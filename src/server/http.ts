export class ApiError extends Error {
  constructor(public status: number, message: string, public code = 'API_ERROR', public details?: unknown) {
    super(message)
  }
}

export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('cache-control', 'no-store')
  return new Response(JSON.stringify(data), { ...init, headers })
}

export function ok(data: unknown, meta?: Record<string, unknown>) {
  return json({ ok: true, data, ...(meta ? { meta } : {}) })
}

export function fail(error: unknown) {
  if (error instanceof ApiError) {
    return json({ ok: false, error: { code: error.code, message: error.message, details: error.details } }, { status: error.status })
  }
  console.error(error)
  return json({ ok: false, error: { code: 'INTERNAL_ERROR', message: 'Váratlan szerverhiba történt.' } }, { status: 500 })
}

export async function readJson<T>(request: Request): Promise<T> {
  try { return await request.json() as T }
  catch { throw new ApiError(400, 'Hibás JSON kérés.', 'INVALID_JSON') }
}
