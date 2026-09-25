import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { ApiError,fail,ok,readJson } from '../server/http'
import { getSupabaseAdmin } from '../server/supabase'
import { writeAudit } from '../server/audit'
export const Route=createFileRoute('/api/v1/admin/products/$id/images')({server:{handlers:{
 POST:async({request,params})=>{try{const actor=await requireAdmin(request,'products.write'),body=await readJson<{url:string;alt_text?:string}>(request),db=getSupabaseAdmin();if(!body.url)throw new ApiError(400,'Kép URL szükséges.','IMAGE_URL_REQUIRED');const {data,error}=await db.from('product_images').insert({product_id:params.id,url:body.url,alt_text:body.alt_text||null,sort_order:0}).select('*').single();if(error)throw new ApiError(400,'Kép kapcsolása sikertelen.','IMAGE_ATTACH_FAILED',error.message);await writeAudit({actorUserId:actor.userId,action:'product.image.add',entityType:'products',entityId:params.id,after:data});return ok(data)}catch(e){return fail(e)}},
 DELETE:async({request,params})=>{try{const actor=await requireAdmin(request,'products.write'),imageId=new URL(request.url).searchParams.get('imageId');if(!imageId)throw new ApiError(400,'imageId szükséges.','IMAGE_ID_REQUIRED');const db=getSupabaseAdmin();const {data:before}=await db.from('product_images').select('*').eq('id',imageId).eq('product_id',params.id).maybeSingle();const {error}=await db.from('product_images').delete().eq('id',imageId).eq('product_id',params.id);if(error)throw new ApiError(400,'Kép leválasztása sikertelen.','IMAGE_DETACH_FAILED',error.message);await writeAudit({actorUserId:actor.userId,action:'product.image.remove',entityType:'products',entityId:params.id,before});return ok({deleted:true})}catch(e){return fail(e)}}
}}})
