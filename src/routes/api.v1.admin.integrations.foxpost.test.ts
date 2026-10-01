import {createFileRoute} from '@tanstack/react-router'
import {requireAdmin} from '../server/auth'
import {fail,ok} from '../server/http'
import {testFoxpostConnection} from '../server/integrations/foxpost'

export const Route=createFileRoute('/api/v1/admin/integrations/foxpost/test')({server:{handlers:{POST:async({request})=>{try{
 await requireAdmin(request,'integrations.write')
 return ok(await testFoxpostConnection())
}catch(error){return fail(error)}}}}})
