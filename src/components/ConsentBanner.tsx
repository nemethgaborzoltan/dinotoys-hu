import {useEffect,useState} from 'react'
import {Link} from '@tanstack/react-router'
import {getConsent,saveConsent} from '../lib/analytics'

export function ConsentBanner(){
 const [open,setOpen]=useState(false),[settings,setSettings]=useState(false),[analytics,setAnalytics]=useState(false),[marketing,setMarketing]=useState(false)
 useEffect(()=>{
  const current=getConsent()
  if(current){setAnalytics(current.analytics);setMarketing(current.marketing)}else setOpen(true)
  const reopen=()=>{const value=getConsent();setAnalytics(Boolean(value?.analytics));setMarketing(Boolean(value?.marketing));setSettings(true);setOpen(true)}
  window.addEventListener('dinotoys:open-consent',reopen)
  return()=>window.removeEventListener('dinotoys:open-consent',reopen)
 },[])
 if(!open)return null
 const save=(a:boolean,m:boolean)=>{saveConsent({analytics:a,marketing:m});setOpen(false);setSettings(false)}
 return <div className="consent-panel" role="dialog" aria-label="Cookie és adatvédelmi beállítások" aria-modal="false"><div className="consent-copy"><b>Te döntöd el, mi mérhető.</b><p>A szükséges technológiák a kosárhoz, biztonsághoz és a választásaid megjegyzéséhez kellenek. Analitika és marketing csak a hozzájárulásod után kapcsolható be.</p><div className="consent-links"><Link to="/jogi/$slug" params={{slug:'cookie'}}>Cookie tájékoztató</Link><Link to="/jogi/$slug" params={{slug:'adatkezeles'}}>Adatkezelés</Link></div></div>
 {settings&&<div className="consent-options"><label><span><b>Szükséges</b><small>Kosár, consent, biztonság, alapműködés</small></span><input type="checkbox" checked disabled/></label><label><span><b>Analitika</b><small>Teljesítmény- és konverziómérés</small></span><input type="checkbox" checked={analytics} onChange={e=>setAnalytics(e.target.checked)}/></label><label><span><b>Marketing</b><small>Remarketing / hirdetési technológiák, ha később aktiválva vannak</small></span><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)}/></label></div>}
 <div className="consent-actions"><button className="btn btn-ghost" onClick={()=>save(false,false)}>Csak szükséges</button><button className="btn btn-ghost" onClick={()=>setSettings(value=>!value)}>{settings?'Részletek bezárása':'Beállítások'}</button>{settings?<button className="btn btn-primary" onClick={()=>save(analytics,marketing)}>Kiválasztottak mentése</button>:<button className="btn btn-primary" onClick={()=>save(true,true)}>Összes elfogadása</button>}</div></div>
}
