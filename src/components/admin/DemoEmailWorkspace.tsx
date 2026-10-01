import {useEffect,useMemo,useState} from 'react'
import {readDemoOrders} from '../../lib/demo-orders'
import {
 clearDemoEmails,deleteDemoEmail,demoEmailDefaults,demoEmailTypeLabels,generateMissingDemoEmails,markDemoEmailSent,
 queueDemoEmailForOrder,readDemoEmails,readDemoEmailTemplates,resetDemoEmailTemplates,saveDemoEmailTemplate,subscribeDemoEmails,
 type DemoEmail,type DemoEmailStatus,type DemoEmailType,type DemoEmailTemplateSettings
} from '../../lib/demo-emails'
import {readDemoIntegrationConfig} from '../../lib/integration-config'

const typeOrder:DemoEmailType[]=['order_confirmation','payment_confirmed','payment_failed','shipment_handed_over','invoice_issued','delivered','refund_confirmed']

export function DemoEmailWorkspace(){
 const [emails,setEmails]=useState<DemoEmail[]>(()=>readDemoEmails())
 const [tab,setTab]=useState<'outbox'|'templates'>('outbox')
 const [selected,setSelected]=useState<DemoEmail|null>(null)
 const [status,setStatus]=useState<'all'|DemoEmailStatus>('all')
 const [type,setType]=useState<'all'|DemoEmailType>('all')
 const [query,setQuery]=useState('')
 const reload=()=>setEmails(readDemoEmails())
 useEffect(()=>subscribeDemoEmails(reload),[])
 const integrations=readDemoIntegrationConfig()
 const filtered=useMemo(()=>emails.filter(email=>{
  if(status!=='all'&&email.status!==status)return false
  if(type!=='all'&&email.type!==type)return false
  const q=query.trim().toLowerCase()
  if(q&&!([email.orderNumber,email.recipient,email.recipientName,email.subject,demoEmailTypeLabels[email.type]].join(' ').toLowerCase().includes(q)))return false
  return true
 }),[emails,status,type,query])
 const queued=emails.filter(email=>email.status==='queued').length
 const sent=emails.filter(email=>email.status==='demo_sent').length
 const uniqueOrders=new Set(emails.map(email=>email.orderId)).size
 return <>
  <div className="admin2-heading row demo-email-heading"><div><span className="eyebrow">Offline e-mail központ</span><h1>E-mailek</h1><p>A rendelési eseményekből automatikusan elkészülnek a tranzakciós e-mailek. Most csak előnézet és demo küldési állapot működik; valódi levél nem hagyja el a böngészőt.</p></div><div className="demo-email-heading-actions"><button className="btn btn-ghost" onClick={()=>{generateMissingDemoEmails(readDemoOrders());reload()}}>Hiányzó levelek létrehozása</button>{emails.length>0&&<button className="btn admin2-danger" onClick={()=>{if(confirm('Törlöd az összes offline demo e-mailt?')){clearDemoEmails();setSelected(null);reload()}}}>Demo e-mailek törlése</button>}</div></div>
  <div className="demo-email-metrics"><EmailMetric label="Küldésre vár" value={String(queued)} hint="offline outbox"/><EmailMetric label="Demo elküldve" value={String(sent)} hint="csak szimuláció"/><EmailMetric label="Rendelések" value={String(uniqueOrders)} hint="kapcsolódó rendelések"/><EmailMetric label="Feladó" value={integrations.email.resend.fromName||'DinoToys.hu'} hint={integrations.email.resend.fromEmail||'e-mail még nincs megadva'}/></div>
  <div className="demo-email-tabs"><button className={tab==='outbox'?'active':''} onClick={()=>setTab('outbox')}>✉ Kimenő levelek</button><button className={tab==='templates'?'active':''} onClick={()=>setTab('templates')}>▤ Sablonok és automatizmusok</button></div>
  {tab==='outbox'?<>
   <div className="demo-email-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Keresés rendelés, címzett vagy tárgy alapján…"/><select value={status} onChange={e=>setStatus(e.target.value as 'all'|DemoEmailStatus)}><option value="all">Minden állapot</option><option value="queued">Küldésre vár</option><option value="demo_sent">Demo elküldve</option></select><select value={type} onChange={e=>setType(e.target.value as 'all'|DemoEmailType)}><option value="all">Minden levéltípus</option>{typeOrder.map(item=><option key={item} value={item}>{demoEmailTypeLabels[item]}</option>)}</select></div>
   {filtered.length===0?<div className="admin2-empty demo-email-empty"><span>✉</span><b>{emails.length?'Nincs ilyen levél.':'Még nincs demo e-mail.'}</b><p>{emails.length?'Válassz másik szűrőt.':'Készíts demo rendelést a checkoutban, vagy kattints a Hiányzó levelek létrehozása gombra.'}</p></div>:<div className="demo-email-list">{filtered.map(email=><EmailRow key={email.id} email={email} onOpen={()=>setSelected(email)} onChange={reload}/>)}</div>}
  </>:<TemplateWorkspace/>}
  {selected&&<EmailPreview email={selected} onClose={()=>setSelected(null)} onChange={()=>{reload();setSelected(readDemoEmails().find(item=>item.id===selected.id)||null)}}/>}
 </>
}

function EmailMetric({label,value,hint}:{label:string;value:string;hint:string}){return <div><span>{label}</span><b>{value}</b><small>{hint}</small></div>}

function EmailRow({email,onOpen,onChange}:{email:DemoEmail;onOpen:()=>void;onChange:()=>void}){
 return <article className="demo-email-row">
  <button className="demo-email-main" onClick={onOpen}><span className={`demo-email-type type-${email.type}`}>{typeIcon(email.type)}</span><div className="demo-email-recipient"><small>{demoEmailTypeLabels[email.type]}</small><b>{email.recipientName}</b><span>{email.recipient}</span></div><div className="demo-email-subject"><small>Tárgy</small><b>{email.subject}</b><span>#{email.orderNumber}</span></div><div><small>Létrehozva</small><b>{new Date(email.createdAt).toLocaleString('hu-HU')}</b><span>{email.senderName}</span></div><div><strong className={`demo-email-state ${email.status}`}>{email.status==='queued'?'KÜLDÉSRE VÁR':'DEMO ELKÜLDVE'}</strong>{email.sentAt&&<span>{new Date(email.sentAt).toLocaleString('hu-HU')}</span>}</div><i>→</i></button>
  <div className="demo-email-row-actions"><span>Ez a levél nem került valódi e-mail szolgáltatóhoz.</span>{email.status==='queued'&&<button onClick={()=>{markDemoEmailSent(email.id);onChange()}}>Demo küldés ✓</button>}<button onClick={onOpen}>Előnézet</button><button className="danger" onClick={()=>{deleteDemoEmail(email.id);onChange()}}>Törlés</button></div>
 </article>
}

function typeIcon(type:DemoEmailType){return({order_confirmation:'🛒',payment_confirmed:'✓',payment_failed:'!',shipment_handed_over:'📦',invoice_issued:'🧾',delivered:'🎁',refund_confirmed:'↩'} as Record<DemoEmailType,string>)[type]}

function EmailPreview({email,onClose,onChange}:{email:DemoEmail;onClose:()=>void;onChange:()=>void}){
 const order=readDemoOrders().find(item=>item.id===email.orderId)
 return <div className="admin2-drawer-backdrop" onMouseDown={onClose}><div className="admin2-drawer demo-email-drawer" onMouseDown={e=>e.stopPropagation()}>
  <div className="admin2-drawer-head"><div><span className="eyebrow">E-mail előnézet</span><h2>{demoEmailTypeLabels[email.type]}</h2><div className="demo-email-preview-meta"><span>#{email.orderNumber}</span><span>{email.recipient}</span><strong className={`demo-email-state ${email.status}`}>{email.status==='queued'?'Küldésre vár':'Demo elküldve'}</strong></div></div><button onClick={onClose}>×</button></div>
  <section className="demo-email-envelope"><div><small>Feladó</small><b>{email.senderName} &lt;{email.senderEmail}&gt;</b></div><div><small>Címzett</small><b>{email.recipientName} &lt;{email.recipient}&gt;</b></div><div><small>Tárgy</small><b>{email.subject}</b></div><div><small>Preheader</small><b>{email.preheader}</b></div></section>
  <div className="demo-email-warning"><b>Offline demo</b><span>A „Demo küldés” csak állapotot vált. Valódi e-mail nem kerül kiküldésre, amíg a Resend szerveroldali integrációt be nem kapcsoljuk.</span></div>
  <iframe className="demo-email-preview-frame" title={email.subject} srcDoc={email.html}/>
  <section className="demo-email-text-preview"><details><summary>Szöveges változat</summary><pre>{email.text}</pre></details></section>
  <div className="demo-email-preview-actions">{email.status==='queued'&&<button className="btn btn-primary" onClick={()=>{markDemoEmailSent(email.id);onChange()}}>Demo küldés</button>}{order&&<button className="btn btn-ghost" onClick={()=>{queueDemoEmailForOrder(order,email.type,true);onChange()}}>Új példány generálása</button>}<button className="btn admin2-danger" onClick={()=>{deleteDemoEmail(email.id);onClose();onChange()}}>Törlés</button></div>
 </div></div>
}

function TemplateWorkspace(){
 const [templates,setTemplates]=useState(()=>readDemoEmailTemplates())
 const [editing,setEditing]=useState<DemoEmailType|null>(null)
 const save=(type:DemoEmailType,value:DemoEmailTemplateSettings)=>{saveDemoEmailTemplate(type,value);setTemplates(readDemoEmailTemplates());setEditing(null)}
 return <>
  <section className="demo-email-automation-intro"><div><span className="eyebrow">Automatikus események</span><h2>Mikor készüljön e-mail?</h2><p>A levél automatikusan bekerül az offline outboxba, amikor a rendelés eléri az adott eseményt. Az éles verzióban ugyanezeket az eseményeket küldjük majd Resenddel.</p></div><button className="btn btn-ghost" onClick={()=>{resetDemoEmailTemplates();setTemplates(readDemoEmailTemplates())}}>Alap sablonok visszaállítása</button></section>
  <div className="demo-email-template-list">{typeOrder.map((type,index)=>{const template=templates[type]||demoEmailDefaults[type];return <article key={type} className="demo-email-template-card"><div className="demo-email-template-step"><b>{index+1}</b><span>{typeIcon(type)}</span></div><div><small>{eventTrigger(type)}</small><h3>{demoEmailTypeLabels[type]}</h3><p><b>Tárgy:</b> {template.subject}</p><p><b>Előnézeti sor:</b> {template.preheader}</p><div className="demo-email-template-tags"><span>{{'{{orderNumber}}'}} → rendelési szám</span><span>{{'{{customerName}}'}} → vásárló neve</span></div></div><div className="demo-email-template-actions"><label><input type="checkbox" checked={template.enabled} onChange={e=>{saveDemoEmailTemplate(type,{...template,enabled:e.target.checked});setTemplates(readDemoEmailTemplates())}}/><span>{template.enabled?'Automatikus':'Kikapcsolva'}</span></label><button onClick={()=>setEditing(type)}>Szerkesztés</button></div></article>})}</div>
  <section className="demo-email-resend-roadmap"><div><span>1</span><b>Offline sablon</b><small>most kész</small></div><i>→</i><div><span>2</span><b>Outbox esemény</b><small>most kész</small></div><i>→</i><div><span>3</span><b>Resend API</b><small>következő éles lépés</small></div><i>→</i><div><span>4</span><b>Delivery webhook</b><small>kézbesítés / bounce</small></div></section>
  {editing&&<TemplateDrawer type={editing} initial={templates[editing]} onClose={()=>setEditing(null)} onSave={value=>save(editing,value)}/>}
 </>
}

function eventTrigger(type:DemoEmailType){return({order_confirmation:'Checkout sikeres leadása után',payment_confirmed:'Fizetés sikeres állapotra váltásakor',payment_failed:'Fizetés sikertelen állapotra váltásakor',shipment_handed_over:'Futárnak átadva státusznál',invoice_issued:'Demo / később valódi számla kiállításakor',delivered:'Kézbesítve státusznál',refund_confirmed:'Visszatérítés rögzítésekor'} as Record<DemoEmailType,string>)[type]}

function TemplateDrawer({type,initial,onClose,onSave}:{type:DemoEmailType;initial:DemoEmailTemplateSettings;onClose:()=>void;onSave:(value:DemoEmailTemplateSettings)=>void}){
 const [form,setForm]=useState(initial)
 return <div className="admin2-drawer-backdrop" onMouseDown={onClose}><div className="admin2-drawer narrow" onMouseDown={e=>e.stopPropagation()}><div className="admin2-drawer-head"><div><span className="eyebrow">E-mail sablon</span><h2>{demoEmailTypeLabels[type]}</h2></div><button onClick={onClose}>×</button></div><div className="demo-email-template-editor"><label className="admin2-toggle"><span><b>Automatikusan készüljön el</b><small>{eventTrigger(type)}</small></span><input type="checkbox" checked={form.enabled} onChange={e=>setForm({...form,enabled:e.target.checked})}/></label><label><span>Tárgy</span><input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/><small>Használható: {{'{{orderNumber}}'}}, {{'{{customerName}}'}}</small></label><label><span>Preheader / előnézeti sor</span><textarea rows={4} value={form.preheader} onChange={e=>setForm({...form,preheader:e.target.value})}/><small>Ez jelenhet meg a levelezőben a tárgy mellett.</small></label></div><div className="admin2-drawer-actions"><span/><span/><button className="btn btn-ghost" onClick={onClose}>Mégse</button><button className="btn btn-primary" onClick={()=>onSave(form)}>Mentés</button></div></div></div>
}
