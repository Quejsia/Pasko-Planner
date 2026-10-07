-- Longer join codes: new groups get 8 characters (was 6).
-- Old 6-character groups keep working. Safe to run more than once.
create or replace function create_group(p_name text,p_budget int,p_date date,p_pairs jsonb default '[]') returns json language plpgsql security definer set search_path=public as $$
declare c text; g groups; begin
 if auth.uid() is null then raise exception 'NOT_AUTH'; end if;
 if coalesce(trim(p_name),'')='' then raise exception 'NAME_REQUIRED'; end if;
 if p_budget is null or p_budget<=0 then raise exception 'BAD_BUDGET'; end if;
 if p_date is null or p_date<=current_date then raise exception 'BAD_DATE'; end if;
 loop c:=upper(substr(encode(gen_random_bytes(4),'hex'),1,8)); exit when not exists(select 1 from groups where join_code=c); end loop;
 insert into groups(name,budget_php,party_date,join_code,organizer_id,exclusion_names) values(trim(p_name),p_budget,p_date,c,auth.uid(),coalesce(p_pairs,'[]')) returning * into g;
 return json_build_object('join_code',g.join_code); end $$;

revoke execute on function create_group from public,anon;
grant execute on function create_group to authenticated;
