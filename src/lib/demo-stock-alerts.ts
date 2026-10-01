import {readLocalVersioned,removeLocal,subscribeLocal,writeLocalVersioned} from './local-store'

export type DemoStockAlertStatus='active'|'notified'|'cancelled'
export type DemoStockAlert={
 id:string
 productId:string
 productName:string
 variantId?:string
 variantLabel?:string
 email:string
 createdAt:string
 updatedAt:string
 status:DemoStockAlertStatus
 notifiedAt?:string
}
const key='dinotoys-demo-stock-alerts-v1',version=1

function uid(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36)}
export function readDemoStockAlerts(){return readLocalVersioned<DemoStockAlert[]>(key,version,[]).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}
function write(items:DemoStockAlert[]){writeLocalVersioned(key,version,items)}
export function createDemoStockAlert(input:{productId:string;productName:string;variantId?:string;variantLabel?:string;email:string}){
 const email=input.email.trim().toLowerCase(),items=readDemoStockAlerts()
 const existing=items.find(item=>item.productId===input.productId&&item.variantId===input.variantId&&item.email===email&&item.status==='active')
 if(existing)return existing
 const now=new Date().toISOString()
 const alert:DemoStockAlert={id:uid(),productId:input.productId,productName:input.productName,variantId:input.variantId,variantLabel:input.variantLabel,email,createdAt:now,updatedAt:now,status:'active'}
 write([alert,...items]);return alert
}
export function updateDemoStockAlert(id:string,status:DemoStockAlertStatus){
 const items=readDemoStockAlerts(),index=items.findIndex(item=>item.id===id);if(index<0)return null
 const now=new Date().toISOString()
 items[index]={...items[index],status,updatedAt:now,...(status==='notified'?{notifiedAt:now}:{})}
 write(items);return items[index]
}
export function deleteDemoStockAlert(id:string){write(readDemoStockAlerts().filter(item=>item.id!==id))}
export function clearDemoStockAlerts(){removeLocal(key)}
export function subscribeDemoStockAlerts(callback:()=>void){return subscribeLocal(key,callback)}
