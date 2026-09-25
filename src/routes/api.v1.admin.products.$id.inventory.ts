import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { ApiError,fail,ok,readJson } from '../server/http'
import { getSupabaseAdmin } from '../server/supabase'
import { writeAudit } from '../server/audit'
export const Route=createFileRoute('/api/v1/admin/products/$id/inventory')({server:{handlers:{POST:async({request,params})=>{try{
 const actor=await requireAdmin(request,'inventory.write'),body=await readJson<{delta:number;reason:string}>(request)
 if(!Number.isInteger(body.delta)||body.delta===0)throw new ApiError(400,'Nem nulla egész készletváltozás szükséges.','INVALID_DELTA')
 if(!body.reason?.trim())throw new ApiError(400,'Indoklás szükséges.','REASON_REQUIRED')
 const db=getSupabaseAdmin(),{data,error}=await db.rpc('adjust_inventory',{p_product_id:params.id,p_delta:body.delta,p_reason:body.reason,p_reference_type:'admin',p_reference_id:null})
 if(error)throw new ApiError(409,'Készletmódosítás sikertelen.','INVENTORY_UPDATE_FAILED',error.message)
 await writeAudit({actorUserId:actor.userId,action:'inventory.adjust',entityType:'products',entityId:params.id,after:{delta:body.delta,reason:body.reason,newStock:data}})
 return ok({stock_on_hand:data})
}catch(e){return fail(e)}}}}})
