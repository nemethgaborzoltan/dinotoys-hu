import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { deleteMedia } from '../server/media-service'
import { fail,ok } from '../server/http'
export const Route=createFileRoute('/api/v1/admin/media/$id')({server:{handlers:{DELETE:async({request,params})=>{try{const actor=await requireAdmin(request,'media.write');await deleteMedia(params.id,actor);return ok({deleted:true})}catch(e){return fail(e)}}}}})
