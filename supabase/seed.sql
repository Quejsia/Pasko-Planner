-- Sign up in the app first, put your email below, then run. Gives you PASKO1 (undrawn, you organize) and PASKO2 (drawn, you can open the reveal).
do $$ declare u uuid; g1 uuid:=gen_random_uuid(); g2 uuid:=gen_random_uuid(); me uuid:=gen_random_uuid(); a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); begin
 select id into u from auth.users where email='YOUR_EMAIL@example.com'; if u is null then raise exception 'Sign up in the app first, then edit the email above'; end if;
 insert into groups(id,name,budget_php,party_date,organizer_id,join_code,exclusion_names) values(g1,'Pamilya Reyes',500,'2026-12-24',u,'PASKO1','[["Nanay","Tatay"]]');
 insert into members(group_id,name,wishes) values(g1,'Nanay','{"Tsinelas","Kape"}'),(g1,'Tatay','{"Medyas"}'),(g1,'Ate Joy','{"Scented candle","Mug"}');
 insert into groups(id,name,budget_php,party_date,organizer_id,join_code,drawn) values(g2,'Barkada Batch 2018',300,'2026-12-20',u,'PASKO2',true);
 insert into members(id,group_id,name,wishes,user_id) values(me,g2,'Ako','{"Tumbler"}',u),(a,g2,'Mika','{"Planner","Washi tape"}',null),(b,g2,'Jun','{"Libro"}',null);
 insert into assignments(group_id,giver_id,receiver_id) values(g2,me,a),(g2,a,b),(g2,b,me); end $$;
