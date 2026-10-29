# SDG Group digital flagship platform

One Next.js 16 app with Payload CMS 3.90 runs the public site, the client portal, the admin console, the
enquiry pipeline and the AI assistant. MongoDB Atlas (Mumbai) is the database, S3 holds media, Claude on
Amazon Bedrock's India inference profile powers the assistant. Deployed as one Docker container behind
Caddy on an AWS Lightsail server, built and shipped from Azure DevOps.

Design: the public site uses the Refined skin (navy and brass on cream, Manrope headings, Inter body, self-hosted fonts, pill
buttons) per `../docs/sdg-design-tokens.md`, reference wireframe `../sdg-wireframe-refined.html`. The staff
admin uses the TailAdmin Pro 2.2 theme (Outfit, brand blue, white cards on gray); see "Admin" below.
Architecture: team v3, 13 Oct 2026.

## Run it locally

```bash
npm install
npm run dev:local        # starts a local MongoDB on 27017 (data in ./.mongo-data), seeds it, runs next dev on :3000
```

Admin: http://localhost:3000/admin — `admin@sdg.local` / `ChangeMe123!` (seed defaults; set
`SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` to change). OTP codes print to the terminal and are shown
on the form in development. The assistant runs in mock mode until AWS credentials are present.

The local database is the bundled `mongod` from mongodb-memory-server, started on the standard port with
on-disk storage, so content survives restarts. Browse it in MongoDB Compass at `mongodb://127.0.0.1:27017/sdg`
(no Community Server install needed; if one is installed and running on 27017 the script simply uses it).
`DEV_DB=memory npm run dev:local` gives a throwaway in-memory database instead.

With a real database: copy `.env.example` to `.env`, fill `DATABASE_URL` and `PAYLOAD_SECRET`, then
`npm run seed` once and `npm run dev`.

## Admin

The admin at `/admin` is Payload's, dressed as TailAdmin and limited to the light theme. Only the `(payload)`
route group is touched; the public site keeps its own stylesheet and Tailwind setup in `(frontend)`.

- `src/app/(payload)/tailadmin.css`: TailAdmin's Tailwind v4 theme tokens and sidebar utilities, imported
  without Tailwind's preflight so Payload's own resets stay intact (the few base rules TailAdmin needs are
  scoped to `.ta`).
- `src/app/(payload)/custom.scss`: Payload's list, edit, header and sign-in views restyled with the same tokens.
- `src/components/admin/`: the TailAdmin pieces. `AdminNav` + `AdminNavClient` replace the sidebar (same
  access-controlled groups: Website, Enquiries & customers, AI knowledge, Staff & system); `AdminDashboard`
  replaces the home view with KPI cards, enquiries-per-month and by-business charts (ApexCharts), the work
  queue for the signed-in role, recent enquiries and content status; `HeaderActions`, `LoginNote`, `Brand`
  and `AdminFonts` cover the header, sign-in page, logo and Outfit font. `tailadmin/icons.tsx` holds the
  template's icons converted to plain React components (no SVGR). All of it is registered in
  `payload.config.ts` under `admin.components`.
- Collections carry plain-language labels, groups and a one-line description that shows at the top of each
  list. Changing a label never changes the slug or the API.

After adding or renaming an admin component, run `node node_modules/payload/bin.js generate:importmap`
(the npm script sometimes exits silently; `next dev` also regenerates the map on start).

## What is where

| Path | Purpose |
|---|---|
| `src/collections/` | Payload collections: projects, facts, FAQs, documents (+ chunks), posts (Blogs), jobs (Careers), testimonials, customers, enquiries, consultants, chat logs, users, OTPs, AI usage |
| `src/globals/SiteSettings.ts` | Contact details, hours, assistant caps (monthly tokens, turns per session, retention days) |
| `src/lib/access.ts` | The six staff roles and who may publish or approve |
| `src/lib/scoring.ts` | Rules-based lead qualification with the client's Q17 weights |
| `src/lib/otp.ts` | OTP issue and verify, rate limits, verification tokens |
| `src/lib/ai/` | Classify → retrieve (Atlas Vector Search) → draft (Bedrock) → post-check → log |
| `src/lib/integrations/` | MSG91, WhatsApp Cloud API, SES, the CRM layer (`crm.ts` picks PropFlo or HubSpot; one adapter each) and Microsoft Graph calendar (`graph.ts`) |
| `src/jobs/tasks.ts` | Payload job queue: document indexing, CRM sync, calendar booking, WhatsApp, email, consultant allocation, hand-off notification, retention sweep |
| `src/app/api/site/` | Public API: `otp/send`, `otp/verify`, `enquire`, `chat`, `portal`, `health` |
| `src/app/(frontend)/` | Pages, one per wireframe route: home, real-estate, projects (discovery) and projects/[slug], paper, glass, about, leadership, partnerships, careers, blog and blog/[slug], portal, contact, schedule, readiness, roi, proposal (space designer), past-projects, documents (summariser), map, privacy, 404. `globals.css` holds the Refined tokens and chrome; `site.css` the page sections |
| `src/components/` | `SiteHeader` (six-entry menu with Our Businesses and About dropdowns, share and Ask SDG icons), `SiteFooter`, `SectionBar` (business page bars), `EnquiryForm`, `PortalClient`, `Scheduler`, `ReadinessWizard`, `CareerForm`; `ui/` holds the `UiProvider` (toast, AI drawer, booking, share and brochure sheets, lightbox), `CtaDock`, `CookieNotice`; `construction/`, `project/` and `tools/` hold the page-specific client components |
| `src/seed/` | Site content: the client's approved fact sheet and questionnaire plus the text and imagery migrated from sdg.in (`assets/`). `run.ts` upserts it by natural key whenever `CONTENT_VERSION` is bumped |
| `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `azure-pipelines.yml` | Build and deploy |

## CRM and calendar

**CRM.** Every enquiry is queued to `crmSync`, which writes it to whichever CRM has credentials: PropFlo
(`PROPFLO_API_URL` + `PROPFLO_API_KEY`, SDG's CRM, no self-service sign-up) or HubSpot's free CRM
(`HUBSPOT_ACCESS_TOKEN`, used on staging). `CRM_PROVIDER` forces one. In HubSpot the contact is matched by mobile
number and the enquiry details land in custom `sdg_*` contact properties (created on first use; without the schema
scope they go into the Message property). The enquiry's CRM group shows the provider, lead ID and sync status; the
customer keeps the CRM contact ID.

HubSpot set-up (free): create an account at hubspot.com → Settings → Integrations → Private apps → Create app →
Scopes: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.schemas.contacts.read`,
`crm.schemas.contacts.write` → copy the access token into `HUBSPOT_ACCESS_TOKEN`.

**Calendar.** A request from Book a meeting carries the slot and the chosen desk (`meeting` on the enquiry). Once the
visitor verifies their number, `calendarBook` creates the event on that consultant's connected Outlook calendar,
with the visitor as attendee when they gave an email, and the scheduler greys out slots the calendar already has
(`/api/site/calendar/busy`). Each consultant connects their own calendar from Sales consultants → Outlook calendar
→ Connect; the refresh token is stored on the record, hidden and unreadable through the API.

Microsoft set-up: a free Outlook.com account works for a consultant. Register an app at entra.microsoft.com →
App registrations → New (supported account types: personal + any org, or whichever applies) → Redirect URI (Web)
`<site>/api/site/calendar/callback` → Certificates & secrets → new client secret → API permissions (delegated):
`Calendars.ReadWrite`, `User.Read`, `offline_access`. Put the application (client) ID and secret in `MS_CLIENT_ID`,
`MS_CLIENT_SECRET`; `MS_TENANT=common` for mixed accounts or `consumers` for Outlook.com only.

## How the pieces behave

- **Publishing.** Content roles save drafts; only Management and Super Admin can publish or approve a
  document for the assistant. Facts carry an approval status that mirrors the client's workbook.
- **Enquiries.** Saved first, verified by OTP second, so a drop-off is still captured. One customer per
  phone number, one record per enquiry. Scored by rules. Every outbound call (PropFlo, WhatsApp, email,
  consultant allocation) goes through the job queue with retries.
- **Assistant.** Rules and Haiku classify the question. Restricted subjects (price, availability,
  possession, RERA/legal, loans, returns, discounts) get a hand-off card and a consultant notification.
  Everything else is answered only from approved documents, post-checked for commitments, then streamed.
  Every turn is logged; only Super Admin, Management, Sales and Support can read logs.
- **Residency.** Bedrock model IDs use the `in.` profile so inference stays in Mumbai and Hyderabad.

## Scripts

`dev`, `dev:local`, `build`, `start`, `seed`, `typecheck`, `test:unit`, `generate:types`, `lint`.

## Deploying

1. Server once: Ubuntu Lightsail in Mumbai, Docker + compose, `/opt/sdg` with `docker-compose.yml`,
   `Caddyfile` and a filled `.env`; open 80/443; point the domain at the static IP; nightly snapshots.
2. Pipeline: set the variable group named in `azure-pipelines.yml`; every push to `master` builds,
   tests, pushes the image and restarts the server, then smoke-checks `/api/site/health`.
3. Atlas: M10 in Mumbai, private endpoint or IP allow-list, and a Vector Search index named
   `chunks_vector` on `document-chunks.embedding` (512 dimensions, cosine). Until the index exists,
   retrieval falls back to an in-process scan, which is fine at launch volume.

## Staging on Vercel (temporary, during development)

Production is the Docker container on AWS Lightsail (`Dockerfile`, `docker-compose.yml`, `azure-pipelines.yml`).
For the development period the site runs on Vercel from this repo, with a free MongoDB Atlas cluster; nothing here
changes the production path. `vercel.json` pins the Mumbai region and a daily cron that drains the job queue; the
in-process queue runner is off on Vercel, so for minute-level processing run the same image on Render (or any
always-on host) against the same database.

Deploy from a machine with the Vercel CLI (`npx vercel login` once, or `VERCEL_TOKEN`):

```bash
npx vercel link                      # create or pick the project
npx vercel env add DATABASE_URL production      # Atlas connection string
npx vercel env add PAYLOAD_SECRET production    # 32+ random characters
npx vercel env add AI_MODE production           # mock until Bedrock keys exist
npx vercel env add OTP_MODE production          # mock: codes are shown on the form (staging only)
npx vercel env add CRON_SECRET production       # lets the cron call /api/payload-jobs/run
npx vercel blob create-store sdg-media --access public --region bom1 --yes   # uploads; adds BLOB_READ_WRITE_TOKEN
npx vercel deploy --prod
# once per content version, from your machine, so the seed's images land in the Blob store, not on your disk
DATABASE_URL=... PAYLOAD_SECRET=... MEDIA_STORAGE=vercel-blob BLOB_READ_WRITE_TOKEN=... npm run seed
```

Uploads on the staging hosts go to a Vercel Blob store (Vercel's and Render's filesystems are read-only): on Vercel
the token alone switches it on; on Render (and for a seed run from your machine) set `MEDIA_STORAGE=vercel-blob` too.
Production stays on S3 (`S3_BUCKET` wins). Other staging limits: mock OTP must never be used for real customers, and
`NEXT_PUBLIC_SERVER_URL` falls back to the Vercel production URL when unset.

Render runs the same Docker image from the GitHub mirror (`render.yaml`, branch `salman`, auto-deploy): pushing that
branch to GitHub deploys it. Azure DevOps (`origin`) stays the source of truth; push there first, then mirror:

```bash
git push origin salman
git push github salman
```

## Security

- **Secrets** live only in the host's environment (`.env*` is ignored by git, Docker and the Vercel CLI; the repo
  carries `.env.example` with placeholders). `PAYLOAD_SECRET` must be 32+ random characters and `CRON_SECRET`
  guards the job runner. Rotate any key that was ever pasted into a chat or ticket.
- **Admin and API.** Every collection and global declares who may read, create, update and delete (`src/lib/access.ts`);
  public visitors only see published, approved or active records, and customer data (enquiries, customers, chats,
  consultants) needs a staff login. Accounts lock for 10 minutes after 5 wrong passwords; the session cookie is
  `Secure` in production and `SameSite=Lax`; cookie-authenticated requests must come from the site's own origin
  (`cors`/`csrf` in `payload.config.ts`); GraphQL is disabled.
- **Rate limits.** The public routes (enquiry, OTP send and verify, assistant, scheduler availability) share a
  database-backed per-address window (`src/lib/ratelimit.ts`, 429 with `Retry-After`); staff sign-in endpoints get
  an in-memory per-address window in `src/proxy.ts`; OTP codes are additionally capped per number and per address.
- **Input and output.** Every route validates its body with zod and bounded lengths; React escapes all output;
  rich text links and admin-entered URLs are restricted to web addresses (`src/lib/validate.ts`); uploads are
  raster images and documents only, 25 MB at most; the JSON-LD block escapes `<`.
- **Headers.** `next.config.ts` sends a Content Security Policy (own origin, Google Fonts, Maps and YouTube
  frames, nothing may frame the site), `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy` and, in production, HSTS. `X-Powered-By` is off.
- **Operations.** Run `npm audit` before each release; the seed refuses the default admin password on anything
  but a local database; `OTP_MODE=mock` and `AI_MODE=mock` are for development and staging only; keep the Atlas
  cluster on an IP allow-list or private endpoint.

## Not yet built (tracked for the sprints)

PDF text extraction for documents (paste the text into the admin for now), the approved proposal PDF on
letterhead (the space designer produces the indicative on-screen version), Microsoft Graph calendar
booking (the scheduler records the requested slot as an enquiry and the consultant confirms it),
Entra ID sign-in for staff, CV upload on careers applications (CVs go by email), and CloudFront in front
of S3. The seed carries no placeholder content any more: posts, roles and testimonials come only from the
admin (a record ticked `sample` still shows a "Sample" chip).
