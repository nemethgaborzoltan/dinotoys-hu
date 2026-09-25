import {Link,createFileRoute} from '@tanstack/react-router'
import {useState} from 'react'
import {absoluteUrl} from '../lib/seo'
import {getLegalProfile} from '../server/storefront'

export const Route=createFileRoute('/kapcsolat')({
 loader:()=>getLegalProfile(),
 head:()=>({meta:[{title:'Kapcsolat és ügyfélszolgálat | DinoToys.hu'},{name:'description',content:'Kapcsolatfelvétel a DinoToys.hu ügyfélszolgálatával rendelési, termék- és vásárlási kérdésekben.'}],links:[{rel:'canonical',href:absoluteUrl('/kapcsolat')}]}),
 component:Contact,
})

function Contact(){
 const legal=Route.useLoaderData(),[sent,setSent]=useState(false)
 return <div className="container section info-page"><span className="eyebrow">Segítünk</span><h1>Kapcsolat és ügyfélszolgálat</h1><p className="lead">{legal.complete?'Vedd fel velünk a kapcsolatot rendelési, termék- vagy vásárlási kérdésben.':'A webshop jogi profiljának pontos kapcsolati adatai még kitöltendők az adminban.'}</p>
 <div className="contact-layout"><section><h2>Elérhetőségek</h2><div className="contact-chip">✉️ {legal.email}</div><div className="contact-chip">☎️ {legal.phone}</div><div className="contact-chip">📮 {legal.mailingAddress}</div><p>Fogyasztói panaszhoz a <Link to="/jogi/$slug" params={{slug:'panaszkezeles'}}><b>Panaszkezelés</b></Link> oldal ad részletes tájékoztatást.</p></section>
 {sent?<div className="success-card compact"><span>✓</span><h2>Demo üzenet rögzítve</h2><p>A tényleges support/e-mail integráció aktiválásáig ez a felület nem küld külső e-mailt.</p></div>:<form className="contact-form" onSubmit={e=>{e.preventDefault();setSent(true)}}><label><span>Név</span><input name="name" autoComplete="name" required/></label><label><span>E-mail</span><input name="email" type="email" autoComplete="email" required/></label><label><span>Rendelésszám <small>(ha van)</small></span><input name="orderNumber" autoComplete="off"/></label><label><span>Üzenet</span><textarea name="message" required rows={5}/></label><p className="form-privacy-note">Az üzenetben megadott adatokat a megkeresés megválaszolásához kezeljük. Részletek: <Link to="/jogi/$slug" params={{slug:'adatkezeles'}}>Adatkezelési tájékoztató</Link>.</p><button className="btn btn-primary">Üzenet elküldése</button><small>Jelenleg UI-demó; nem küld külső e-mailt.</small></form>}</div></div>
}
