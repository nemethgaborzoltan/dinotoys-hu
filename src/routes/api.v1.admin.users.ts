import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { ApiError,fail,ok,readJson } from '../server/http'
import { getSupabaseAdmin } from '../server/supabase'
import { writeAudit } from '../server/audit'

async function loadAdminUsers(){
  const db=getSupabaseAdmin()
  const [{data:members,error:memberError},{data:roles,error:roleError},{data:authData,error:authError}]=await Promise.all([
    db.from('admin_users').select('user_id,role_id,active,display_name,created_at,roles(id,name,label)').order('created_at'),
    db.from('roles').select('id,name,label,description').order('label'),
    db.auth.admin.listUsers({page:1,perPage:1000}),
  ])
  if(memberError||roleError||authError)throw new ApiError(500,'Admin felhasználók betöltése sikertelen.','ADMIN_USERS_READ_FAILED',{memberError:memberError?.message,roleError:roleError?.message,authError:authError?.message})
  const authMap=new Map(authData.users.map(u=>[u.id,u]))
  return {users:(members??[]).map((m:any)=>({...m,email:authMap.get(m.user_id)?.email??null,last_sign_in_at:authMap.get(m.user_id)?.last_sign_in_at??null})),roles:roles??[]}
}
export const Route=createFileRoute('/api/v1/admin/users')({server:{handlers:{
 GET:async({request})=>{try{await requireAdmin(request,'users.manage');return ok(await loadAdminUsers())}catch(e){return fail(e)}},
 POST:async({request})=>{try{
  const actor=await requireAdmin(request,'users.manage'),body=await readJson<{email:string;roleId:string;displayName?:string}>(request)
  if(!body.email||!body.roleId)throw new ApiError(400,'E-mail és szerepkör szükséges.','INVALID_ADMIN_INVITE')
  const db=getSupabaseAdmin()
  const {data:role,error:roleError}=await db.from('roles').select('id').eq('id',body.roleId).maybeSingle()
  if(roleError||!role)throw new ApiError(400,'Ismeretlen szerepkör.','ROLE_NOT_FOUND')
  const {data:invite,error:inviteError}=await db.auth.admin.inviteUserByEmail(body.email,{data:{full_name:body.displayName||''}})
  if(inviteError||!invite.user)throw new ApiError(400,'Meghívás sikertelen.','ADMIN_INVITE_FAILED',inviteError?.message)
  const {data,error}=await db.from('admin_users').insert({user_id:invite.user.id,role_id:body.roleId,display_name:body.displayName||null,active:true}).select('*').single()
  if(error)throw new ApiError(400,'Admin szerepkör mentése sikertelen.','ADMIN_ROLE_SAVE_FAILED',error.message)
  await writeAudit({actorUserId:actor.userId,action:'admin.invite',entityType:'admin_users',entityId:invite.user.id,after:{...data,email:body.email}})
  return ok(data)
 }catch(e){return fail(e)}},
}}})
