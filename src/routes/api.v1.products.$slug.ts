import { createFileRoute } from '@tanstack/react-router'
import { getSupabaseAdmin } from '../server/supabase'
import { ApiError, fail, ok } from '../server/http'
export const Route=createFileRoute('/api/v1/products/$slug')({server:{handlers:{GET:async({params})=>{try{
  const db=getSupabaseAdmin()
  const {data,error}=await db.from('products').select('id,sku,ean,name,slug,brand,description,short_description,retail_price_huf,compare_at_price_huf,vat_rate,stock_on_hand,safety_stock,age_from,manufacturer_name,responsible_person_name,safety_warning_hu,ce_marked,seo_title,seo_description,variant_options,metadata,product_images(url,alt_text,sort_order),product_categories(category_id),product_variants(id,sku,ean,retail_price_huf,compare_at_price_huf,stock_on_hand,safety_stock,weight_grams,image_url,attributes,active,sort_order)').eq('slug',params.slug).eq('status','active').maybeSingle()
  if(error)throw new ApiError(500,'Termék betöltése sikertelen.','PRODUCT_READ_FAILED',error.message)
  if(!data)throw new ApiError(404,'Termék nem található.','PRODUCT_NOT_FOUND')
  const {data:relations}=await db.from('product_relations').select('related_product_id,relation_type,sort_order').eq('product_id',data.id).order('sort_order')
  return ok({...data,relations:relations??[]})
}catch(e){return fail(e)}}}}})
