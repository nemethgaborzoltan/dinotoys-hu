import { productInputSchema, productPatchSchema } from './schemas'
import { ApiError } from './http'
import { getSupabaseAdmin } from './supabase'
import { writeAudit } from './audit'
import type { AdminPrincipal } from './auth'

async function assertPublishable(product: Record<string, any>, productId?: string) {
  if (product.status !== 'active') return
  const missing:string[]=[]
  if (!product.name) missing.push('name')
  if (!product.sku) missing.push('sku')
  if (!product.retail_price_huf || product.retail_price_huf <= 0) missing.push('retail_price_huf')
  if (!product.manufacturer_name) missing.push('manufacturer_name')
  if (!product.responsible_person_name) missing.push('responsible_person_name')
  if (!product.safety_warning_hu) missing.push('safety_warning_hu')
  if (product.stock_on_hand == null || product.stock_on_hand < 0) missing.push('stock_on_hand')

  if (productId) {
    const db=getSupabaseAdmin()
    const {count}=await db.from('product_images').select('*',{count:'exact',head:true}).eq('product_id',productId)
    if (!count) missing.push('product_image')
  } else {
    missing.push('product_image')
  }

  if (missing.length) throw new ApiError(422,'A termék még nem publikálható.','PRODUCT_NOT_PUBLISHABLE',{missing})
}

export async function listProducts(params:URLSearchParams){
  const db=getSupabaseAdmin()
  const page=Math.max(1,Number(params.get('page')||1))
  const pageSize=Math.min(100,Math.max(10,Number(params.get('pageSize')||25)))
  const from=(page-1)*pageSize,to=from+pageSize-1
  let query=db.from('products').select('*, product_images(id,url,alt_text,sort_order), product_categories(category_id)',{count:'exact'}).range(from,to).order('updated_at',{ascending:false})
  const q=params.get('q')
  if(q) query=query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,ean.ilike.%${q}%,brand.ilike.%${q}%`)
  const status=params.get('status')
  if(status) query=query.eq('status',status)
  const {data,error,count}=await query
  if(error) throw new ApiError(500,'Terméklista betöltése sikertelen.','PRODUCT_LIST_FAILED',error.message)
  return {items:data??[],page,pageSize,total:count??0}
}

export async function getProduct(id:string){
  const db=getSupabaseAdmin()
  const {data,error}=await db.from('products').select('*, product_images(*), product_categories(category_id)').eq('id',id).maybeSingle()
  if(error) throw new ApiError(500,'Termék betöltése sikertelen.','PRODUCT_READ_FAILED',error.message)
  if(!data) throw new ApiError(404,'A termék nem található.','PRODUCT_NOT_FOUND')
  return data
}

export async function createProduct(input:unknown,actor:AdminPrincipal){
  const parsed=productInputSchema.parse(input)
  await assertPublishable(parsed)
  const db=getSupabaseAdmin()
  const {data,error}=await db.from('products').insert(parsed).select('*').single()
  if(error) throw new ApiError(400,'Termék létrehozása sikertelen.','PRODUCT_CREATE_FAILED',error.message)
  await writeAudit({actorUserId:actor.userId,action:'product.create',entityType:'products',entityId:data.id,after:data})
  return data
}

export async function updateProduct(id:string,input:unknown,actor:AdminPrincipal){
  const patch=productPatchSchema.parse(input), db=getSupabaseAdmin()
  const before=await getProduct(id)
  const merged={...before,...patch}
  await assertPublishable(merged,id)
  const {data,error}=await db.from('products').update(patch).eq('id',id).select('*').single()
  if(error) throw new ApiError(400,'Termék módosítása sikertelen.','PRODUCT_UPDATE_FAILED',error.message)
  await writeAudit({actorUserId:actor.userId,action:'product.update',entityType:'products',entityId:id,before,after:data})
  return data
}

export async function archiveProduct(id:string,actor:AdminPrincipal){
  const before=await getProduct(id),db=getSupabaseAdmin()
  const {data,error}=await db.from('products').update({status:'archived'}).eq('id',id).select('*').single()
  if(error) throw new ApiError(400,'Archiválás sikertelen.','PRODUCT_ARCHIVE_FAILED',error.message)
  await writeAudit({actorUserId:actor.userId,action:'product.archive',entityType:'products',entityId:id,before,after:data})
  return data
}
