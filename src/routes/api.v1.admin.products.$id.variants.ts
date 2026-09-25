import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { fail,ok,readJson } from '../server/http'
import { getVariantConfig,replaceVariantConfig } from '../server/variant-service'
export const Route=createFileRoute('/api/v1/admin/products/$id/variants')({server:{handlers:{
  GET:async({request,params})=>{try{await requireAdmin(request,'products.read');return ok(await getVariantConfig(params.id))}catch(e){return fail(e)}},
  PUT:async({request,params})=>{try{const actor=await requireAdmin(request,'products.write');return ok(await replaceVariantConfig(params.id,await readJson(request),actor))}catch(e){return fail(e)}},
}}})
