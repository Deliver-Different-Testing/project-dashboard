import { createServer } from 'node:http'
import { parse as parseUrl } from 'node:url'
import postgres from 'postgres'

const PORT = Number(process.env.PORT || 3001)
const DATABASE_URL = process.env.DATABASE_URL
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}

const sql = postgres(DATABASE_URL, {
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
})

async function ensureSchema() {
  await sql`
    create table if not exists dashboard_forward_work_state (
      dev_key text not null,
      item_key text not null,
      status text not null,
      notes text not null default '',
      updated_at timestamptz not null default now(),
      updated_by text,
      primary key (dev_key, item_key)
    )
  `

  await sql`
    create table if not exists dashboard_forward_work_order (
      dev_key text not null,
      item_key text not null,
      position integer not null,
      updated_at timestamptz not null default now(),
      updated_by text,
      primary key (dev_key, item_key)
    )
  `

  await sql`
    create table if not exists dashboard_runsheet_entries (
      id bigserial primary key,
      project_slug text not null,
      entry_text text not null,
      created_at timestamptz not null default now(),
      created_by text,
      deleted_at timestamptz
    )
  `

  await sql`create index if not exists idx_dashboard_runsheet_entries_project on dashboard_runsheet_entries (project_slug, created_at desc)`
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  })
  res.end(JSON.stringify(body))
}

function sendEmpty(res, status = 204) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  })
  res.end()
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (chunks.length === 0) return {}
  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

function normalizeRow(row) {
  return {
    status: row.status,
    notes: row.notes || '',
    updated: row.updated_at ? new Date(row.updated_at).getTime() : null,
    updatedBy: row.updated_by || null,
  }
}

function normalizeRunsheet(row) {
  return {
    id: String(row.id),
    ts: new Date(row.created_at).getTime(),
    text: row.entry_text,
    by: row.created_by || null,
  }
}

async function handleGetForwardWork(devKey, res) {
  const [stateRows, orderRows] = await Promise.all([
    sql`select item_key, status, notes, updated_at, updated_by from dashboard_forward_work_state where dev_key = ${devKey}`,
    sql`select item_key from dashboard_forward_work_order where dev_key = ${devKey} order by position asc`,
  ])

  const state = Object.fromEntries(stateRows.map(row => [row.item_key, normalizeRow(row)]))
  const order = orderRows.map(row => row.item_key)
  sendJson(res, 200, { state, order })
}

async function handlePutForwardWork(devKey, itemKey, req, res) {
  const body = await readBody(req)
  const status = typeof body.status === 'string' ? body.status : 'Not started'
  const notes = typeof body.notes === 'string' ? body.notes : ''
  const updatedBy = typeof body.updatedBy === 'string' ? body.updatedBy : null

  const [row] = await sql`
    insert into dashboard_forward_work_state (dev_key, item_key, status, notes, updated_at, updated_by)
    values (${devKey}, ${itemKey}, ${status}, ${notes}, now(), ${updatedBy})
    on conflict (dev_key, item_key)
    do update set
      status = excluded.status,
      notes = excluded.notes,
      updated_at = now(),
      updated_by = excluded.updated_by
    returning status, notes, updated_at, updated_by
  `

  sendJson(res, 200, normalizeRow(row))
}

async function handlePutForwardOrder(devKey, req, res) {
  const body = await readBody(req)
  const order = Array.isArray(body.order) ? body.order.filter(value => typeof value === 'string') : []
  const updatedBy = typeof body.updatedBy === 'string' ? body.updatedBy : null

  await sql.begin(async tx => {
    await tx`delete from dashboard_forward_work_order where dev_key = ${devKey}`
    for (let i = 0; i < order.length; i += 1) {
      await tx`
        insert into dashboard_forward_work_order (dev_key, item_key, position, updated_at, updated_by)
        values (${devKey}, ${order[i]}, ${i}, now(), ${updatedBy})
      `
    }
  })

  sendJson(res, 200, { ok: true })
}

async function handleGetRunsheet(projectSlug, res) {
  const rows = await sql`
    select id, project_slug, entry_text, created_at, created_by
    from dashboard_runsheet_entries
    where project_slug = ${projectSlug}
      and deleted_at is null
    order by created_at desc
  `
  sendJson(res, 200, rows.map(normalizeRunsheet))
}

async function handlePostRunsheet(projectSlug, req, res) {
  const body = await readBody(req)
  const text = typeof body.text === 'string' ? body.text.trim() : ''
  const createdBy = typeof body.createdBy === 'string' ? body.createdBy : null
  if (!text) return sendJson(res, 400, { error: 'text is required' })

  const [row] = await sql`
    insert into dashboard_runsheet_entries (project_slug, entry_text, created_by)
    values (${projectSlug}, ${text}, ${createdBy})
    returning id, project_slug, entry_text, created_at, created_by
  `

  sendJson(res, 201, normalizeRunsheet(row))
}

async function handleDeleteRunsheet(entryId, res) {
  await sql`update dashboard_runsheet_entries set deleted_at = now() where id = ${entryId}`
  sendEmpty(res)
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return sendEmpty(res)

    const { pathname = '/' } = parseUrl(req.url || '/', true)

    if (req.method === 'GET' && pathname === '/health') {
      return sendJson(res, 200, { ok: true })
    }

    const forwardMatch = pathname.match(/^\/api\/forward-work\/([^/]+)$/)
    if (req.method === 'GET' && forwardMatch) {
      return await handleGetForwardWork(decodeURIComponent(forwardMatch[1]), res)
    }

    const orderMatch = pathname.match(/^\/api\/forward-work\/([^/]+)\/order$/)
    if (req.method === 'PUT' && orderMatch) {
      return await handlePutForwardOrder(decodeURIComponent(orderMatch[1]), req, res)
    }

    const rowMatch = pathname.match(/^\/api\/forward-work\/([^/]+)\/([^/]+)$/)
    if (req.method === 'PUT' && rowMatch) {
      return await handlePutForwardWork(decodeURIComponent(rowMatch[1]), decodeURIComponent(rowMatch[2]), req, res)
    }

    const runsheetMatch = pathname.match(/^\/api\/runsheets\/([^/]+)$/)
    if (req.method === 'GET' && runsheetMatch) {
      return await handleGetRunsheet(decodeURIComponent(runsheetMatch[1]), res)
    }

    const runsheetEntryMatch = pathname.match(/^\/api\/runsheets\/([^/]+)\/entries$/)
    if (req.method === 'POST' && runsheetEntryMatch) {
      return await handlePostRunsheet(decodeURIComponent(runsheetEntryMatch[1]), req, res)
    }

    const runsheetDeleteMatch = pathname.match(/^\/api\/runsheets\/[^/]+\/entries\/([^/]+)$/)
    if (req.method === 'DELETE' && runsheetDeleteMatch) {
      return await handleDeleteRunsheet(runsheetDeleteMatch[1], res)
    }

    sendJson(res, 404, { error: 'Not found' })
  } catch (error) {
    console.error(error)
    sendJson(res, 500, { error: 'Internal server error' })
  }
})

await ensureSchema()

server.listen(PORT, () => {
  console.log(`project-dashboard-api listening on ${PORT}`)
})
