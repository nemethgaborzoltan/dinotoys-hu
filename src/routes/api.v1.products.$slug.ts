import { createFileRoute } from '@tanstack/react-router'
import { getSupabaseAdmin } from '../server/supabase'
import { ApiError,fail,ok } from '../server/http'
export const Route=createFileRoute('/api/v1/products/$slug')({server:{handlers:{GET:async({params})=>{try{
  const {data,error}=await getSupabaseAdmin().from('products').select('*, product_images(url,alt_text,sort_order), product_categories(category_id)').eq('slug',params.slug).eq('status','active').maybeSingle()
  if(error)throw new ApiError(500,'Termék betöltése sikertelen.','PRODUCT_READ_FAILED',error.message)
  if(!data)throw new ApiError(404,'Termék nem található.','PRODUCT_NOT_FOUND')
  return ok(data)
}catch(e){return fail(e)}}}}})
