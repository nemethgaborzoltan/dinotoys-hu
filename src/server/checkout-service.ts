import { z } from 'zod'
import { ApiError } from './http'
import { getSupabaseAdmin } from './supabase'

const checkoutSchema=z.object({
  idempotencyKey:z.string().min(12).max(120),
  email:z.string().email(),
  phone:z.string().min(6).max(40),
  couponCode:z.string().max(80).nullish(),
  shippingAddress:z.object({name:z.string().min(2).max(160),countryCode:z.string().length(2).default('HU'),postalCode:z.string().min(3).max(20),city:z.string().min(1).max(120),line1:z.string().min(2).max(240),line2:z.string().max(240).optional()}),
  items:z.array(z.object({productId:z.string().uuid(),variantId:z.string().uuid().optional(),quantity:z.number().int().min(1).max(99)})).min(1).max(100),
})
export async function createCheckout(input:unknown){
  const parsed=checkoutSchema.parse(input),db=getSupabaseAdmin()
  const {data,error}=await db.rpc('create_checkout_order',{p_idempotency_key:parsed.idempotencyKey,p_email:parsed.email,p_phone:parsed.phone,p_shipping_address:parsed.shippingAddress,p_items:parsed.items.map(i=>({product_id:i.productId,variant_id:i.variantId??null,quantity:i.quantity})),p_coupon_code:parsed.couponCode??null})
  if(error){
    if(error.message.includes('INSUFFICIENT_STOCK'))throw new ApiError(409,'Egy kiválasztott variánsból nincs elegendő szabad készlet.','INSUFFICIENT_STOCK')
    if(error.message.includes('VARIANT_NOT_AVAILABLE'))throw new ApiError(409,'A kiválasztott termékváltozat már nem vásárolható.','VARIANT_NOT_AVAILABLE')
    if(error.message.includes('PRODUCT_NOT_AVAILABLE'))throw new ApiError(409,'Egy termék már nem vásárolható.','PRODUCT_NOT_AVAILABLE')
    if(error.message.includes('COUPON_INVALID'))throw new ApiError(422,'A kuponkód érvénytelen vagy lejárt.','COUPON_INVALID')
    if(error.message.includes('COUPON_MIN_SUBTOTAL'))throw new ApiError(422,'A kosárérték még nem éri el a kupon minimumát.','COUPON_MIN_SUBTOTAL')
    if(error.message.includes('COUPON_USAGE_LIMIT')||error.message.includes('COUPON_CUSTOMER_LIMIT'))throw new ApiError(422,'A kupon felhasználási kerete elfogyott.','COUPON_LIMIT_REACHED')
    throw new ApiError(400,'Checkout létrehozása sikertelen.','CHECKOUT_FAILED',error.message)
  }
  return data
}
