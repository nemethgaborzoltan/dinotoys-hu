import {describe,expect,it} from 'vitest'
import {buildDemoEmailPreview,demoEmailDefaults} from './demo-emails'
import type {DemoOrder} from './demo-orders'

const order:DemoOrder={
 id:'order-1',orderNumber:'DT-2026-000123',createdAt:'2026-10-01T10:00:00.000Z',updatedAt:'2026-10-01T10:00:00.000Z',status:'shipped',
 customer:{name:'Teszt Elek',email:'teszt@example.com',phone:'+36301234567'},
 shipping:{provider:'foxpost',methodId:'foxpost-locker',label:'FOXPOST / Packeta átvételi pont',feeHuf:1090,pickupPoint:{place_id:'123',operator_id:'hu123',name:'Teszt Pont',address:'5300 Karcag, Példa utca 1.',zip:'5300',city:'Karcag'}},
 payment:{method:'card',label:'Online bankkártya',status:'paid',feeHuf:0},
 billing:{provider:'Számlázz.hu',companyInvoice:false,invoiceStatus:'issued',invoiceNumber:'DEMO-SZ-2026-000123'},
 coupon:null,
 items:[{productId:'p1',sku:'SKU1',name:'Teszt játék',brand:'DinoToys',image:'/favicon.svg',quantity:2,unitPriceHuf:4990,lineTotalHuf:9980}],
 totals:{itemsHuf:9980,discountHuf:0,shippingHuf:1090,paymentFeeHuf:0,totalHuf:11070},
 shipment:{status:'handed_over',barcode:'DEMO-FOX-123',size:'M',codHuf:0,createdAt:'2026-10-01T11:00:00.000Z'},
 stockReleased:false,
 events:[],
}

describe('offline transactional email templates',()=>{
 it('renders order number and customer into the confirmation',()=>{
  const preview=buildDemoEmailPreview(order,'order_confirmation',demoEmailDefaults.order_confirmation)
  expect(preview.subject).toContain('DT-2026-000123')
  expect(preview.html).toContain('Teszt Elek')
  expect(preview.html).toContain('Teszt játék')
  expect(preview.text).toContain('11')
 })
 it('includes shipment tracking identifier in shipping email',()=>{
  const preview=buildDemoEmailPreview(order,'shipment_handed_over',demoEmailDefaults.shipment_handed_over)
  expect(preview.html).toContain('DEMO-FOX-123')
  expect(preview.text).toContain('DEMO-FOX-123')
 })
 it('includes invoice number in invoice email',()=>{
  const preview=buildDemoEmailPreview(order,'invoice_issued',demoEmailDefaults.invoice_issued)
  expect(preview.html).toContain('DEMO-SZ-2026-000123')
 })
})
