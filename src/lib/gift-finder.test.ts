import {describe,expect,it} from 'vitest'
import {products} from '../data/products'
import {rankGiftProducts} from './gift-finder'
import {getProductDisplayPrice,getProductStock} from './catalog'

describe('gift finder scoring',()=>{
 it('keeps recommendations inside age budget and stock constraints',()=>{
  const results=rankGiftProducts(products,{age:7,budget:10000,interest:'',occasion:'birthday',playStyles:[],brands:[],inStockOnly:true})
  expect(Array.isArray(results)).toBe(true)
  expect(results.length).toBeGreaterThan(0)
  for(const item of results){
   expect(item.product.ageFrom).toBeLessThanOrEqual(7)
   expect(getProductDisplayPrice(item.product)).toBeLessThanOrEqual(10000)
   expect(getProductStock(item.product)).toBeGreaterThan(0)
   expect(item.score).toBeGreaterThanOrEqual(0)
  }
 })
})
