import {createClient} from '@supabase/supabase-js'
export const sb=createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY,{auth:{flowType:'pkce'}})
export const K=(t,c)=>`pp:${t}:${c.toUpperCase()}`
export const go=p=>{location.hash='#/'+p}
export const base=()=>location.origin+location.pathname
export const daysTo=d=>Math.ceil((new Date(d+'T00:00:00')-new Date())/864e5)
export const peso=n=>'₱'+Number(n).toLocaleString('en-PH')
const MSG={NAME_REQUIRED:'Lagyan ng pangalan, ha!',BAD_BUDGET:'Dapat higit sa ₱0 ang budget.',BAD_DATE:'Dapat sa future ang petsa ng party.',NOT_FOUND:'Hindi mahanap ang group na ito.'}
export const friendly=e=>{const m=e?.message||'';return Object.entries(MSG).find(([k])=>m.includes(k))?.[1]||'May nangyaring problema. Subukan ulit.'}
export const copy=async t=>{try{await navigator.clipboard.writeText(t);return true}catch{return false}}
