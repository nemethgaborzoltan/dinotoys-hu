import {useEffect,useState} from 'react'
import {parseFoxpostMessage,type FoxpostPickupPoint} from '../lib/foxpost'

const widgetUrl='https://cdn.foxpost.hu/apt-finder-v3/app/'

export function FoxpostPointPicker({value,onChange,defaultQuery=''}:{value:FoxpostPickupPoint|null;onChange:(point:FoxpostPickupPoint)=>void;defaultQuery?:string}){
 const [query,setQuery]=useState(defaultQuery),[results,setResults]=useState<FoxpostPickupPoint[]>([]),[loading,setLoading]=useState(false),[error,setError]=useState<string|null>(null),[mapOpen,setMapOpen]=useState(false),[choosing,setChoosing]=useState(!value),[typed,setTyped]=useState(false)

 useEffect(()=>{
  const suggested=defaultQuery.trim()
  if(!typed&&suggested.length>=2)setQuery(suggested)
 },[defaultQuery,typed])

 useEffect(()=>{
  const q=query.trim()
  if(q.length<2){setResults([]);setLoading(false);setError(null);return}
  const controller=new AbortController()
  const timer=window.setTimeout(async()=>{
   setLoading(true);setError(null)
   try{
    const response=await fetch('/api/v1/shipping/foxpost/points?q='+encodeURIComponent(q)+'&limit=12',{signal:controller.signal})
    const payload=await response.json() as any
    if(!response.ok||payload?.ok===false)throw new Error(payload?.error?.message||'Nem sikerült betölteni az átvételi pontokat.')
    setResults(Array.isArray(payload?.data?.items)?payload.data.items:[])
   }catch(err){if((err as Error).name!=='AbortError')setError(err instanceof Error?err.message:'Nem sikerült betölteni az átvételi pontokat.')}finally{setLoading(false)}
  },220)
  return()=>{window.clearTimeout(timer);controller.abort()}
 },[query])

 useEffect(()=>{
  if(!mapOpen)return
  const receive=(event:MessageEvent)=>{
   if(event.origin!=='https://cdn.foxpost.hu')return
   const point=parseFoxpostMessage(event.data)
   if(!point)return
   onChange(point);setQuery(point.city||point.zip);setMapOpen(false);setChoosing(false)
  }
  window.addEventListener('message',receive)
  return()=>window.removeEventListener('message',receive)
 },[mapOpen,onChange])

 const choose=(point:FoxpostPickupPoint)=>{onChange(point);setQuery(point.city||point.zip);setChoosing(false)}

 return <div className="foxpost-picker simple">
  {value&&!choosing&&<div className="foxpost-selected"><div className="foxpost-selected-icon">🟠</div><div><span>Kiválasztott átvételi pont</span><b>{value.name}</b><small>{value.address}</small>{value.findme&&<em>{value.findme.replace(/<br\s*\/?\s*>/gi,' · ')}</em>}</div><button type="button" onClick={()=>setChoosing(true)}>Másik pont</button></div>}

  {choosing&&<div className="foxpost-simple-panel">
   <div className="foxpost-simple-head"><div><span className="foxpost-step">1</span><div><b>Hol szeretnéd átvenni?</b><small>Írd be a települést vagy az irányítószámot.</small></div></div><button type="button" onClick={()=>setMapOpen(true)}>Térkép</button></div>
   <div className="foxpost-search-box"><span>⌕</span><input autoFocus value={query} onChange={e=>{setTyped(true);setQuery(e.target.value)}} placeholder="Pl. Karcag vagy 5300" aria-label="FOXPOST pont keresése"/>{query&&<button type="button" aria-label="Keresés törlése" onClick={()=>{setTyped(true);setQuery('')}}>×</button>}</div>
   <div className="foxpost-search-hint">{query.trim().length<2?'Legalább 2 karaktert írj be.':loading?'Átvételi pontok keresése…':error?error:results.length?`${results.length} találat · válassz egyet`:'Nincs találat. Próbáld csak a település nevét vagy az irányítószámot.'}</div>
   {results.length>0&&<div className="foxpost-results" aria-live="polite">{results.map(point=><button type="button" className="foxpost-result" key={String(point.operator_id||point.place_id)} onClick={()=>choose(point)}><span className="foxpost-result-logo">🟠</span><span className="foxpost-result-copy"><span><b>{point.name}</b>{point.variant&&<i>{point.variant}</i>}</span><small>{point.address}</small>{point.findme&&<em>{point.findme.replace(/<br\s*\/?\s*>/gi,' · ')}</em>}</span><strong>Ezt választom</strong></button>)}</div>}
   <div className="foxpost-simple-footer"><span><b>2</b> Kattints az „Ezt választom” gombra.</span><button type="button" onClick={()=>setMapOpen(true)}>Inkább térképen választok →</button></div>
  </div>}

  {mapOpen&&<div className="foxpost-modal" role="dialog" aria-modal="true" aria-label="FOXPOST átvételi pont választó"><div className="foxpost-modal-card"><header><div><span className="eyebrow">Alternatív választás</span><h2>FOXPOST térképes kereső</h2><p>Ha a gyors keresőben nem találod a megfelelő pontot, itt a hivatalos térképen is kiválaszthatod.</p></div><button type="button" aria-label="Bezárás" onClick={()=>setMapOpen(false)}>×</button></header><iframe title="FOXPOST átvételi pont kereső" src={widgetUrl} loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/></div></div>}
 </div>
}
