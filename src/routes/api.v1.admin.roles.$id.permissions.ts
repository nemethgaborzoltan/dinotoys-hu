import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { ApiError,fail,ok,readJson } from '../server/http'
import { getSupabaseAdmin } from '../server/supabase'
import { writeAudit } from '../server/audit'

export const Route=createFileRoute('/api/v1/admin/roles/$id/permissions')({server:{handlers:{PUT:async({request,params})=>{try{
  const actor=await requireAdmin(request,'users.manage')
  const body=await readJson<{permissionIds:string[]}>(request)
  if(!Array.isArray(body.permissionIds))throw new ApiError(400,'permissionIds lista szükséges.','PERMISSION_IDS_REQUIRED')
  const db=getSupabaseAdmin()
  const {data:role,error:roleError}=await db.from('roles').select('id,name,label').eq('id',params.id).maybeSingle()
  if(roleError||!role)throw new ApiError(404,'Szerepkör nem található.','ROLE_NOT_FOUND')
  if(role.name==='super_admin')throw new ApiError(409,'A Super Admin rendszerjogosultság nem módosítható.','SYSTEM_ROLE_LOCKED')
  const unique=[...new Set(body.permissionIds)]
  if(unique.length){
    const {count,error:countError}=await db.from('permissions').select('*',{count:'exact',head:true}).in('id',unique)
    if(countError||count!==unique.length)throw new ApiError(400,'Ismeretlen jogosultság azonosító.','INVALID_PERMISSION')
  }
  const {data:before}=await db.from('role_permissions').select('permission_id').eq('role_id',params.id)
  const {error:deleteError}=await db.from('role_permissions').delete().eq('role_id',params.id)
  if(deleteError)throw new ApiError(400,'Jogosultságok törlése sikertelen.','ROLE_PERMISSION_UPDATE_FAILED',deleteError.message)
  if(unique.length){
    const {error:insertError}=await db.from('role_permissions').insert(unique.map(permission_id=>({role_id:params.id,permission_id})))
    if(insertError)throw new ApiError(400,'Jogosultságok mentése sikertelen.','ROLE_PERMISSION_UPDATE_FAILED',insertError.message)
  }
  await writeAudit({actorUserId:actor.userId,action:'role.permissions.update',entityType:'roles',entityId:params.id,before,after:{permissionIds:unique}})
  return ok({roleId:params.id,permissionIds:unique})
}catch(e){return fail(e)}}}}})
