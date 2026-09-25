import { getSupabaseAdmin } from './supabase'

export async function writeAudit(input: {
  actorUserId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  before?: unknown
  after?: unknown
  metadata?: Record<string, unknown>
}) {
  const db = getSupabaseAdmin()
  const { error } = await db.from('audit_logs').insert({
    actor_user_id: input.actorUserId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    before_data: input.before ?? null,
    after_data: input.after ?? null,
    metadata: input.metadata ?? {},
  })
  if (error) console.error('audit log write failed', error)
}
