import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { createResource,getResource,listResource } from '../server/resources'
import { fail,ok,readJson } from '../server/http'
export const Route=createFileRoute('/api/v1/admin/resources/$resource')({server:{handlers:{
  GET:async({request,params})=>{try{const r=getResource(params.resource);await requireAdmin(request,r.permission);return ok(await listResource(params.resource))}catch(e){return fail(e)}},
  POST:async({request,params})=>{try{const r=getResource(params.resource),actor=await requireAdmin(request,r.permission);return ok(await createResource(params.resource,await readJson(request),actor))}catch(e){return fail(e)}},
}}})
