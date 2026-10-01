import {readLocalVersioned,removeLocal,subscribeLocal,writeLocalVersioned} from './local-store'
import {readDemoOrders} from './demo-orders'

export type DemoReviewStatus='pending'|'approved'|'rejected'
export type DemoReview={
 id:string
 productId:string
 productName:string
 name:string
 email:string
 rating:number
 title:string
 body:string
 status:DemoReviewStatus
 verifiedPurchase:boolean
 createdAt:string
 updatedAt:string
}
const key='dinotoys-demo-reviews-v1',version=1

function uid(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2)+Date.now().toString(36)}
export function readDemoReviews(){return readLocalVersioned<DemoReview[]>(key,version,[]).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))}
function write(items:DemoReview[]){writeLocalVersioned(key,version,items)}
function isVerifiedPurchase(productId:string,email:string){
 const normalized=email.trim().toLowerCase()
 return readDemoOrders().some(order=>order.customer.email.trim().toLowerCase()===normalized&&order.items.some(item=>item.productId===productId)&&!['cancelled','refunded'].includes(order.status))
}
export function createDemoReview(input:{productId:string;productName:string;name:string;email:string;rating:number;title:string;body:string}){
 const now=new Date().toISOString(),rating=Math.max(1,Math.min(5,Math.round(input.rating)))
 const review:DemoReview={id:uid(),productId:input.productId,productName:input.productName,name:input.name.trim(),email:input.email.trim().toLowerCase(),rating,title:input.title.trim(),body:input.body.trim(),status:'pending',verifiedPurchase:isVerifiedPurchase(input.productId,input.email),createdAt:now,updatedAt:now}
 write([review,...readDemoReviews()]);return review
}
export function updateDemoReviewStatus(id:string,status:DemoReviewStatus){
 const items=readDemoReviews(),index=items.findIndex(item=>item.id===id);if(index<0)return null
 items[index]={...items[index],status,updatedAt:new Date().toISOString()};write(items);return items[index]
}
export function deleteDemoReview(id:string){write(readDemoReviews().filter(item=>item.id!==id))}
export function clearDemoReviews(){removeLocal(key)}
export function subscribeDemoReviews(callback:()=>void){return subscribeLocal(key,callback)}
export function approvedReviewsForProduct(productId:string){return readDemoReviews().filter(item=>item.productId===productId&&item.status==='approved')}
export function reviewSummary(productId:string,baseRating=0,baseCount=0){
 const approved=approvedReviewsForProduct(productId),localTotal=approved.reduce((sum,item)=>sum+item.rating,0),count=baseCount+approved.length
 const rating=count?((baseRating*baseCount)+localTotal)/count:0
 const distribution=[5,4,3,2,1].map(stars=>({stars,count:approved.filter(item=>item.rating===stars).length}))
 return{rating,count,approved,distribution,pending:readDemoReviews().filter(item=>item.productId===productId&&item.status==='pending').length}
}
