import {createFileRoute,Link} from '@tanstack/react-router'
import {useEffect,useMemo,useState} from 'react'
import {money} from '../lib/format'
import {useShop} from '../lib/shop'
import {getProductArt,getProductPrice,getProductStock,getVariantLabel} from '../lib/catalog'
import {demoCommerceDefaults,readDemoCommercePreferences} from '../lib/demo-commerce'
import {billingProviderLabel,demoIntegrationDefaults,getDemoShippingMethods,readDemoIntegrationConfig} from '../lib/integration-config'
import {FoxpostPointPicker} from '../components/FoxpostPointPicker'
import {normalizeFoxpostPhone,type FoxpostPickupPoint} from '../lib/foxpost'
import {createDemoOrder} from '../lib/demo-orders'
import {useDemoSiteEditorConfig} from '../lib/site-editor'

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
 const shop=useShop(),siteEditor=useDemoSiteEditorConfig(),checkout=siteEditor.checkout
 const [done,setDone]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState<string|null>(null),[result,setResult]=useState<any>(null)
 const initialShipping=getDemoShippingMethods(demoIntegrationDefaults)
 const [shippingOptions,setShippingOptions]=useState(initialShipping),[shipping,setShipping]=useState<string>(initialShipping[0]?.id||'personal-pickup'),[payment,setPayment]=useState<PaymentId>('card'),[invoice,setInvoice]=useState(false),[billingSameAsShipping,setBillingSameAsShipping]=useState(true),[demoPrefs,setDemoPrefs]=useState(demoCommerceDefaults),[integrationConfig,setIntegrationConfig]=useState(demoIntegrationDefaults),[foxpostPoint,setFoxpostPoint]=useState<FoxpostPickupPoint|null>(null),[postalCode,setPostalCode]=useState(''),[city,setCity]=useState('')
 useEffect(()=>{setDemoPrefs(readDemoCommercePreferences());const integrations=readDemoIntegrationConfig();setIntegrationConfig(integrations);const methods=getDemoShippingMethods(integrations);setShippingOptions(methods);setShipping(current=>methods.some(item=>item.id===current)?current:(methods[0]?.id||'personal-pickup'))},[])
 const shippingOption=shippingOptions.find(x=>x.id===shipping)??shippingOptions[0]??{id:'personal-pickup',provider:'local',name:'Személyes átvétel',description:'Demó',icon:'🏠',fee:0,freeAboveHuf:null}
 const configuredPaymentOptions=useMemo(()=>{const online=integrationConfig.payment.barion.enabled?{id:'card' as const,icon:'💳',name:'Barion bankkártya',description:`Barion ${integrationConfig.payment.barion.sandbox?'sandbox':'éles'} mód · demóban nincs terhelés`,fee:0}:integrationConfig.payment.stripe.enabled?{id:'card' as const,icon:'💳',name:'Stripe bankkártya',description:'Stripe integráció előkészítve · demóban nincs terhelés',fee:0}:paymentOptions[0];return[online,...paymentOptions.slice(1)]},[integrationConfig])
 const paymentOption=configuredPaymentOptions.find(x=>x.id===payment)!
 const shippingFee=shippingOption.freeAboveHuf!==null&&shop.subtotal>=shippingOption.freeAboveHuf?0:shippingOption.fee
 const total=shop.subtotal+shippingFee+paymentOption.fee
 const shippingThreshold=shippingOption.freeAboveHuf
 const needsFoxpostPoint=shippingOption.provider==='foxpost'
 const billingNeedsOwnAddress=needsFoxpostPoint||!billingSameAsShipping
 const invoiceProvider=billingProviderLabel(integrationConfig)
 const productCount=useMemo(()=>shop.cart.reduce((sum,line)=>sum+line.quantity,0),[shop.cart])

 if(done){const successTitle=(checkout.successTitle||'Rendelés #{{orderNumber}}').replace('{{orderNumber}}',result?.order_number||'');return <div className="container section checkout-success-page" style={{'--checkout-accent':checkout.accent,'--checkout-radius':`${checkout.panelRadius}px`} as React.CSSProperties}><div className="success-card checkout-success"><span>✓</span><div className="demo-badge">{checkout.successBadge}</div><h1>{successTitle}</h1><p>{checkout.successText}</p><div className="success-order-meta"><div><small>Fizetendő</small><b>{money(result?.total_huf??0)}</b></div><div><small>Szállítás</small><b>{result?.shipping_label}</b></div><div><small>Fizetés</small><b>{result?.payment_label}</b></div><div><small>Számlázás</small><b>{result?.invoice_provider||invoiceProvider}</b></div>{result?.pickup_point&&<div><small>Átvételi pont</small><b>{result.pickup_point.name}</b></div>}</div><div className="success-actions"><Link to="/" className="btn btn-primary">{checkout.successPrimaryLabel}</Link><a href="/admin" className="btn btn-ghost">{checkout.successAdminLabel}</a><Link to="/termekek" search={{}} className="btn btn-ghost">{checkout.successContinueLabel}</Link></div></div></div>}

 if(!shop.cart.length)return <div className="container section" style={{'--checkout-accent':checkout.accent} as React.CSSProperties}><div className="empty-state large"><span>🛒</span><h1>{checkout.emptyTitle}</h1><p>{checkout.emptyText}</p><Link to="/termekek" search={{}} className="btn btn-primary">{checkout.emptyButtonLabel}</Link></div></div>

 return <div className={`container section checkout-page ${checkout.compact?'checkout-editor-compact':''}`} style={{'--checkout-accent':checkout.accent,'--checkout-radius':`${checkout.panelRadius}px`} as React.CSSProperties}>
  {error&&<div className="admin2-error">{error}</div>}
  <div className="checkout-header">
   <div><span className="eyebrow">{checkout.eyebrow}</span><h1>{checkout.title}</h1><p>{checkout.description}</p><div className="checkout-mode-note">{demoPrefs.guestCheckout?'✓ Vendégként is végigvihető a rendelés':'○ Fiókos vásárlásra tervezve · demóban vendégként is tesztelhető'}</div></div>
   {checkout.showProgress&&<div className="checkout-steps" aria-label="Pénztár lépései"><span className="active"><b>1</b>{checkout.progressLabels[0]}</span><i/><span className="active"><b>2</b>{checkout.progressLabels[1]}</span><i/><span className="active"><b>3</b>{checkout.progressLabels[2]}</span></div>}
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
      const items=shop.cart.map(line=>{const product=shop.getProduct(line.productId);if(!product)throw new Error('Egy kosárban lévő termék adatai nem találhatók.');const available=getProductStock(product,line.variantId);if(available<line.quantity)throw new Error(`${product.name}: csak ${available} db érhető el a demo készletből.`);const unitPrice=getProductPrice(product,line.variantId);return{productId:product.id,variantId:line.variantId,sku:product.variants?.find(v=>v.id===line.variantId)?.sku??product.sourceSku,name:product.name,brand:product.brand,image:getProductArt(product,line.variantId),variantLabel:getVariantLabel(product,line.variantId)||undefined,quantity:line.quantity,unitPriceHuf:unitPrice,lineTotalHuf:unitPrice*line.quantity}})
      const demoOrder=createDemoOrder({
       customer:{name:String(form.get('name')||''),email:String(form.get('email')||''),phone:normalizedPhone},
       shipping:{provider:shippingOption.provider,methodId:shippingOption.id,label:shippingOption.name,feeHuf:shippingFee,address:needsFoxpostPoint?undefined:{postalCode:String(form.get('postalCode')||''),city:String(form.get('city')||''),line1:String(form.get('line1')||'')},pickupPoint:needsFoxpostPoint?foxpostPoint:null},
       payment:{method:payment,label:paymentOption.name,feeHuf:paymentOption.fee},
       billing:{
        provider:invoiceProvider,
        companyInvoice:invoice,
        billingName:invoice?undefined:(String(form.get('billingName')||form.get('name')||'')),
        companyName:invoice?String(form.get('companyName')||''):undefined,
        taxNumber:invoice?String(form.get('taxNumber')||''):undefined,
        address:{
         countryCode:'HU',
         postalCode:billingNeedsOwnAddress?String(form.get('billingPostalCode')||''):String(form.get('postalCode')||''),
         city:billingNeedsOwnAddress?String(form.get('billingCity')||''):String(form.get('city')||''),
         line1:billingNeedsOwnAddress?String(form.get('billingLine1')||''):String(form.get('line1')||'')
        }
       },
       coupon:shop.appliedCoupon?{code:shop.appliedCoupon.code,discountHuf:shop.discount}:null,
       items,
       totals:{itemsHuf:shop.itemsSubtotal,discountHuf:shop.discount,shippingHuf:shippingFee,paymentFeeHuf:paymentOption.fee,totalHuf:total},
      })
      const order={order_number:demoOrder.orderNumber,total_huf:demoOrder.totals.totalHuf,shipping_label:demoOrder.shipping.label,payment_label:demoOrder.payment.label,invoice_provider:demoOrder.billing.provider,pickup_point:demoOrder.shipping.pickupPoint,order_id:demoOrder.id}
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
     <div className="checkout-section-title"><b>1</b><div><h2>{checkout.contactTitle}</h2><p>{checkout.contactDescription}</p></div></div>
     <div className="form-grid"><label className="field-wide"><span>{checkout.nameLabel}</span><input name="name" autoComplete="name" required/></label><label><span>{checkout.emailLabel}</span><input name="email" type="email" autoComplete="email" placeholder="nev@email.hu" required/></label><label><span>{checkout.phoneLabel}</span><input name="phone" autoComplete="tel" placeholder="+36 30 123 4567" required/></label></div>
    </section>

    <section className="checkout-section">
     <div className="checkout-section-title"><b>2</b><div><h2>{checkout.shippingTitle}</h2><p>{checkout.shippingDescription}</p></div></div>
     <div className="checkout-choice-grid">{shippingOptions.map(option=>{const effective=option.freeAboveHuf!==null&&shop.subtotal>=option.freeAboveHuf?0:option.fee;return <label key={option.id} className={`checkout-choice ${shipping===option.id?'selected':''}`}><input type="radio" name="shippingMethod" checked={shipping===option.id} onChange={()=>setShipping(option.id)}/><span className="choice-icon">{option.icon}</span><span className="choice-copy"><b>{option.name}</b><small>{option.description}</small></span><strong>{effective?money(effective):'Ingyenes'}</strong></label>})}</div>
     {needsFoxpostPoint&&<FoxpostPointPicker value={foxpostPoint} onChange={setFoxpostPoint}/>} 
    </section>

    <section className="checkout-section">
     <div className="checkout-section-title"><b>3</b><div><h2>{needsFoxpostPoint?checkout.pickupTitle:checkout.addressTitle}</h2><p>{needsFoxpostPoint?checkout.pickupDescription:checkout.addressDescription}</p></div></div>
     {needsFoxpostPoint?<div className="foxpost-address-confirm">{foxpostPoint?<><span>✓</span><div><b>{foxpostPoint.name}</b><small>{foxpostPoint.address}</small></div></>:<><span>!</span><div><b>Még nincs átvételi pont kiválasztva</b><small>Menj vissza egy lépéssel, és válassz FOXPOST pontot.</small></div></>}</div>:<div className="form-grid"><label><span>{checkout.postalCodeLabel}</span><input name="postalCode" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{4}" placeholder="5310" value={postalCode} onChange={e=>setPostalCode(e.target.value.replace(/\D/g,'').slice(0,4))} required/></label><label><span>{checkout.cityLabel}</span><input name="city" autoComplete="address-level2" value={city} onChange={e=>setCity(e.target.value)} required/></label><label className="field-wide"><span>{checkout.addressLineLabel}</span><input name="line1" autoComplete="street-address" required/></label><label className="field-wide"><span>{checkout.deliveryNoteLabel} <small>(opcionális)</small></span><input name="deliveryNote" placeholder={checkout.deliveryNotePlaceholder}/></label></div>}
    </section>

    <section className="checkout-section">
     <div className="checkout-section-title"><b>4</b><div><h2>{checkout.paymentTitle}</h2><p>{checkout.paymentDescription}</p></div></div>
     <div className="checkout-choice-grid">{configuredPaymentOptions.map(option=><label key={option.id} className={`checkout-choice ${payment===option.id?'selected':''}`}><input type="radio" name="paymentMethod" checked={payment===option.id} onChange={()=>setPayment(option.id)}/><span className="choice-icon">{option.icon}</span><span className="choice-copy"><b>{option.name}</b><small>{option.description}</small></span><strong>{option.fee?`+ ${money(option.fee)}`:'0 Ft'}</strong></label>)}</div>
    </section>

    <section className="checkout-section checkout-invoice">
     <div className="checkout-section-title"><b>5</b><div><h2>Számlázási adatok</h2><p>A számla nevéhez és címéhez szükséges adatok. FOXPOST átvételnél külön számlázási címet kérünk.</p></div></div>
     <div className="invoice-type-row"><button type="button" className={!invoice?'active':''} onClick={()=>setInvoice(false)}>Magánszemély</button><button type="button" className={invoice?'active':''} onClick={()=>setInvoice(true)}>Cég / egyéni vállalkozó</button></div>
     {invoice?<div className="form-grid invoice-fields"><label className="field-wide"><span>{checkout.companyNameLabel}</span><input name="companyName" autoComplete="organization" required/></label><label><span>{checkout.taxNumberLabel}</span><input name="taxNumber" inputMode="numeric" placeholder="12345678-1-42" pattern="[0-9]{8}-[1-5]-[0-9]{2}" required/></label><div className="invoice-provider-note"><b>{invoiceProvider}</b><small>Demo módban még nem készül valódi NAV-adatszolgáltatás.</small></div></div>:<div className="form-grid invoice-fields"><label className="field-wide"><span>Számlázási név</span><input name="billingName" autoComplete="name" placeholder="Ha eltér a kapcsolattartó nevétől"/></label></div>}
     {!needsFoxpostPoint&&<label className="invoice-toggle billing-same-toggle"><input type="checkbox" checked={billingSameAsShipping} onChange={e=>setBillingSameAsShipping(e.target.checked)}/><span><b>Számlázási cím megegyezik a szállítási címmel</b><small>Kapcsold ki, ha más címre kéred a számlát.</small></span></label>}
     {billingNeedsOwnAddress&&<div className="form-grid billing-address-fields"><label><span>Irányítószám</span><input name="billingPostalCode" inputMode="numeric" pattern="[0-9]{4}" autoComplete="billing postal-code" required/></label><label><span>Város</span><input name="billingCity" autoComplete="billing address-level2" required/></label><label className="field-wide"><span>Utca, házszám</span><input name="billingLine1" autoComplete="billing street-address" required/></label></div>}
    </section>

    <label className="consent checkout-consent"><input type="checkbox" required/><span>{checkout.consentText} <Link to="/jogi/$slug" params={{slug:'aszf'}}>{checkout.termsLabel}</Link> · <Link to="/jogi/$slug" params={{slug:'adatkezeles'}}>{checkout.privacyLabel}</Link></span></label>
    <button className="btn btn-primary btn-block btn-large checkout-submit" disabled={busy}>{busy?'Rendelés feldolgozása…':`${checkout.submitLabel} · ${money(total)}`}</button>
    {demoPrefs.trustBadges&&checkout.showTrust&&<div className="checkout-trust-row">{checkout.trustItems.map((item,index)=>demoPrefs.deliveryEstimate||index<2?<span key={item}>{item}</span>:null)}</div>}
   </form>

   <aside className="summary-card checkout-summary checkout-summary-pro">
    <div className="summary-heading"><div><span className="eyebrow">{checkout.summaryEyebrow}</span><h2>{checkout.summaryTitle.replace('{{count}}',String(productCount))}</h2></div><Link to="/kosar">{checkout.editCartLabel}</Link></div>
    <div className="checkout-summary-products">{shop.cart.map(line=>{const p=shop.getProduct(line.productId);if(!p)return null;const label=getVariantLabel(p,line.variantId);return <div className="summary-product" key={`${p.id}:${line.variantId??'base'}`}><img src={getProductArt(p,line.variantId)} alt="" loading="lazy" decoding="async" onError={e=>{e.currentTarget.src='/favicon.svg'}}/><span><b>{p.name}</b><small>{line.quantity} db{label?` · ${label}`:''}</small></span><strong>{money(getProductPrice(p,line.variantId)*line.quantity)}</strong></div>})}</div>
    <div><span>{checkout.itemsLabel}</span><b>{money(shop.itemsSubtotal)}</b></div>
    {shop.discount>0&&<div className="summary-discount"><span>Kupon ({shop.appliedCoupon?.code})</span><b>− {money(shop.discount)}</b></div>}
    <div><span>{shippingOption.name}</span><b>{shippingFee?money(shippingFee):'Ingyenes'}</b></div>
    {needsFoxpostPoint&&<div className="summary-pickup-point"><span>{checkout.pickupLabel}</span><b>{foxpostPoint?.name||'Még nincs kiválasztva'}</b>{foxpostPoint&&<small>{foxpostPoint.address}</small>}</div>}
    {paymentOption.fee>0&&<div><span>{paymentOption.name}</span><b>{money(paymentOption.fee)}</b></div>}
    <div className="summary-total"><span>{checkout.totalLabel}</span><b>{money(total)}</b></div>
    {shippingThreshold!==null&&shop.subtotal<shippingThreshold?<div className="checkout-free-shipping"><b>Még {money(shippingThreshold-shop.subtotal)} a(z) {shippingOption.name} ingyenes szállításáig</b><span><i style={{width:`${Math.min(100,(shop.subtotal/shippingThreshold)*100)}%`}}/></span></div>:<div className="secure-note">🎉 Ennél a kosárnál a választott szállítás díjmentes.</div>}
    {demoPrefs.trustBadges&&<div className="secure-note">🔐 Demo checkout: bankkártyaadatot nem kérünk és nem tárolunk.</div>}
   </aside>
  </div>
 </div>
}
