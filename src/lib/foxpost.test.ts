import {describe,expect,it} from 'vitest'
import {foxpostDestination,isValidFoxpostPhone,normalizeFoxpostPhone,parseFoxpostMessage} from './foxpost'

describe('FOXPOST helpers',()=>{
 it('normalizes Hungarian mobile numbers',()=>{
  expect(normalizeFoxpostPhone('06 30 123 4567')).toBe('+36301234567')
  expect(normalizeFoxpostPhone('36-70-123-4567')).toBe('+36701234567')
  expect(isValidFoxpostPhone('+36 20 123 4567')).toBe(true)
 })

 it('prefers operator_id as FOXPOST destination',()=>{
  expect(foxpostDestination({place_id:'1250198',operator_id:'hu5516',name:'Pont',address:'Cím',zip:'1000',city:'Budapest'})).toBe('hu5516')
 })

 it('parses the official widget message shape',()=>{
  const point=parseFoxpostMessage(JSON.stringify({place_id:1250198,operator_id:'hu5516',name:'Győrújbarát Gabi Cukrászat',address:'9081 Győrújbarát, István utca 67.',zip:'9081',city:'Győrújbarát',geolat:47.6,geolng:17.65,variant:'FOXPOST'}))
  expect(point?.operator_id).toBe('hu5516')
  expect(point?.city).toBe('Győrújbarát')
 })
})
