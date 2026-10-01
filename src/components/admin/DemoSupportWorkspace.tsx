import {useEffect,useMemo,useState} from 'react'
import {
 addDemoSupportMessage,deleteDemoSupportTicket,readDemoSupportTickets,subscribeDemoSupport,supportCategoryLabels,supportStatusLabels,
 updateDemoSupportTicket,type DemoSupportStatus,type DemoSupportTicket
} from '../../lib/demo-support'
import {readDemoOrders} from '../../lib/demo-orders'

export function DemoSupportWorkspace(){
 const [tickets,setTickets]=useState<DemoSupportTicket[]>(()=>readDemoSupportTickets())
 const [selected,setSelected]=useState<DemoSupportTicket|null>(null)
 const [query,setQuery]=useState('')
 const [status,setStatus]=useState<'all'|DemoSupportStatus>('all')
 const reload=()=>{const next=readDemoSupportTickets();setTickets(next);setSelected(current=>current?next.find(item=>item.id===current.id)||null:null)}
 useEffect(()=>subscribeDemoSupport(reload),[])
 const filtered=useMemo(()=>tickets.filter(ticket=>{
  if(status!=='all'&&ticket.status!==status)return false
  const q=query.trim().toLowerCase()
  return !q||[ticket.ticketNumber,ticket.name,ticket.email,ticket.orderNumber,ticket.subject,supportCategoryLabels[ticket.category]].filter(Boolean).join(' ').toLowerCase().includes(q)
 }),[tickets,status,query])
 const metrics={new:tickets.filter(t=>t.status==='new').length,open:tickets.filter(t=>t.status==='in_progress'||t.status==='waiting_customer').length,resolved:tickets.filter(t=>t.status==='resolved').length,high:tickets.filter(t=>t.priority==='high'&&t.status!=='resolved').length}
 return <>
  <div className="admin2-heading row support-heading"><div><span className="eyebrow">Ügyfélszolgálat</span><h1>Megkeresések</h1><p>Kapcsolati üzenetek, rendelési kérdések és visszaküldési ügyek egy helyen.</p></div></div>
  <div className="support-metrics"><Metric label="Új" value={metrics.new}/><Metric label="Nyitott" value={metrics.open}/><Metric label="Sürgős" value={metrics.high}/><Metric label="Lezárt" value={metrics.resolved}/></div>
  <div className="support-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Keresés név, e-mail, rendelés vagy tárgy alapján…"/><select value={status} onChange={e=>setStatus(e.target.value as 'all'|DemoSupportStatus)}><option value="all">Minden állapot</option>{Object.entries(supportStatusLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
  {filtered.length===0?<div className="admin2-empty support-empty"><b>Nincs ilyen ügyfélszolgálati megkeresés.</b><span>A Kapcsolat oldalon elküldött demo üzenetek itt jelennek meg.</span></div>:<div className="support-list">{filtered.map(ticket=><button key={ticket.id} onClick={()=>setSelected(ticket)} className={ticket.status==='new'?'unread':''}><span className={'support-status-dot '+ticket.status}/><div><small>{ticket.ticketNumber} · {supportCategoryLabels[ticket.category]}</small><b>{ticket.subject}</b><span>{ticket.name} · {ticket.email}{ticket.orderNumber?' · '+ticket.orderNumber:''}</span></div><div><strong>{supportStatusLabels[ticket.status]}</strong><small>{new Date(ticket.updatedAt).toLocaleString('hu-HU')}</small></div><i>→</i></button>)}</div>}
  {selected&&<SupportDrawer ticket={selected} onClose={()=>setSelected(null)} onChanged={reload}/>}
 </>
}
function Metric({label,value}:{label:string;value:number}){return <div><span>{label}</span><b>{value}</b></div>}

function SupportDrawer({ticket,onClose,onChanged}:{ticket:DemoSupportTicket;onClose:()=>void;onChanged:()=>void}){
 const [reply,setReply]=useState('')
 const order=ticket.orderNumber?readDemoOrders().find(item=>item.orderNumber===ticket.orderNumber):undefined
 const mutate=(fn:()=>unknown)=>{fn();onChanged()}
 return <div className="admin2-drawer-backdrop" onMouseDown={onClose}><div className="admin2-drawer support-drawer" onMouseDown={e=>e.stopPropagation()}>
  <div className="admin2-drawer-head"><div><span className="eyebrow">{ticket.ticketNumber}</span><h2>{ticket.subject}</h2><div className="support-ticket-meta"><span>{ticket.name}</span><span>{ticket.email}</span>{ticket.orderNumber&&<span>#{ticket.orderNumber}</span>}</div></div><button onClick={onClose}>×</button></div>
  <div className="support-ticket-controls"><label><span>Állapot</span><select value={ticket.status} onChange={e=>mutate(()=>updateDemoSupportTicket(ticket.id,{status:e.target.value as DemoSupportStatus}))}>{Object.entries(supportStatusLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label><span>Prioritás</span><select value={ticket.priority} onChange={e=>mutate(()=>updateDemoSupportTicket(ticket.id,{priority:e.target.value as 'normal'|'high'}))}><option value="normal">Normál</option><option value="high">Sürgős</option></select></label></div>
  {order&&<section className="support-order-link"><div><small>Kapcsolódó rendelés</small><b>{order.orderNumber}</b><span>{order.customer.name} · {order.totals.totalHuf.toLocaleString('hu-HU')} Ft · {order.status}</span></div><a href="/admin">Rendelések megnyitása ↗</a></section>}
  <section className="support-thread">{ticket.messages.map(message=><article key={message.id} className={message.author}><div><b>{message.author==='customer'?ticket.name:'DinoToys ügyfélszolgálat'}</b><small>{new Date(message.at).toLocaleString('hu-HU')}</small></div><p>{message.body}</p></article>)}</section>
  <section className="support-reply"><label><span>Válasz / belső demo üzenet</span><textarea rows={5} value={reply} onChange={e=>setReply(e.target.value)} placeholder="Írd meg a választ…"/></label><div><small>Demo módban ez nem küld valódi e-mailt, csak az ügy történetéhez adja a választ.</small><button className="btn btn-primary" disabled={!reply.trim()} onClick={()=>{mutate(()=>addDemoSupportMessage(ticket.id,reply,'admin'));setReply('')}}>Válasz rögzítése</button></div></section>
  <div className="admin2-drawer-actions"><button className="btn admin2-danger" onClick={()=>{if(confirm('Törlöd ezt a demo megkeresést?')){deleteDemoSupportTicket(ticket.id);onChanged();onClose()}}}>Törlés</button><span/><button className="btn btn-ghost" onClick={onClose}>Bezárás</button>{ticket.status!=='resolved'&&<button className="btn btn-primary" onClick={()=>mutate(()=>updateDemoSupportTicket(ticket.id,{status:'resolved'}))}>Lezárás</button>}</div>
 </div></div>
}
