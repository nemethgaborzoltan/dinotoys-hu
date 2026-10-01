import type {Product} from '../data/products'
import {readLocalVersioned,removeLocal,subscribeLocal,writeLocalVersioned} from './local-store'
import {getProductDisplayPrice} from './catalog'

export type DemoProfitSettings={
 vatRate:number
 eurHuf:number
 paymentFeePercent:number
 packagingHuf:number
 marketingHuf:number
 shippingSubsidyHuf:number
 defaultInboundHuf:number
}
export type DemoProductCost={
 productId:string
 costNetEur:number|null
 costNetHuf:number|null
 inboundHuf:number|null
 note?:string
 updatedAt:string
}
export type DemoProfitConfig={settings:DemoProfitSettings;costs:Record<string,DemoProductCost>}
export type DemoProductProfit={
 product:Product
 configured:boolean
 grossPriceHuf:number
 netRevenueHuf:number
 landedCostHuf:number
 paymentFeeHuf:number
 operatingCostHuf:number
 contributionHuf:number
 contributionMargin:number
 markup:number
}

const key='dinotoys-demo-profit-v1',version=1
export const defaultDemoProfitSettings:DemoProfitSettings={vatRate:.27,eurHuf:395,paymentFeePercent:1.5,packagingHuf:180,marketingHuf:0,shippingSubsidyHuf:0,defaultInboundHuf:250}
export const defaultDemoProfitConfig:DemoProfitConfig={settings:defaultDemoProfitSettings,costs:{}}

export function readDemoProfitConfig(){return readLocalVersioned<DemoProfitConfig>(key,version,defaultDemoProfitConfig)}
export function writeDemoProfitConfig(config:DemoProfitConfig){return writeLocalVersioned(key,version,config)}
export function resetDemoProfitConfig(){removeLocal(key)}
export function subscribeDemoProfit(callback:()=>void){return subscribeLocal(key,callback)}

export function setDemoProductCost(productId:string,patch:Partial<Omit<DemoProductCost,'productId'|'updatedAt'>>){
 const config=readDemoProfitConfig(),current=config.costs[productId]
 const next:DemoProductCost={productId,costNetEur:patch.costNetEur??current?.costNetEur??null,costNetHuf:patch.costNetHuf??current?.costNetHuf??null,inboundHuf:patch.inboundHuf??current?.inboundHuf??null,note:patch.note??current?.note,updatedAt:new Date().toISOString()}
 config.costs={...config.costs,[productId]:next};writeDemoProfitConfig(config);return next
}
export function calculateDemoProductProfit(product:Product,config=readDemoProfitConfig()):DemoProductProfit{
 const settings=config.settings,cost=config.costs[product.id],grossPriceHuf=getProductDisplayPrice(product)
 const netRevenueHuf=settings.vatRate>=0?grossPriceHuf/(1+settings.vatRate):grossPriceHuf
 const purchaseCostHuf=cost?.costNetHuf!=null&&cost.costNetHuf>0?cost.costNetHuf:cost?.costNetEur!=null&&cost.costNetEur>0?cost.costNetEur*settings.eurHuf:0
 const configured=purchaseCostHuf>0
 const inboundHuf=cost?.inboundHuf!=null?cost.inboundHuf:settings.defaultInboundHuf
 const landedCostHuf=purchaseCostHuf+inboundHuf
 const paymentFeeHuf=grossPriceHuf*(settings.paymentFeePercent/100)
 const operatingCostHuf=settings.packagingHuf+settings.marketingHuf+settings.shippingSubsidyHuf
 const contributionHuf=netRevenueHuf-landedCostHuf-paymentFeeHuf-operatingCostHuf
 const contributionMargin=netRevenueHuf>0?contributionHuf/netRevenueHuf:0
 const markup=landedCostHuf>0?(netRevenueHuf-landedCostHuf)/landedCostHuf:0
 return{product,configured,grossPriceHuf,netRevenueHuf,landedCostHuf,paymentFeeHuf,operatingCostHuf,contributionHuf,contributionMargin,markup}
}
