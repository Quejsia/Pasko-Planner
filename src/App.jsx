import {useEffect,useState} from 'react'
import {Create,Join,Lobby,Reveal,Missing,Messages,ShareCard} from './screens'
import {Login,Home} from './auth'
import {sb,go} from './lib'
function Parol(){return <svg className="parol w-10 h-14" viewBox="0 0 40 56" aria-hidden="true"><path d="M20 0v8" stroke="#e3a72f" strokeWidth="2"/><path d="M20 8l5 9 10-2-6 8 9 5-10 2 2 10-10-6-10 6 2-10-10-2 9-5-6-8 10 2z" fill="#e3a72f" stroke="#fff4dc" strokeWidth="1.5"/><circle cx="20" cy="26" r="4" fill="#8f1d21"/><path d="M14 44l-3 10M20 46v10M26 44l3 10" stroke="#e3a72f" strokeWidth="2"/></svg>}
export default function App(){
 const [h,setH]=useState(location.hash),[s,setS]=useState()
 useEffect(()=>{const f=()=>setH(location.hash);addEventListener('hashchange',f);sb.auth.getSession().then(({data})=>setS(data.session));const {data:{subscription:sub}}=sb.auth.onAuthStateChange((_,x)=>setS(x));return()=>{removeEventListener('hashchange',f);sub.unsubscribe()}},[])
 const [a,b]=h.replace(/^#\/?/,'').split('/').filter(Boolean)
 const back=['r','m','c'].includes(a)&&b?'g/'+b:''
 const v=s===undefined?<p className="text-center text-paper">Sandali lang…</p>:!s?<Login/>:!a?<Home/>:a==='new'?<Create/>:a==='j'&&b?<Join code={b} key={b}/>:a==='g'&&b?<Lobby code={b} key={b}/>:a==='r'&&b?<Reveal code={b} key={b}/>:a==='m'&&b?<Messages code={b} key={b}/>:a==='c'&&b?<ShareCard code={b} key={b}/>:<Missing/>
 return <div className="pb-10" style={{paddingTop:'env(safe-area-inset-top)'}}>
  <header className="flex items-center justify-center gap-3 pt-3 pb-4"><Parol/><a href="#/" className="font-display font-extrabold text-3xl text-gold">Pasko Planner</a><Parol/></header>
  <main className="max-w-md mx-auto px-4 space-y-4">{s&&a&&<button className="text-paper font-bold underline" onClick={()=>go(back)}>← {back?'Balik sa lobby':'Mga group ko'}</button>}{v}{s&&<button className="block mx-auto text-paper underline font-bold" onClick={()=>sb.auth.signOut()}>Mag-logout</button>}</main></div>}
