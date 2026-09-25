import { ApiError } from './http'
import { getSupabaseAdmin } from './supabase'

export type AdminPrincipal = {
  userId: string
  email: string
  roleId: string
  role: string
  permissions: string[]
}

function bearerToken(request: Request) {
  const header = request.headers.get('authorization') || ''
  return header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : null
}

export async function authenticate(request: Request) {
  const token = bearerToken(request)
  if (!token) throw new ApiError(401, 'Bejelentkezés szükséges.', 'UNAUTHENTICATED')
  const db = getSupabaseAdmin()
  const { data, error } = await db.auth.getUser(token)
  if (error || !data.user?.email) throw new ApiError(401, 'Érvénytelen vagy lejárt munkamenet.', 'INVALID_SESSION')
  return data.user
}

export async function requireAdmin(request: Request, permission?: string): Promise<AdminPrincipal> {
  const user = await authenticate(request)
  const db = getSupabaseAdmin()
  const { data: member, error } = await db
    .from('admin_users')
    .select('user_id, role_id, active, roles!inner(name)')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle()

  if (error) throw new ApiError(500, 'Admin jogosultság ellenőrzése sikertelen.', 'AUTHZ_LOOKUP_FAILED', error.message)
  if (!member) throw new ApiError(403, 'Nincs admin jogosultságod.', 'FORBIDDEN')

  const { data: permissionRows, error: permissionError } = await db
    .from('role_permissions')
    .select('permissions!inner(key)')
    .eq('role_id', member.role_id)

  if (permissionError) throw new ApiError(500, 'Jogosultságok betöltése sikertelen.', 'PERMISSION_LOOKUP_FAILED')
  const permissions = (permissionRows ?? []).map((row: any) => row.permissions?.key).filter(Boolean)
  if (permission && !permissions.includes('*') && !permissions.includes(permission)) {
    throw new ApiError(403, 'Ehhez a művelethez nincs jogosultságod.', 'MISSING_PERMISSION', { permission })
  }

  return {
    userId: user.id,
    email: user.email!,
    roleId: member.role_id,
    role: (member as any).roles?.name ?? 'admin',
    permissions,
  }
}
