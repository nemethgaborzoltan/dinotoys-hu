import { createFileRoute } from '@tanstack/react-router'
import { createCheckout } from '../server/checkout-service'
import { fail,ok,readJson } from '../server/http'
export const Route=createFileRoute('/api/v1/checkout')({server:{handlers:{POST:async({request})=>{try{return ok(await createCheckout(await readJson(request)))}catch(e){return fail(e)}}}}})
