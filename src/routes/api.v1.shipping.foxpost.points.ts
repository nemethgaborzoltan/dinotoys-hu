import {createFileRoute} from '@tanstack/react-router'
import {fail,ok} from '../server/http'
import {searchFoxpostPickupPoints} from '../server/integrations/foxpost-points'

export const Route=createFileRoute('/api/v1/shipping/foxpost/points')({server:{handlers:{GET:async({request})=>{try{
 const url=new URL(request.url)
 const q=url.searchParams.get('q')||''
 const limit=Number(url.searchParams.get('limit')||12)
 const items=await searchFoxpostPickupPoints(q,Number.isFinite(limit)?limit:12)
 return ok({items,count:items.length,query:q})
}catch(error){return fail(error)}}}}})
