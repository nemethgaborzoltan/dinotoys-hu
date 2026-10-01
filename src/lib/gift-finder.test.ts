import {describe,expect,it} from 'vitest'
import {products} from '../data/products'
import {rankGiftProducts} from './gift-finder'
import {getProductDisplayPrice,getProductStock} from './catalog'

describe('gift finder scoring',()=>{
 it('keeps recommendations inside age budget and stock constraints',()=>{
  const results=rankGiftProducts(products,{age:7,budget:8000,interest:'dínó',occasion:'birthday',playStyles:['surprise'],brands:[],inStockOnly:true})
  expect(results.length).toBeGreaterThan(0)
  for(const item of results){
   expect(item.product.ageFrom).toBeLessThanOrEqual(7)
   expect(getProductDisplayPrice(item.product)).toBeLessThanOrEqual(8000)
   expect(getProductStock(item.product)).toBeGreaterThan(0)
  }
 })
 it('prioritizes matching interests',()=>{
  const results=rankGiftProducts(products,{age:7,budget:10000,interest:'dínó',occasion:'birthday',playStyles:[],brands:[],inStockOnly:true})
  const matching=results.slice(0,4).find(item=>(item.product.tags.join(' ')+' '+item.product.name+' '+item.product.category).toLowerCase().match(/dín|dino|schleich/))
  expect(matching).toBeTruthy()
  expect(matching?.reasons).toContain('Passzol az érdeklődéshez')
 })
})
