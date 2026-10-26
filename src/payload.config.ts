import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
import { Leaders } from './collections/Leaders'
import { Media } from './collections/Media'
import { Otps } from './collections/Otps'
import { Partners } from './collections/Partners'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Testimonials } from './collections/Testimonials'
import { Users } from './collections/Users'
import { SiteCopy } from './globals/SiteCopy'
import { SiteSettings } from './globals/SiteSettings'
import { tasks } from './jobs/tasks'
import { RATE_LIMIT_COLLECTION } from './lib/ratelimit'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const UPLOAD_COLLECTIONS = { media: { prefix: 'media' }, documents: { prefix: 'documents' } }

/**
 * Where uploads live. S3 when a bucket is configured (the Lightsail production path). Vercel Blob on the temporary
 * staging hosts, whose filesystems are read-only: implied on Vercel itself, opted into elsewhere (Render, or a machine
 * seeding the staging database) with MEDIA_STORAGE=vercel-blob. The local disk otherwise (dev).
 */
const storage = process.env.S3_BUCKET
  ? 's3'
  : process.env.BLOB_READ_WRITE_TOKEN && (process.env.MEDIA_STORAGE === 'vercel-blob' || process.env.VERCEL)
    ? 'vercel-blob'
    : 'local'

const plugins: Plugin[] =
  storage === 's3'
    ? [
        s3Storage({
          collections: UPLOAD_COLLECTIONS,
          bucket: process.env.S3_BUCKET as string,
          config: {
            region: process.env.AWS_REGION || 'ap-south-1',
            ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
              ? { credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY } }
              : {}),
          },
        }),
      ]
    : storage === 'vercel-blob'
      ? [vercelBlobStorage({ collections: UPLOAD_COLLECTIONS, token: process.env.BLOB_READ_WRITE_TOKEN })]
      : []

const serverURL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.RENDER_EXTERNAL_URL || undefined)

/**
 * Browsers may call the API only from the site's own origin: no cross-origin reads, and cookie-authenticated requests
 * must carry a matching Origin or Sec-Fetch-Site (Payload's CSRF check). Non-browser clients use the JWT header.
 * In development the origin is the local dev server; in production it is the configured server URL.
 */
const ownOrigins = serverURL ? [serverURL] : process.env.NODE_ENV === 'production' ? [] : ['http://localhost:3000', 'http://127.0.0.1:3000']

export default buildConfig({
  serverURL,
  cors: ownOrigins,
  csrf: ownOrigins,
  // The site reads content through the local API and the admin uses REST, so GraphQL is pure attack surface.
  graphQL: { disable: true },
  upload: { limits: { fileSize: 25 * 1024 * 1024 } },
  admin: {
    user: Users.slug,
    // One light theme in the brand colours, no dark-mode toggle: the admin is for non-technical staff (SOW §4.1).
    theme: 'light',
    dateFormat: 'd MMM yyyy, h:mm a',
    meta: {
      titleSuffix: ' · SDG admin',
      description: 'Staff admin for the SDG Group website, enquiries and AI assistant.',
      icons: [{ rel: 'icon', type: 'image/png', url: '/img/icon-192.png' }],
    },
    // TailAdmin shell: our sidebar, header actions and dashboard; Payload's own list and edit views are restyled in custom.scss.
    components: {
      graphics: { Logo: '/components/admin/Brand#AdminLogo', Icon: '/components/admin/Brand#AdminIcon' },
      providers: ['/components/admin/AdminFonts#AdminFonts'],
      Nav: '/components/admin/AdminNav#AdminNav',
      actions: ['/components/admin/HeaderActions#HeaderActions'],
      beforeLogin: ['/components/admin/LoginNote#LoginNote'],
      views: { dashboard: { Component: '/components/admin/AdminDashboard#AdminDashboard' } },
    },
    importMap: { baseDir: path.resolve(dirname) },
  },
  // Order here is the order of the admin navigation, grouped by each collection's admin.group.
  collections: [
    Projects, Posts, Jobs, Testimonials, Faqs, Facts, Leaders, Partners, Media, // Website
    Enquiries, Customers, ChatLogs, Consultants, // Enquiries & customers
    Documents, // AI knowledge
    Users, AiUsage, // Staff & system
    DocumentChunks, Otps, // hidden
  ],
  globals: [SiteSettings, SiteCopy],
  // Rich text for staff: an always-visible toolbar, and headings from h2 down (the page title is the h1).
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter((f) => f.key !== 'heading'),
      HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
      FixedToolbarFeature(),
    ],
  }),
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
    if (process.env.NODE_ENV === 'production' && !serverURL) {
      payload.logger.warn('NEXT_PUBLIC_SERVER_URL is not set: cookie-authenticated requests are not checked against the site origin')
    }
    if (process.env.NODE_ENV === 'production' && (process.env.PAYLOAD_SECRET || '').length < 32) {
      payload.logger.warn('PAYLOAD_SECRET is shorter than 32 characters; use a long random value')
    }
    // TTL index: expired OTP rows disappear on their own, which is why there is no Redis.
    try {
      const otps = (payload.db as unknown as { collections?: Record<string, { collection: { createIndex: (k: object, o: object) => Promise<unknown> } }> }).collections?.otps
      await otps?.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    } catch (err) {
      payload.logger.warn(`OTP TTL index not created: ${String(err)}`)
    }
    // Rate-limit windows (src/lib/ratelimit.ts): one row per caller and window, unique key, removed by TTL.
    try {
      const conn = (payload.db as unknown as { connection?: { collection: (n: string) => { createIndex: (k: object, o?: object) => Promise<unknown> } } }).connection
      await conn?.collection(RATE_LIMIT_COLLECTION).createIndex({ key: 1 }, { unique: true })
      await conn?.collection(RATE_LIMIT_COLLECTION).createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    } catch (err) {
      payload.logger.warn(`Rate-limit indexes not created: ${String(err)}`)
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
