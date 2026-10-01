import {useEffect,useState} from 'react'
import {clearDinoLocalStorage,exportDinoLocalStorage,importDinoLocalStorage,localStorageUsage} from '../../lib/local-store'

export function DemoStorageWorkspace(){
 const [usage,setUsage]=useState(()=>localStorageUsage())
 const [message,setMessage]=useState<string|null>(null)
 const refresh=()=>setUsage(localStorageUsage())
 useEffect(()=>{const onStorage=()=>refresh();window.addEventListener('storage',onStorage);window.addEventListener('dinotoys:local-store',onStorage);return()=>{window.removeEventListener('storage',onStorage);window.removeEventListener('dinotoys:local-store',onStorage)}},[])
 const exportData=()=>{
  const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),version:1,data:exportDinoLocalStorage()},null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='dinotoys-local-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url)
 }
 const importFile=async(file:File)=>{
  try{
   const parsed=JSON.parse(await file.text()),data=parsed?.data&&typeof parsed.data==='object'?parsed.data:parsed
   const count=importDinoLocalStorage(data);setMessage(count+' helyi adat visszaállítva. Frissítsd az oldalt a teljes újratöltéshez.');refresh()
  }catch{setMessage('A kiválasztott fájl nem érvényes DinoToys helyi mentés.')}
 }
 return <>
  <div className="admin2-heading row"><div><span className="eyebrow">Offline adattár</span><h1>Helyi adatok</h1><p>Verziózott LocalStorage, mentés-visszaállítás és tárhelyellenőrzés. Ezek az adatok csak ezen a böngészőn élnek a Supabase bekötéséig.</p></div><div className="admin2-heading-actions"><button className="btn btn-ghost" onClick={refresh}>Frissítés</button><button className="btn btn-primary" onClick={exportData}>Biztonsági mentés</button></div></div>
  {message&&<div className="admin2-notice" onClick={()=>setMessage(null)}>{message} ×</div>}
  <div className="storage-metrics"><Metric label="DinoToys kulcsok" value={String(usage.items)}/><Metric label="Használt hely" value={formatBytes(usage.bytes)}/><Metric label="Shop schema" value="v4"/><Metric label="Szinkron" value="több böngészőlap"/></div>
  <div className="admin2-grid storage-grid">
   <section className="admin2-card"><div className="admin2-card-head"><div><span className="eyebrow">Biztonság</span><h2>Mentés és visszaállítás</h2></div></div><p className="admin2-help">Exportálhatod a kosarat, demo rendeléseket, megjelenési beállításokat, értékeléseket, értesítőket és más helyi DinoToys adatokat egy JSON fájlba.</p><div className="storage-actions"><button className="btn btn-primary" onClick={exportData}>JSON mentés készítése</button><label className="btn btn-ghost storage-import">Mentés visszatöltése<input type="file" accept="application/json,.json" onChange={e=>{const file=e.target.files?.[0];if(file)void importFile(file);e.currentTarget.value=''}}/></label></div></section>
   <section className="admin2-card"><div className="admin2-card-head"><div><span className="eyebrow">Adatvédelem</span><h2>Helyi demo adatok törlése</h2></div></div><p className="admin2-help">Törli a DinoToys által létrehozott helyi adatokat ezen a böngészőn. Más webhelyek LocalStorage-ához nem nyúl.</p><button className="btn admin2-danger" onClick={()=>{if(confirm('Biztosan törlöd az összes DinoToys helyi demo adatot? Előtte érdemes mentést készíteni.')){const count=clearDinoLocalStorage();setMessage(count+' helyi kulcs törölve.');refresh()}}}>Összes DinoToys helyi adat törlése</button></section>
  </div>
  <section className="admin2-card storage-keys"><div className="admin2-card-head"><div><span className="eyebrow">Diagnosztika</span><h2>Tárolt kulcsok</h2></div><span>{formatBytes(usage.bytes)}</span></div><div>{usage.keys.map(item=><div key={item.key}><code>{item.key}</code><span>{formatBytes(item.bytes)}</span></div>)}</div><p className="admin2-help">A shop állapot v4-től kompakt formában ment: a beépített katalógustermékek teljes snapshotjai nem duplikálódnak, a régi v3 shop-state automatikusan migrálódik, és másik böngészőlapon végzett módosítás storage eseménnyel szinkronizálódik.</p></section>
 </>
}
function Metric({label,value}:{label:string;value:string}){return <div><span>{label}</span><b>{value}</b></div>}
function formatBytes(bytes:number){if(bytes<1024)return bytes+' B';if(bytes<1024*1024)return(bytes/1024).toFixed(1)+' KB';return(bytes/1024/1024).toFixed(2)+' MB'}
