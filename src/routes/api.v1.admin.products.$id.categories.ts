import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { ApiError,fail,ok,readJson } from '../server/http'
import { getSupabaseAdmin } from '../server/supabase'
import { writeAudit } from '../server/audit'
export const Route=createFileRoute('/api/v1/admin/products/$id/categories')({server:{handlers:{PUT:async({request,params})=>{try{
 const actor=await requireAdmin(request,'products.write'),body=await readJson<{categoryIds:string[]}>(request),db=getSupabaseAdmin()
 if(!Array.isArray(body.categoryIds))throw new ApiError(400,'categoryIds lista szükséges.','CATEGORY_IDS_REQUIRED')
 const {data:before}=await db.from('product_categories').select('*').eq('product_id',params.id)
 const {error:delError}=await db.from('product_categories').delete().eq('product_id',params.id);if(delError)throw new ApiError(400,'Kategóriák módosítása sikertelen.','CATEGORY_UPDATE_FAILED')
 if(body.categoryIds.length){const {error}=await db.from('product_categories').insert(body.categoryIds.map(category_id=>({product_id:params.id,category_id})));if(error)throw new ApiError(400,'Kategóriák mentése sikertelen.','CATEGORY_UPDATE_FAILED',error.message)}
 await writeAudit({actorUserId:actor.userId,action:'product.categories',entityType:'products',entityId:params.id,before,after:body.categoryIds});return ok({categoryIds:body.categoryIds})
}catch(e){return fail(e)}}}}})
