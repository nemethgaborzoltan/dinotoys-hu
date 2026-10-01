import {useEffect,useMemo,useState} from 'react'
import {money} from '../../lib/format'
import {
 addDemoOrderNote,clearDemoOrders,createDemoShipment,demoOrderStatusLabel,issueDemoInvoice,readDemoOrders,setDemoPaymentStatus,
 subscribeDemoOrders,updateDemoOrderStatus,type DemoOrder,type DemoOrderStatus,type DemoPaymentStatus
} from '../../lib/demo-orders'
import {demoEmailTypeLabels,demoEmailsForOrder,queueDemoEmailForOrder,subscribeDemoEmails,type DemoEmailType} from '../../lib/demo-emails'

const statusOrder:DemoOrderStatus[]=['new','pending_payment','paid','processing','packed','shipped','delivered','cancelled','returned','refunded']
const paymentLabels:Record<DemoPaymentStatus,string>={pending:'Fizetésre vár',paid:'Fizetve',cod:'Utánvét',failed:'Sikertelen',refunded:'Visszatérítve'}

export function DemoOrdersWorkspace(){
 const [orders,setOrders]=useState<DemoOrder[]>(()=>readDemoOrders())
 const [selectedId,setSelectedId]=useState<string|null>(null)
 const [filter,setFilter]=useState<'all'|'attention'|DemoOrderStatus>('all')
 const [query,setQuery]=useState('')
 const reload=()=>setOrders(readDemoOrders())
 useEffect(()=>subscribeDemoOrders(reload),[])
 const selected=orders.find(order=>order.id===selectedId)||null
 const filtered=useMemo(()=>orders.filter(order=>{
  if(filter==='attention'&&!['new','pending_payment','paid','processing','packed'].includes(order.status))return false
  if(filter!=='all'&&filter!=='attention'&&order.status!==filter)return false
  const q=query.trim().toLowerCase()
  if(q&&!([order.orderNumber,order.customer.name,order.customer.email,order.customer.phone,...order.items.map(item=>item.name)].join(' ').toLowerCase().includes(q)))return false
  return true
 }),[orders,filter,query])
 const revenue=orders.filter(order=>!['cancelled','returned','refunded'].includes(order.status)).reduce((sum,order)=>sum+order.totals.totalHuf,0)
 const attention=orders.filter(order=>['new','pending_payment','paid','processing','packed'].includes(order.status)).length
 const unpaid=orders.filter(order=>order.payment.status==='pending').length
 const toShip=orders.filter(order=>['paid','processing','packed'].includes(order.status)).length
 return <>
  <div className="admin2-heading row demo-orders-heading"><div><span className="eyebrow">Offline rendelésközpont</span><h1>Rendelések</h1><p>A demo pénztárból létrejövő rendelések ezen a gépen megmaradnak. Itt végigpróbálhatod a teljes munkafolyamatot adatbázis és külső API nélkül.</p></div><div className="demo-order-heading-actions"><a className="btn btn-ghost" href="/checkout" target="_blank" rel="noreferrer">Pénztár tesztelése ↗</a>{orders.length>0&&<button className="btn admin2-danger" onClick={()=>{if(confirm('Biztosan törlöd az összes demo rendelést és visszaállítod a lefoglalt készletet?')){clearDemoOrders();setSelectedId(null);reload()}}}>Demo rendelések törlése</button>}</div></div>
  <div className="demo-order-metrics"><OrderMetric label="Rendelések" value={String(orders.length)} hint="helyben elmentve"/><OrderMetric label="Demo forgalom" value={money(revenue)} hint="nem törölt rendelések"/><OrderMetric label="Figyelmet igényel" value={String(attention)} hint="még nincs lezárva"/><OrderMetric label="Feladásra vár" value={String(toShip)} hint={`${unpaid} fizetésre vár`}/></div>
  <div className="demo-order-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Keresés rendelés, név, e-mail vagy termék alapján…"/><div className="demo-order-filters"><FilterButton active={filter==='all'} onClick={()=>setFilter('all')}>Mind</FilterButton><FilterButton active={filter==='attention'} onClick={()=>setFilter('attention')}>⚠ Teendő</FilterButton><FilterButton active={filter==='pending_payment'} onClick={()=>setFilter('pending_payment')}>Fizetésre vár</FilterButton><FilterButton active={filter==='processing'} onClick={()=>setFilter('processing')}>Összekészítés</FilterButton><FilterButton active={filter==='packed'} onClick={()=>setFilter('packed')}>Csomagolva</FilterButton><FilterButton active={filter==='shipped'} onClick={()=>setFilter('shipped')}>Feladva</FilterButton></div></div>
  {filtered.length===0?<div className="admin2-empty demo-order-empty"><span>▤</span><b>{orders.length?'Nincs ilyen rendelés.':'Még nincs demo rendelés.'}</b><p>{orders.length?'Próbálj másik szűrőt vagy keresést.':'Tegyél terméket a kosárba, menj végig a checkouton, és a rendelés automatikusan megjelenik itt.'}</p><a href="/termekek" target="_blank" rel="noreferrer" className="btn btn-primary">Demo rendelés indítása ↗</a></div>:<div className="demo-order-list">{filtered.map(order=><OrderCard key={order.id} order={order} onOpen={()=>setSelectedId(order.id)} onChange={reload}/>)}</div>}
  {selected&&<OrderDrawer order={selected} onClose={()=>setSelectedId(null)} onChange={()=>{reload();const fresh=readDemoOrders().find(item=>item.id===selected.id);if(!fresh)setSelectedId(null)}}/>}
 </>
}

function OrderMetric({label,value,hint}:{label:string;value:string;hint:string}){return <div><span>{label}</span><b>{value}</b><small>{hint}</small></div>}
function FilterButton({active,onClick,children}:{active:boolean;onClick:()=>void;children:React.ReactNode}){return <button className={active?'active':''} onClick={onClick}>{children}</button>}

function OrderCard({order,onOpen,onChange}:{order:DemoOrder;onOpen:()=>void;onChange:()=>void}){
 const next=nextAction(order)
 return <article className="demo-order-card">
  <button className="demo-order-card-main" onClick={onOpen}>
   <div className="demo-order-number"><span>{statusIcon(order.status)}</span><div><b>#{order.orderNumber}</b><small>{new Date(order.createdAt).toLocaleString('hu-HU')}</small></div></div>
   <div><small>Vásárló</small><b>{order.customer.name}</b><span>{order.customer.email}</span></div>
   <div><small>Összeg</small><b>{money(order.totals.totalHuf)}</b><span>{order.items.reduce((sum,item)=>sum+item.quantity,0)} db · {order.items.length} tétel</span></div>
   <div><small>Szállítás</small><b>{order.shipping.label}</b><span>{order.shipping.pickupPoint?.name||order.shipping.address?.city||'—'}</span></div>
   <div><small>Állapot</small><strong className={`demo-order-status s-${order.status}`}>{demoOrderStatusLabel(order.status)}</strong><span>{paymentLabels[order.payment.status]}</span></div>
   <i>→</i>
  </button>
  <div className="demo-order-card-actions"><span>{order.billing.invoiceStatus==='issued'?(`🧾 ${order.billing.invoiceNumber}`):'○ Nincs számla'} · {order.shipment.barcode?(`📦 ${order.shipment.barcode}`):'○ Nincs csomag'}</span>{next&&<button onClick={()=>{updateDemoOrderStatus(order.id,next.status);onChange()}}>{next.label}</button>}<button className="open" onClick={onOpen}>Részletek</button></div>
 </article>
}

function nextAction(order:DemoOrder):{status:DemoOrderStatus;label:string}|null{
 if(order.status==='new')return{status:'processing',label:'Összekészítés →'}
 if(order.status==='pending_payment')return null
 if(order.status==='paid')return{status:'processing',label:'Összekészítés →'}
 if(order.status==='processing')return{status:'packed',label:'Csomagolva ✓'}
 if(order.status==='packed')return{status:'shipped',label:'Futárnak átadva →'}
 if(order.status==='shipped')return{status:'delivered',label:'Kézbesítve ✓'}
 return null
}
function statusIcon(status:DemoOrderStatus){if(status==='delivered')return'✓';if(['cancelled','returned','refunded'].includes(status))return'↩';if(status==='pending_payment')return'₣';if(['packed','shipped'].includes(status))return'📦';return'●'}

function OrderDrawer({order,onClose,onChange}:{order:DemoOrder;onClose:()=>void;onChange:()=>void}){
 const [note,setNote]=useState('')
 const mutate=(fn:()=>unknown)=>{fn();onChange()}
 const canCreateShipment=order.shipping.provider==='foxpost'&&!order.shipment.barcode
 return <div className="admin2-drawer-backdrop" onMouseDown={onClose}><div className="admin2-drawer demo-order-drawer" onMouseDown={e=>e.stopPropagation()}>
  <div className="admin2-drawer-head"><div><span className="eyebrow">Demo rendelés</span><h2>#{order.orderNumber}</h2><div className="demo-order-drawer-status"><strong className={`demo-order-status s-${order.status}`}>{demoOrderStatusLabel(order.status)}</strong><span>{new Date(order.createdAt).toLocaleString('hu-HU')}</span></div></div><button onClick={onClose}>×</button></div>
  <section className="demo-order-flow"><span className={flowDone(order,'new')?'done':''}>1<b>Rendelés</b></span><i/><span className={flowDone(order,'paid')?'done':''}>2<b>Fizetés</b></span><i/><span className={flowDone(order,'processing')?'done':''}>3<b>Összekészítés</b></span><i/><span className={flowDone(order,'packed')?'done':''}>4<b>Csomagolva</b></span><i/><span className={flowDone(order,'shipped')?'done':''}>5<b>Feladva</b></span><i/><span className={flowDone(order,'delivered')?'done':''}>6<b>Kézbesítve</b></span></section>
  <div className="demo-order-drawer-grid">
   <section className="demo-order-panel"><div className="demo-order-panel-head"><div><span className="eyebrow">Vásárló</span><h3>{order.customer.name}</h3></div></div><dl><div><dt>E-mail</dt><dd>{order.customer.email}</dd></div><div><dt>Telefon</dt><dd>{order.customer.phone}</dd></div><div><dt>Szállítás</dt><dd>{order.shipping.label}</dd></div>{order.shipping.pickupPoint?<><div><dt>Átvételi pont</dt><dd>{order.shipping.pickupPoint.name}</dd></div><div><dt>Cím</dt><dd>{order.shipping.pickupPoint.address}</dd></div></>:order.shipping.address&&<div><dt>Cím</dt><dd>{order.shipping.address.postalCode} {order.shipping.address.city}, {order.shipping.address.line1}</dd></div>}</dl></section>
   <section className="demo-order-panel"><div className="demo-order-panel-head"><div><span className="eyebrow">Fizetés</span><h3>{order.payment.label}</h3></div><strong className={`payment-state p-${order.payment.status}`}>{paymentLabels[order.payment.status]}</strong></div><div className="demo-payment-actions"><button disabled={order.payment.status==='paid'} onClick={()=>mutate(()=>setDemoPaymentStatus(order.id,'paid'))}>✓ Fizetve</button><button disabled={order.payment.status==='failed'} onClick={()=>mutate(()=>setDemoPaymentStatus(order.id,'failed'))}>✕ Sikertelen</button><button disabled={order.payment.status==='refunded'} onClick={()=>mutate(()=>setDemoPaymentStatus(order.id,'refunded'))}>↩ Visszatérítve</button></div></section>
  </div>
  <section className="demo-order-panel"><div className="demo-order-panel-head"><div><span className="eyebrow">Tételek</span><h3>{order.items.length} tétel · {order.items.reduce((sum,item)=>sum+item.quantity,0)} db</h3></div><b>{money(order.totals.totalHuf)}</b></div><div className="demo-order-items">{order.items.map(item=><div key={`${item.productId}:${item.variantId||'base'}`}><img src={item.image} alt="" onError={e=>{e.currentTarget.src='/favicon.svg'}}/><span><b>{item.name}</b><small>{item.sku}{item.variantLabel?(` · ${item.variantLabel}`):''}</small><em>{item.quantity} × {money(item.unitPriceHuf)}</em></span><strong>{money(item.lineTotalHuf)}</strong></div>)}</div><div className="demo-order-totals"><span>Termékek <b>{money(order.totals.itemsHuf)}</b></span>{order.totals.discountHuf>0&&<span>Kedvezmény <b>− {money(order.totals.discountHuf)}</b></span>}<span>Szállítás <b>{money(order.totals.shippingHuf)}</b></span>{order.totals.paymentFeeHuf>0&&<span>Fizetési díj <b>{money(order.totals.paymentFeeHuf)}</b></span>}<span className="total">Összesen <b>{money(order.totals.totalHuf)}</b></span></div></section>
  <div className="demo-order-drawer-grid">
   <section className="demo-order-panel"><div className="demo-order-panel-head"><div><span className="eyebrow">Szállítás</span><h3>{order.shipping.provider==='foxpost'?'FOXPOST demo csomag':order.shipping.label}</h3></div><span className="admin2-pill">{order.shipment.status==='not_created'?'nincs csomag':order.shipment.status}</span></div>{order.shipping.provider==='foxpost'?<>{order.shipment.barcode?<div className="demo-parcel"><span>📦</span><div><small>Demo csomagszám</small><b>{order.shipment.barcode}</b><em>{order.shipment.size} méret · utánvét {money(order.shipment.codHuf||0)}</em></div></div>:<p className="demo-panel-help">A valódi FOXPOST API helyett most helyi csomagot hozunk létre. Később ugyanez a gomb hívja majd a WebAPI-t.</p>}<div className="demo-panel-actions">{canCreateShipment&&<button className="btn btn-primary" onClick={()=>mutate(()=>createDemoShipment(order.id,'M'))}>Demo FOXPOST csomag létrehozása</button>}{order.shipment.barcode&&<button className="btn btn-ghost" onClick={()=>printLabel(order)}>Címke előnézet / nyomtatás</button>}</div></>:<p className="demo-panel-help">Ehhez a szállítási módhoz a demo csomagkészítés még nincs bekapcsolva.</p>}</section>
   <section className="demo-order-panel"><div className="demo-order-panel-head"><div><span className="eyebrow">Számlázás</span><h3>{order.billing.provider}</h3></div><span className={`admin2-pill ${order.billing.invoiceStatus==='issued'?'ok':''}`}>{order.billing.invoiceStatus==='issued'?'számla kész':'nincs számla'}</span></div>{order.billing.invoiceStatus==='issued'?<div className="demo-invoice-summary"><span>🧾</span><div><small>Demo számlaszám</small><b>{order.billing.invoiceNumber}</b><em>{order.billing.companyInvoice?(`${order.billing.companyName||''} · ${order.billing.taxNumber||''}`):'Magánszemély'}</em></div></div>:<p className="demo-panel-help">API nélkül is kipróbálhatod a számlázási munkafolyamatot. A demo számla nem minősül valódi bizonylatnak.</p>}<div className="demo-panel-actions">{order.billing.invoiceStatus!=='issued'&&<button className="btn btn-primary" onClick={()=>mutate(()=>issueDemoInvoice(order.id))}>Demo számla kiállítása</button>}{order.billing.invoiceStatus==='issued'&&<button className="btn btn-ghost" onClick={()=>printInvoice(order)}>Számla előnézet / nyomtatás</button>}</div></section>
  </div>
  <section className="demo-order-panel"><div className="demo-order-panel-head"><div><span className="eyebrow">Rendelési állapot</span><h3>Munka következő lépése</h3></div></div><div className="demo-status-actions">{statusOrder.map(status=><button key={status} className={order.status===status?'active':''} onClick={()=>mutate(()=>updateDemoOrderStatus(order.id,status))}>{demoOrderStatusLabel(status)}</button>)}</div></section>
  <OrderEmailPanel order={order}/>
  <section className="demo-order-panel"><div className="demo-order-panel-head"><div><span className="eyebrow">Belső megjegyzés</span><h3>Jegyzet az adminnak</h3></div></div><div className="demo-order-note"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Pl. ajándékcsomagolást kért telefonon…"/><button onClick={()=>{if(!note.trim())return;addDemoOrderNote(order.id,note);setNote('');onChange()}}>Hozzáadás</button></div></section>
  <section className="demo-order-panel timeline"><div className="demo-order-panel-head"><div><span className="eyebrow">Idővonal</span><h3>Mi történt a rendeléssel?</h3></div></div><div className="demo-order-timeline">{[...order.events].reverse().map(item=><div key={item.id}><i className={`event-${item.kind}`}/><time>{new Date(item.at).toLocaleString('hu-HU')}</time><span><b>{item.title}</b>{item.detail&&<small>{item.detail}</small>}</span></div>)}</div></section>
 </div></div>
}


function OrderEmailPanel({order}:{order:DemoOrder}){
 const [emails,setEmails]=useState(()=>demoEmailsForOrder(order.id))
 useEffect(()=>subscribeDemoEmails(()=>setEmails(demoEmailsForOrder(order.id))),[order.id])
 const suggested:DemoEmailType[]=['order_confirmation',...(order.payment.status==='paid'?['payment_confirmed' as const]:[]),...(order.payment.status==='failed'?['payment_failed' as const]:[]),...(order.shipment.barcode?['shipment_handed_over' as const]:[]),...(order.billing.invoiceStatus==='issued'?['invoice_issued' as const]:[]),...(order.status==='delivered'?['delivered' as const]:[]),...(order.payment.status==='refunded'?['refund_confirmed' as const]:[])]
 return <section className="demo-order-panel"><div className="demo-order-panel-head"><div><span className="eyebrow">E-mail automatizmus</span><h3>{emails.length} elkészült levél</h3></div><span className="admin2-pill">{emails.filter(email=>email.status==='queued').length} vár</span></div><div className="demo-order-email-list">{emails.length?emails.map(email=><button key={email.id} onClick={()=>openEmailHtml(email.subject,email.html)}><span>{email.status==='demo_sent'?'✓':'✉'}</span><div><b>{demoEmailTypeLabels[email.type]}</b><small>{email.subject}</small></div><i>Előnézet ↗</i></button>):<p className="demo-panel-help">Ehhez a rendeléshez még nincs e-mail. A rendelés eseményei automatikusan hozzák létre őket.</p>}</div><div className="demo-order-email-generate"><small>Új előnézet készítése:</small>{suggested.map(type=><button key={type} onClick={()=>queueDemoEmailForOrder(order,type,true)}>{demoEmailTypeLabels[type]}</button>)}</div></section>
}

function openEmailHtml(title:string,html:string){
 const popup=window.open('','_blank','width=760,height=900')
 if(!popup)return
 popup.document.open();popup.document.write(html);popup.document.title=title;popup.document.close()
}

function flowDone(order:DemoOrder,target:DemoOrderStatus){
 if(['cancelled','returned','refunded'].includes(order.status))return false
 const flow:DemoOrderStatus[]=['new','pending_payment','paid','processing','packed','shipped','delivered']
 return flow.indexOf(order.status)>=flow.indexOf(target)
}
function escapeHtml(value:unknown){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char))}
function openPrint(title:string,body:string){
 const popup=window.open('','_blank','width=880,height=900')
 if(!popup)return
 popup.document.write('<!doctype html><html><head><title>'+escapeHtml(title)+'</title><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#17211b;padding:32px}h1,h2,p{margin:0 0 12px}.muted{color:#6f7a74}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}.card{border:1px solid #ddd;border-radius:12px;padding:14px}table{width:100%;border-collapse:collapse;margin:22px 0}th,td{text-align:left;padding:10px;border-bottom:1px solid #ddd}th:last-child,td:last-child{text-align:right}.total{font-size:20px;font-weight:800}.demo{padding:10px;background:#fff2d9;border:1px solid #edd49a;border-radius:9px;margin-bottom:20px}@media print{button{display:none}body{padding:10mm}}</style></head><body>'+body+'<script>window.onload=function(){window.print()}<\/script></body></html>')
 popup.document.close()
}
function printInvoice(order:DemoOrder){
 const rows=order.items.map(item=>'<tr><td>'+escapeHtml(item.name)+'<br><small>'+escapeHtml(item.sku)+'</small></td><td>'+item.quantity+' × '+money(item.unitPriceHuf)+'</td><td>'+money(item.lineTotalHuf)+'</td></tr>').join('')
 const buyer=order.billing.companyInvoice?(order.billing.companyName||order.customer.name):order.customer.name
 const tax=order.billing.taxNumber?'<p>Adószám: '+escapeHtml(order.billing.taxNumber)+'</p>':''
 openPrint(order.billing.invoiceNumber||'Demo számla','<div class="demo"><b>DEMO SZÁMLA – NEM ADÓÜGYI BIZONYLAT</b></div><h1>'+escapeHtml(order.billing.invoiceNumber)+'</h1><p class="muted">'+escapeHtml(order.billing.provider)+'</p><div class="grid"><div class="card"><b>Eladó</b><p>DinoToys.hu – demo</p></div><div class="card"><b>Vevő</b><p>'+escapeHtml(buyer)+'</p>'+tax+'</div></div><table><thead><tr><th>Tétel</th><th>Mennyiség</th><th>Bruttó</th></tr></thead><tbody>'+rows+'</tbody></table><p>Szállítás: <b>'+money(order.totals.shippingHuf)+'</b></p><p class="total">Fizetendő: '+money(order.totals.totalHuf)+'</p>')
}
function printLabel(order:DemoOrder){
 const point=order.shipping.pickupPoint
 openPrint(order.shipment.barcode||'Demo címke','<div class="demo"><b>DEMO FOXPOST CÍMKE – NEM FELADHATÓ</b></div><h1>'+escapeHtml(order.shipment.barcode)+'</h1><h2>'+escapeHtml(order.customer.name)+'</h2><p>'+escapeHtml(order.customer.phone)+'</p><div class="card"><b>Átvételi pont</b><p>'+escapeHtml(point?.name||'')+'</p><p>'+escapeHtml(point?.address||'')+'</p><p>Destination: '+escapeHtml(point?.operator_id||point?.place_id||'')+'</p></div><div class="grid"><div class="card"><b>Rendelés</b><p>'+escapeHtml(order.orderNumber)+'</p></div><div class="card"><b>Méret / utánvét</b><p>'+escapeHtml(order.shipment.size||'M')+' · '+money(order.shipment.codHuf||0)+'</p></div></div>')
}
