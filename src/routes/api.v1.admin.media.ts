import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { listMedia,uploadMedia } from '../server/media-service'
import { fail,ok } from '../server/http'
export const Route=createFileRoute('/api/v1/admin/media')({server:{handlers:{
  GET:async({request})=>{try{await requireAdmin(request,'media.write');return ok(await listMedia())}catch(e){return fail(e)}},
  POST:async({request})=>{try{const actor=await requireAdmin(request,'media.write');return ok(await uploadMedia(request,actor))}catch(e){return fail(e)}},
}}})
