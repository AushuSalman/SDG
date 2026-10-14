# SDG Group digital flagship platform

One Next.js 16 app with Payload CMS 3.90 runs the public site, the client portal, the admin console, the
enquiry pipeline and the AI assistant. MongoDB Atlas (Mumbai) is the database, S3 holds media, Claude on
Amazon Bedrock's India inference profile powers the assistant. Deployed as one Docker container behind
Caddy on an AWS Lightsail server, built and shipped from Azure DevOps.

Design: the Refined skin (navy and brass on cream, Fraunces headlines, Inter body, pill buttons) per
`../docs/sdg-design-tokens.md`, reference wireframe `../sdg-wireframe-refined.html`. Architecture: team v3, 13 Oct 2026.

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

## What is where

| Path | Purpose |
|---|---|
| `src/collections/` | Payload collections: projects, facts, FAQs, documents (+ chunks), posts (Blogs), jobs (Careers), testimonials, customers, enquiries, consultants, chat logs, users, OTPs, AI usage |
| `src/globals/SiteSettings.ts` | Contact details, hours, assistant caps (monthly tokens, turns per session, retention days) |
| `src/lib/access.ts` | The six staff roles and who may publish or approve |
| `src/lib/scoring.ts` | Rules-based lead qualification with the client's Q17 weights |
| `src/lib/otp.ts` | OTP issue and verify, rate limits, verification tokens |
| `src/lib/ai/` | Classify → retrieve (Atlas Vector Search) → draft (Bedrock) → post-check → log |
| `src/lib/integrations/` | MSG91, WhatsApp Cloud API, PropFlo adapter, SES |
| `src/jobs/tasks.ts` | Payload job queue: document indexing, PropFlo sync, WhatsApp, email, consultant allocation, hand-off notification, retention sweep |
| `src/app/api/site/` | Public API: `otp/send`, `otp/verify`, `enquire`, `chat`, `portal`, `health` |
| `src/app/(frontend)/` | Pages, one per wireframe route: home, real-estate, projects (discovery) and projects/[slug], paper, glass, about, leadership, partnerships, careers, blog and blog/[slug], portal, contact, schedule, readiness, roi, proposal (space designer), past-projects, documents (summariser), map, privacy, 404. `globals.css` holds the Refined tokens and chrome; `site.css` the page sections |
| `src/components/` | `SiteHeader` (six-entry menu with Our Businesses and About dropdowns, share and Ask SDG icons), `SiteFooter`, `SectionBar` (business page bars), `EnquiryForm`, `PortalClient`, `Scheduler`, `ReadinessWizard`, `CareerForm`; `ui/` holds the `UiProvider` (toast, AI drawer, booking, share and brochure sheets, lightbox), `CtaDock`, `CookieNotice`; `construction/`, `project/` and `tools/` hold the page-specific client components |
| `src/seed/` | Approved content from the client's fact sheet and questionnaire |
| `Dockerfile`, `docker-compose.yml`, `Caddyfile`, `azure-pipelines.yml` | Build and deploy |

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

## Not yet built (tracked for the sprints)

PDF text extraction for documents (paste the text into the admin for now), the approved proposal PDF on
letterhead (the space designer produces the indicative on-screen version), Microsoft Graph calendar
booking (the scheduler records the requested slot as an enquiry and the consultant confirms it),
Entra ID sign-in for staff, CV upload on careers applications (CVs go by email), CloudFront in front
of S3, and admin branding. Sample posts, roles and testimonials are seeded with `sample: true` and show
a "Sample" chip until marketing replaces them.
