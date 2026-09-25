import { z } from 'zod'
import { ApiError } from './http'
import { getSupabaseAdmin } from './supabase'
import { brandSchema, categorySchema, contentPageSchema, homepageSectionSchema, integrationSchema, marketingPopupSchema, navigationSchema, priceRuleSchema, promotionSchema, settingSchema, supplierSchema } from './schemas'
import { writeAudit } from './audit'
import type { AdminPrincipal } from './auth'

type ResourceConfig = { table:string; permission:string; schema:z.AnyZodObject; orderBy:string }
export const resources: Record<string, ResourceConfig> = {
  categories:{table:'categories',permission:'categories.write',schema:categorySchema,orderBy:'sort_order'},
  brands:{table:'brands',permission:'products.write',schema:brandSchema,orderBy:'name'},
  content_pages:{table:'content_pages',permission:'content.write',schema:contentPageSchema,orderBy:'slug'},
  navigation_items:{table:'navigation_items',permission:'content.write',schema:navigationSchema,orderBy:'sort_order'},
  homepage_sections:{table:'homepage_sections',permission:'content.write',schema:homepageSectionSchema,orderBy:'sort_order'},
  settings:{table:'settings',permission:'settings.write',schema:settingSchema,orderBy:'group_name'},
  price_rules:{table:'price_rules',permission:'pricing.write',schema:priceRuleSchema,orderBy:'name'},
  promotions:{table:'promotions',permission:'marketing.write',schema:promotionSchema,orderBy:'priority'},
  marketing_popups:{table:'marketing_popups',permission:'marketing.write',schema:marketingPopupSchema,orderBy:'sort_order'},
  suppliers:{table:'suppliers',permission:'supplier.sync',schema:supplierSchema,orderBy:'name'},
  integration_accounts:{table:'integration_accounts',permission:'integrations.write',schema:integrationSchema,orderBy:'provider'},
}
export function getResource(name:string){const item=resources[name];if(!item)throw new ApiError(404,'Ismeretlen admin erőforrás.','UNKNOWN_RESOURCE');return item}
export async function listResource(name:string){const r=getResource(name),db=getSupabaseAdmin();const {data,error}=await db.from(r.table).select('*').order(r.orderBy,{ascending:true});if(error)throw new ApiError(500,'Az adatok betöltése sikertelen.','DB_READ_FAILED',error.message);return data??[]}
export async function createResource(name:string,input:unknown,actor:AdminPrincipal){const r=getResource(name),parsed=r.schema.parse(input),db=getSupabaseAdmin();const {data,error}=await db.from(r.table).insert(parsed).select('*').single();if(error)throw new ApiError(400,'Mentés sikertelen.','DB_INSERT_FAILED',error.message);await writeAudit({actorUserId:actor.userId,action:'create',entityType:r.table,entityId:data.id,after:data});return data}
export async function updateResource(name:string,id:string,input:unknown,actor:AdminPrincipal){const r=getResource(name),parsed=r.schema.partial().parse(input),db=getSupabaseAdmin();const {data:before}=await db.from(r.table).select('*').eq('id',id).maybeSingle();const {data,error}=await db.from(r.table).update(parsed).eq('id',id).select('*').single();if(error)throw new ApiError(400,'Módosítás sikertelen.','DB_UPDATE_FAILED',error.message);await writeAudit({actorUserId:actor.userId,action:'update',entityType:r.table,entityId:id,before,after:data});return data}
export async function deleteResource(name:string,id:string,actor:AdminPrincipal){const r=getResource(name),db=getSupabaseAdmin();const {data:before}=await db.from(r.table).select('*').eq('id',id).maybeSingle();const {error}=await db.from(r.table).delete().eq('id',id);if(error)throw new ApiError(400,'Törlés sikertelen.','DB_DELETE_FAILED',error.message);await writeAudit({actorUserId:actor.userId,action:'delete',entityType:r.table,entityId:id,before})}
