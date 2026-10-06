-- Pasko Planner v2: real accounts (Supabase Auth). Safe to re-run while testing (drops everything first!).
drop table if exists messages, exclusions, assignments, members, groups cascade;
drop function if exists current_member_id, my_member_ids, create_group, get_group, join_group, my_reveal, my_groups;
create extension if not exists pgcrypto;
create table groups(id uuid primary key default gen_random_uuid(),name text not null,budget_php int not null check(budget_php>0),party_date date not null,
 organizer_id uuid not null references auth.users,join_code text not null unique,drawn boolean not null default false,
 exclusion_names jsonb not null default '[]',created_at timestamptz not null default now());
create table members(id uuid primary key default gen_random_uuid(),group_id uuid not null references groups on delete cascade,
 user_id uuid references auth.users on delete cascade,name text not null,wishes text[] not null default '{}' check(cardinality(wishes)<=3),unique(group_id,user_id));
create table assignments(id uuid primary key default gen_random_uuid(),group_id uuid not null references groups on delete cascade,
 giver_id uuid not null unique references members on delete cascade,receiver_id uuid not null references members on delete cascade,check(giver_id<>receiver_id));
create table exclusions(group_id uuid not null references groups on delete cascade,member_a uuid not null references members on delete cascade,member_b uuid not null references members on delete cascade);
create table messages(id uuid primary key default gen_random_uuid(),group_id uuid not null references groups on delete cascade,from_member uuid not null references members,to_member uuid not null references members,body text not null,created_at timestamptz not null default now());

alter table groups enable row level security; alter table members enable row level security; alter table assignments enable row level security;
alter table exclusions enable row level security; alter table messages enable row level security;
revoke all on groups,members,assignments,exclusions,messages from anon,authenticated;
create function my_member_ids() returns setof uuid language sql stable security definer set search_path=public as $$ select id from members where user_id=auth.uid() $$;
grant select on assignments to authenticated;
-- A logged-in user can read ONLY the assignment where they are the giver. Organizer has no special access.
create policy giver_reads_own on assignments for select to authenticated using (giver_id in (select my_member_ids()));

create function create_group(p_name text,p_budget int,p_date date,p_pairs jsonb default '[]') returns json language plpgsql security definer set search_path=public as $$
declare c text; g groups; begin
 if auth.uid() is null then raise exception 'NOT_AUTH'; end if;
 if coalesce(trim(p_name),'')='' then raise exception 'NAME_REQUIRED'; end if;
 if p_budget is null or p_budget<=0 then raise exception 'BAD_BUDGET'; end if;
 if p_date is null or p_date<=current_date then raise exception 'BAD_DATE'; end if;
 loop c:=upper(substr(encode(gen_random_bytes(4),'hex'),1,6)); exit when not exists(select 1 from groups where join_code=c); end loop;
 insert into groups(name,budget_php,party_date,join_code,organizer_id,exclusion_names) values(trim(p_name),p_budget,p_date,c,auth.uid(),coalesce(p_pairs,'[]')) returning * into g;
 return json_build_object('join_code',g.join_code); end $$;

create function get_group(p_code text) returns json language plpgsql security definer set search_path=public as $$
declare g groups; begin if auth.uid() is null then raise exception 'NOT_AUTH'; end if;
 select * into g from groups where join_code=upper(p_code); if not found then return null; end if;
 return json_build_object('join_code',g.join_code,'name',g.name,'budget_php',g.budget_php,'party_date',g.party_date,'drawn',g.drawn,
  'is_organizer',g.organizer_id=auth.uid(),'me',(select name from members where group_id=g.id and user_id=auth.uid()),
  'members',coalesce((select json_agg(name order by name) from members where group_id=g.id),'[]'::json)); end $$;

create function join_group(p_code text,p_name text,p_wishes text[]) returns json language plpgsql security definer set search_path=public as $$
declare g groups; n text; b text:=trim(coalesce(p_name,'')); i int:=1; m members; begin
 if auth.uid() is null then raise exception 'NOT_AUTH'; end if;
 select * into g from groups where join_code=upper(p_code); if not found then raise exception 'NOT_FOUND'; end if;
 select * into m from members where group_id=g.id and user_id=auth.uid(); if found then return json_build_object('name',m.name); end if;
 if b='' then raise exception 'NAME_REQUIRED'; end if; n:=b;
 while exists(select 1 from members where group_id=g.id and lower(name)=lower(n)) loop i:=i+1; n:=b||' '||i; end loop;
 insert into members(group_id,user_id,name,wishes) values(g.id,auth.uid(),n,coalesce((select array_agg(w) from (select trim(x) w from unnest(p_wishes) x where trim(x)<>'' limit 3) s),'{}')) returning * into m;
 return json_build_object('name',m.name); end $$;

create function my_reveal(p_code text) returns json language sql security definer set search_path=public as $$
 select json_build_object('receiver_name',r.name,'wishes',r.wishes,'budget_php',gr.budget_php,'party_date',gr.party_date)
 from groups gr join members g on g.group_id=gr.id and g.user_id=auth.uid() join assignments a on a.giver_id=g.id join members r on r.id=a.receiver_id where gr.join_code=upper(p_code) $$;

create function my_groups() returns json language sql security definer set search_path=public as $$
 select coalesce(json_agg(json_build_object('join_code',join_code,'name',name,'party_date',party_date,'drawn',drawn,'is_organizer',organizer_id=auth.uid()) order by party_date),'[]'::json)
 from groups where organizer_id=auth.uid() or id in (select group_id from members where user_id=auth.uid()) $$;

revoke execute on function create_group,get_group,join_group,my_reveal,my_groups from public,anon;
grant execute on function create_group,get_group,join_group,my_reveal,my_groups to authenticated;
-- Screen 5: anonymous giver<->receiver chat. Run once in the SQL Editor (Run as postgres).
grant all on groups,members,assignments,exclusions,messages to service_role;
create or replace function get_thread(p_code text,p_role text) returns json language plpgsql security definer set search_path=public as $$
declare g groups; me members; o members; a assignments; begin
 if auth.uid() is null then raise exception 'NOT_AUTH'; end if;
 select * into g from groups where join_code=upper(p_code); if not found then return null; end if;
 select * into me from members where group_id=g.id and user_id=auth.uid(); if not found then return null; end if;
 if p_role='giver' then select * into a from assignments where giver_id=me.id; if not found then return null; end if; select * into o from members where id=a.receiver_id;
 else select * into a from assignments where receiver_id=me.id and group_id=g.id; if not found then return null; end if; select * into o from members where id=a.giver_id; end if;
 return json_build_object('with_name',case when p_role='giver' then o.name end,
  'messages',coalesce((select json_agg(json_build_object('mine',from_member=me.id,'body',body,'at',created_at) order by created_at) from messages where group_id=g.id and ((from_member=me.id and to_member=o.id) or (from_member=o.id and to_member=me.id))),'[]'::json)); end $$;
create or replace function send_message(p_code text,p_role text,p_body text) returns void language plpgsql security definer set search_path=public as $$
declare g groups; me members; o uuid; b text:=trim(coalesce(p_body,'')); begin
 if auth.uid() is null then raise exception 'NOT_AUTH'; end if;
 if b='' or length(b)>500 then raise exception 'BAD_MSG'; end if;
 select * into g from groups where join_code=upper(p_code); if not found then raise exception 'NOT_FOUND'; end if;
 select * into me from members where group_id=g.id and user_id=auth.uid(); if not found then raise exception 'NOT_FOUND'; end if;
 if p_role='giver' then select receiver_id into o from assignments where giver_id=me.id; else select giver_id into o from assignments where receiver_id=me.id and group_id=g.id; end if;
 if o is null then raise exception 'NOT_DRAWN'; end if;
 insert into messages(group_id,from_member,to_member,body) values(g.id,me.id,o,b); end $$;
revoke execute on function get_thread,send_message from public,anon;
grant execute on function get_thread,send_message to authenticated;
