import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { getSupabaseAdmin } from '../server/supabase'
import { ApiError,fail,ok } from '../server/http'
export const Route=createFileRoute('/api/v1/admin/audit')({server:{handlers:{GET:async({request})=>{try{await requireAdmin(request,'audit.read');const {data,error}=await getSupabaseAdmin().from('audit_logs').select('*').order('created_at',{ascending:false}).limit(200);if(error)throw new ApiError(500,'Audit log betöltése sikertelen.','AUDIT_READ_FAILED',error.message);return ok(data??[])}catch(e){return fail(e)}}}}})
