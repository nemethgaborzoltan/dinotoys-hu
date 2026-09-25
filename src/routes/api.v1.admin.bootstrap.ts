import { createFileRoute } from '@tanstack/react-router'
import { authenticate } from '../server/auth'
import { ApiError,fail,ok } from '../server/http'
import { getSupabaseAdmin } from '../server/supabase'
import { getServerEnv } from '../server/env'
export const Route=createFileRoute('/api/v1/admin/bootstrap')({server:{handlers:{POST:async({request})=>{try{
  const user=await authenticate(request),env=getServerEnv()
  if(!env.ADMIN_BOOTSTRAP_EMAIL||user.email?.toLowerCase()!==env.ADMIN_BOOTSTRAP_EMAIL.toLowerCase())throw new ApiError(403,'Bootstrap e-mail nem engedélyezett.','BOOTSTRAP_FORBIDDEN')
  const db=getSupabaseAdmin()
  const {count}=await db.from('admin_users').select('*',{count:'exact',head:true})
  if((count??0)>0)throw new ApiError(409,'Admin bootstrap már megtörtént.','BOOTSTRAP_ALREADY_DONE')
  const {data:role,error:roleError}=await db.from('roles').select('id').eq('name','super_admin').single()
  if(roleError||!role)throw new ApiError(500,'Super admin szerepkör hiányzik.','ROLE_MISSING')
  const {data,error}=await db.from('admin_users').insert({user_id:user.id,role_id:role.id,active:true}).select('*').single()
  if(error)throw new ApiError(400,'Bootstrap sikertelen.','BOOTSTRAP_FAILED',error.message)
  return ok(data)
}catch(e){return fail(e)}}}}})
