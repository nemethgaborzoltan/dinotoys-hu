import { createFileRoute } from '@tanstack/react-router'
import { getSupabaseAdmin } from '../server/supabase'
import { ApiError,fail,ok } from '../server/http'
export const Route=createFileRoute('/api/v1/products')({server:{handlers:{GET:async({request})=>{try{
  const url=new URL(request.url),db=getSupabaseAdmin(),limit=Math.min(100,Math.max(1,Number(url.searchParams.get('limit')||24)))
  let q=db.from('products').select('id,sku,ean,name,slug,brand,short_description,retail_price_huf,compare_at_price_huf,stock_on_hand,safety_stock,age_from,product_images(url,alt_text,sort_order)').eq('status','active').limit(limit).order('updated_at',{ascending:false})
  const search=url.searchParams.get('q');if(search)q=q.or(`name.ilike.%${search}%,brand.ilike.%${search}%`)
  const {data,error}=await q;if(error)throw new ApiError(500,'Katalógus betöltése sikertelen.','CATALOG_FAILED',error.message)
  return ok(data??[])
}catch(e){return fail(e)}}}}})
