import {useEffect,useMemo,useState} from 'react'
import {deleteDemoReview,readDemoReviews,subscribeDemoReviews,updateDemoReviewStatus,type DemoReviewStatus} from '../../lib/demo-reviews'
import {deleteDemoStockAlert,readDemoStockAlerts,subscribeDemoStockAlerts,updateDemoStockAlert,type DemoStockAlertStatus} from '../../lib/demo-stock-alerts'

type Tab='reviews'|'stock'

export function DemoEngagementWorkspace(){
 const [tab,setTab]=useState<Tab>('reviews')
 const [reviews,setReviews]=useState(()=>readDemoReviews())
 const [alerts,setAlerts]=useState(()=>readDemoStockAlerts())
 const [query,setQuery]=useState('')
 useEffect(()=>subscribeDemoReviews(()=>setReviews(readDemoReviews())),[])
 useEffect(()=>subscribeDemoStockAlerts(()=>setAlerts(readDemoStockAlerts())),[])
 const visibleReviews=useMemo(()=>reviews.filter(item=>!query.trim()||[item.productName,item.name,item.email,item.title].join(' ').toLowerCase().includes(query.toLowerCase())),[reviews,query])
 const visibleAlerts=useMemo(()=>alerts.filter(item=>!query.trim()||[item.productName,item.email,item.variantLabel].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase())),[alerts,query])
 return <>
  <div className="admin2-heading"><span className="eyebrow">Vásárlói jelzések</span><h1>Értékelések & készletértesítők</h1><p>A termékoldalakról érkező demo visszajelzések és készletértesítési igények egy helyen.</p></div>
  <div className="engagement-tabs"><button className={tab==='reviews'?'active':''} onClick={()=>setTab('reviews')}>★ Értékelések <span>{reviews.length}</span></button><button className={tab==='stock'?'active':''} onClick={()=>setTab('stock')}>🔔 Készletértesítők <span>{alerts.filter(a=>a.status==='active').length}</span></button></div>
  <div className="admin2-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==='reviews'?'Termék, vásárló, e-mail vagy cím…':'Termék, e-mail vagy variáns…'}/></div>
  {tab==='reviews'?<ReviewList reviews={visibleReviews} onChanged={()=>setReviews(readDemoReviews())}/>:<StockList alerts={visibleAlerts} onChanged={()=>setAlerts(readDemoStockAlerts())}/>}
 </>
}

function ReviewList({reviews,onChanged}:{reviews:ReturnType<typeof readDemoReviews>;onChanged:()=>void}){
 const pending=reviews.filter(r=>r.status==='pending').length,approved=reviews.filter(r=>r.status==='approved').length,rejected=reviews.filter(r=>r.status==='rejected').length
 return <>
  <div className="support-metrics"><Metric label="Moderálásra vár" value={pending}/><Metric label="Publikus" value={approved}/><Metric label="Elutasított" value={rejected}/><Metric label="Ellenőrzött vásárlás" value={reviews.filter(r=>r.verifiedPurchase).length}/></div>
  {reviews.length===0?<div className="admin2-empty"><b>Még nincs termékértékelés.</b><span>A vásárlók a termékoldalon tudnak demo értékelést beküldeni.</span></div>:<div className="review-admin-list">{reviews.map(review=><article key={review.id}><div className="review-admin-head"><div><span className={'review-status '+review.status}>{review.status==='pending'?'várakozik':review.status==='approved'?'publikus':'elutasítva'}</span><b>{review.productName}</b><small>{review.name} · {review.email} · {new Date(review.createdAt).toLocaleString('hu-HU')}</small></div><strong>{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</strong></div><h3>{review.title}</h3><p>{review.body}</p><div className="review-admin-meta">{review.verifiedPurchase&&<span>✓ Ellenőrzött demo vásárlás</span>}</div><div className="review-admin-actions">{review.status!=='approved'&&<button onClick={()=>{updateDemoReviewStatus(review.id,'approved');onChanged()}}>Jóváhagyás</button>}{review.status!=='rejected'&&<button onClick={()=>{updateDemoReviewStatus(review.id,'rejected');onChanged()}}>Elutasítás</button>}<select value={review.status} onChange={e=>{updateDemoReviewStatus(review.id,e.target.value as DemoReviewStatus);onChanged()}}><option value="pending">Várakozik</option><option value="approved">Publikus</option><option value="rejected">Elutasítva</option></select><button className="danger" onClick={()=>{if(confirm('Törlöd ezt az értékelést?')){deleteDemoReview(review.id);onChanged()}}}>Törlés</button></div></article>)}</div>}
 </>
}
function StockList({alerts,onChanged}:{alerts:ReturnType<typeof readDemoStockAlerts>;onChanged:()=>void}){
 const active=alerts.filter(a=>a.status==='active').length,notified=alerts.filter(a=>a.status==='notified').length,cancelled=alerts.filter(a=>a.status==='cancelled').length
 return <>
  <div className="support-metrics"><Metric label="Aktív kérés" value={active}/><Metric label="Értesített" value={notified}/><Metric label="Leállított" value={cancelled}/><Metric label="Összes" value={alerts.length}/></div>
  {alerts.length===0?<div className="admin2-empty"><b>Még nincs készletértesítő.</b><span>Elfogyott terméknél a vásárló e-mailes értesítést kérhet.</span></div>:<div className="stock-alert-list">{alerts.map(alert=><article key={alert.id}><div><span className={'stock-alert-status '+alert.status}>{alert.status==='active'?'aktív':alert.status==='notified'?'értesítve':'leállítva'}</span><b>{alert.productName}</b><small>{alert.variantLabel||'Alapváltozat'} · {alert.email}</small><em>{new Date(alert.createdAt).toLocaleString('hu-HU')}</em></div><div>{alert.status==='active'&&<button onClick={()=>{updateDemoStockAlert(alert.id,'notified');onChanged()}}>Demo értesítés kész</button>}{alert.status!=='cancelled'&&<button onClick={()=>{updateDemoStockAlert(alert.id,'cancelled');onChanged()}}>Leállítás</button>}<select value={alert.status} onChange={e=>{updateDemoStockAlert(alert.id,e.target.value as DemoStockAlertStatus);onChanged()}}><option value="active">Aktív</option><option value="notified">Értesített</option><option value="cancelled">Leállított</option></select><button className="danger" onClick={()=>{if(confirm('Törlöd ezt a készletértesítőt?')){deleteDemoStockAlert(alert.id);onChanged()}}}>Törlés</button></div></article>)}</div>}
 </>
}
function Metric({label,value}:{label:string;value:number}){return <div><span>{label}</span><b>{value}</b></div>}
