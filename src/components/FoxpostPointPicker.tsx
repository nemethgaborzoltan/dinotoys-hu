import {useEffect,useState} from 'react'
import {parseFoxpostMessage,type FoxpostPickupPoint} from '../lib/foxpost'

const widgetUrl='https://cdn.foxpost.hu/apt-finder-v3/app/'

export function FoxpostPointPicker({value,onChange}:{value:FoxpostPickupPoint|null;onChange:(point:FoxpostPickupPoint)=>void}){
 const [open,setOpen]=useState(false)
 useEffect(()=>{
  if(!open)return
  const receive=(event:MessageEvent)=>{
   if(event.origin!=='https://cdn.foxpost.hu')return
   const point=parseFoxpostMessage(event.data)
   if(!point)return
   onChange(point);setOpen(false)
  }
  window.addEventListener('message',receive)
  return()=>window.removeEventListener('message',receive)
 },[open,onChange])
 return <div className="foxpost-picker">
  {value?<div className="foxpost-selected"><div className="foxpost-selected-icon">🟠</div><div><span>Kiválasztott FOXPOST átvételi pont</span><b>{value.name}</b><small>{value.address}</small>{value.findme&&<em>{value.findme.replace(/<br\s*\/?\s*>/gi,' · ')}</em>}</div><button type="button" onClick={()=>setOpen(true)}>Módosítás</button></div>:<button type="button" className="foxpost-open" onClick={()=>setOpen(true)}><span>🟠</span><div><b>FOXPOST automata kiválasztása</b><small>Térképen vagy keresővel válassz átvételi pontot</small></div><i>→</i></button>}
  {open&&<div className="foxpost-modal" role="dialog" aria-modal="true" aria-label="FOXPOST átvételi pont választó"><div className="foxpost-modal-card"><header><div><span className="eyebrow">FOXPOST · Packeta Group</span><h2>Válassz átvételi pontot</h2><p>A FOXPOST hivatalos térképes keresője. A „Kiválasztom” gomb után automatikusan visszatérsz a pénztárhoz.</p></div><button type="button" aria-label="Bezárás" onClick={()=>setOpen(false)}>×</button></header><iframe title="FOXPOST átvételi pont kereső" src={widgetUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/></div></div>}
 </div>
}
