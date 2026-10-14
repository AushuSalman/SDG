// Local development without Atlas.
//   npm run dev:local                 -> seed + next dev against a local MongoDB
//   node scripts/dev-local.mjs build start
//
// Which database:
//   1. DATABASE_URL set            -> that database (an Atlas cluster, or a MongoDB server you installed).
//   2. something listens on 27017   -> mongodb://127.0.0.1:27017/sdg (a MongoDB Community Server, or a previous run).
//   3. otherwise                    -> this script starts the bundled mongod on 27017 with its data in ./.mongo-data,
//                                      so content survives restarts and MongoDB Compass can open it at the same URI.
// Set DEV_DB=memory for a throwaway in-memory database on a random port (the old behaviour).
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'

const steps = process.argv.slice(2).length ? process.argv.slice(2) : ['seed', 'dev']
const PORT = Number(process.env.MONGO_PORT) || 27017
const DB = 'sdg'

const portOpen = (port) =>
  new Promise((resolve) => {
    const s = net.connect({ host: '127.0.0.1', port })
    s.once('connect', () => { s.destroy(); resolve(true) })
    s.once('error', () => resolve(false))
    s.setTimeout(800, () => { s.destroy(); resolve(false) })
  })

// After an unclean shutdown (terminal closed, process killed) WiredTiger's per-collection count statistics lag
// behind the data, and Payload reads those estimates for unfiltered counts: list totals and the seed guards would
// read 0. Validating each collection refreshes the statistics; on this small local database it takes a moment.
async function validateAll(uri) {
  const { MongoClient } = await import('mongodb')
  const client = new MongoClient(uri)
  try {
    await client.connect()
    const db = client.db(DB)
    const cols = (await db.listCollections({}, { nameOnly: true }).toArray()).filter((c) => c.type === 'collection')
    for (const c of cols) await db.command({ validate: c.name })
    if (cols.length) console.log(`[dev-local] validated ${cols.length} collections`)
  } catch (err) {
    console.warn(`[dev-local] validation skipped: ${err.message}`)
  } finally {
    await client.close()
  }
}

let uri = process.env.DATABASE_URL
let mongo = null
if (uri) {
  console.log(`[dev-local] using DATABASE_URL`)
} else if (process.env.DEV_DB === 'memory') {
  const { MongoMemoryServer } = await import('mongodb-memory-server')
  mongo = await MongoMemoryServer.create({ instance: { dbName: DB } })
  uri = mongo.getUri(DB)
  console.log(`[dev-local] throwaway in-memory MongoDB at ${uri}`)
} else if (await portOpen(PORT)) {
  uri = `mongodb://127.0.0.1:${PORT}/${DB}`
  console.log(`[dev-local] MongoDB already listening on ${PORT}; using ${uri}`)
} else {
  const { MongoMemoryServer } = await import('mongodb-memory-server')
  const dbPath = path.resolve('.mongo-data')
  mkdirSync(dbPath, { recursive: true })
  mongo = await MongoMemoryServer.create({ instance: { dbName: DB, port: PORT, dbPath, storageEngine: 'wiredTiger' } })
  uri = mongo.getUri(DB)
  console.log(`[dev-local] local MongoDB at ${uri}`)
  console.log(`[dev-local] data persists in ${dbPath}; open the same URI in MongoDB Compass to browse it`)
  await validateAll(uri)
}

const env = {
  ...process.env,
  DATABASE_URL: uri,
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'dev-secret-change-me-please',
  AI_MODE: process.env.AI_MODE || 'mock',
  OTP_MODE: process.env.OTP_MODE || 'mock',
  NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --no-deprecation`.trim(),
}
const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env, shell: process.platform === 'win32' })
    child.on('exit', (code) => (code ? reject(new Error(`${cmd} ${args.join(' ')} exited with ${code}`)) : resolve()))
  })

const next = 'node_modules/next/dist/bin/next'
try {
  for (const step of steps) {
    if (step === 'seed') await run('node', ['--import=tsx/esm', 'src/seed/run.ts'])
    else if (step === 'dev') await run('node', [next, 'dev'])
    else if (step === 'build') await run('node', [next, 'build'])
    else if (step === 'start') await run('node', [next, 'start'])
    else throw new Error(`unknown step ${step}`)
  }
} finally {
  if (mongo) await mongo.stop() // a clean shutdown; the on-disk data directory is kept
}
