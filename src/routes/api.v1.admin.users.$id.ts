import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { ApiError,fail,ok,readJson } from '../server/http'
import { getSupabaseAdmin } from '../server/supabase'
import { writeAudit } from '../server/audit'
export const Route=createFileRoute('/api/v1/admin/users/$id')({server:{handlers:{
 PATCH:async({request,params})=>{try{
  const actor=await requireAdmin(request,'users.manage')
  if(actor.userId===params.id)throw new ApiError(409,'A saját admin hozzáférésedet ezen a felületen nem módosíthatod.','SELF_ROLE_CHANGE_BLOCKED')
  const body=await readJson<{roleId?:string;active?:boolean;displayName?:string}>(request),db=getSupabaseAdmin()
  const {data:before,error:readError}=await db.from('admin_users').select('*').eq('user_id',params.id).maybeSingle()
  if(readError||!before)throw new ApiError(404,'Admin felhasználó nem található.','ADMIN_USER_NOT_FOUND')
  const patch:Record<string,unknown>={}
  if(body.roleId!==undefined)patch.role_id=body.roleId
  if(body.active!==undefined)patch.active=body.active
  if(body.displayName!==undefined)patch.display_name=body.displayName
  const {data,error}=await db.from('admin_users').update(patch).eq('user_id',params.id).select('*').single()
  if(error)throw new ApiError(400,'Admin módosítása sikertelen.','ADMIN_USER_UPDATE_FAILED',error.message)
  await writeAudit({actorUserId:actor.userId,action:'admin.update',entityType:'admin_users',entityId:params.id,before,after:data})
  return ok(data)
 }catch(e){return fail(e)}},
}}})
