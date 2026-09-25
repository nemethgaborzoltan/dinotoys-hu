import { ApiError } from './http'
import { getSupabaseAdmin } from './supabase'
import { writeAudit } from './audit'
import type { AdminPrincipal } from './auth'

const bucket='product-media'
const allowed=new Set(['image/jpeg','image/png','image/webp','image/avif','image/svg+xml'])
const maxBytes=8*1024*1024

function cleanName(name:string){return name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-120)}

export async function listMedia(){
  const db=getSupabaseAdmin()
  const {data,error}=await db.from('media_assets').select('*').order('created_at',{ascending:false}).limit(250)
  if(error)throw new ApiError(500,'Médiatár betöltése sikertelen.','MEDIA_LIST_FAILED',error.message)
  return data??[]
}

export async function uploadMedia(request:Request,actor:AdminPrincipal){
  const form=await request.formData(),file=form.get('file')
  if(!(file instanceof File))throw new ApiError(400,'Nincs feltöltendő fájl.','FILE_REQUIRED')
  if(file.size>maxBytes)throw new ApiError(413,'A fájl legfeljebb 8 MB lehet.','FILE_TOO_LARGE')
  if(!allowed.has(file.type))throw new ApiError(415,'Nem támogatott képtípus.','UNSUPPORTED_MEDIA_TYPE',{type:file.type})
  const folder=String(form.get('folder')||'products').replace(/[^a-zA-Z0-9/_-]/g,'').slice(0,100)||'products'
  const path=`${folder}/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}-${cleanName(file.name)}`
  const db=getSupabaseAdmin(),bytes=new Uint8Array(await file.arrayBuffer())
  const {error:uploadError}=await db.storage.from(bucket).upload(path,bytes,{contentType:file.type,cacheControl:'31536000',upsert:false})
  if(uploadError)throw new ApiError(400,'Feltöltés sikertelen.','MEDIA_UPLOAD_FAILED',uploadError.message)
  const {data:publicData}=db.storage.from(bucket).getPublicUrl(path)
  const {data,error}=await db.from('media_assets').insert({bucket,path,url:publicData.publicUrl,file_name:file.name,mime_type:file.type,size_bytes:file.size,uploaded_by:actor.userId}).select('*').single()
  if(error)throw new ApiError(400,'Média metaadat mentése sikertelen.','MEDIA_DB_FAILED',error.message)
  await writeAudit({actorUserId:actor.userId,action:'media.upload',entityType:'media_assets',entityId:data.id,after:data})
  return data
}

export async function deleteMedia(id:string,actor:AdminPrincipal){
  const db=getSupabaseAdmin()
  const {data:asset,error:readError}=await db.from('media_assets').select('*').eq('id',id).maybeSingle()
  if(readError||!asset)throw new ApiError(404,'Média nem található.','MEDIA_NOT_FOUND')
  const {error:storageError}=await db.storage.from(asset.bucket).remove([asset.path])
  if(storageError)throw new ApiError(400,'Fájl törlése sikertelen.','MEDIA_DELETE_FAILED',storageError.message)
  const {error}=await db.from('media_assets').delete().eq('id',id)
  if(error)throw new ApiError(400,'Média rekord törlése sikertelen.','MEDIA_RECORD_DELETE_FAILED',error.message)
  await writeAudit({actorUserId:actor.userId,action:'media.delete',entityType:'media_assets',entityId:id,before:asset})
}
