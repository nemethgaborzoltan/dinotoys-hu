import { createFileRoute } from '@tanstack/react-router'
import { requireAdmin } from '../server/auth'
import { importBarbieJfp42 } from '../server/curated-product-import'
import { fail, ok } from '../server/http'

export const Route = createFileRoute('/api/v1/admin/products/import-barbie')({ server: { handlers: {
  POST: async ({ request }) => {
    try {
      const actor = await requireAdmin(request, 'products.publish')
      return ok(await importBarbieJfp42(actor))
    } catch (error) { return fail(error) }
  },
} } })
