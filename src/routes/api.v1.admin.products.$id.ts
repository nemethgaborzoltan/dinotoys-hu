import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { archiveProduct,getProduct,updateProduct } from '../server/product-service'
import { fail,ok,readJson } from '../server/http'
export const Route=createFileRoute('/api/v1/admin/products/$id')({server:{handlers:{
  GET:async({request,params})=>{try{await requireAdmin(request,'products.read');return ok(await getProduct(params.id))}catch(e){return fail(e)}},
  PATCH:async({request,params})=>{try{const actor=await requireAdmin(request,'products.write');return ok(await updateProduct(params.id,await readJson(request),actor))}catch(e){return fail(e)}},
  DELETE:async({request,params})=>{try{const actor=await requireAdmin(request,'products.write');return ok(await archiveProduct(params.id,actor))}catch(e){return fail(e)}},
}}})
