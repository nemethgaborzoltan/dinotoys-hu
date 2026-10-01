import {money} from './format'
import {readDemoIntegrationConfig} from './integration-config'
import type {DemoOrder} from './demo-orders'

export type DemoEmailType='order_confirmation'|'payment_confirmed'|'payment_failed'|'shipment_handed_over'|'invoice_issued'|'delivered'|'refund_confirmed'
export type DemoEmailStatus='queued'|'demo_sent'

export type DemoEmailTemplateSettings={
 enabled:boolean
 subject:string
 preheader:string
}

export type DemoEmail={
 id:string
 orderId:string
 orderNumber:string
 type:DemoEmailType
 status:DemoEmailStatus
 recipient:string
 recipientName:string
 senderName:string
 senderEmail:string
 subject:string
 preheader:string
 html:string
 text:string
 createdAt:string
 sentAt?:string
 idempotencyKey:string
}

const emailKey='dinotoys-demo-email-outbox-v1'
const templateKey='dinotoys-demo-email-templates-v1'
const eventName='dinotoys:demo-emails'

export const demoEmailTypeLabels:Record<DemoEmailType,string>={
 order_confirmation:'Rendelés visszaigazolása',
 payment_confirmed:'Sikeres fizetés',
 payment_failed:'Sikertelen fizetés',
 shipment_handed_over:'Csomag úton van',
 invoice_issued:'Számla elkészült',
 delivered:'Csomag kézbesítve',
 refund_confirmed:'Visszatérítés',
}

export const demoEmailDefaults:Record<DemoEmailType,DemoEmailTemplateSettings>={
 order_confirmation:{enabled:true,subject:'Köszönjük a rendelésed! – {{orderNumber}}',preheader:'Megkaptuk a rendelésed, itt találod a legfontosabb részleteket.'},
 payment_confirmed:{enabled:true,subject:'Sikeres fizetés – {{orderNumber}}',preheader:'A fizetésed rendben megérkezett, kezdjük az összekészítést.'},
 payment_failed:{enabled:true,subject:'A fizetés nem sikerült – {{orderNumber}}',preheader:'A rendelésed megmaradt, de a fizetés még teendőt igényel.'},
 shipment_handed_over:{enabled:true,subject:'Úton a csomagod! – {{orderNumber}}',preheader:'A csomagot átadtuk a szállítónak.'},
 invoice_issued:{enabled:true,subject:'Elkészült a számlád – {{orderNumber}}',preheader:'A rendelésedhez tartozó számla elkészült.'},
 delivered:{enabled:true,subject:'Megérkezett a csomagod 🎉 – {{orderNumber}}',preheader:'Reméljük, örömet szereznek a játékok!'},
 refund_confirmed:{enabled:true,subject:'Visszatérítés rögzítve – {{orderNumber}}',preheader:'A rendeléshez tartozó visszatérítést rögzítettük.'},
}

function uid(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36)}
function now(){return new Date().toISOString()}
function readJson<T>(key:string,fallback:T):T{if(typeof window==='undefined')return fallback;try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback}catch{return fallback}}
function writeJson(key:string,value:unknown){if(typeof window==='undefined')return;try{localStorage.setItem(key,JSON.stringify(value))}catch{}}
function emit(){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(eventName))}
function esc(value:unknown){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char))}
function replaceTokens(value:string,order:DemoOrder){return value.replaceAll('{{orderNumber}}',order.orderNumber).replaceAll('{{customerName}}',order.customer.name)}

export function readDemoEmailTemplates(){
 return {...demoEmailDefaults,...readJson<Partial<Record<DemoEmailType,DemoEmailTemplateSettings>>>(templateKey,{})}
}
export function saveDemoEmailTemplate(type:DemoEmailType,value:DemoEmailTemplateSettings){const current=readDemoEmailTemplates();writeJson(templateKey,{...current,[type]:value});emit()}
export function resetDemoEmailTemplates(){if(typeof window!=='undefined')localStorage.removeItem(templateKey);emit()}

export function readDemoEmails(){return readJson<DemoEmail[]>(emailKey,[]).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))}
function writeDemoEmails(items:DemoEmail[]){writeJson(emailKey,items);emit()}

export function buildDemoEmailPreview(order:DemoOrder,type:DemoEmailType,settings=readDemoEmailTemplates()[type]){
 const integrations=readDemoIntegrationConfig()
 const senderName=integrations.email.resend.fromName||'DinoToys.hu'
 const senderEmail=integrations.email.resend.fromEmail||'rendeles@dinotoys.hu'
 const subject=replaceTokens(settings.subject,order)
 const preheader=replaceTokens(settings.preheader,order)
 const heading:Record<DemoEmailType,string>={
  order_confirmation:'Megkaptuk a rendelésed! 🎉',
  payment_confirmed:'Sikeres fizetés ✓',
  payment_failed:'A fizetés nem sikerült',
  shipment_handed_over:'Úton van a csomagod! 📦',
  invoice_issued:'Elkészült a számlád 🧾',
  delivered:'Megérkezett! 🎁',
  refund_confirmed:'A visszatérítést rögzítettük',
 }
 const intro:Record<DemoEmailType,string>={
  order_confirmation:'Köszönjük a vásárlást! A rendelésed bekerült a rendszerünkbe. Alább összefoglaltuk a legfontosabb adatokat.',
  payment_confirmed:'A fizetésed sikeresen megérkezett. A következő lépés az összekészítés és csomagolás.',
  payment_failed:'A rendelésed megmaradt, de a fizetés nem zárult sikeresen. Éles rendszerben itt adnánk lehetőséget az újrapróbálásra.',
  shipment_handed_over:'A csomagot átadtuk a szállítónak. Ha van csomagszám, ezen az oldalon is megtalálod.',
  invoice_issued:'A rendelésedhez tartozó számla elkészült. Az éles rendszerben a PDF-et ehhez az e-mailhez csatoljuk vagy biztonságos linken adjuk át.',
  delivered:'A szállítási folyamat szerint a csomagod megérkezett. Reméljük, nagy örömet szerez!',
  refund_confirmed:'A rendeléshez tartozó visszatérítést rögzítettük. Éles fizetési szolgáltatónál a banki jóváírás ideje eltérhet.',
 }
 const accent=type==='payment_failed'||type==='refund_confirmed'?'#b44435':type==='delivered'?'#188457':'#ff6948'
 const itemRows=order.items.map(item=>'<tr><td style="padding:12px 0;border-bottom:1px solid #edf0ee"><table role="presentation" width="100%"><tr><td width="54" valign="top"><img src="'+esc(item.image)+'" width="46" height="46" alt="" style="display:block;object-fit:contain;border-radius:9px;background:#f7f8f7"></td><td valign="top"><strong style="font-size:14px;color:#17211b">'+esc(item.name)+'</strong><div style="font-size:12px;color:#7a857f;margin-top:3px">'+esc(item.quantity)+' db'+(item.variantLabel?' · '+esc(item.variantLabel):'')+'</div></td><td align="right" valign="top" style="font-weight:800;font-size:14px;color:#17211b">'+money(item.lineTotalHuf)+'</td></tr></table></td></tr>').join('')
 const pickup=order.shipping.pickupPoint?'<div style="margin-top:8px;color:#5d6962;font-size:13px"><strong>'+esc(order.shipping.pickupPoint.name)+'</strong><br>'+esc(order.shipping.pickupPoint.address)+'</div>':''
 const shipment=order.shipment.barcode?'<div style="margin:18px 0;padding:14px 16px;border-radius:12px;background:#f6f8f7"><div style="font-size:11px;color:#7b8680;text-transform:uppercase;letter-spacing:.06em">Csomagszám</div><strong style="display:block;margin-top:4px;font-size:16px">'+esc(order.shipment.barcode)+'</strong></div>':''
 const invoice=order.billing.invoiceNumber?'<div style="margin:18px 0;padding:14px 16px;border-radius:12px;background:#f6f8f7"><div style="font-size:11px;color:#7b8680;text-transform:uppercase;letter-spacing:.06em">Számlaszám</div><strong style="display:block;margin-top:4px;font-size:16px">'+esc(order.billing.invoiceNumber)+'</strong></div>':''
 const html='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f3f5f4;font-family:Arial,sans-serif;color:#17211b"><div style="display:none;max-height:0;overflow:hidden">'+esc(preheader)+'</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" style="max-width:640px;background:#fff;border-radius:20px;overflow:hidden"><tr><td style="padding:22px 28px;background:#17211b"><div style="display:inline-block;width:38px;height:38px;line-height:38px;text-align:center;border-radius:11px;background:#ff6948;color:#fff;font-weight:900;font-size:20px">D</div><span style="margin-left:10px;color:#fff;font-weight:800;font-size:16px">DinoToys.hu</span></td></tr><tr><td style="padding:32px 28px"><div style="font-size:12px;color:'+accent+';font-weight:800;text-transform:uppercase;letter-spacing:.08em">'+esc(demoEmailTypeLabels[type])+'</div><h1 style="font-size:28px;line-height:1.12;margin:8px 0 12px;color:#17211b">'+esc(heading[type])+'</h1><p style="font-size:15px;line-height:1.65;color:#5f6b64;margin:0 0 22px">Szia '+esc(order.customer.name)+'! '+esc(intro[type])+'</p><div style="padding:16px;border-radius:14px;background:#fff7f4;border:1px solid #f6d8cf"><table role="presentation" width="100%"><tr><td><div style="font-size:11px;color:#7d8781">Rendelés</div><strong style="font-size:16px">'+esc(order.orderNumber)+'</strong></td><td align="right"><div style="font-size:11px;color:#7d8781">Összesen</div><strong style="font-size:18px">'+money(order.totals.totalHuf)+'</strong></td></tr></table></div>'+shipment+invoice+(type==='order_confirmation'?'<table role="presentation" width="100%" style="margin-top:18px;border-collapse:collapse">'+itemRows+'</table><div style="margin-top:18px;font-size:13px;color:#5f6b64"><strong>Szállítás:</strong> '+esc(order.shipping.label)+pickup+'</div>':'')+'<div style="margin-top:26px;padding-top:18px;border-top:1px solid #edf0ee;font-size:12px;line-height:1.6;color:#7a857f">Ez egy <strong>offline demo e-mail előnézet</strong>. Nem került ténylegesen elküldésre. Az éles rendszerben a Resend integráció ugyanebből a rendelési eseményből küldi majd ki a levelet.</div></td></tr><tr><td style="padding:18px 28px;background:#f7f9f8;color:#7d8781;font-size:11px">© DinoToys.hu · Játék. Élmény. Ajándék.</td></tr></table></td></tr></table></body></html>'
 const text=[heading[type],`Szia ${order.customer.name}!`,intro[type],`Rendelés: ${order.orderNumber}`,`Összesen: ${money(order.totals.totalHuf)}`,order.shipment.barcode?`Csomagszám: ${order.shipment.barcode}`:'',order.billing.invoiceNumber?`Számlaszám: ${order.billing.invoiceNumber}`:''].filter(Boolean).join('\n\n')
 return{senderName,senderEmail,subject,preheader,html,text}
}

export function queueDemoEmailForOrder(order:DemoOrder,type:DemoEmailType,force=false){
 const settings=readDemoEmailTemplates()[type]
 if(!settings.enabled)return null
 const idempotencyKey=`${order.id}:${type}`
 const current=readDemoEmails()
 const existing=current.find(item=>item.idempotencyKey===idempotencyKey)
 if(existing&&!force)return existing
 const preview=buildDemoEmailPreview(order,type,settings)
 const email:DemoEmail={id:uid(),orderId:order.id,orderNumber:order.orderNumber,type,status:'queued',recipient:order.customer.email,recipientName:order.customer.name,...preview,createdAt:now(),idempotencyKey:force?`${idempotencyKey}:${uid()}`:idempotencyKey}
 writeDemoEmails([email,...current])
 return email
}

export function markDemoEmailSent(id:string){
 const items=readDemoEmails(),index=items.findIndex(item=>item.id===id);if(index<0)return null
 items[index]={...items[index],status:'demo_sent',sentAt:now()};writeDemoEmails(items);return items[index]
}
export function deleteDemoEmail(id:string){writeDemoEmails(readDemoEmails().filter(item=>item.id!==id))}
export function clearDemoEmails(){if(typeof window!=='undefined')localStorage.removeItem(emailKey);emit()}
export function demoEmailsForOrder(orderId:string){return readDemoEmails().filter(item=>item.orderId===orderId)}
export function subscribeDemoEmails(callback:()=>void){if(typeof window==='undefined')return()=>{};window.addEventListener(eventName,callback);const storage=(event:StorageEvent)=>{if(event.key===emailKey||event.key===templateKey)callback()};window.addEventListener('storage',storage);return()=>{window.removeEventListener(eventName,callback);window.removeEventListener('storage',storage)}}

export function generateMissingDemoEmails(orders:DemoOrder[]){
 for(const order of orders){
  queueDemoEmailForOrder(order,'order_confirmation')
  if(order.payment.status==='paid')queueDemoEmailForOrder(order,'payment_confirmed')
  if(order.payment.status==='failed')queueDemoEmailForOrder(order,'payment_failed')
  if(order.payment.status==='refunded')queueDemoEmailForOrder(order,'refund_confirmed')
  if(['shipped','delivered'].includes(order.status))queueDemoEmailForOrder(order,'shipment_handed_over')
  if(order.billing.invoiceStatus==='issued')queueDemoEmailForOrder(order,'invoice_issued')
  if(order.status==='delivered')queueDemoEmailForOrder(order,'delivered')
 }
 return readDemoEmails()
}
