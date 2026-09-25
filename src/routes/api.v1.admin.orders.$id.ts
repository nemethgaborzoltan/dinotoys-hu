import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { transitionOrder } from '../server/order-service'
import { fail,ok,readJson } from '../server/http'
export const Route=createFileRoute('/api/v1/admin/orders/$id')({server:{handlers:{PATCH:async({request,params})=>{try{const actor=await requireAdmin(request,'orders.write');const body=await readJson<{status:string}>(request);return ok(await transitionOrder(params.id,body.status,actor))}catch(e){return fail(e)}}}}})
