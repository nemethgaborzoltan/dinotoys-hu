import {ApiError} from '../http'
import type {FoxpostPickupPoint} from '../../lib/foxpost'

const feedUrl='https://cdn.foxpost.hu/foxplus.json'
const ttlMs=55*60*1000
let cache:{expiresAt:number;points:FoxpostPickupPoint[]}|null=null

function clean(value:unknown){return String(value??'').trim()}
function normalizeText(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}

function toPoint(raw:unknown):FoxpostPickupPoint|null{
 if(!raw||typeof raw!=='object')return null
 const row=raw as Record<string,unknown>
 const placeId=row.place_id
 const name=clean(row.name),address=clean(row.address),zip=clean(row.zip),city=clean(row.city)
 if((typeof placeId!=='string'&&typeof placeId!=='number')||!name||!address)return null
 return{
  place_id:placeId,operator_id:clean(row.operator_id)||undefined,name,address,zip,city,street:clean(row.street)||undefined,findme:clean(row.findme)||undefined,
  geolat:typeof row.geolat==='number'?row.geolat:Number.isFinite(Number(row.geolat))?Number(row.geolat):undefined,
  geolng:typeof row.geolng==='number'?row.geolng:Number.isFinite(Number(row.geolng))?Number(row.geolng):undefined,
  variant:clean(row.variant)||undefined,service:clean(row.service)||undefined,serviceString:clean(row.serviceString)||undefined,paymentOptionsString:clean(row.paymentOptionsString)||undefined,isOutdoor:typeof row.isOutdoor==='boolean'?row.isOutdoor:undefined,
 }
}

async function loadPoints(){
 if(cache&&Date.now()<cache.expiresAt)return cache.points
 const response=await fetch(feedUrl,{headers:{accept:'application/json'}})
 if(!response.ok)throw new ApiError(502,'A FOXPOST átvételi pontok most nem tölthetők be.','FOXPOST_POINTS_UNAVAILABLE')
 const json=await response.json() as unknown
 if(!Array.isArray(json))throw new ApiError(502,'A FOXPOST pontlista formátuma megváltozott.','FOXPOST_POINTS_INVALID')
 const points=json.map(toPoint).filter((point):point is FoxpostPickupPoint=>Boolean(point))
 cache={expiresAt:Date.now()+ttlMs,points}
 return points
}

function scorePoint(point:FoxpostPickupPoint,query:string){
 const q=normalizeText(query)
 const tokens=q.split(' ').filter(Boolean)
 const zip=normalizeText(point.zip),city=normalizeText(point.city),name=normalizeText(point.name),address=normalizeText(point.address),variant=normalizeText(point.variant||'')
 const haystack=[zip,city,name,address,variant].join(' ')
 if(tokens.some(token=>!haystack.includes(token)))return -1
 let score=0
 if(zip===q)score+=220
 if(city===q)score+=200
 if(city.startsWith(q))score+=150
 if(zip.startsWith(q))score+=140
 if(name.startsWith(q))score+=110
 if(address.startsWith(q))score+=90
 if(city.includes(q))score+=70
 if(name.includes(q))score+=55
 if(address.includes(q))score+=40
 if((point.variant||'').toUpperCase().includes('FOXPOST'))score+=4
 return score
}

export async function searchFoxpostPickupPoints(query:string,limit=12){
 const q=query.trim()
 if(q.length<2)return[]
 const points=await loadPoints()
 return points.map(point=>({point,score:scorePoint(point,q)})).filter(item=>item.score>=0).sort((a,b)=>b.score-a.score||a.point.city.localeCompare(b.point.city,'hu')||a.point.name.localeCompare(b.point.name,'hu')).slice(0,Math.min(Math.max(limit,1),30)).map(item=>item.point)
}
