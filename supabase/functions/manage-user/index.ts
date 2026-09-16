// JoTrip Operations - trusted user management endpoint
// Deploy as a Supabase Edge Function. Never expose SUPABASE_SECRET_KEY in the browser.

import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('DASH_ORIGIN') ?? 'https://dash.openphuquoc.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
})

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405)

  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const publishable = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const secret = Deno.env.get('SUPABASE_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!url || !publishable || !secret) return json({ error: 'SERVER_AUTH_NOT_CONFIGURED' }, 500)

  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'UNAUTHENTICATED' }, 401)

  const caller = createClient(url, publishable, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const admin = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  const { data: authData, error: authError } = await caller.auth.getUser()
  if (authError || !authData.user) return json({ error: 'UNAUTHENTICATED' }, 401)

  const { data: profile, error: profileError } = await caller
    .from('profiles')
    .select('user_id,role,status')
    .eq('user_id', authData.user.id)
    .single()

  if (profileError || profile?.status !== 'active' || profile?.role !== 'admin') {
    return json({ error: 'ADMIN_REQUIRED' }, 403)
  }

  let input: any
  try { input = await req.json() } catch { return json({ error: 'INVALID_JSON' }, 400) }

  const action = String(input?.action ?? '')
  const allowedRoles = new Set(['admin','ops','sales','guide','data','viewer','partner'])
  const allowedStatuses = new Set(['active','disabled'])

  if (action === 'invite') {
    const email = String(input?.email ?? '').trim().toLowerCase()
    const fullName = String(input?.full_name ?? '').trim()
    const role = String(input?.role ?? 'viewer')
    const scope = typeof input?.scope === 'object' && input.scope ? input.scope : { label: String(input?.scope ?? 'Phú Quốc') }
    if (!email || !fullName || !allowedRoles.has(role)) return json({ error: 'INVALID_INPUT' }, 400)

    const redirectTo = `${Deno.env.get('DASH_ORIGIN') ?? 'https://dash.openphuquoc.com'}/`
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { full_name: fullName },
    })
    if (inviteError || !invited.user) return json({ error: 'INVITE_FAILED', detail: inviteError?.message }, 400)

    const { error: profileInsertError } = await admin.from('profiles').insert({
      user_id: invited.user.id,
      full_name: fullName,
      role,
      status: 'active',
      scope,
      created_by: authData.user.id,
    })
    if (profileInsertError) return json({ error: 'PROFILE_CREATE_FAILED', detail: profileInsertError.message }, 500)

    return json({ ok: true, user_id: invited.user.id })
  }

  if (action === 'update') {
    const userId = String(input?.user_id ?? '')
    const role = input?.role == null ? null : String(input.role)
    const status = input?.status == null ? null : String(input.status)
    const fullName = input?.full_name == null ? null : String(input.full_name).trim()
    const scope = input?.scope == null ? null : input.scope
    if (!userId || (role && !allowedRoles.has(role)) || (status && !allowedStatuses.has(status))) return json({ error: 'INVALID_INPUT' }, 400)
    if (userId === authData.user.id && status === 'disabled') return json({ error: 'CANNOT_DISABLE_SELF' }, 400)

    const patch: Record<string, unknown> = {}
    if (role) patch.role = role
    if (status) patch.status = status
    if (fullName) patch.full_name = fullName
    if (scope != null) patch.scope = typeof scope === 'object' ? scope : { label: String(scope) }
    if (!Object.keys(patch).length) return json({ error: 'NO_CHANGES' }, 400)

    const { error } = await admin.from('profiles').update(patch).eq('user_id', userId)
    if (error) return json({ error: 'PROFILE_UPDATE_FAILED', detail: error.message }, 500)
    return json({ ok: true })
  }

  if (action === 'resend_invite') {
    const email = String(input?.email ?? '').trim().toLowerCase()
    if (!email) return json({ error: 'INVALID_INPUT' }, 400)
    const { error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${Deno.env.get('DASH_ORIGIN') ?? 'https://dash.openphuquoc.com'}/`,
    })
    if (error) return json({ error: 'INVITE_FAILED', detail: error.message }, 400)
    return json({ ok: true })
  }

  return json({ error: 'UNKNOWN_ACTION' }, 400)
})
