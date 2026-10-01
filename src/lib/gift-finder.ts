import type {Product} from '../data/products'
import {getProductDisplayPrice,getProductStock} from './catalog'

export type GiftOccasion='birthday'|'christmas'|'reward'|'visit'|'other'
export type GiftPlayStyle='creative'|'action'|'collect'|'plush'|'family'|'surprise'|'vehicle'
export type GiftFinderInput={
 age:number
 budget:number
 interest:string
 occasion:GiftOccasion
 playStyles:GiftPlayStyle[]
 brands:string[]
 inStockOnly:boolean
}

export type GiftRecommendation={
 product:Product
 score:number
 reasons:string[]
}

const styleTerms:Record<GiftPlayStyle,string[]>={
 creative:['kreatív','gyurma','alkot','rajz','fest','play-doh','kézműves'],
 action:['akció','figura','star wars','marvel','hős','harc','kaland'],
 collect:['gyűjt','figura','szett','barbie','schleich','licencelt'],
 plush:['plüss','stitch','puha','kulcstartó','bagclip'],
 family:['puzzle','játék','kártya','uno','memória','családi'],
 surprise:['meglepetés','blind','tojás','mystery','trend'],
 vehicle:['jármű','autó','hot wheels','racer','verseny'],
}
export const giftOccasionLabels:Record<GiftOccasion,string>={
 birthday:'Születésnap',
 christmas:'Karácsony',
 reward:'Jutalom',
 visit:'Vendégség / apró ajándék',
 other:'Más alkalom',
}
export const giftPlayStyleLabels:Record<GiftPlayStyle,string>={
 creative:'Kreatív alkotás',
 action:'Akció és kaland',
 collect:'Gyűjtés / figurák',
 plush:'Plüss és cuki',
 family:'Közös játék',
 surprise:'Meglepetés',
 vehicle:'Autók és járművek',
}

function text(product:Product){
 return [product.name,product.brand,product.category,...product.tags,...product.highlights,product.description].join(' ').toLowerCase()
}
function normalize(value:string){return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim()}
function includesLoose(haystack:string,needle:string){
 const n=normalize(needle);if(!n)return false
 const h=normalize(haystack)
 return h.includes(n)||n.split(/\s+/).filter(Boolean).some(word=>word.length>=3&&h.includes(word))
}

export function rankGiftProducts(products:Product[],input:GiftFinderInput):GiftRecommendation[]{
 return products.map(product=>{
  const price=getProductDisplayPrice(product),stock=getProductStock(product),hay=text(product)
  if(input.inStockOnly&&stock<=0)return null
  if(price<=0||price>input.budget)return null
  if(product.ageFrom>input.age)return null
  let score=0
  const reasons:string[]=[]
  const ageGap=Math.max(0,input.age-product.ageFrom)
  if(ageGap<=2){score+=24;reasons.push('Korban nagyon jól illik')}
  else if(ageGap<=4){score+=16;reasons.push('Korosztályhoz illő')}
  else score+=8
  const budgetUse=price/input.budget
  if(budgetUse>=.62&&budgetUse<=1){score+=18;reasons.push('Jól kihasználja a keretet')}
  else if(budgetUse>=.35){score+=12;reasons.push('Kényelmesen belefér a keretbe')}
  else score+=5
  if(input.interest&&includesLoose(hay,input.interest)){score+=34;reasons.push('Passzol az érdeklődéshez')}
  const matchedStyles=input.playStyles.filter(style=>styleTerms[style].some(term=>includesLoose(hay,term)))
  if(matchedStyles.length){score+=Math.min(28,matchedStyles.length*14);reasons.push(giftPlayStyleLabels[matchedStyles[0]])}
  if(input.brands.length&&input.brands.some(brand=>normalize(brand)===normalize(product.brand))){score+=22;reasons.push('Kedvelt márka')}
  if(stock>10){score+=8;reasons.push('Jó készlet')}
  else if(stock>0)score+=4
  if(product.trending){score+=9;reasons.push('Trendtermék')}
  if(product.newArrival)score+=5
  if(input.occasion==='visit'&&price<=5000){score+=12;reasons.push('Kisebb ajándéknak praktikus')}
  if(input.occasion==='reward'&&price<=8000){score+=8}
  if(input.occasion==='birthday'&&product.trending)score+=5
  if(input.occasion==='christmas'&&price>=Math.min(5000,input.budget*.5))score+=5
  return{product,score,reasons:Array.from(new Set(reasons)).slice(0,4)}
 }).filter((item):item is GiftRecommendation=>Boolean(item)).sort((a,b)=>b.score-a.score||getProductStock(b.product)-getProductStock(a.product))
}

export function giftMatchLabel(score:number){
 if(score>=90)return'Nagyon erős találat'
 if(score>=70)return'Erős találat'
 if(score>=50)return'Jó találat'
 return'Alternatíva'
}
