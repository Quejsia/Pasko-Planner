import {useEffect,useState} from 'react'
import {sb,go} from './lib'
export function Login(){
 const [email,setE]=useState(''),[pw,setP]=useState(''),[up,setUp]=useState(false),[err,setErr]=useState(''),[msg,setMsg]=useState(''),[busy,setB]=useState(false)
 const google=()=>sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href}})
 const submit=async e=>{e.preventDefault();setErr('');setMsg('');setB(true)
  const {data,error}=up?await sb.auth.signUp({email,password:pw,options:{emailRedirectTo:location.href}}):await sb.auth.signInWithPassword({email,password:pw});setB(false)
  if(error)return setErr(error.message);if(up&&!data.session)setMsg('Tingnan ang email mo at i-confirm, tapos mag-login.')}
 return <form onSubmit={submit} className="card space-y-4"><h2 className="text-2xl font-extrabold">{up?'Gumawa ng account':'Mag-login'} 🎄</h2>
  <button type="button" onClick={google} className="btn bg-white text-pine-deep w-full border-2 border-pine/30">Continue with Google</button>
  <p className="text-center text-sm">o gamitin ang email</p>
  <input className="inp" type="email" placeholder="Email" autoComplete="email" value={email} onChange={e=>setE(e.target.value)} required/>
  <input className="inp" type="password" placeholder={up?"Password (8+ characters)":"Password"} autoComplete={up?'new-password':'current-password'} minLength={up?8:undefined} value={pw} onChange={e=>setP(e.target.value)} required/>
  {err&&<p role="alert" className="bg-red/10 text-red font-bold rounded-2xl px-4 py-2">{err}</p>}{msg&&<p className="font-bold text-pine">{msg}</p>}
  <button disabled={busy} className="btn bg-gold text-red-deep w-full">{busy?'Sandali lang…':up?'Mag-sign up':'Mag-login'}</button>
  <p className="text-center text-xs">Sa paggamit ng app, sumasang-ayon ka sa <a className="underline font-bold" href="/terms">Terms</a> at <a className="underline font-bold" href="/privacy">Privacy Policy</a>.</p>
  <button type="button" className="underline font-bold w-full" onClick={()=>setUp(!up)}>{up?'May account na ako':'Wala pang account? Mag-sign up'}</button></form>}
export function Home(){
 const [l,setL]=useState();useEffect(()=>{sb.rpc('my_groups').then(({data})=>setL(data||[]))},[])
 return <><button className="btn bg-gold text-red-deep w-full" onClick={()=>go('new')}>+ Gumawa ng bagong group</button>
  {l&&!l.length&&<div className="card text-center">Wala ka pang group. Gumawa ng isa, o buksan ang link na ipinadala sa'yo.</div>}
  {l?.map(x=><a key={x.join_code} href={'#/g/'+x.join_code} className="card block"><p className="font-display font-extrabold text-xl">{x.name}</p>
   <p className="text-sm">{new Date(x.party_date+'T00:00').toLocaleDateString('en-PH',{month:'long',day:'numeric',year:'numeric'})} · {x.is_organizer?'Organizer':'Member'} · {x.drawn?'Na-draw na':'Hindi pa na-draw'}</p></a>)}</>}
