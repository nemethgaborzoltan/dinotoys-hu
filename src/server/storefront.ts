import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import type { Product } from '../data/products'
import { getOptionalServerEnv } from './env'
import { getSupabaseAdmin } from './supabase'

export type StorefrontShell={
  settings:Record<string,unknown>
  navigation:Array<{id:string;location:string;label:string;href:string;sort_order:number}>
  searchProducts:Product[]
}
export type StorefrontCategory={name:string;icon:string;blurb:string}
export type HomeData={products:Product[];categories:StorefrontCategory[];sections:Array<{section_key:string;title?:string;content:Record<string,unknown>;sort_order:number}>}
export type CatalogData={products:Product[];categories:StorefrontCategory[]}

function ready(){const e=getOptionalServerEnv();return Boolean(e.supabaseUrl&&e.serviceRoleKey)}
function categoryIcon(name:string){const n=name.toLowerCase();if(n.includes('dín'))return'🦕';if(n.includes('plüss'))return'🧸';if(n.includes('járm')||n.includes('aut'))return'🏎️';if(n.includes('isk'))return'🎒';if(n.includes('puzzle')||n.includes('játék'))return'🧩';return'🎁'}

function mapProduct(row:any):Product{
  const metadata=row.metadata&&typeof row.metadata==='object'?row.metadata:{}
  const image=[...(row.product_images??[])].sort((a:any,b:any)=>(a.sort_order??0)-(b.sort_order??0))[0]
  const category=row.product_categories?.[0]?.categories?.name||metadata.category||'Játékok'
  return {
    id:row.id,slug:row.slug,name:row.name,brand:row.brand||'DinoToys',category,sourceSku:row.sku,ean:row.ean||'',
    retailPrice:Number(row.retail_price_huf||0),compareAtPrice:row.compare_at_price_huf?Number(row.compare_at_price_huf):undefined,
    stock:Math.max(0,Number(row.stock_on_hand||0)-Number(row.safety_stock||0)),ageFrom:Number(row.age_from||3),
    tags:Array.isArray(metadata.tags)?metadata.tags.map(String):[row.brand,category].filter(Boolean).map(String),
    description:row.description||row.short_description||'',highlights:Array.isArray(metadata.highlights)?metadata.highlights.map(String):[],
    art:image?.url||'/favicon.svg',accent:String(metadata.accent||'#ff6b45'),rating:Number(metadata.rating||4.8),reviewCount:Number(metadata.reviewCount||0),
    newArrival:Boolean(metadata.newArrival),trending:Boolean(metadata.trending),
    compliance:{manufacturer:row.manufacturer_name||'Nincs adat',responsiblePerson:row.responsible_person_name||'Nincs adat',warning:row.safety_warning_hu||'',ceMarked:Boolean(row.ce_marked),safetyStatus:'ready'},
  }
}
const productSelect='id,sku,ean,name,slug,brand,description,short_description,retail_price_huf,compare_at_price_huf,stock_on_hand,safety_stock,age_from,manufacturer_name,responsible_person_name,safety_warning_hu,ce_marked,metadata,updated_at,product_images(id,url,alt_text,sort_order),product_categories(category_id,categories(name))'

async function loadProducts(limit=200){
  const db=getSupabaseAdmin()
  const {data,error}=await db.from('products').select(productSelect).eq('status','active').order('updated_at',{ascending:false}).limit(limit)
  if(error)throw error
  return (data??[]).map(mapProduct)
}
async function loadCategories(){
  const db=getSupabaseAdmin(),{data,error}=await db.from('categories').select('name,description,sort_order').eq('active',true).order('sort_order')
  if(error)throw error
  return (data??[]).map((c:any)=>({name:c.name,icon:categoryIcon(c.name),blurb:c.description||'Válogatott termékek'}))
}

export const getStorefrontShell=createServerFn({method:'GET'}).handler(async():Promise<StorefrontShell|null>=>{
  if(!ready())return null
  try{
    const db=getSupabaseAdmin()
    const [{data:settings},{data:navigation},searchProducts]=await Promise.all([
      db.from('settings').select('key,value').eq('public',true),
      db.from('navigation_items').select('id,location,label,href,sort_order').eq('active',true).order('sort_order'),
      loadProducts(20),
    ])
    return {settings:Object.fromEntries((settings??[]).map((r:any)=>[r.key,r.value])),navigation:navigation??[],searchProducts}
  }catch(e){console.error('storefront shell fallback',e);return null}
})

export const getHomeData=createServerFn({method:'GET'}).handler(async():Promise<HomeData|null>=>{
  if(!ready())return null
  try{
    const db=getSupabaseAdmin()
    const [products,categories,{data:sections}]=await Promise.all([
      loadProducts(24),loadCategories(),db.from('homepage_sections').select('section_key,title,content,sort_order').eq('enabled',true).order('sort_order')
    ])
    return {products,categories,sections:(sections??[]) as HomeData['sections']}
  }catch(e){console.error('home data fallback',e);return null}
})

export const getCatalogData=createServerFn({method:'GET'}).handler(async():Promise<CatalogData|null>=>{
  if(!ready())return null
  try{return {products:await loadProducts(200),categories:await loadCategories()}}catch(e){console.error('catalog fallback',e);return null}
})

export const getProductPage=createServerFn({method:'GET'}).validator(z.object({slug:z.string().min(1)})).handler(async({data}):Promise<{product:Product;related:Product[]}|null>=>{
  if(!ready())return null
  try{
    const db=getSupabaseAdmin(),{data:row,error}=await db.from('products').select(productSelect).eq('slug',data.slug).eq('status','active').maybeSingle()
    if(error)throw error
    if(!row)return null
    const product=mapProduct(row)
    const all=await loadProducts(30)
    const related=all.filter(p=>p.id!==product.id&&(p.category===product.category||p.brand===product.brand)).slice(0,4)
    return {product,related}
  }catch(e){console.error('product fallback',e);return null}
})


export const getContentPage=createServerFn({method:'GET'}).validator(z.object({slug:z.string().min(1)})).handler(async({data}):Promise<{slug:string;title:string;body:string;seo_title?:string|null;seo_description?:string|null}|null>=>{
  if(!ready())return null
  try{
    const db=getSupabaseAdmin()
    const {data:page,error}=await db.from('content_pages').select('slug,title,body,seo_title,seo_description').eq('slug',data.slug).eq('published',true).maybeSingle()
    if(error)throw error
    return page
  }catch(e){console.error('content page fallback',e);return null}
})
