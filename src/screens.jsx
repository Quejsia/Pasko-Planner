import {useEffect,useState,useCallback,useRef} from 'react'
import {sb,go,base,daysTo,peso,friendly,copy} from './lib'
const Field=({label,children})=><label className="block space-y-1"><span className="font-bold text-sm">{label}</span>{children}</label>
const Err=({m})=>m?<p role="alert" className="bg-red/10 text-red font-bold rounded-2xl px-4 py-2">{m}</p>:null
const Gold=p=><button {...p} className={'btn bg-gold text-red-deep w-full '+(p.className||'')}/>
const Green=p=><button {...p} className={'btn bg-pine text-paper w-full '+(p.className||'')}/>

export function Missing(){return <div className="card text-center space-y-3"><div className="text-5xl">🎄</div><h2 className="text-2xl font-extrabold">Naku, wala kaming makita!</h2><p>Mali o expired na ang link na ito. Hingin ulit sa organizer ang tamang link.</p><Gold onClick={()=>go('')}>Gumawa ng bagong group</Gold></div>}

function LinkRow({label,url,warn}){const [ok,setOk]=useState(false)
 return <div className="space-y-1"><p className="font-bold text-sm">{label}</p>{warn&&<p className="text-red text-sm font-bold">{warn}</p>}
 <div className="flex gap-2"><input readOnly value={url} className="inp text-sm" onFocus={e=>e.target.select()}/><button className="btn bg-pine text-paper !px-4" onClick={async()=>{setOk(await copy(url));setTimeout(()=>setOk(false),1500)}}>{ok?'✓':'Copy'}</button></div></div>}

export function Create(){
 const [f,setF]=useState({name:'',budget:'500',date:''});const [pairs,setPairs]=useState([]);const [err,setErr]=useState('');const [busy,setBusy]=useState(false);const [done,setDone]=useState(null)
 const set=k=>e=>setF({...f,[k]:e.target.value})
 const submit=async e=>{e.preventDefault();setErr('')
  const b=Number(f.budget),tomorrow=new Date(Date.now()+864e5).toISOString().slice(0,10)
  if(!f.name.trim())return setErr('Lagyan ng pangalan, ha!');if(!(b>0))return setErr('Dapat higit sa ₱0 ang budget.');if(!f.date||f.date<tomorrow)return setErr('Dapat sa future ang petsa ng party.')
  setBusy(true);const clean=pairs.filter(p=>p[0].trim()&&p[1].trim())
  const {data,error}=await sb.rpc('create_group',{p_name:f.name,p_budget:b,p_date:f.date,p_pairs:clean});setBusy(false)
  if(error)return setErr(friendly(error))
  setDone(data)}
 if(done)return <div className="card space-y-4"><h2 className="text-2xl font-extrabold">Handa na ang group! 🎁</h2>
  <LinkRow label="Share link — ipadala sa barkada/pamilya" url={`${base()}#/j/${done.join_code}`}/>
  <Gold onClick={()=>go('j/'+done.join_code)}>Sumali na rin ako</Gold><Green onClick={()=>go('g/'+done.join_code)}>Pumunta sa lobby</Green></div>
 return <form onSubmit={submit} className="card space-y-4"><h2 className="text-2xl font-extrabold">Gumawa ng Monito-Monita</h2>
  <Field label="Pangalan ng group"><input className="inp" value={f.name} onChange={set('name')} placeholder="Pamilya Reyes 2026" maxLength={60}/></Field>
  <div className="grid grid-cols-2 gap-3"><Field label="Budget (₱)"><input className="inp" type="number" inputMode="numeric" min="1" value={f.budget} onChange={set('budget')}/></Field>
  <Field label="Petsa ng party"><input className="inp" type="date" value={f.date} onChange={set('date')}/></Field></div>
  <fieldset className="space-y-2"><legend className="font-bold text-sm">Hindi pwedeng magka-draw (optional, hal. mag-asawa)</legend>
   {pairs.map((p,i)=><div key={i} className="flex gap-2"><input className="inp" placeholder="Pangalan 1" value={p[0]} onChange={e=>setPairs(pairs.map((q,j)=>j===i?[e.target.value,q[1]]:q))}/><input className="inp" placeholder="Pangalan 2" value={p[1]} onChange={e=>setPairs(pairs.map((q,j)=>j===i?[q[0],e.target.value]:q))}/></div>)}
   <button type="button" className="text-pine font-bold underline" onClick={()=>setPairs([...pairs,['','']])}>+ Magdagdag ng pair</button>
   <p className="text-xs opacity-70">Isulat ang pangalan nang eksakto kung paano nila ilalagay sa pag-join.</p></fieldset>
  <Err m={err}/><Gold disabled={busy}>{busy?'Sandali lang…':'Gumawa ng group'}</Gold></form>}

function useGroup(code){const [g,setG]=useState();
 const load=useCallback(async()=>{const {data}=await sb.rpc('get_group',{p_code:code});setG(data||null)},[code])
 useEffect(()=>{load();const t=setInterval(load,10000);return()=>clearInterval(t)},[load]);return {g,load}}

export function Join({code}){
 const {g}=useGroup(code);const [name,setName]=useState('');const [w,setW]=useState(['','','']);const [err,setErr]=useState('');const [busy,setBusy]=useState(false)
 useEffect(()=>{if(g?.me)go('g/'+code)},[g])
 if(g===undefined)return <p className="text-center text-paper">Sandali lang…</p>;if(g===null)return <Missing/>
 const submit=async e=>{e.preventDefault();setErr('');if(!name.trim())return setErr('Lagyan ng pangalan, ha!');setBusy(true)
  const {data,error}=await sb.rpc('join_group',{p_code:code,p_name:name,p_wishes:w});setBusy(false)
  if(error)return setErr(friendly(error));go('g/'+code)}
 return <form onSubmit={submit} className="card space-y-4"><h2 className="text-2xl font-extrabold">Sali ka sa {g.name}! 🎄</h2>
  <p>Budget: <b>{peso(g.budget_php)}</b> · Party: <b>{new Date(g.party_date+'T00:00').toLocaleDateString('en-PH',{month:'long',day:'numeric'})}</b></p>
  <Field label="Pangalan mo"><input className="inp" value={name} onChange={e=>setName(e.target.value)} maxLength={40}/></Field>
  {w.map((x,i)=><Field key={i} label={`Wish #${i+1}${i?' (optional)':''}`}><input className="inp" value={x} placeholder={['Hal. mug na may design','Scented candle','Medyas na makulay'][i]} onChange={e=>setW(w.map((y,j)=>j===i?e.target.value:y))} maxLength={80}/></Field>)}
  <Err m={err}/><Gold disabled={busy}>{busy?'Sandali lang…':'Sumali na'}</Gold></form>}

export function Lobby({code}){
 const {g,load}=useGroup(code);const [err,setErr]=useState('');const [busy,setBusy]=useState(false);const [ok,setOk]=useState(false);const [fb,setFb]=useState('')
 if(g===undefined)return <p className="text-center text-paper">Sandali lang…</p>;if(g===null)return <Missing/>
 const link=`${base()}#/j/${g.join_code}`,days=daysTo(g.party_date),isOrg=g.is_organizer
 const msg=async()=>{const text=`Sali ka sa ${g.name} monito-monita! 🎄`;setFb('')
  if(navigator.share){try{await navigator.share({title:'Pasko Planner',text,url:link});return}catch(e){if(e.name==='AbortError')return}}
  let left=false;const h=()=>{if(document.hidden)left=true};document.addEventListener('visibilitychange',h)
  location.href=`fb-messenger://share/?link=${encodeURIComponent(link)}`
  setTimeout(async()=>{document.removeEventListener('visibilitychange',h);if(!left){const c=await copy(link);setFb(c?'Hindi nabuksan ang Messenger, kaya na-copy ang link. I-paste ito sa chat!':'Hindi nabuksan ang Messenger. I-copy ang link at ipadala nang mano-mano.')}},1500)}
 const draw=async()=>{if(g.drawn&&!confirm('Sigurado ka? MAGBABAGO ang lahat ng matches, at kailangang buksan ulit ng lahat ang kanilang regalo.'))return
  setBusy(true);setErr('');const {data,error}=await sb.functions.invoke('draw',{body:{join_code:code}});setBusy(false)
  setErr(data?.error||(error?'May problema sa draw. Subukan ulit.':''));load()}
 return <>
  <div className="card text-center"><p className="font-bold">{g.name}</p><p className="font-display font-extrabold text-6xl text-red leading-none">{days>0?days:'🎉'}</p><p>{days>0?'araw na lang bago ang party!':'Party na!'}</p><p className="text-sm mt-1">Budget: {peso(g.budget_php)}</p></div>
  <div className="card space-y-3"><h3 className="text-xl font-extrabold">Mga sumali ({g.members.length})</h3>
   <ul className="flex flex-wrap gap-2">{g.members.map(n=><li key={n} className="bg-pine text-paper rounded-full px-4 py-1.5 font-bold">{n}</li>)}</ul>
   {!g.members.length&&<p>Wala pang sumali. Ipadala na ang link!</p>}
   {fb&&<p role="status" className="text-sm font-bold text-pine">{fb}</p>}
   <div className="grid grid-cols-2 gap-2"><button className="btn bg-gold text-red-deep" onClick={async()=>{setOk(await copy(link));setTimeout(()=>setOk(false),1500)}}>{ok?'Na-copy!':'Copy link'}</button>
   <button className="btn bg-pine text-paper" onClick={msg}>Messenger</button></div></div>
  {!g.me&&<Gold onClick={()=>go('j/'+code)}>Sumali ka rin!</Gold>}
  {g.drawn&&g.me&&<Gold onClick={()=>go('r/'+code)}>🎁 Buksan ang regalo ko</Gold>}
  {g.drawn&&g.me&&<Green onClick={()=>go('m/'+code)}>💬 Secret messages</Green>}
  <Green onClick={()=>go('c/'+code)}>🖼️ Share card</Green>
  {isOrg&&<div className="card space-y-2"><h3 className="text-xl font-extrabold">Organizer</h3>
   {g.drawn&&<p className="text-sm">Na-draw na! May bagong sumali? Pwede mag re-draw, pero mababago ang lahat ng matches.</p>}
   <Err m={err}/><Green disabled={busy||g.members.length<3} onClick={draw}>{busy?'Nagda-draw…':g.drawn?'Re-draw ng pangalan':'Draw Names'}</Green>
   {g.members.length<3&&<p className="text-sm">Kailangan ng at least 3 members para mag-draw.</p>}</div>}</>}

function chime(){try{const c=new (window.AudioContext||window.webkitAudioContext)();[523,659,784,1047].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,c.currentTime+i*.12);g.gain.exponentialRampToValueAtTime(.25,c.currentTime+i*.12+.03);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+i*.12+.5);o.connect(g).connect(c.destination);o.start(c.currentTime+i*.12);o.stop(c.currentTime+i*.12+.55)})}catch{}}

export function Reveal({code}){
 const [r,setR]=useState();const [open,setOpen]=useState(false)
 useEffect(()=>{sb.rpc('my_reveal',{p_code:code}).then(({data})=>setR(data||null))},[])
 if(r===undefined)return <p className="text-center text-paper">Sandali lang…</p>
 if(!r)return <div className="card text-center space-y-3"><div className="text-5xl">🎁</div><h2 className="text-2xl font-extrabold">Wala pang regalo</h2><p>Hindi pa na-draw ang group, o hindi ka pa nakasali.</p><Gold onClick={()=>go('g/'+code)}>Balik sa lobby</Gold></div>
 return <div className="card text-center space-y-4">
  <button className={'mx-auto block '+(open?'open':'shake')} aria-label="Buksan ang regalo" disabled={open} onClick={()=>{setOpen(true);chime()}}>
   <svg viewBox="0 0 160 150" className="gift w-48 h-44"><g className="lid"><rect x="14" y="40" width="132" height="28" rx="6" fill="#e3a72f"/><path d="M80 40c-20-24-44-10-26 0zM80 40c20-24 44-10 26 0z" fill="#8f1d21"/></g>
   <rect x="22" y="68" width="116" height="78" rx="6" fill="#1d4d33"/><rect x="70" y="68" width="20" height="78" fill="#e3a72f"/></svg></button>
  {!open?<p className="font-bold">I-tap ang regalo para malaman kung sino ang Monito/Monita mo! 🤫</p>:
  <div className="pop space-y-3"><p>Ang reregaluhan mo ay si</p><p className="font-display font-extrabold text-4xl text-red">{r.receiver_name}</p>
   <div className="bg-white rounded-2xl p-3 text-left"><p className="font-bold">Wishlist niya:</p>{r.wishes?.length?<ul className="list-disc pl-5">{r.wishes.map((w,i)=><li key={i}>{w}</li>)}</ul>:<p>Walang nilagay — surprise na lang!</p>}</div>
   <p className="font-bold">Budget: {peso(r.budget_php)}</p>
   <button className="btn bg-red text-paper w-full" onClick={()=>setOpen(false)}>🙈 Itago (may nakatingin!)</button></div>}
  <button className="underline font-bold" onClick={()=>go('g/'+code)}>Balik sa lobby</button></div>}

export function Messages({code}){
 const [role,setRole]=useState('giver'),[d,setD]=useState(),[txt,setTxt]=useState(''),[err,setErr]=useState(''),[busy,setB]=useState(false)
 const load=useCallback(async()=>{const {data}=await sb.rpc('get_thread',{p_code:code,p_role:role});setD(data||null)},[code,role])
 useEffect(()=>{setD(undefined);load();const t=setInterval(load,6000);return()=>clearInterval(t)},[load])
 const send=async e=>{e.preventDefault();if(!txt.trim())return;setB(true);setErr('')
  const {error}=await sb.rpc('send_message',{p_code:code,p_role:role,p_body:txt});setB(false)
  if(error)return setErr(friendly(error));setTxt('');load()}
 const tabs=[['giver','Sa reregaluhan ko'],['receiver','Sa Monito/Monita ko']]
 return <div className="card space-y-3"><h2 className="text-2xl font-extrabold">Secret messages 🤫</h2>
  <div className="grid grid-cols-2 gap-2">{tabs.map(([k,l])=><button key={k} onClick={()=>setRole(k)} className={'btn !text-base '+(role===k?'bg-pine text-paper':'bg-white text-pine-deep border-2 border-pine/30')}>{l}</button>)}</div>
  {d===undefined?<p>Sandali lang…</p>:d===null?<p>Hindi pa na-draw, o hindi ka pa kasali.</p>:<>
   <p className="text-sm">{role==='giver'?`Para kay ${d.with_name}. Hindi niya malalaman na ikaw ito.`:'Mula sa iyong Monito/Monita. Hindi mo malalaman kung sino siya!'}</p>
   <div className="space-y-2 max-h-80 overflow-y-auto">{!d.messages.length&&<p className="text-center">Wala pang mensahe. Mauna ka na! 💌</p>}
    {d.messages.map((m,i)=><div key={i} className={'max-w-[85%] rounded-2xl px-4 py-2 '+(m.mine?'ml-auto bg-pine text-paper':'bg-white')}>
     {!m.mine&&<p className="text-xs font-bold text-red">{role==='receiver'?'Mula sa iyong Monito/Monita':d.with_name}</p>}{m.body}</div>)}</div>
   <form onSubmit={send} className="flex gap-2"><input className="inp" value={txt} maxLength={500} onChange={e=>setTxt(e.target.value)} placeholder="Mag-type ng mensahe…"/><button disabled={busy} className="btn bg-gold text-red-deep !px-5">Send</button></form><Err m={err}/></>}
  <button className="underline font-bold" onClick={()=>go('g/'+code)}>Balik sa lobby</button></div>}

export function ShareCard({code}){
 const {g}=useGroup(code);const ref=useRef();const [ok,setOk]=useState(false)
 useEffect(()=>{if(!g)return;(async()=>{try{await document.fonts.load('800 90px "Baloo 2"')}catch{}
  const c=ref.current,x=c.getContext('2d'),W=1080,H=1350,days=daysTo(g.party_date),yr=new Date(g.party_date+'T00:00').getFullYear()
  const bg=x.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#b3282d');bg.addColorStop(1,'#6b1216');x.fillStyle=bg;x.fillRect(0,0,W,H)
  x.strokeStyle='#e3a72f';x.lineWidth=8;x.strokeRect(40,40,W-80,H-80);x.beginPath();x.moveTo(W/2,60);x.lineTo(W/2,120);x.stroke()
  x.save();x.translate(W/2,330);x.fillStyle='#e3a72f';x.beginPath();for(let i=0;i<16;i++){const r=i%2?90:210,a=i*Math.PI/8-Math.PI/2;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fill();x.fillStyle='#8f1d21';x.beginPath();x.arc(0,0,48,0,7);x.fill();x.restore()
  x.textAlign='center';x.fillStyle='#fff4dc';x.font='800 84px "Baloo 2",system-ui,sans-serif';x.fillText(`Our Pasko ${yr} is set!`,W/2,700)
  x.fillStyle='#e3a72f';x.font='800 300px "Baloo 2",system-ui,sans-serif';x.fillText(days>0?String(days):'🎉',W/2,960)
  x.fillStyle='#fff4dc';x.font='700 64px "Baloo 2",system-ui,sans-serif';x.fillText(days>0?(days===1?'day to go':'days to go'):'Party na!',W/2,1050)
  x.fillStyle='#f6dc96';x.font='700 44px "Baloo 2",system-ui,sans-serif';x.fillText('Merry Christmas and Happy New Year!',W/2,1150)
  x.fillStyle='#f6dc96';x.font='600 36px Nunito,system-ui,sans-serif';x.fillText('Made with AppBuildersPH',W/2,1240);setOk(true)})()},[g])
 const blob=()=>new Promise(r=>ref.current.toBlob(r,'image/png'))
 const dl=async()=>{const b=await blob();const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`pasko-${code}.png`;a.click()}
 const share=async()=>{const b=await blob();const f=new File([b],'pasko.png',{type:'image/png'});if(navigator.canShare?.({files:[f]})){try{await navigator.share({files:[f],text:'Our Pasko is set! 🎄'})}catch{}}else dl()}
 if(g===null)return <Missing/>
 return <div className="card space-y-3 text-center">{g===undefined&&<p>Sandali lang…</p>}<canvas ref={ref} width={1080} height={1350} className={'w-full rounded-2xl '+(g?'':'hidden')}/>
  {g&&<><Gold onClick={share} disabled={!ok}>Ibahagi</Gold><Green onClick={dl} disabled={!ok}>I-download ang PNG</Green></>}
  <button className="underline font-bold" onClick={()=>go('g/'+code)}>Balik sa lobby</button></div>}
