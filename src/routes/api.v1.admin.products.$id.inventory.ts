import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { ApiError,fail,ok,readJson } from '../server/http'
import { getSupabaseAdmin } from '../server/supabase'
import { writeAudit } from '../server/audit'
export const Route=createFileRoute('/api/v1/admin/products/$id/inventory')({server:{handlers:{POST:async({request,params})=>{try{
 const actor=await requireAdmin(request,'inventory.write'),body=await readJson<{delta:number;reason:string;variantId?:string}>(request)
 if(!Number.isInteger(body.delta)||body.delta===0)throw new ApiError(400,'Nem nulla egész készletváltozás szükséges.','INVALID_DELTA')
 if(!body.reason?.trim())throw new ApiError(400,'Indoklás szükséges.','REASON_REQUIRED')
 const db=getSupabaseAdmin()
 const result=body.variantId
  ?await db.rpc('adjust_variant_inventory',{p_variant_id:body.variantId,p_delta:body.delta,p_reason:body.reason,p_reference_type:'admin',p_reference_id:null})
  :await db.rpc('adjust_inventory',{p_product_id:params.id,p_delta:body.delta,p_reason:body.reason,p_reference_type:'admin',p_reference_id:null})
 if(result.error)throw new ApiError(409,'Készletmódosítás sikertelen.','INVENTORY_UPDATE_FAILED',result.error.message)
 await writeAudit({actorUserId:actor.userId,action:body.variantId?'variant.inventory.adjust':'inventory.adjust',entityType:'products',entityId:params.id,after:{variantId:body.variantId??null,delta:body.delta,reason:body.reason,newStock:result.data}})
 return ok({stock_on_hand:result.data})
}catch(e){return fail(e)}}}}})
