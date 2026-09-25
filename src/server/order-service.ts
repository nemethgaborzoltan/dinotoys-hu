import { ApiError } from './http'
import { getSupabaseAdmin } from './supabase'
import { writeAudit } from './audit'
import type { AdminPrincipal } from './auth'

const transitions:Record<string,string[]>={
  draft:['pending_payment','cancelled'],
  pending_payment:['paid','cancelled'],
  paid:['processing','refunded'],
  processing:['shipped','cancelled','refunded'],
  shipped:['delivered','returned'],
  delivered:['returned','refunded'],
  returned:['refunded'],
  cancelled:[],
  refunded:[],
}

export async function listOrders(params:URLSearchParams){
  const db=getSupabaseAdmin(),page=Math.max(1,Number(params.get('page')||1)),pageSize=Math.min(100,Math.max(10,Number(params.get('pageSize')||25))),from=(page-1)*pageSize
  let query=db.from('orders').select('*, order_items(*)',{count:'exact'}).range(from,from+pageSize-1).order('created_at',{ascending:false})
  const status=params.get('status'); if(status)query=query.eq('status',status)
  const {data,error,count}=await query
  if(error)throw new ApiError(500,'Rendelések betöltése sikertelen.','ORDER_LIST_FAILED',error.message)
  return {items:data??[],page,pageSize,total:count??0}
}

export async function transitionOrder(id:string,nextStatus:string,actor:AdminPrincipal){
  const db=getSupabaseAdmin()
  const {data:before,error:readError}=await db.from('orders').select('*').eq('id',id).maybeSingle()
  if(readError)throw new ApiError(500,'Rendelés betöltése sikertelen.','ORDER_READ_FAILED')
  if(!before)throw new ApiError(404,'Rendelés nem található.','ORDER_NOT_FOUND')
  if(!(transitions[before.status]??[]).includes(nextStatus)) throw new ApiError(422,`Tiltott státuszváltás: ${before.status} → ${nextStatus}`,'INVALID_ORDER_TRANSITION')
  const {data,error}=await db.from('orders').update({status:nextStatus}).eq('id',id).select('*').single()
  if(error)throw new ApiError(400,'Rendelés módosítása sikertelen.','ORDER_UPDATE_FAILED',error.message)
  await writeAudit({actorUserId:actor.userId,action:'order.status',entityType:'orders',entityId:id,before,after:data})
  return data
}
