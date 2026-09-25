import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { createProduct,listProducts } from '../server/product-service'
import { fail,ok,readJson } from '../server/http'
export const Route=createFileRoute('/api/v1/admin/products')({server:{handlers:{
  GET:async({request})=>{try{await requireAdmin(request,'products.read');return ok(await listProducts(new URL(request.url).searchParams))}catch(e){return fail(e)}},
  POST:async({request})=>{try{const actor=await requireAdmin(request,'products.write');return ok(await createProduct(await readJson(request),actor))}catch(e){return fail(e)}},
}}})
