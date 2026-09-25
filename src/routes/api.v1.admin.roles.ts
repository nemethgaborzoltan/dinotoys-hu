import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { ApiError,fail,ok } from '../server/http'
import { getSupabaseAdmin } from '../server/supabase'

export const Route=createFileRoute('/api/v1/admin/roles')({server:{handlers:{GET:async({request})=>{try{
  await requireAdmin(request,'users.manage')
  const db=getSupabaseAdmin()
  const [{data:roles,error:roleError},{data:permissions,error:permissionError},{data:links,error:linkError}]=await Promise.all([
    db.from('roles').select('id,name,label,description,system').order('label'),
    db.from('permissions').select('id,key,label').order('key'),
    db.from('role_permissions').select('role_id,permission_id'),
  ])
  if(roleError||permissionError||linkError)throw new ApiError(500,'Szerepkör-mátrix betöltése sikertelen.','ROLE_MATRIX_READ_FAILED',{roleError:roleError?.message,permissionError:permissionError?.message,linkError:linkError?.message})
  const rolePermissions=new Map<string,string[]>()
  for(const link of links??[]){const list=rolePermissions.get(link.role_id)??[];list.push(link.permission_id);rolePermissions.set(link.role_id,list)}
  return ok({roles:(roles??[]).map(role=>({...role,permissionIds:rolePermissions.get(role.id)??[]})),permissions:permissions??[]})
}catch(e){return fail(e)}}}}})
