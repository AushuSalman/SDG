import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig, type Plugin } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { AiUsage } from './collections/AiUsage'
import { ChatLogs } from './collections/ChatLogs'
import { Consultants } from './collections/Consultants'
import { Customers } from './collections/Customers'
import { DocumentChunks, Documents } from './collections/Documents'
import { Enquiries } from './collections/Enquiries'
import { Facts } from './collections/Facts'
import { Faqs } from './collections/Faqs'
import { Jobs } from './collections/Jobs'
import { Media } from './collections/Media'
import { Otps } from './collections/Otps'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { tasks } from './jobs/tasks'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Media and documents go to S3 when a bucket is configured; local disk otherwise (dev). */
const plugins: Plugin[] = process.env.S3_BUCKET
  ? [
      s3Storage({
        collections: { media: { prefix: 'media' }, documents: { prefix: 'documents' } },
        bucket: process.env.S3_BUCKET,
        config: {
          region: process.env.AWS_REGION || 'ap-south-1',
          ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
            ? { credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY } }
            : {}),
        },
      }),
    ]
  : []

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined),
  admin: {
    user: Users.slug,
    meta: { titleSuffix: ' · SDG admin' },
    importMap: { baseDir: path.resolve(dirname) },
  },
  collections: [
    Projects, Facts, Faqs, Documents, Media, Posts, Jobs, Testimonials,
    Customers, Enquiries, Consultants, ChatLogs,
    Users, AiUsage, DocumentChunks, Otps,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: mongooseAdapter({ url: process.env.DATABASE_URL || '' }),
  sharp,
  plugins,
  jobs: {
    tasks,
    // The single container processes its own queue every minute (architecture v3: Payload jobs, no SQS).
    autoRun: [{ cron: '* * * * *', limit: 10, queue: 'default' }],
    // Serverless hosts (Vercel) have no long-lived process: there the queue is run by the cron in vercel.json
    // or by the always-on Render instance sharing the same database.
    shouldAutoRun: () => process.env.PAYLOAD_JOBS_AUTORUN !== 'false' && !process.env.VERCEL,
    access: {
      run: ({ req }) => {
        if (req.user) return true
        const auth = req.headers.get('authorization')
        return Boolean(process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`)
      },
    },
  },
  onInit: async (payload) => {
    // TTL index: expired OTP rows disappear on their own, which is why there is no Redis.
    try {
      const otps = (payload.db as unknown as { collections?: Record<string, { collection: { createIndex: (k: object, o: object) => Promise<unknown> } }> }).collections?.otps
      await otps?.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    } catch (err) {
      payload.logger.warn(`OTP TTL index not created: ${String(err)}`)
    }
    // One retention sweep a day, queued if none is waiting.
    try {
      const pending = await payload.find({ collection: 'payload-jobs', overrideAccess: true, limit: 1, where: { and: [{ taskSlug: { equals: 'retentionSweep' } }, { completedAt: { exists: false } }] } })
      if (!pending.totalDocs) {
        await payload.jobs.queue({ task: 'retentionSweep', input: {}, waitUntil: new Date(Date.now() + 24 * 3600 * 1000) })
      }
    } catch (err) {
      payload.logger.warn(`Retention sweep not scheduled: ${String(err)}`)
    }
  },
})
