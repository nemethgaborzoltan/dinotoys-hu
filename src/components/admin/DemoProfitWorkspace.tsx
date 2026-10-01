import {useEffect,useMemo,useState} from 'react'
import {products} from '../../data/products'
import {money} from '../../lib/format'
import {calculateDemoProductProfit,defaultDemoProfitConfig,readDemoProfitConfig,resetDemoProfitConfig,subscribeDemoProfit,writeDemoProfitConfig,type DemoProfitConfig} from '../../lib/demo-profit'
import {readDemoOrders,subscribeDemoOrders} from '../../lib/demo-orders'

export function DemoProfitWorkspace(){
 const [config,setConfig]=useState<DemoProfitConfig>(()=>readDemoProfitConfig())
 const [orders,setOrders]=useState(()=>readDemoOrders())
 const [query,setQuery]=useState('')
 const [onlyMissing,setOnlyMissing]=useState(false)
 const [saved,setSaved]=useState(false)
 useEffect(()=>subscribeDemoProfit(()=>setConfig(readDemoProfitConfig())),[])
 useEffect(()=>subscribeDemoOrders(()=>setOrders(readDemoOrders())),[])
 const rows=useMemo(()=>products.filter(product=>product.retailPrice>0).map(product=>calculateDemoProductProfit(product,config)),[config])
 const configured=rows.filter(row=>row.configured)
 const averageMargin=configured.length?configured.reduce((sum,row)=>sum+row.contributionMargin,0)/configured.length:0
 const positive=configured.filter(row=>row.contributionHuf>0).length
 const activeOrders=orders.filter(order=>!['cancelled','returned','refunded'].includes(order.status))
 const realized=useMemo(()=>activeOrders.reduce((sum,order)=>{
  let orderContribution=0
  for(const item of order.items){
   const product=products.find(p=>p.id===item.productId);if(!product)continue
   const base=calculateDemoProductProfit(product,config);if(!base.configured)continue
   const net=item.unitPriceHuf/(1+config.settings.vatRate)
   const payment=item.unitPriceHuf*(config.settings.paymentFeePercent/100)
   orderContribution+=(net-base.landedCostHuf-payment-config.settings.packagingHuf)*item.quantity
  }
  return sum+orderContribution-config.settings.marketingHuf-config.settings.shippingSubsidyHuf
 },0),[activeOrders,config])
 const visible=rows.filter(row=>(!onlyMissing||!row.configured)&&(!query.trim()||[row.product.name,row.product.brand,row.product.sourceSku].join(' ').toLowerCase().includes(query.trim().toLowerCase())))
 const updateSetting=(key:keyof DemoProfitConfig['settings'],value:number)=>setConfig(current=>({...current,settings:{...current.settings,[key]:value}}))
 const updateCost=(productId:string,key:'costNetEur'|'costNetHuf'|'inboundHuf',value:string)=>setConfig(current=>({...current,costs:{...current.costs,[productId]:{productId,costNetEur:current.costs[productId]?.costNetEur??null,costNetHuf:current.costs[productId]?.costNetHuf??null,inboundHuf:current.costs[productId]?.inboundHuf??null,updatedAt:new Date().toISOString(),[key]:value===''?null:Number(value)}}}))
 const save=()=>{writeDemoProfitConfig(config);setSaved(true);window.setTimeout(()=>setSaved(false),1600)}
 return <>
  <div className="admin2-heading row"><div><span className="eyebrow">Profit dashboard</span><h1>Profit & fedezet</h1><p>Valós beszerzési költség nélkül nem találunk ki profitot. Add meg a nettó beszerzési árat, és a rendszer számolja a becsült fedezetet.</p></div><div className="admin2-heading-actions">{saved&&<span className="site-builder-saved">✓ Mentve</span>}<button className="btn btn-ghost" onClick={()=>{if(confirm('Visszaállítod a profit beállításokat?')){resetDemoProfitConfig();setConfig(defaultDemoProfitConfig)}}}>Alaphelyzet</button><button className="btn btn-primary" onClick={save}>Mentés</button></div></div>
  <div className="profit-metrics"><Metric label="Költségadat lefedettség" value={configured.length+'/'+rows.length} hint="árazható termék"/><Metric label="Átlagos fedezeti szint" value={configured.length?(averageMargin*100).toFixed(1)+'%':'—'} hint="csak kitöltött költségek"/><Metric label="Pozitív fedezet" value={positive+'/'+configured.length} hint="konfigurált termék"/><Metric label="Demo rendelések becsült fedezete" value={configured.length?money(Math.round(realized)):'—'} hint={activeOrders.length+' aktív rendelés'}/></div>
  <section className="admin2-card profit-settings"><div className="admin2-card-head"><div><span className="eyebrow">Számítás</span><h2>Költségmodell</h2></div><span className="admin2-pill">nettó fedezet</span></div><div className="profit-settings-grid">
   <Number label="ÁFA %" value={config.settings.vatRate*100} onChange={value=>updateSetting('vatRate',value/100)}/>
   <Number label="EUR/HUF árfolyam" value={config.settings.eurHuf} onChange={value=>updateSetting('eurHuf',value)}/>
   <Number label="Fizetési díj %" value={config.settings.paymentFeePercent} onChange={value=>updateSetting('paymentFeePercent',value)}/>
   <Number label="Csomagolás / db" value={config.settings.packagingHuf} onChange={value=>updateSetting('packagingHuf',value)}/>
   <Number label="Marketing / rendelés" value={config.settings.marketingHuf} onChange={value=>updateSetting('marketingHuf',value)}/>
   <Number label="Szállítási támogatás / rendelés" value={config.settings.shippingSubsidyHuf} onChange={value=>updateSetting('shippingSubsidyHuf',value)}/>
   <Number label="Alap beérkeztetés / db" value={config.settings.defaultInboundHuf} onChange={value=>updateSetting('defaultInboundHuf',value)}/>
  </div><p className="admin2-help">A becslés a bruttó eladási árból levonja az ÁFÁ-t, a beszerzést, beérkeztetést, fizetési díjat és a megadott működési költségeket. Ez vezetői becslés, nem könyvelési eredménykimutatás.</p></section>
  <div className="admin2-toolbar profit-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Termék, márka vagy SKU…"/><label><input type="checkbox" checked={onlyMissing} onChange={e=>setOnlyMissing(e.target.checked)}/> Csak hiányzó költség</label></div>
  <div className="admin2-table-wrap"><table className="admin2-table profit-table"><thead><tr><th>Termék</th><th>Eladási ár</th><th>Nettó beszerzés EUR</th><th>vagy HUF</th><th>Beérkeztetés</th><th>Fedezet</th><th>Fedezeti %</th></tr></thead><tbody>{visible.map(row=>{const cost=config.costs[row.product.id];return <tr key={row.product.id}><td><div className="admin2-product-cell"><img src={row.product.art} alt=""/><div><b>{row.product.name}</b><small>{row.product.brand} · {row.product.sourceSku}</small></div></div></td><td><b>{money(row.grossPriceHuf)}</b><small>nettó bevétel: {money(Math.round(row.netRevenueHuf))}</small></td><td><input className="profit-cost-input" type="number" step=".01" min="0" value={cost?.costNetEur??''} onChange={e=>updateCost(row.product.id,'costNetEur',e.target.value)} placeholder="EUR"/></td><td><input className="profit-cost-input" type="number" min="0" value={cost?.costNetHuf??''} onChange={e=>updateCost(row.product.id,'costNetHuf',e.target.value)} placeholder="HUF"/></td><td><input className="profit-cost-input" type="number" min="0" value={cost?.inboundHuf??''} onChange={e=>updateCost(row.product.id,'inboundHuf',e.target.value)} placeholder={String(config.settings.defaultInboundHuf)}/></td><td>{row.configured?<b className={row.contributionHuf>=0?'profit-positive':'profit-negative'}>{money(Math.round(row.contributionHuf))}</b>:<span className="admin2-pill warn">költség hiányzik</span>}</td><td>{row.configured?<strong className={row.contributionMargin>=.2?'profit-positive':row.contributionMargin>=0?'':'profit-negative'}>{(row.contributionMargin*100).toFixed(1)}%</strong>:'—'}</td></tr>})}</tbody></table></div>
 </>
}
function Metric({label,value,hint}:{label:string;value:string;hint:string}){return <div><span>{label}</span><b>{value}</b><small>{hint}</small></div>}
function Number({label,value,onChange}:{label:string;value:number;onChange:(value:number)=>void}){return <label><span>{label}</span><input type="number" step="any" value={value} onChange={e=>onChange(Number(e.target.value)||0)}/></label>}
