import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'}
// Domain errors return 200 + {error} so the client can show a friendly message.
const out=(b:unknown)=>new Response(JSON.stringify(b),{headers:{...cors,'Content-Type':'application/json'}})
const rnd=(n:number)=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n}
function shuffle<T>(a:T[]){a=[...a];for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors})
 const {join_code}=await req.json().catch(()=>({}))
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
 const jwt=(req.headers.get('Authorization')||'').replace('Bearer ','');const {data:{user}}=await db.auth.getUser(jwt);if(!user)return out({error:'Mag-login muna.'})
 const {data:g}=await db.from('groups').select('*').eq('join_code',String(join_code||'').toUpperCase()).eq('organizer_id',user.id).maybeSingle()
 if(!g)return out({error:'Ang organizer lang ng group ang pwedeng mag-draw.'})
 const {data:ms}=await db.from('members').select('id,name').eq('group_id',g.id)
 if(!ms||ms.length<3)return out({error:'Kailangan ng at least 3 members para mag-draw.'})
 const byName=new Map(ms.map(m=>[m.name.toLowerCase().trim(),m.id]));const bad=new Set<string>();const ex:any[]=[]
 for(const [a,b] of g.exclusion_names||[]){const x=byName.get(String(a).toLowerCase().trim()),y=byName.get(String(b).toLowerCase().trim())
  if(x&&y){bad.add(x+y);bad.add(y+x);ex.push({group_id:g.id,member_a:x,member_b:y})}}
 const ids=ms.map(m=>m.id);let pick:string[]|null=null
 for(let t=0;t<2000&&!pick;t++){const s=shuffle(ids);if(ids.every((id,i)=>id!==s[i]&&!bad.has(id+s[i])))pick=s}
 if(!pick)return out({error:'Walang valid na draw sa mga rules na ito. Subukang tanggalin ang ilang exclusions o magdagdag ng members.'})
 await db.from('assignments').delete().eq('group_id',g.id);await db.from('messages').delete().eq('group_id',g.id);await db.from('exclusions').delete().eq('group_id',g.id)
 if(ex.length)await db.from('exclusions').insert(ex)
 const {error}=await db.from('assignments').insert(ids.map((id,i)=>({group_id:g.id,giver_id:id,receiver_id:pick![i]})))
 if(error)return out({error:'May problema sa pag-save ng draw. Subukan ulit.'})
 await db.from('groups').update({drawn:true}).eq('id',g.id);return out({ok:true})})
