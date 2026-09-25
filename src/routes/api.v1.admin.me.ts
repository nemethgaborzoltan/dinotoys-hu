import { createFileRoute } from '@tanstack/react-router'
import { fail,ok } from '../server/http'
import { requireAdmin } from '../server/auth'
export const Route=createFileRoute('/api/v1/admin/me')({server:{handlers:{GET:async({request})=>{try{return ok(await requireAdmin(request))}catch(e){return fail(e)}}}}})
