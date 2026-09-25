import { ApiError } from './http'
import { getSupabaseAdmin } from './supabase'
import { variantConfigSchema } from './schemas'
import { writeAudit } from './audit'
import type { AdminPrincipal } from './auth'

export async function getVariantConfig(productId:string){
  const db=getSupabaseAdmin()
  const [{data:product,error:productError},{data:variants,error:variantError},{data:relations,error:relationError}]=await Promise.all([
    db.from('products').select('id,variant_options').eq('id',productId).maybeSingle(),
    db.from('product_variants').select('*').eq('product_id',productId).order('sort_order'),
    db.from('product_relations').select('related_product_id,relation_type,sort_order').eq('product_id',productId).order('sort_order'),
  ])
  if(productError||!product)throw new ApiError(404,'Termék nem található.','PRODUCT_NOT_FOUND')
  if(variantError||relationError)throw new ApiError(500,'Variáns konfiguráció betöltése sikertelen.','VARIANT_CONFIG_READ_FAILED',{variantError:variantError?.message,relationError:relationError?.message})
  return{options:product.variant_options??[],variants:variants??[],upsellIds:(relations??[]).filter(r=>r.relation_type==='upsell').map(r=>r.related_product_id),crossSellIds:(relations??[]).filter(r=>r.relation_type==='cross_sell').map(r=>r.related_product_id)}
}

export async function replaceVariantConfig(productId:string,input:unknown,actor:AdminPrincipal){
  const parsed=variantConfigSchema.parse(input),db=getSupabaseAdmin(),before=await getVariantConfig(productId)
  const optionNames=new Set(parsed.options.map(option=>option.name))
  for(const variant of parsed.variants){
    for(const key of Object.keys(variant.attributes))if(!optionNames.has(key))throw new ApiError(422,`Ismeretlen variáns opció: ${key}`,'INVALID_VARIANT_ATTRIBUTE')
    for(const option of parsed.options){if(!variant.attributes[option.name])throw new ApiError(422,`A(z) ${variant.sku} variánsból hiányzik: ${option.label}`,'MISSING_VARIANT_ATTRIBUTE')}
  }
  const keptIds=parsed.variants.flatMap(v=>v.id?[v.id]:[])
  let deleteQuery=db.from('product_variants').delete().eq('product_id',productId)
  if(keptIds.length)deleteQuery=deleteQuery.not('id','in',`(${keptIds.join(',')})`)
  const {error:deleteError}=await deleteQuery;if(deleteError)throw new ApiError(400,'Régi variánsok törlése sikertelen.','VARIANT_DELETE_FAILED',deleteError.message)
  for(const variant of parsed.variants){
    const row={product_id:productId,sku:variant.sku,ean:variant.ean??null,retail_price_huf:variant.retail_price_huf,compare_at_price_huf:variant.compare_at_price_huf??null,cost_net_eur:variant.cost_net_eur??null,stock_on_hand:variant.stock_on_hand,safety_stock:variant.safety_stock,weight_grams:variant.weight_grams??null,image_url:variant.image_url??null,attributes:variant.attributes,metadata:variant.metadata,active:variant.active,sort_order:variant.sort_order}
    if(variant.id){const {error}=await db.from('product_variants').update(row).eq('id',variant.id).eq('product_id',productId);if(error)throw new ApiError(400,'Variáns módosítása sikertelen.','VARIANT_UPDATE_FAILED',error.message)}
    else{const {error}=await db.from('product_variants').insert(row);if(error)throw new ApiError(400,'Variáns létrehozása sikertelen.','VARIANT_CREATE_FAILED',error.message)}
  }
  const {error:productError}=await db.from('products').update({variant_options:parsed.options}).eq('id',productId);if(productError)throw new ApiError(400,'Variáns opciók mentése sikertelen.','VARIANT_OPTIONS_FAILED',productError.message)
  const {error:relationDelete}=await db.from('product_relations').delete().eq('product_id',productId);if(relationDelete)throw new ApiError(400,'Kapcsolódó ajánlatok frissítése sikertelen.','RELATION_DELETE_FAILED',relationDelete.message)
  const relationRows=[...parsed.upsellIds.map((related_product_id,sort_order)=>({product_id:productId,related_product_id,relation_type:'upsell',sort_order})),...parsed.crossSellIds.map((related_product_id,sort_order)=>({product_id:productId,related_product_id,relation_type:'cross_sell',sort_order}))]
  if(relationRows.length){const {error}=await db.from('product_relations').insert(relationRows);if(error)throw new ApiError(400,'Upsell/cross-sell mentése sikertelen.','RELATION_SAVE_FAILED',error.message)}
  const after=await getVariantConfig(productId)
  await writeAudit({actorUserId:actor.userId,action:'product.merchandising.update',entityType:'products',entityId:productId,before,after})
  return after
}
