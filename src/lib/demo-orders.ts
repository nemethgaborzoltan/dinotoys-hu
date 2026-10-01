import type {FoxpostPickupPoint} from './foxpost'

export type DemoOrderStatus='new'|'pending_payment'|'paid'|'processing'|'packed'|'shipped'|'delivered'|'cancelled'|'returned'|'refunded'
export type DemoPaymentStatus='pending'|'paid'|'cod'|'failed'|'refunded'
export type DemoShipmentStatus='not_created'|'created'|'handed_over'|'in_transit'|'delivered'|'returned'
export type DemoInvoiceStatus='none'|'issued'|'cancelled'

export type DemoOrderItem={
 productId:string
 variantId?:string
 sku:string
 name:string
 brand:string
 image:string
 variantLabel?:string
 quantity:number
 unitPriceHuf:number
 lineTotalHuf:number
}

export type DemoOrderEvent={
 id:string
 at:string
 kind:'order'|'payment'|'status'|'stock'|'shipment'|'invoice'|'note'
 title:string
 detail?:string
}

export type DemoOrder={
 id:string
 orderNumber:string
 createdAt:string
 updatedAt:string
 status:DemoOrderStatus
 customer:{name:string;email:string;phone:string}
 shipping:{
  provider:string
  methodId:string
  label:string
  feeHuf:number
  address?:{postalCode:string;city:string;line1:string}
  pickupPoint?:FoxpostPickupPoint|null
 }
 payment:{method:string;label:string;status:DemoPaymentStatus;feeHuf:number}
 billing:{
  provider:string
  companyInvoice:boolean
  companyName?:string
  taxNumber?:string
  invoiceStatus:DemoInvoiceStatus
  invoiceNumber?:string
  issuedAt?:string
 }
 coupon?:{code:string;discountHuf:number}|null
 items:DemoOrderItem[]
 totals:{itemsHuf:number;discountHuf:number;shippingHuf:number;paymentFeeHuf:number;totalHuf:number}
 shipment:{
  status:DemoShipmentStatus
  barcode?:string
  size?:'XS'|'S'|'M'|'L'|'XL'
  codHuf?:number
  createdAt?:string
 }
 stockReleased:boolean
 events:DemoOrderEvent[]
}

export type CreateDemoOrderInput=Omit<DemoOrder,'id'|'orderNumber'|'createdAt'|'updatedAt'|'status'|'shipment'|'stockReleased'|'events'|'billing'|'payment'> & {
 payment:Omit<DemoOrder['payment'],'status'>
 billing:Omit<DemoOrder['billing'],'invoiceStatus'|'invoiceNumber'|'issuedAt'>
}

const ordersKey='dinotoys-demo-orders-v2'
const sequenceKey='dinotoys-demo-order-sequence-v1'
const reservationsKey='dinotoys-demo-stock-reservations-v1'
const eventName='dinotoys:demo-orders'

function now(){return new Date().toISOString()}
function uid(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36)}
function emit(){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(eventName))}
function readJson<T>(key:string,fallback:T):T{
 if(typeof window==='undefined')return fallback
 try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw) as T:fallback}catch{return fallback}
}
function writeJson(key:string,value:unknown){
 if(typeof window==='undefined')return
 try{localStorage.setItem(key,JSON.stringify(value))}catch{}
}

export function readDemoOrders(){return readJson<DemoOrder[]>(ordersKey,[]).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))}
function writeDemoOrders(orders:DemoOrder[]){writeJson(ordersKey,orders);emit()}

function nextOrderNumber(){
 const year=new Date().getFullYear()
 const state=readJson<{year:number;value:number}>(sequenceKey,{year,value:0})
 const next=state.year===year?state.value+1:1
 writeJson(sequenceKey,{year,value:next})
 return `DT-${year}-${String(next).padStart(6,'0')}`
}

function stockKey(productId:string,variantId?:string){return `${productId}::${variantId||'base'}`}
function readReservations(){return readJson<Record<string,number>>(reservationsKey,{})}
function writeReservations(value:Record<string,number>){writeJson(reservationsKey,value);if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('dinotoys:demo-stock'))}

function reserveItems(items:DemoOrderItem[]){
 const current=readReservations()
 for(const item of items){const key=stockKey(item.productId,item.variantId);current[key]=Math.max(0,(current[key]||0)+item.quantity)}
 writeReservations(current)
}
function releaseItems(items:DemoOrderItem[]){
 const current=readReservations()
 for(const item of items){const key=stockKey(item.productId,item.variantId);current[key]=Math.max(0,(current[key]||0)-item.quantity);if(current[key]===0)delete current[key]}
 writeReservations(current)
}
export function getDemoReservedStock(productId:string,variantId?:string){return readReservations()[stockKey(productId,variantId)]||0}
export function getDemoAvailableStock(baseStock:number,productId:string,variantId?:string){return Math.max(0,baseStock-getDemoReservedStock(productId,variantId))}

function event(kind:DemoOrderEvent['kind'],title:string,detail?:string):DemoOrderEvent{return{id:uid(),at:now(),kind,title,detail}}

export function createDemoOrder(input:CreateDemoOrderInput){
 const createdAt=now()
 const paymentStatus:DemoPaymentStatus=input.payment.method==='cod'?'cod':'pending'
 const order:DemoOrder={
  ...input,
  id:uid(),orderNumber:nextOrderNumber(),createdAt,updatedAt:createdAt,
  status:paymentStatus==='pending'?'pending_payment':'new',
  payment:{...input.payment,status:paymentStatus},
  billing:{...input.billing,invoiceStatus:'none'},
  shipment:{status:'not_created'},
  stockReleased:false,
  events:[
   event('order','Rendelés létrejött','A demo checkout sikeresen létrehozta a rendelést.'),
   event('stock','Készlet lefoglalva',`${input.items.reduce((sum,item)=>sum+item.quantity,0)} db termék lefoglalva.`),
   event('payment',paymentStatus==='cod'?'Utánvétes fizetés':'Fizetésre vár',input.payment.label),
  ],
 }
 reserveItems(order.items)
 writeDemoOrders([order,...readDemoOrders()])
 return order
}

export function getDemoOrder(id:string){return readDemoOrders().find(order=>order.id===id||order.orderNumber===id)}

const statusLabels:Record<DemoOrderStatus,string>={
 new:'Új rendelés',pending_payment:'Fizetésre vár',paid:'Fizetve',processing:'Összekészítés alatt',packed:'Csomagolva',shipped:'Futárnak átadva',delivered:'Kézbesítve',cancelled:'Lemondva',returned:'Visszaküldve',refunded:'Visszatérítve'
}
export function demoOrderStatusLabel(status:DemoOrderStatus){return statusLabels[status]}

export function updateDemoOrderStatus(id:string,status:DemoOrderStatus){
 const orders=readDemoOrders()
 const index=orders.findIndex(order=>order.id===id)
 if(index<0)return null
 const order={...orders[index]}
 if(order.status===status)return order
 const previous=order.status
 const terminal=['cancelled','returned','refunded'].includes(status)
 if(order.stockReleased&&!terminal){reserveItems(order.items);order.stockReleased=false;order.events=[...order.events,event('stock','Készlet újra lefoglalva','A rendelés újra aktív lett, ezért a készletet ismét lefoglaltuk.')]}
 order.status=status;order.updatedAt=now()
 if(status==='paid')order.payment={...order.payment,status:'paid'}
 if(status==='refunded')order.payment={...order.payment,status:'refunded'}
 if(status==='shipped')order.shipment={...order.shipment,status:'handed_over'}
 if(status==='delivered')order.shipment={...order.shipment,status:'delivered'}
 if(status==='returned')order.shipment={...order.shipment,status:'returned'}
 if(terminal&&!order.stockReleased){releaseItems(order.items);order.stockReleased=true;order.events=[...order.events,event('stock','Készlet visszaállítva','A lefoglalt mennyiség visszakerült a demo készletbe.')]}
 order.events=[...order.events,event('status',statusLabels[status],`${statusLabels[previous]} → ${statusLabels[status]}`)]
 orders[index]=order;writeDemoOrders(orders);return order
}

export function setDemoPaymentStatus(id:string,status:DemoPaymentStatus){
 const orders=readDemoOrders(),index=orders.findIndex(order=>order.id===id);if(index<0)return null
 const order={...orders[index],payment:{...orders[index].payment,status},updatedAt:now()}
 if(status==='paid'&&['new','pending_payment'].includes(order.status))order.status='paid'
 if(status==='refunded'){order.status='refunded';if(!order.stockReleased){releaseItems(order.items);order.stockReleased=true;order.events=[...order.events,event('stock','Készlet visszaállítva','A visszatérített rendelés készletfoglalását feloldottuk.')]}}
 order.events=[...order.events,event('payment',status==='paid'?'Fizetés sikeres':status==='failed'?'Fizetés sikertelen':status==='refunded'?'Fizetés visszatérítve':'Fizetési állapot frissült',status)]
 orders[index]=order;writeDemoOrders(orders);return order
}

export function createDemoShipment(id:string,size:'XS'|'S'|'M'|'L'|'XL'='M'){
 const orders=readDemoOrders(),index=orders.findIndex(order=>order.id===id);if(index<0)return null
 const order={...orders[index]},createdAt=now()
 const prefix=order.shipping.provider==='foxpost'?'DEMO-FOX':'DEMO-SHIP'
 const barcode=`${prefix}-${order.orderNumber.replace(/[^0-9]/g,'').slice(-10)}`
 const codHuf=order.payment.method==='cod'?order.totals.totalHuf:0
 order.shipment={status:'created',barcode,size,codHuf,createdAt};order.updatedAt=createdAt
 order.events=[...order.events,event('shipment','Demo csomag létrehozva',`${barcode} · ${size} · utánvét: ${codHuf.toLocaleString('hu-HU')} Ft`)]
 orders[index]=order;writeDemoOrders(orders);return order
}

export function issueDemoInvoice(id:string){
 const orders=readDemoOrders(),index=orders.findIndex(order=>order.id===id);if(index<0)return null
 const order={...orders[index]},issuedAt=now()
 const invoiceNumber=`DEMO-${order.orderNumber.replace('DT-','SZ-')}`
 order.billing={...order.billing,invoiceStatus:'issued',invoiceNumber,issuedAt};order.updatedAt=issuedAt
 order.events=[...order.events,event('invoice','Demo számla kiállítva',`${invoiceNumber} · ${order.billing.provider}`)]
 orders[index]=order;writeDemoOrders(orders);return order
}

export function addDemoOrderNote(id:string,detail:string){
 const text=detail.trim();if(!text)return null
 const orders=readDemoOrders(),index=orders.findIndex(order=>order.id===id);if(index<0)return null
 const order={...orders[index],updatedAt:now(),events:[...orders[index].events,event('note','Admin megjegyzés',text)]}
 orders[index]=order;writeDemoOrders(orders);return order
}

export function clearDemoOrders(){
 const orders=readDemoOrders()
 for(const order of orders)if(!order.stockReleased)releaseItems(order.items)
 if(typeof window!=='undefined'){localStorage.removeItem(ordersKey);localStorage.removeItem(sequenceKey)}
 emit()
}

export function subscribeDemoOrders(callback:()=>void){
 if(typeof window==='undefined')return()=>{}
 window.addEventListener(eventName,callback)
 const storage=(event:StorageEvent)=>{if(event.key===ordersKey||event.key===reservationsKey)callback()}
 window.addEventListener('storage',storage)
 return()=>{window.removeEventListener(eventName,callback);window.removeEventListener('storage',storage)}
}
