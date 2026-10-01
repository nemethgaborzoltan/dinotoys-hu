export type DemoSupportStatus='new'|'in_progress'|'waiting_customer'|'resolved'
export type DemoSupportPriority='normal'|'high'
export type DemoSupportCategory='order'|'shipping'|'product'|'return'|'payment'|'other'
export type DemoSupportMessage={id:string;at:string;author:'customer'|'admin';body:string}
export type DemoSupportTicket={
 id:string
 ticketNumber:string
 createdAt:string
 updatedAt:string
 status:DemoSupportStatus
 priority:DemoSupportPriority
 category:DemoSupportCategory
 name:string
 email:string
 orderNumber?:string
 subject:string
 messages:DemoSupportMessage[]
}

const storageKey='dinotoys-demo-support-v1'
const sequenceKey='dinotoys-demo-support-sequence-v1'
const eventName='dinotoys:support'

export const supportStatusLabels:Record<DemoSupportStatus,string>={
 new:'Új',
 in_progress:'Folyamatban',
 waiting_customer:'Vásárlóra vár',
 resolved:'Lezárva',
}
export const supportCategoryLabels:Record<DemoSupportCategory,string>={
 order:'Rendelés',
 shipping:'Szállítás',
 product:'Termék',
 return:'Visszaküldés',
 payment:'Fizetés',
 other:'Egyéb',
}

function uid(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36)}
function emit(){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(eventName))}
function nextNumber(){
 if(typeof window==='undefined')return'DT-S-000001'
 const current=Number(localStorage.getItem(sequenceKey)||'0')+1
 localStorage.setItem(sequenceKey,String(current))
 return'DT-S-'+String(current).padStart(6,'0')
}
export function readDemoSupportTickets():DemoSupportTicket[]{
 if(typeof window==='undefined')return[]
 try{const raw=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(raw)?raw.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))):[]}catch{return[]}
}
function write(items:DemoSupportTicket[]){if(typeof window==='undefined')return;localStorage.setItem(storageKey,JSON.stringify(items));emit()}
export function createDemoSupportTicket(input:{name:string;email:string;orderNumber?:string;subject:string;message:string;category:DemoSupportCategory}){
 const now=new Date().toISOString()
 const ticket:DemoSupportTicket={id:uid(),ticketNumber:nextNumber(),createdAt:now,updatedAt:now,status:'new',priority:'normal',category:input.category,name:input.name,email:input.email,orderNumber:input.orderNumber?.trim()||undefined,subject:input.subject.trim(),messages:[{id:uid(),at:now,author:'customer',body:input.message.trim()}]}
 write([ticket,...readDemoSupportTickets()])
 return ticket
}
export function updateDemoSupportTicket(id:string,patch:Partial<Pick<DemoSupportTicket,'status'|'priority'|'category'|'subject'>>){
 const items=readDemoSupportTickets(),index=items.findIndex(item=>item.id===id);if(index<0)return null
 items[index]={...items[index],...patch,updatedAt:new Date().toISOString()};write(items);return items[index]
}
export function addDemoSupportMessage(id:string,body:string,author:'customer'|'admin'='admin'){
 const text=body.trim();if(!text)return null
 const items=readDemoSupportTickets(),index=items.findIndex(item=>item.id===id);if(index<0)return null
 const now=new Date().toISOString(),message:DemoSupportMessage={id:uid(),at:now,author,body:text}
 items[index]={...items[index],messages:[...items[index].messages,message],status:author==='admin'?'waiting_customer':'in_progress',updatedAt:now};write(items);return items[index]
}
export function deleteDemoSupportTicket(id:string){write(readDemoSupportTickets().filter(item=>item.id!==id))}
export function subscribeDemoSupport(callback:()=>void){
 if(typeof window==='undefined')return()=>{}
 window.addEventListener(eventName,callback)
 const storage=(event:StorageEvent)=>{if(event.key===storageKey)callback()}
 window.addEventListener('storage',storage)
 return()=>{window.removeEventListener(eventName,callback);window.removeEventListener('storage',storage)}
}
