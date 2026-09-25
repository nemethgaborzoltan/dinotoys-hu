import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { Product,ProductOption,ProductVariant } from '../data/products'
import { getOptionalServerEnv } from './env'
import { getSupabaseAdmin } from './supabase'

export type JsonValue=string|number|boolean|null|JsonValue[]|{[key:string]:JsonValue}
export type StorefrontPromotion={id:string;name:string;code:string;kind:'percentage'|'fixed'|'free_shipping'|'bundle';value:number;description:string|null;conditions:Record<string,JsonValue>;maxDiscountHuf:number|null}
export type StorefrontPopup={id:string;name:string;title:string;body:string|null;eyebrow:string|null;couponCode:string|null;ctaLabel:string;ctaHref:string;triggerType:'delay'|'exit_intent'|'cart_value';delaySeconds:number;minCartHuf:number|null;pageScope:'all'|'home'|'catalog'|'product'|'cart';frequency:'always'|'session'|'day'|'once';content:Record<string,JsonValue>}
export type StorefrontShell={settings:Record<string,JsonValue>;navigation:Array<{id:string;location:string;label:string;href:string;sort_order:number}>;searchProducts:Product[];promotions:StorefrontPromotion[];popup:StorefrontPopup|null}
export type StorefrontCategory={name:string;icon:string;blurb:string}
export type HomeData={products:Product[];categories:StorefrontCategory[];sections:Array<{section_key:string;title?:string;content:Record<string,JsonValue>;sort_order:number}>}
export type CatalogData={products:Product[];categories:StorefrontCategory[]}

function ready(){const e=getOptionalServerEnv();return Boolean(e.supabaseUrl&&e.serviceRoleKey)}
function categoryIcon(name:string){const n=name.toLowerCase();if(n.includes('dín'))return'🦕';if(n.includes('plüss'))return'🧸';if(n.includes('járm')||n.includes('aut'))return'🏎️';if(n.includes('isk'))return'🎒';if(n.includes('puzzle')||n.includes('játék'))return'🧩';return'🎁'}
function activeWindow(starts?:string|null,ends?:string|null){const now=Date.now();return(!starts||new Date(starts).getTime()<=now)&&(!ends||new Date(ends).getTime()>=now)}

function mapProduct(row:any,relations?:{upsellIds?:string[];crossSellIds?:string[]}):Product{
  const metadata=row.metadata&&typeof row.metadata==='object'?row.metadata:{}
  const image=[...(row.product_images??[])].sort((a:any,b:any)=>(a.sort_order??0)-(b.sort_order??0))[0]
  const category=row.product_categories?.[0]?.categories?.name||metadata.category||'Játékok'
  const options=(Array.isArray(row.variant_options)?row.variant_options:[]) as ProductOption[]
  const variants:ProductVariant[]=(row.product_variants??[]).filter((v:any)=>v.active!==false).sort((a:any,b:any)=>(a.sort_order??0)-(b.sort_order??0)).map((v:any)=>({
    id:v.id,sku:v.sku,ean:v.ean??null,retailPrice:Number(v.retail_price_huf||0),compareAtPrice:v.compare_at_price_huf==null?undefined:Number(v.compare_at_price_huf),
    stock:Number(v.stock_on_hand||0),safetyStock:Number(v.safety_stock||0),art:v.image_url||undefined,attributes:(v.attributes??{}) as Record<string,string>,active:Boolean(v.active),sortOrder:Number(v.sort_order||0),
  }))
  const availableStock=variants.length?variants.reduce((sum,v)=>sum+Math.max(0,v.stock-(v.safetyStock??0)),0):Math.max(0,Number(row.stock_on_hand||0)-Number(row.safety_stock||0))
  return{
    id:row.id,slug:row.slug,name:row.name,brand:row.brand||'DinoToys',category,sourceSku:row.sku,ean:row.ean||'',
    retailPrice:Number(row.retail_price_huf||0),compareAtPrice:row.compare_at_price_huf?Number(row.compare_at_price_huf):undefined,stock:availableStock,ageFrom:Number(row.age_from||3),
    tags:Array.isArray(metadata.tags)?metadata.tags.map(String):[row.brand,category].filter(Boolean).map(String),description:row.description||row.short_description||'',
    highlights:Array.isArray(metadata.highlights)?metadata.highlights.map(String):[],art:image?.url||variants.find(v=>v.art)?.art||'/favicon.svg',accent:String(metadata.accent||'#ff6b45'),
    rating:Number(metadata.rating||4.8),reviewCount:Number(metadata.reviewCount||0),newArrival:Boolean(metadata.newArrival),trending:Boolean(metadata.trending),
    options,variants,upsellIds:relations?.upsellIds??[],crossSellIds:relations?.crossSellIds??[],
    compliance:{manufacturer:row.manufacturer_name||'Nincs adat',responsiblePerson:row.responsible_person_name||'Nincs adat',warning:row.safety_warning_hu||'',ceMarked:Boolean(row.ce_marked),safetyStatus:'ready'},
  }
}
const productSelect='id,sku,ean,name,slug,brand,description,short_description,retail_price_huf,compare_at_price_huf,stock_on_hand,safety_stock,age_from,manufacturer_name,responsible_person_name,safety_warning_hu,ce_marked,variant_options,metadata,updated_at,product_images(id,url,alt_text,sort_order),product_categories(category_id,categories(name)),product_variants(id,sku,ean,retail_price_huf,compare_at_price_huf,stock_on_hand,safety_stock,image_url,attributes,active,sort_order)'

async function loadProducts(limit=200){
  const db=getSupabaseAdmin(),{data,error}=await db.from('products').select(productSelect).eq('status','active').order('updated_at',{ascending:false}).limit(limit)
  if(error)throw error
  return(data??[]).map(row=>mapProduct(row))
}
async function loadCategories(){const db=getSupabaseAdmin(),{data,error}=await db.from('categories').select('name,description,sort_order').eq('active',true).order('sort_order');if(error)throw error;return(data??[]).map((c:any)=>({name:c.name,icon:categoryIcon(c.name),blurb:c.description||'Válogatott termékek'}))}
function mapPromotion(row:any):StorefrontPromotion{return{id:row.id,name:row.name,code:row.code||'',kind:row.kind,value:Number(row.value||0),description:row.description??null,conditions:(row.conditions??{}) as Record<string,JsonValue>,maxDiscountHuf:row.max_discount_huf==null?null:Number(row.max_discount_huf)}}
function mapPopup(row:any):StorefrontPopup{return{id:row.id,name:row.name,title:row.title,body:row.body??null,eyebrow:row.eyebrow??null,couponCode:row.coupon_code??null,ctaLabel:row.cta_label,ctaHref:row.cta_href,triggerType:row.trigger_type,delaySeconds:Number(row.delay_seconds||0),minCartHuf:row.min_cart_huf==null?null:Number(row.min_cart_huf),pageScope:row.page_scope,frequency:row.frequency,content:(row.content??{}) as Record<string,JsonValue>}}

export const getStorefrontShell=createServerFn({method:'GET'}).handler(async():Promise<StorefrontShell|null>=>{
  if(!ready())return null
  try{
    const db=getSupabaseAdmin()
    const [{data:settings},{data:navigation},searchProducts,promoResult,popupResult]=await Promise.all([
      db.from('settings').select('key,value').eq('public',true),
      db.from('navigation_items').select('id,location,label,href,sort_order').eq('active',true).order('sort_order'),
      loadProducts(20),
      db.from('promotions').select('id,name,code,kind,value,description,conditions,max_discount_huf,starts_at,ends_at,active,priority').eq('active',true).order('priority',{ascending:false}),
      db.from('marketing_popups').select('*').eq('active',true).order('sort_order'),
    ])
    const promotions=promoResult.error?[]:(promoResult.data??[]).filter((p:any)=>p.code&&activeWindow(p.starts_at,p.ends_at)).map(mapPromotion)
    const popupRows=popupResult.error?[]:(popupResult.data??[]).filter((p:any)=>activeWindow(p.starts_at,p.ends_at))
    return{settings:Object.fromEntries((settings??[]).map((r:any)=>[r.key,r.value])),navigation:navigation??[],searchProducts,promotions,popup:popupRows[0]?mapPopup(popupRows[0]):null}
  }catch(e){console.error('storefront shell fallback',e);return null}
})
export const getHomeData=createServerFn({method:'GET'}).handler(async():Promise<HomeData|null>=>{if(!ready())return null;try{const db=getSupabaseAdmin();const[products,categories,{data:sections}]=await Promise.all([loadProducts(24),loadCategories(),db.from('homepage_sections').select('section_key,title,content,sort_order').eq('enabled',true).order('sort_order')]);return{products,categories,sections:(sections??[]) as HomeData['sections']}}catch(e){console.error('home data fallback',e);return null}})
export const getCatalogData=createServerFn({method:'GET'}).handler(async():Promise<CatalogData|null>=>{if(!ready())return null;try{return{products:await loadProducts(200),categories:await loadCategories()}}catch(e){console.error('catalog fallback',e);return null}})
export const getProductPage=createServerFn({method:'GET'}).validator(z.object({slug:z.string().min(1)})).handler(async({data}):Promise<{product:Product;related:Product[];upsell:Product[];crossSell:Product[]}|null>=>{
  if(!ready())return null
  try{
    const db=getSupabaseAdmin(),{data:row,error}=await db.from('products').select(productSelect).eq('slug',data.slug).eq('status','active').maybeSingle()
    if(error)throw error;if(!row)return null
    const {data:relations}=await db.from('product_relations').select('related_product_id,relation_type,sort_order').eq('product_id',row.id).order('sort_order')
    const upsellIds=(relations??[]).filter(r=>r.relation_type==='upsell').map(r=>r.related_product_id),crossSellIds=(relations??[]).filter(r=>r.relation_type==='cross_sell').map(r=>r.related_product_id)
    const product=mapProduct(row,{upsellIds,crossSellIds}),all=await loadProducts(80)
    const related=all.filter(p=>p.id!==product.id&&(p.category===product.category||p.brand===product.brand)).slice(0,4)
    return{product,related,upsell:upsellIds.map(id=>all.find(p=>p.id===id)).filter((p):p is Product=>Boolean(p)),crossSell:crossSellIds.map(id=>all.find(p=>p.id===id)).filter((p):p is Product=>Boolean(p))}
  }catch(e){console.error('product fallback',e);return null}
})
export const getContentPage=createServerFn({method:'GET'}).validator(z.object({slug:z.string().min(1)})).handler(async({data}):Promise<{slug:string;title:string;body:string;seo_title?:string|null;seo_description?:string|null}|null>=>{if(!ready())return null;try{const db=getSupabaseAdmin(),{data:page,error}=await db.from('content_pages').select('slug,title,body,seo_title,seo_description').eq('slug',data.slug).eq('published',true).maybeSingle();if(error)throw error;return page}catch(e){console.error('content page fallback',e);return null}})


export type LegalProfile={
  companyName:string
  registeredOffice:string
  mailingAddress:string
  taxNumber:string
  registrationNumber:string
  email:string
  phone:string
  hostingName:string
  hostingAddress:string
  hostingContact:string
  complaintAddress:string
  lastReviewed:string
  complete:boolean
}

function legalText(value:unknown,fallback:string){
  return typeof value==='string'&&value.trim()?value:fallback
}

export const getLegalProfile=createServerFn({method:'GET'}).handler(async():Promise<LegalProfile>=>{
  const fallback:LegalProfile={
    companyName:'[KITÖLTENDŐ – vállalkozás neve]',
    registeredOffice:'[KITÖLTENDŐ – székhely]',
    mailingAddress:'[KITÖLTENDŐ – levelezési cím]',
    taxNumber:'[KITÖLTENDŐ – adószám]',
    registrationNumber:'[KITÖLTENDŐ – cégjegyzékszám vagy nyilvántartási szám]',
    email:'[KITÖLTENDŐ – ügyfélszolgálati e-mail]',
    phone:'[KITÖLTENDŐ – telefonszám]',
    hostingName:'Cloudflare / Supabase – production konfiguráció szerint pontosítandó',
    hostingAddress:'[KITÖLTENDŐ / szolgáltatói szerződés alapján]',
    hostingContact:'[KITÖLTENDŐ / szolgáltatói szerződés alapján]',
    complaintAddress:'[KITÖLTENDŐ – panaszkezelési cím]',
    lastReviewed:'2026-09-25',
    complete:false,
  }
  if(!ready())return fallback
  try{
    const db=getSupabaseAdmin()
    const {data,error}=await db.from('settings').select('key,value').eq('group_name','legal')
    if(error)throw error
    const values=Object.fromEntries((data??[]).map((row:any)=>[row.key,row.value]))
    const profile:LegalProfile={
      companyName:legalText(values['legal.company_name'],fallback.companyName),
      registeredOffice:legalText(values['legal.registered_office'],fallback.registeredOffice),
      mailingAddress:legalText(values['legal.mailing_address'],fallback.mailingAddress),
      taxNumber:legalText(values['legal.tax_number'],fallback.taxNumber),
      registrationNumber:legalText(values['legal.registration_number'],fallback.registrationNumber),
      email:legalText(values['legal.email'],fallback.email),
      phone:legalText(values['legal.phone'],fallback.phone),
      hostingName:legalText(values['legal.hosting_name'],fallback.hostingName),
      hostingAddress:legalText(values['legal.hosting_address'],fallback.hostingAddress),
      hostingContact:legalText(values['legal.hosting_contact'],fallback.hostingContact),
      complaintAddress:legalText(values['legal.complaint_address'],fallback.complaintAddress),
      lastReviewed:legalText(values['legal.last_reviewed'],fallback.lastReviewed),
      complete:true,
    }
    profile.complete=!Object.values(profile).some(value=>typeof value==='string'&&value.includes('[KITÖLTENDŐ'))
    return profile
  }catch(error){
    console.error('legal profile fallback',error)
    return fallback
  }
})
