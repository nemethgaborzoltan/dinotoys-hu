import {Link,createFileRoute} from '@tanstack/react-router'
import {useState} from 'react'
import {createDemoSupportTicket,supportCategoryLabels,type DemoSupportCategory} from '../lib/demo-support'
import {absoluteUrl} from '../lib/seo'
import {getLegalProfile} from '../server/storefront'

export const Route=createFileRoute('/kapcsolat')({
 loader:()=>getLegalProfile(),
 head:()=>({meta:[{title:'Kapcsolat és ügyfélszolgálat | DinoToys.hu'},{name:'description',content:'Kapcsolatfelvétel a DinoToys.hu ügyfélszolgálatával rendelési, termék- és vásárlási kérdésekben.'}],links:[{rel:'canonical',href:absoluteUrl('/kapcsolat')}]}),
 component:Contact,
})

function Contact(){
 const legal=Route.useLoaderData(),[ticketNumber,setTicketNumber]=useState<string|null>(null)
 return <div className="container section info-page"><span className="eyebrow">Segítünk</span><h1>Kapcsolat és ügyfélszolgálat</h1><p className="lead">{legal.complete?'Vedd fel velünk a kapcsolatot rendelési, termék- vagy vásárlási kérdésben.':'A webshop jogi profiljának pontos kapcsolati adatai még kitöltendők az adminban.'}</p>
 <div className="contact-layout"><section><h2>Elérhetőségek</h2><div className="contact-chip">✉️ {legal.email}</div><div className="contact-chip">☎️ {legal.phone}</div><div className="contact-chip">📮 {legal.mailingAddress}</div><p>Fogyasztói panaszhoz a <Link to="/jogi/$slug" params={{slug:'panaszkezeles'}}><b>Panaszkezelés</b></Link> oldal ad részletes tájékoztatást.</p></section>
 {ticketNumber?<div className="success-card compact contact-success"><span>✓</span><h2>Megkeresés rögzítve</h2><p>Az ügyfélszolgálati azonosítód: <b>{ticketNumber}</b>. A megkeresés már megjelent az Admin → Ügyfélszolgálat menüben.</p><button className="btn btn-ghost" onClick={()=>setTicketNumber(null)}>Új üzenet</button></div>:<form className="contact-form" onSubmit={e=>{e.preventDefault();const form=new FormData(e.currentTarget);const ticket=createDemoSupportTicket({name:String(form.get('name')||''),email:String(form.get('email')||''),orderNumber:String(form.get('orderNumber')||''),subject:String(form.get('subject')||'Ügyfélszolgálati kérdés'),message:String(form.get('message')||''),category:String(form.get('category')||'other') as DemoSupportCategory});setTicketNumber(ticket.ticketNumber);e.currentTarget.reset()}}><div className="contact-form-grid"><label><span>Név</span><input name="name" autoComplete="name" required/></label><label><span>E-mail</span><input name="email" type="email" autoComplete="email" required/></label><label><span>Témakör</span><select name="category" defaultValue="order">{Object.entries(supportCategoryLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label><span>Rendelésszám <small>(ha van)</small></span><input name="orderNumber" autoComplete="off" placeholder="DT-2026-000001"/></label><label className="field-wide"><span>Tárgy</span><input name="subject" placeholder="Röviden miről van szó?" required/></label><label className="field-wide"><span>Üzenet</span><textarea name="message" required rows={6} placeholder="Írd le minél pontosabban, miben segíthetünk…"/></label></div><p className="form-privacy-note">Az üzenetben megadott adatokat a megkeresés megválaszolásához kezeljük. Részletek: <Link to="/jogi/$slug" params={{slug:'adatkezeles'}}>Adatkezelési tájékoztató</Link>.</p><button className="btn btn-primary">Üzenet elküldése</button><small>Demo módban a megkeresés helyben mentődik; külső e-mail nem kerül kiküldésre.</small></form>}</div></div>
}
