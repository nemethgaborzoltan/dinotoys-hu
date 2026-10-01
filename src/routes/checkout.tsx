import {createFileRoute,Link} from '@tanstack/react-router'
import {useMemo,useState} from 'react'
import {money} from '../lib/format'
import {useShop} from '../lib/shop'
import {getProductArt,getProductPrice,getVariantLabel} from '../lib/catalog'

export const Route=createFileRoute('/checkout')({
 head:()=>({meta:[{title:'Pénztár | DinoToys.hu'},{name:'robots',content:'noindex,nofollow'}]}),
 component:Checkout
})

type ShippingId='courier'|'locker'|'pickup'
type PaymentId='card'|'cod'|'transfer'

const shippingOptions=[
 {id:'courier' as const,icon:'🚚',name:'Házhozszállítás',description:'GLS/DPD jellegű demo szállítás · várhatóan 1–2 munkanap',fee:1490},
 {id:'locker' as const,icon:'📦',name:'Csomagautomata / átvételi pont',description:'Foxpost/Packeta jellegű demo mód · várhatóan 1–2 munkanap',fee:1090},
 {id:'pickup' as const,icon:'🏠',name:'Személyes átvétel',description:'Demo opció · egyeztetett átvételi ponton',fee:0},
]
const paymentOptions=[
 {id:'card' as const,icon:'💳',name:'Online bankkártya',description:'Demo fizetés – nem történik valódi terhelés',fee:0},
 {id:'cod' as const,icon:'💵',name:'Utánvét',description:'Fizetés átvételkor · demo kezelési díj',fee:490},
 {id:'transfer' as const,icon:'🏦',name:'Banki átutalás',description:'Demo opció – díjbekérő nélkül',fee:0},
]

function Checkout(){
 const shop=useShop()
 const [done,setDone]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[result,setResult]=useState<any>(null)
 const [shipping,setShipping]=useState<ShippingId>('courier'),[payment,setPayment]=useState<PaymentId>('card'),[invoice,setInvoice]=useState(false)
 const shippingOption=shippingOptions.find(x=>x.id===shipping)!,paymentOption=paymentOptions.find(x=>x.id===payment)!
 const shippingFee=shipping==='pickup'||shop.subtotal>=shop.freeShippingThreshold?0:shippingOption.fee
 const total=shop.subtotal+shippingFee+paymentOption.fee
 const productCount=useMemo(()=>shop.cart.reduce((sum,line)=>sum+line.quantity,0),[shop.cart])

 if(done)return <div className="container section checkout-success-page"><div className="success-card checkout-success"><span>✓</span><div className="demo-badge">DEMO RENDELÉS</div><h1>{result?.order_number?\`Rendelés #\${result.order_number}\`:'Rendelés rögzítve'}</h1><p>Köszönjük! A demó pénztár végigfutott, de valódi fizetés, készletfoglalás és e-mail küldés nem történt.</p><div className="success-order-meta"><div><small>Fizetendő</small><b>{money(result?.total_huf??0)}</b></div><div><small>Szállítás</small><b>{result?.shipping_label}</b></div><div><small>Fizetés</small><b>{result?.payment_label}</b></div></div><div className="success-actions"><Link to="/" className="btn btn-primary">Főoldal</Link><Link to="/termekek" search={{}} className="btn btn-ghost">Tovább vásárolok</Link></div></div></div>

 if(!shop.cart.length)return <div className="container section"><div className="empty-state large"><span>🛒</span><h1>A pénztárhoz előbb tegyél valamit a kosárba</h1><p>A demo checkout teljes folyamatát termékkel tudod kipróbálni.</p><Link to="/termekek" search={{}} className="btn btn-primary">Termékek felfedezése</Link></div></div>

 return <div className="container section checkout-page">
  {error&&<div className="admin2-error">{error}</div>}
  <div className="checkout-header">
   <div><span className="eyebrow">Biztonságos demo pénztár</span><h1>Rendelés véglegesítése</h1><p>Minden lépést kipróbálhatsz. A demó módban nem történik valódi terhelés vagy futármegrendelés.</p></div>
   <div className="checkout-steps" aria-label="Pénztár lépései"><span className="active"><b>1</b>Adatok</span><i/><span className="active"><b>2</b>Szállítás</span><i/><span className="active"><b>3</b>Fizetés</span></div>
  </div>

  <div className="checkout-grid">
   <form className="checkout-form checkout-form-pro" onSubmit={async e=>{
    e.preventDefault();setBusy(true);setError(null)
    try{
     const form=new FormData(e.currentTarget)
     const live=shop.cart.every(line=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(line.productId))
     if(!live){
      const order={order_number:\`DEMO-\${Date.now().toString().slice(-6)}\`,total_huf:total,shipping_label:shippingOption.name,payment_label:paymentOption.name}
      setResult(order);shop.clearCart();setDone(true);return
     }
     const response=await fetch('/api/v1/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
      idempotencyKey:crypto.randomUUID(),
      email:String(form.get('email')||''),phone:String(form.get('phone')||''),
      couponCode:shop.appliedCoupon?.code??null,
      shippingAddress:{name:String(form.get('name')||''),countryCode:'HU',postalCode:String(form.get('postalCode')||''),city:String(form.get('city')||''),line1:String(form.get('line1')||'')},
      items:shop.cart.map(line=>({productId:line.productId,variantId:line.variantId,quantity:line.quantity}))
     })})
     const payload=await response.json() as any
     if(!response.ok||payload?.ok===false)throw new Error(payload?.error?.message||'A rendelés létrehozása sikertelen.')
     setResult({...payload.data,shipping_label:shippingOption.name,payment_label:paymentOption.name});shop.clearCart();setDone(true)
    }catch(err){setError(err instanceof Error?err.message:'Checkout hiba')}finally{setBusy(false)}
   }}>
    <section className="checkout-section">
     <div className="checkout-section-title"><b>1</b><div><h2>Kapcsolattartás</h2><p>Ide küldenénk a rendelés visszaigazolását.</p></div></div>
     <div className="form-grid"><label><span>E-mail</span><input name="email" type="email" autoComplete="email" placeholder="nev@email.hu" required/></label><label><span>Telefon</span><input name="phone" autoComplete="tel" placeholder="+36 30 123 4567" required/></label></div>
    </section>

    <section className="checkout-section">
     <div className="checkout-section-title"><b>2</b><div><h2>Szállítási cím</h2><p>Magyarországi demo kézbesítés.</p></div></div>
     <div className="form-grid"><label className="field-wide"><span>Teljes név</span><input name="name" autoComplete="name" required/></label><label><span>Irányítószám</span><input name="postalCode" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{4}" placeholder="5310" required/></label><label><span>Város</span><input name="city" autoComplete="address-level2" required/></label><label className="field-wide"><span>Utca, házszám</span><input name="line1" autoComplete="street-address" required/></label><label className="field-wide"><span>Megjegyzés a futárnak <small>(opcionális)</small></span><input name="deliveryNote" placeholder="Pl. kapucsengő, emelet…"/></label></div>
    </section>

    <section className="checkout-section">
     <div className="checkout-section-title"><b>3</b><div><h2>Szállítási mód</h2><p>Válassz kényelmes átvételi módot.</p></div></div>
     <div className="checkout-choice-grid">{shippingOptions.map(option=>{const effective=option.id==='pickup'||shop.subtotal>=shop.freeShippingThreshold?0:option.fee;return <label key={option.id} className={\`checkout-choice \${shipping===option.id?'selected':''}\`}><input type="radio" name="shippingMethod" checked={shipping===option.id} onChange={()=>setShipping(option.id)}/><span className="choice-icon">{option.icon}</span><span className="choice-copy"><b>{option.name}</b><small>{option.description}</small></span><strong>{effective?money(effective):'Ingyenes'}</strong></label>})}</div>
    </section>

    <section className="checkout-section">
     <div className="checkout-section-title"><b>4</b><div><h2>Fizetési mód</h2><p>Demóban egyik opció sem indít valódi tranzakciót.</p></div></div>
     <div className="checkout-choice-grid">{paymentOptions.map(option=><label key={option.id} className={\`checkout-choice \${payment===option.id?'selected':''}\`}><input type="radio" name="paymentMethod" checked={payment===option.id} onChange={()=>setPayment(option.id)}/><span className="choice-icon">{option.icon}</span><span className="choice-copy"><b>{option.name}</b><small>{option.description}</small></span><strong>{option.fee?\`+ \${money(option.fee)}\`:'0 Ft'}</strong></label>)}</div>
    </section>

    <section className="checkout-section checkout-invoice">
     <label className="invoice-toggle"><input type="checkbox" checked={invoice} onChange={e=>setInvoice(e.target.checked)}/><span><b>Céges számlát kérek</b><small>Demo mezők, számlázó integráció nélkül.</small></span></label>
     {invoice&&<div className="form-grid invoice-fields"><label><span>Cégnév</span><input name="companyName" required={invoice}/></label><label><span>Adószám</span><input name="taxNumber" required={invoice}/></label></div>}
    </section>

    <label className="consent checkout-consent"><input type="checkbox" required/><span>Elolvastam és elfogadom az <Link to="/jogi/$slug" params={{slug:'aszf'}}>ÁSZF-et</Link>, valamint megismertem az <Link to="/jogi/$slug" params={{slug:'adatkezeles'}}>Adatkezelési tájékoztatót</Link>.</span></label>
    <button className="btn btn-primary btn-block btn-large checkout-submit" disabled={busy}>{busy?'Rendelés feldolgozása…':\`Fizetési kötelezettséggel járó megrendelés · \${money(total)}\`}</button>
    <div className="checkout-trust-row"><span>🔒 Titkosított kapcsolat</span><span>↩ 14 napos elállás</span><span>📦 Nyomon követhető szállítás</span></div>
   </form>

   <aside className="summary-card checkout-summary checkout-summary-pro">
    <div className="summary-heading"><div><span className="eyebrow">Rendelésed</span><h2>{productCount} termék</h2></div><Link to="/kosar">Kosár szerkesztése</Link></div>
    <div className="checkout-summary-products">{shop.cart.map(line=>{const p=shop.getProduct(line.productId);if(!p)return null;const label=getVariantLabel(p,line.variantId);return <div className="summary-product" key={\`\${p.id}:\${line.variantId??'base'}\`}><img src={getProductArt(p,line.variantId)} alt="" loading="lazy" decoding="async" onError={e=>{e.currentTarget.src='/favicon.svg'}}/><span><b>{p.name}</b><small>{line.quantity} db{label?\` · \${label}\`:''}</small></span><strong>{money(getProductPrice(p,line.variantId)*line.quantity)}</strong></div>})}</div>
    <div><span>Termékek</span><b>{money(shop.itemsSubtotal)}</b></div>
    {shop.discount>0&&<div className="summary-discount"><span>Kupon ({shop.appliedCoupon?.code})</span><b>− {money(shop.discount)}</b></div>}
    <div><span>{shippingOption.name}</span><b>{shippingFee?money(shippingFee):'Ingyenes'}</b></div>
    {paymentOption.fee>0&&<div><span>{paymentOption.name}</span><b>{money(paymentOption.fee)}</b></div>}
    <div className="summary-total"><span>Összesen</span><b>{money(total)}</b></div>
    {shop.freeShippingLeft>0&&shipping!=='pickup'?<div className="checkout-free-shipping"><b>Még {money(shop.freeShippingLeft)} az ingyenes szállításig</b><span><i style={{width:\`\${Math.min(100,(shop.subtotal/shop.freeShippingThreshold)*100)}%\`}}/></span></div>:<div className="secure-note">🎉 Ennél a kosárnál a választott szállítás díjmentes.</div>}
    <div className="secure-note">🔐 Demo checkout: bankkártyaadatot nem kérünk és nem tárolunk.</div>
   </aside>
  </div>
 </div>
}
