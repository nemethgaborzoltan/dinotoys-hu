import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { deleteResource,getResource,updateResource } from '../server/resources'
import { fail,ok,readJson } from '../server/http'
export const Route=createFileRoute('/api/v1/admin/resources/$resource/$id')({server:{handlers:{
  PATCH:async({request,params})=>{try{const r=getResource(params.resource),actor=await requireAdmin(request,r.permission);return ok(await updateResource(params.resource,params.id,await readJson(request),actor))}catch(e){return fail(e)}},
  DELETE:async({request,params})=>{try{const r=getResource(params.resource),actor=await requireAdmin(request,r.permission);await deleteResource(params.resource,params.id,actor);return ok({deleted:true})}catch(e){return fail(e)}},
}}})
