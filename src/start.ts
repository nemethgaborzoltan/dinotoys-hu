import { createCsrfMiddleware, createMiddleware, createStart } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'

const securityHeaders = createMiddleware().server(async ({ next }) => {
  const result = await next()
  setResponseHeader('X-Content-Type-Options', 'nosniff')
  setResponseHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  setResponseHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  setResponseHeader('X-Frame-Options', 'DENY')
  return result
})

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
})

export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeaders, csrfMiddleware],
}))
