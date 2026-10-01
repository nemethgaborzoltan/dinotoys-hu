import {createFileRoute,Link} from '@tanstack/react-router'
import {useEffect,useMemo,useState} from 'react'
import {money} from '../lib/format'
import {useShop} from '../lib/shop'
import {getProductArt,getProductPrice,getVariantLabel} from '../lib/catalog'
import {demoCommerceDefaults,readDemoCommercePreferences} from '../lib/demo-commerce'
import {billingProviderLabel,demoIntegrationDefaults,getDemoShippingMethods,readDemoIntegrationConfig} from '../lib/integration-config'
import {FoxpostPointPicker} from '../components/FoxpostPointPicker'
import {normalizeFoxpostPhone,type FoxpostPickupPoint} from '../lib/foxpost'

export const Route=createFileRoute('/checkout')({
 head:()=>({meta:[{title:'Pénztár | DinoToys.hu'},{name:'robots',content:'noindex,nofollow'}]}),
 component:Checkout
})

type PaymentId='card'|'cod'|'transfer'

const paymentOptions=[
 {id:'card' as const,icon:'💳',name:'Online bankkártya',description:'Demo fizetés – nem történik valódi terhelés',fee:0},
 {id:'cod' as const,icon:'💵',name:'Utánvét',description:'Fizetés átvételkor · demo kezelési díj',fee:490},
 {id:'transfer' as const,icon:'🏦',name:'Banki átutalás',description:'Demo opció – díjbekérő nélkül',fee:0},
]

function Checkout(){
 const shop=useShop()
 const [done,setDone]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[result,setResult]=useState<any>(null)
 const initialShipping=getDemoShippingMethods(demoIntegrationDefaults)
 const [shippingOptions,setShippingOptions]=useState(initialShipping),[shipping,setShipping]=useState<string>(initialShipping[0]?.id||'personal-pickup'),[payment,setPayment]=useState<PaymentId>('card'),[invoice,setInvoice]=useState(false),[demoPrefs,setDemoPrefs]=useState(demoCommerceDefaults),[integrationConfig,setIntegrationConfig]=useState(demoIntegrationDefaults),[foxpostPoint,setFoxpostPoint]=useState<FoxpostPickupPoint|null>(null),[postalCode,setPostalCode]=useState(''),[city,setCity]=useState('')
 useEffect(()=>{setDemoPrefs(readDemoCommercePreferences());const integrations=readDemoIntegrationConfig();setIntegrationConfig(integrations);const methods=getDemoShippingMethods(integrations);setShippingOptions(methods);setShipping(current=>methods.some(item=>item.id===current)?current:(methods[0]?.id||'personal-pickup'))},[])
 const shippingOption=shippingOptions.find(x=>x.id===shipping)??shippingOptions[0]??{id:'personal-pickup',provider:'local',name:'Személyes átvétel',description:'Demó',icon:'🏠',fee:0,freeAboveHuf:null}
 const configuredPaymentOptions=useMemo(()=>{const online=integrationConfig.payment.barion.enabled?{id:'card' as const,icon:'💳',name:'Barion bankkártya',description:`Barion ${integrationConfig.payment.barion.sandbox?'sandbox':'éles'} mód · demóban nincs terhelés`,fee:0}:integrationConfig.payment.stripe.enabled?{id:'card' as const,icon:'💳',name:'Stripe bankkártya',description:'Stripe integráció előkészítve · demóban nincs terhelés',fee:0}:paymentOptions[0];return[online,...paymentOptions.slice(1)]},[integrationConfig])
 const paymentOption=configuredPaymentOptions.find(x=>x.id===payment)!
 const shippingFee=shippingOption.freeAboveHuf!==null&&shop.subtotal>=shippingOption.freeAboveHuf?0:shippingOption.fee
 const total=shop.subtotal+shippingFee+paymentOption.fee
 const shippingThreshold=shippingOption.freeAboveHuf
 const needsFoxpostPoint=shippingOption.provider==='foxpost'
 const invoiceProvider=billingProviderLabel(integrationConfig)
 const productCount=useMemo(()=>shop.cart.reduce((sum,line)=>sum+line.quantity,0),[shop.cart])

 if(done)return <div className="container section checkout-success-page"><div className="success-card checkout-success"><span>✓</span><div className="demo-badge">DEMO RENDELÉS</div><h1>{result?.order_number?`Rendelés #${result.order_number}`:'Rendelés rögzítve'}</h1><p>Köszönjük! A demó pénztár végigfutott, de valódi fizetés, készletfoglalás és e-mail küldés nem történt.</p><div className="success-order-meta"><div><small>Fizetendő</small><b>{money(result?.total_huf??0)}</b></div><div><small>Szállítás</small><b>{result?.shipping_label}</b></div><div><small>Fizetés</small><b>{result?.payment_label}</b></div><div><small>Számlázás</small><b>{result?.invoice_provider||invoiceProvider}</b></div>{result?.pickup_point&&<div><small>Átvételi pont</small><b>{result.pickup_point.name}</b></div>}</div><div className="success-actions"><Link to="/" className="btn btn-primary">Főoldal</Link><Link to="/termekek" search={{}} className="btn btn-ghost">Tovább vásárolok</Link></div></div></div>

 if(!shop.cart.length)return <div className="container section"><div className="empty-state large"><span>🛒</span><h1>A pénztárhoz előbb tegyél valamit a kosárba</h1><p>A demo checkout teljes folyamatát termékkel tudod kipróbálni.</p><Link to="/termekek" search={{}} className="btn btn-primary">Termékek felfedezése</Link></div></div>

 return <div className="container section checkout-page">
  {error&&<div className="admin2-error">{error}</div>}
  <div className="checkout-header">
   <div><span className="eyebrow">Biztonságos demo pénztár</span><h1>Rendelés véglegesítése</h1><p>Minden lépést kipróbálhatsz. A demó módban nem történik valódi terhelés vagy futármegrendelés.</p><div className="checkout-mode-note">{demoPrefs.guestCheckout?'✓ Vendégként is végigvihető a rendelés':'○ Fiókos vásárlásra tervezve · demóban vendégként is tesztelhető'}</div></div>
   <div className="checkout-steps" aria-label="Pénztár lépései"><span className="active"><b>1</b>Adatok</span><i/><span className="active"><b>2</b>Szállítás</span><i/><span className="active"><b>3</b>Fizetés</span></div>
  </div>

  <div className="checkout-grid">
   <form className="checkout-form checkout-form-pro" onSubmit={async e=>{
    e.preventDefault();setBusy(true);setError(null)
    try{
     const form=new FormData(e.currentTarget)
     if(needsFoxpostPoint&&!foxpostPoint)throw new Error('FOXPOST szállításhoz válassz ki egy átvételi pontot.')
     const normalizedPhone=needsFoxpostPoint?normalizeFoxpostPhone(String(form.get('phone')||'')):String(form.get('phone')||'')
     if(needsFoxpostPoint&&!/^(\+36|36)(20|30|31|50|51|70)\d{7}$/.test(normalizedPhone))throw new Error('FOXPOST-hoz magyar mobiltelefonszám szükséges, például +36 30 123 4567.')
     const live=shop.cart.every(line=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(line.productId))
     if(!live){
      const order={order_number:`DEMO-${Date.now().toString().slice(-6)}`,total_huf:total,shipping_label:shippingOption.name,payment_label:paymentOption.name,invoice_provider:invoiceProvider,pickup_point:needsFoxpostPoint?foxpostPoint:null}
      setResult(order);shop.clearCart();setDone(true);return
     }
     const response=await fetch('/api/v1/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      idempotencyKey:crypto.randomUUID(),
      email:String(form.get('email')||''),phone:normalizedPhone,
      shippingMethod:{provider:shippingOption.provider,methodId:shippingOption.id,feeHuf:shippingFee,pickupPoint:needsFoxpostPoint?foxpostPoint:null},
      couponCode:shop.appliedCoupon?.code??null,
      shippingAddress:needsFoxpostPoint&&foxpostPoint?{name:String(form.get('name')||''),countryCode:'HU',postalCode:foxpostPoint.zip||'0000',city:foxpostPoint.city||'FOXPOST',line1:foxpostPoint.street||foxpostPoint.address}:{name:String(form.get('name')||''),countryCode:'HU',postalCode:String(form.get('postalCode')||''),city:String(form.get('city')||''),line1:String(form.get('line1')||'')},
      items:shop.cart.map(line=>({productId:line.productId,variantId:line.variantId,quantity:line.quantity}))
     })})
     const payload=await response.json() as any
     if(!response.ok||payload?.ok===false)throw new Error(payload?.error?.message||'A rendelés létrehozása sikertelen.')
     setResult({...payload.data,shipping_label:shippingOption.name,payment_label:paymentOption.name,invoice_provider:invoiceProvider,pickup_point:needsFoxpostPoint?foxpostPoint:null});shop.clearCart();setDone(true)
    }catch(err){setError(err instanceof Error?err.message:'Checkout hiba')}finally{setBusy(false)}
   }}>
    <section className="checkout-section">
     <div className="checkout-section-title"><b>1</b><div><h2>Kapcsolattartás</h2><p>A neved, e-mail címed és telefonszámod kell a rendeléshez.</p></div></div>
     <div className="form-grid"><label className="field-wide"><span>Teljes név</span><input name="name" autoComplete="name" required/></label><label><span>E-mail</span><input name="email" type="email" autoComplete="email" placeholder="nev@email.hu" required/></label><label><span>Telefon</span><input name="phone" autoComplete="tel" placeholder="+36 30 123 4567" required/></label></div>
    </section>

    <section className="checkout-section">
     <div className="checkout-section-title"><b>2</b><div><h2>Hogyan kéred a csomagot?</h2><p>Először válassz szállítási módot. FOXPOST esetén utána csak egy átvételi pontot kell kiválasztanod.</p></div></div>
     <div className="checkout-choice-grid">{shippingOptions.map(option=>{const effective=option.freeAboveHuf!==null&&shop.subtotal>=option.freeAboveHuf?0:option.fee;return <label key={option.id} className={`checkout-choice ${shipping===option.id?'selected':''}`}><input type="radio" name="shippingMethod" checked={shipping===option.id} onChange={()=>setShipping(option.id)}/><span className="choice-icon">{option.icon}</span><span className="choice-copy"><b>{option.name}</b><small>{option.description}</small></span><strong>{effective?money(effective):'Ingyenes'}</strong></label>})}</div>
     {needsFoxpostPoint&&<FoxpostPointPicker value={foxpostPoint} onChange={point=>{setFoxpostPoint(point);setPostalCode(point.zip);setCity(point.city)}}/>}
    </section>

    <section className="checkout-section">
     <div className="checkout-section-title"><b>3</b><div><h2>{needsFoxpostPoint?'Átvételi pont':'Szállítási cím'}</h2><p>{needsFoxpostPoint?'FOXPOST-nál nem kell külön utcacímet megadnod. A kiválasztott pont lesz a kézbesítési hely.':'Add meg, hová kéred a csomagot.'}</p></div></div>
     {needsFoxpostPoint?<div className="foxpost-address-confirm">{foxpostPoint?<><span>✓</span><div><b>{foxpostPoint.name}</b><small>{foxpostPoint.address}</small></div></>:<><span>!</span><div><b>Még nincs átvételi pont kiválasztva</b><small>Menj vissza egy lépéssel, és válassz FOXPOST pontot.</small></div></>}</div>:<div className="form-grid"><label><span>Irányítószám</span><input name="postalCode" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{4}" placeholder="5310" value={postalCode} onChange={e=>setPostalCode(e.target.value.replace(/\D/g,'').slice(0,4))} required/></label><label><span>Város</span><input name="city" autoComplete="address-level2" value={city} onChange={e=>setCity(e.target.value)} required/></label><label className="field-wide"><span>Utca, házszám</span><input name="line1" autoComplete="street-address" required/></label><label className="field-wide"><span>Megjegyzés a futárnak <small>(opcionális)</small></span><input name="deliveryNote" placeholder="Pl. kapucsengő, emelet…"/></label></div>}
    </section>

    <section className="checkout-section">
     <div className="checkout-section-title"><b>4</b><div><h2>Fizetési mód</h2><p>Demóban egyik opció sem indít valódi tranzakciót.</p></div></div>
     <div className="checkout-choice-grid">{configuredPaymentOptions.map(option=><label key={option.id} className={`checkout-choice ${payment===option.id?'selected':''}`}><input type="radio" name="paymentMethod" checked={payment===option.id} onChange={()=>setPayment(option.id)}/><span className="choice-icon">{option.icon}</span><span className="choice-copy"><b>{option.name}</b><small>{option.description}</small></span><strong>{option.fee?`+ ${money(option.fee)}`:'0 Ft'}</strong></label>)}</div>
    </section>

    <section className="checkout-section checkout-invoice">
     <label className="invoice-toggle"><input type="checkbox" checked={invoice} onChange={e=>setInvoice(e.target.checked)}/><span><b>Céges számlát kérek</b><small>{invoiceProvider} · demóban még nem készül valódi számla.</small></span></label>
     {invoice&&<div className="form-grid invoice-fields"><label><span>Cégnév</span><input name="companyName" required={invoice}/></label><label><span>Adószám</span><input name="taxNumber" required={invoice}/></label></div>}
    </section>

    <label className="consent checkout-consent"><input type="checkbox" required/><span>Elolvastam és elfogadom az <Link to="/jogi/$slug" params={{slug:'aszf'}}>ÁSZF-et</Link>, valamint megismertem az <Link to="/jogi/$slug" params={{slug:'adatkezeles'}}>Adatkezelési tájékoztatót</Link>.</span></label>
    <button className="btn btn-primary btn-block btn-large checkout-submit" disabled={busy}>{busy?'Rendelés feldolgozása…':`Fizetési kötelezettséggel járó megrendelés · ${money(total)}`}</button>
    {demoPrefs.trustBadges&&<div className="checkout-trust-row"><span>🔒 Titkosított kapcsolat</span><span>↩ 14 napos elállás</span>{demoPrefs.deliveryEstimate&&<span>📦 Várható kézbesítés: 1–2 munkanap</span>}</div>}
   </form>

   <aside className="summary-card checkout-summary checkout-summary-pro">
    <div className="summary-heading"><div><span className="eyebrow">Rendelésed</span><h2>{productCount} termék</h2></div><Link to="/kosar">Kosár szerkesztése</Link></div>
    <div className="checkout-summary-products">{shop.cart.map(line=>{const p=shop.getProduct(line.productId);if(!p)return null;const label=getVariantLabel(p,line.variantId);return <div className="summary-product" key={`${p.id}:${line.variantId??'base'}`}><img src={getProductArt(p,line.variantId)} alt="" loading="lazy" decoding="async" onError={e=>{e.currentTarget.src='/favicon.svg'}}/><span><b>{p.name}</b><small>{line.quantity} db{label?` · ${label}`:''}</small></span><strong>{money(getProductPrice(p,line.variantId)*line.quantity)}</strong></div>})}</div>
    <div><span>Termékek</span><b>{money(shop.itemsSubtotal)}</b></div>
    {shop.discount>0&&<div className="summary-discount"><span>Kupon ({shop.appliedCoupon?.code})</span><b>− {money(shop.discount)}</b></div>}
    <div><span>{shippingOption.name}</span><b>{shippingFee?money(shippingFee):'Ingyenes'}</b></div>
    {needsFoxpostPoint&&<div className="summary-pickup-point"><span>Átvételi pont</span><b>{foxpostPoint?.name||'Még nincs kiválasztva'}</b>{foxpostPoint&&<small>{foxpostPoint.address}</small>}</div>}
    {paymentOption.fee>0&&<div><span>{paymentOption.name}</span><b>{money(paymentOption.fee)}</b></div>}
    <div className="summary-total"><span>Összesen</span><b>{money(total)}</b></div>
    {shippingThreshold!==null&&shop.subtotal<shippingThreshold?<div className="checkout-free-shipping"><b>Még {money(shippingThreshold-shop.subtotal)} a(z) {shippingOption.name} ingyenes szállításáig</b><span><i style={{width:`${Math.min(100,(shop.subtotal/shippingThreshold)*100)}%`}}/></span></div>:<div className="secure-note">🎉 Ennél a kosárnál a választott szállítás díjmentes.</div>}
    {demoPrefs.trustBadges&&<div className="secure-note">🔐 Demo checkout: bankkártyaadatot nem kérünk és nem tárolunk.</div>}
   </aside>
  </div>
 </div>
}
