import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { listOrders } from '../server/order-service'
import { fail,ok } from '../server/http'
export const Route=createFileRoute('/api/v1/admin/orders')({server:{handlers:{GET:async({request})=>{try{await requireAdmin(request,'orders.read');return ok(await listOrders(new URL(request.url).searchParams))}catch(e){return fail(e)}}}}})
