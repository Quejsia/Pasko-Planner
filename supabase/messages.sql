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
