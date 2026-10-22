/**
 * Seed content. Two sources, in order of authority:
 *   1. The client's approved material: SDG_Master_Fact_Sheet_Draft_v1.xlsx (approvals by Akshay, 10 Oct 2026)
 *      and SDG_Website_Questionnaire.docx. Where the two sources disagree the fact sheet wins and the
 *      difference is recorded in the fact's `source`.
 *   2. The text and imagery published on sdg.in, migrated 21 Oct 2026 (fact IDs WEB-xx, assets in ./assets).
 * Anything not approved in either is left out or marked draft / do-not-publish so it never reaches the site
 * or the assistant.
 */

/** Image files under src/seed/assets, uploaded to the Media collection by the seed. */
export type Asset = { file: string; alt: string }
const plan = (file: string, alt: string): Asset => ({ file: `plans/${file}`, alt })

export const PROJECTS = [
  {
    name: 'SDG Prinia', slug: 'prinia', business: 'construction', category: 'residential', status: 'ongoing',
    location: 'Kismatpur', rera: 'P02400010277', possession: 'Sep 2030, as per RERA', sdgRole: 'developer',
    tagline: 'An exclusive 3 BHK community on an elevated podium.',
    summary: 'Prinia is a premium residential project in Kismatpur, launched in 2026: 344 homes across two towers, four all-corner flats on every floor, and more than fifty amenities spread across four levels above a uniquely elevated podium.',
    specs: { towers: 2, floors: '2 basements + 5 podium levels + 45 floors', units: 344, saleableArea: '8.6 lakh sq ft', floorHeight: '3.3 m floor to floor', parking: 'Two basement levels' },
    configurations: [{ label: '3 BHK', sizeSqft: 2466 }, { label: '3 BHK', sizeSqft: 2499 }, { label: '3 BHK', sizeSqft: 2577 }],
    highlights: ['Premium residential project', 'Exclusive 3 BHK community', 'Four all-corner flats per floor', '50+ amenities across 4 levels', 'Uniquely elevated podium', 'Under construction'],
    featured: true, order: 1,
    hero: { file: 'projects/prinia.jpg', alt: 'SDG Prinia, an exclusive 3 BHK residential community in Kismatpur' },
  },
  {
    name: 'SDG Premise', slug: 'premise', business: 'construction', category: 'commercial', status: 'ongoing',
    location: 'Raidurg, near Biodiversity', rera: 'P02400009718', sdgRole: 'developer',
    tagline: 'Resplendent boutique workspaces in Raidurg.',
    summary: 'Premise brings resplendent boutique office space to Raidurg, near the Biodiversity junction: two basements, ground and eight floors with floor plates from 13,000 to 20,055 sq ft. Launched in 2025.',
    specs: { floors: '2 basements + ground + 8 floors', saleableArea: '1.1 lakh sq ft', floorPlate: '13,000 to 20,055 sq ft' },
    highlights: ['Resplendent boutique spaces', 'Near the Biodiversity junction', 'Launched 2025'],
    order: 2,
    hero: { file: 'projects/premise.jpg', alt: 'SDG Premise, boutique commercial spaces in Raidurg' },
  },
  {
    name: 'SDG Centrum', slug: 'centrum', business: 'construction', category: 'commercial', status: 'completed',
    location: 'Golden Mile, Kokapet', address: 'Golden Mile Layout Road, Kokapet, Hyderabad, Telangana 500075',
    rera: 'P02400006073', sdgRole: 'developer',
    tagline: 'Grade A warm shell and fully furnished offices on the Golden Mile.',
    summary: 'Centrum is a completed, fully SDG-owned office development at Golden Mile, Kokapet: four basements, ground and seventeen floors, IGBC Platinum pre-certified, with floor plates from 18,000 to 32,000 sq ft and a 3.9 m floor-to-floor height.',
    specs: { floors: '4 basements + ground + 17 floors', saleableArea: '4.3 lakh sq ft', floorPlate: '18,000 to 32,000 sq ft', floorHeight: '3.9 m', certification: 'IGBC Platinum pre-certification' },
    highlights: ['Fully owned by SDG Group', 'Grade A warm shell and fully furnished options', 'IGBC Platinum pre-certification', 'Occupiers include Unykloud and Lanarsy'],
    order: 3,
    hero: { file: 'projects/centrum.jpg', alt: 'SDG Centrum, Grade A offices on the Golden Mile, Kokapet' },
  },
  {
    name: 'VSD Tech Park', slug: 'vsd-tech-park', business: 'construction', category: 'commercial', status: 'completed',
    location: 'Financial District, Nanakramguda', address: 'Survey No. 142, Financial District, Nanakramguda, Hyderabad 500032',
    rera: 'P02400001907', sdgRole: 'developer',
    tagline: 'The tallest IT park in the heart of progress. Now leasing.',
    summary: 'VSD Tech Park is a completed 31-floor Grade A office tower in the Financial District, built by SDG and Vamsiram for global capability centres: four basements, floor plates from 11,000 to 42,000 sq ft and 1.1 million sq ft of leasable warm shell and fully furnished space. SDG\'s corporate office is on the 30th and 31st floors of the West Block.',
    specs: { floors: 'Ground + 4 basements + 31 floors', saleableArea: '1.1 million sq ft leasable', floorPlate: '11,000 to 42,000 sq ft', parking: 'One car park for every 1,000 sq ft' },
    highlights: [
      'Now leasing', 'Grade A IT building', 'Luxury retail spaces', '100% power back-up', 'Centralised air conditioning', 'Fire fighting systems',
      'One car park for every 1,000 sq ft', '22 passenger and 2 service elevators', 'Access control for office spaces', 'Double-glazed glass facade',
      'SDG corporate office', 'Occupiers include Starbucks, CDSL, Zaggle, Sonata and Techwave',
    ],
    order: 4,
    hero: { file: 'projects/vsd-tech-park.jpg', alt: 'VSD Tech Park, Financial District, Hyderabad' },
    gallery: [
      { file: 'projects/vsd-tech-park-twilight.jpg', alt: 'VSD Tech Park at twilight' },
      { file: 'projects/vsd-tech-park-1a.jpg', alt: 'VSD Tech Park, tower view' },
      { file: 'projects/vsd-tech-park-1a-con.jpg', alt: 'VSD Tech Park from the Financial District' },
      { file: 'projects/vsd-tech-park-oc.png', alt: 'VSD Tech Park occupancy certificate' },
    ],
    floorPlans: [
      plan('vsd-ground.webp', 'VSD Tech Park ground floor plan'),
      ...Array.from({ length: 15 }, (_, i) => plan(`vsd-${String(i + 1).padStart(2, '0')}.webp`, `VSD Tech Park floor ${i + 1} plan`)),
      plan('vsd-30.webp', 'VSD Tech Park floor 30 plan'),
      ...[1, 2, 3, 4].map((n) => plan(`vsd-basement-0${n}.webp`, `VSD Tech Park basement ${n} plan`)),
    ],
  },
  {
    name: 'Trilight', slug: 'trilight', business: 'construction', category: 'residential', status: 'ongoing',
    location: 'Golden Mile, Kokapet', rera: 'P02400005390', sdgRole: 'partner',
    tagline: 'Uber-luxury 3, 4 and 5 BHK residences on the Golden Mile.',
    summary: 'Trilight is a partner project at Golden Mile, Kokapet, launched in 2023 as Hyderabad\'s tallest residential project at the time: 462 residences across three towers of 56, 46 and 49 floors, three clubhouses spread across one lakh sq ft, and IGBC Platinum pre-certification.',
    specs: { towers: 3, floors: '56 / 46 / 49 floors', units: 462, saleableArea: '2.2 million sq ft', certification: 'IGBC Platinum pre-certification' },
    configurations: [
      { label: '3 BHK', sizeSqft: 2888 }, { label: '4 BHK', sizeSqft: 3666 }, { label: '4 BHK', sizeSqft: 4777 }, { label: '5 BHK', sizeSqft: 5777 },
      { label: 'Limited edition', sizeSqft: 10111 }, { label: 'Limited edition', sizeSqft: 11333 },
    ],
    highlights: ['Uber-luxury residential project', 'Three clubhouses across 1 lakh sq ft', 'IGBC Platinum pre-certification', 'Partner project'],
    order: 5,
    hero: { file: 'projects/trilight.jpg', alt: 'Trilight, uber-luxury residences on the Golden Mile, Kokapet' },
  },
  {
    name: 'Blue Oak Prime', slug: 'blue-oak-prime', business: 'construction', category: 'residential', status: 'completed',
    location: 'Krishna Lanka, Vijayawada', sdgRole: 'developer',
    tagline: 'A completed residential project in Krishna Lanka, Vijayawada.',
    summary: 'Blue Oak Prime is a completed residential project at Krishna Lanka, Vijayawada, with a total built-up area of 25,000 sq ft, completed in 2014.',
    specs: { saleableArea: '25,000 sq ft built-up' },
    highlights: ['Residential project', 'Completed in 2014'],
    order: 6,
    hero: { file: 'projects/blue-oak-prime.jpg', alt: 'Blue Oak Prime, Krishna Lanka, Vijayawada' },
  },
  {
    name: 'Blue Oak Elite', slug: 'blue-oak-elite', business: 'construction', category: 'residential', status: 'completed',
    location: 'Krishna Lanka, Vijayawada', sdgRole: 'developer',
    tagline: 'Completed luxury apartments in Krishna Lanka, Vijayawada.',
    summary: 'Blue Oak Elite is a completed luxury apartment project at Krishna Lanka, Vijayawada, with a total built-up area of 15,000 sq ft, completed in 2019.',
    specs: { saleableArea: '15,000 sq ft built-up' },
    highlights: ['Luxury apartments', 'Completed in 2019'],
    order: 7,
    hero: { file: 'projects/blue-oak-elite.jpg', alt: 'Blue Oak Elite, Krishna Lanka, Vijayawada' },
  },
] as const

const WEB = { status: 'approved', approvedBy: 'Published on sdg.in', approvedAt: '2026-10-21T00:00:00.000Z' } as const
const SHEET = { status: 'approved', approvedBy: 'Akshay (SDG)', approvedAt: '2026-10-10T00:00:00.000Z' } as const

export const FACTS = [
  // Corporate identity
  { factId: 'SDG-002', category: 'Corporate Identity', business: 'group', claim: 'Brand name', wording: 'Suvarna Durga Group (SDG).', ...SHEET, order: 1 },
  { factId: 'SDG-003', category: 'Corporate Identity', business: 'group', claim: 'Group description', wording: 'SDG is a diversified business group with four distinct business interests: construction and realty, paper manufacturing, glass bottle recycling and agro products.', ...SHEET, order: 2 },
  { factId: 'SDG-005', category: 'Corporate Identity', business: 'group', claim: 'Founder', wording: 'The foundations of Suvarna Durga Group were laid by Sri Jakkireddy Subba Reddy, who started the business in his individual capacity in 1978.', ...SHEET, order: 3 },
  { factId: 'SDG-008', category: 'Corporate Identity', business: 'group', claim: 'Values', wording: 'Integrity, honesty, transparency, people-centricity, responsible growth and value creation guide the Group.', ...SHEET, order: 4 },
  { factId: 'WEB-01', category: 'Corporate Identity', business: 'group', claim: 'Promise', wording: 'A leader in all that we do, and a brand whose promise is as good as gold.', ...WEB, source: 'sdg.in home page', order: 5 },
  // History and timeline
  { factId: 'SDG-004', category: 'History & Timeline', business: 'group', claim: 'Since', value: '1978', wording: 'Suvarna Durga Group (SDG) traces its origins to 1978, when the company was founded.', ...SHEET, showOnHome: true, order: 10 },
  { factId: 'SDG-010', category: 'History & Timeline', business: 'glass', claim: 'Bottle recycling', value: '1997', wording: 'Bottle recycling became an SDG business in 1997.', ...SHEET, order: 11 },
  { factId: 'WEB-05', category: 'History & Timeline', business: 'glass', claim: 'Entrepreneur network', value: '2005', wording: 'Built a network of entrepreneurs across Telangana and Andhra Pradesh.', ...WEB, source: 'sdg.in key milestones', order: 12 },
  { factId: 'SDG-011', category: 'History & Timeline', business: 'paper', claim: 'Paper manufacturing', value: '2010', wording: 'SDG entered paper manufacturing in 2010.', ...SHEET, order: 13 },
  { factId: 'SDG-012', category: 'History & Timeline', business: 'construction', claim: 'Construction and realty', value: '2011', wording: 'SDG entered construction and realty in 2011.', ...SHEET, order: 14 },
  { factId: 'WEB-06', category: 'History & Timeline', business: 'glass', claim: 'Bottling turnover', value: '2012', wording: 'The bottling business reached an annual turnover of ₹100 crore.', ...WEB, source: 'sdg.in key milestones', order: 15 },
  { factId: 'SDG-013', category: 'History & Timeline', business: 'agro', claim: 'Agro products', value: '2017', wording: 'SDG entered agro products in 2017.', ...SHEET, order: 16 },
  { factId: 'WEB-07', category: 'History & Timeline', business: 'group', claim: 'Turnover milestones', value: '2018', wording: 'Annual turnover reached ₹250 crore in the bottling business and ₹75 crore in the paper business.', ...WEB, source: 'sdg.in key milestones', order: 17 },
  { factId: 'WEB-08', category: 'History & Timeline', business: 'construction', claim: 'VSD Tech Park', value: '2018', wording: 'Launched VSD Tech Park, SDG\'s first and tallest commercial project: 32 floors and over 1 million sq ft in the Financial District.', ...WEB, source: 'sdg.in key milestones', order: 18 },
  { factId: 'WEB-09', category: 'History & Timeline', business: 'construction', claim: 'Trilight', value: '2023', wording: 'Launched Trilight, the first and tallest residential project: 56 floors and over 2.2 million sq ft at Kokapet.', ...WEB, source: 'sdg.in key milestones', order: 19 },
  { factId: 'WEB-10', category: 'History & Timeline', business: 'group', claim: 'Corporate office', value: '2025', wording: 'Moved to an expansive new corporate office at VSD Tech Park, Financial District, a tower built by SDG and Vamsiram for global capability centres.', ...WEB, source: 'sdg.in key milestones', order: 20 },
  { factId: 'WEB-11', category: 'History & Timeline', business: 'construction', claim: 'Premise', value: '2025', wording: 'Launched Premise, resplendent boutique spaces of ground plus eight floors and 1.1 lakh sq ft at Raidurg.', ...WEB, source: 'sdg.in key milestones', order: 21 },
  { factId: 'WEB-12', category: 'History & Timeline', business: 'construction', claim: 'Prinia', value: '2026', wording: 'Launched Prinia, the first premium residential project: an exclusive 3 BHK community of two towers and 344 homes at Kismatpur.', ...WEB, source: 'sdg.in key milestones', order: 22 },
  // Group metrics
  { factId: 'SDG-006', category: 'Group Metrics', business: 'group', claim: 'Employees', value: '800+', wording: 'SDG has a team of 800+ employees.', ...SHEET, showOnHome: true, order: 30 },
  { factId: 'SDG-020', category: 'Group Metrics', business: 'paper', claim: 'Tonnes of paper a year', value: '175,000', wording: 'SDG\'s paper business produces 175,000 tonnes of paper per annum.', ...SHEET, showOnHome: true, order: 31 },
  { factId: 'SDG-021', category: 'Group Metrics', business: 'construction', claim: 'Sq ft under development', value: '6M+', wording: 'SDG\'s realty portfolio includes over 6 million sq ft under development.', ...SHEET, showOnHome: true, order: 32 },
  { factId: 'WEB-15', category: 'Group Metrics', business: 'group', claim: 'Business interests', value: '4', wording: 'Four distinct business interests: constructions, paper, glass bottles and agro products.', ...WEB, source: 'sdg.in home page', order: 33 },
  { factId: 'SDG-018', category: 'Group Metrics', business: 'glass', claim: 'Bottles recycled a month', value: '5 million', wording: 'Over 5 million bottles are recycled every month.', status: 'do-not-publish', order: 34, source: 'Fact sheet: Website Approved Facts says Do not publish; three other sheets say 5 million; sdg.in publishes "over 3 crore bottles a month". Awaiting one answer from SDG.' },
  // Business verticals (About page cards)
  { factId: 'WEB-20', category: 'Business Verticals', business: 'construction', claim: 'Suvarna Durga Constructions', wording: 'High-end commercial and residential projects in prime locales of Hyderabad, from the Financial District to the Golden Mile, every one RERA registered.', ...WEB, source: 'sdg.in Constructions page', order: 40 },
  { factId: 'WEB-21', category: 'Business Verticals', business: 'paper', claim: 'Suvarna Durga Paper', wording: 'Machine-finished kraft paper for the packaging industry, from 100 to 250 GSM and 18 to 28 BF, made on two paper machines in Sangareddy.', ...WEB, source: 'sdg.in Paper page; BF range per fact sheet', order: 41 },
  { factId: 'WEB-22', category: 'Business Verticals', business: 'glass', claim: 'Suvarna Durga Bottles', wording: 'Empty bottles recovered, washed and supplied back to fillers through a network of warehouses across Telangana and Andhra Pradesh.', ...WEB, source: 'sdg.in Bottles page', order: 42 },
  { factId: 'WEB-23', category: 'Business Verticals', business: 'agro', claim: 'Suvarna Durga Agro Products', wording: 'Procurement, logistics and delivery of grains, rice and other agro products, from source to customer across India.', ...WEB, source: 'sdg.in Agro Products page', order: 43 },
  // Realty
  { factId: 'SDG-027', category: 'Realty', business: 'construction', claim: 'Realty geography', wording: 'SDG develops commercial and residential projects across key locations in Hyderabad.', ...SHEET, order: 50 },
  { factId: 'WEB-25', category: 'Realty', business: 'construction', claim: 'Experience', value: '10+ years', wording: 'Over a decade of experience in innovative and futuristic residential and commercial spaces.', ...WEB, source: 'sdg.in Constructions page', order: 51 },
  // Paper
  { factId: 'SDG-039', category: 'Paper', business: 'paper', claim: 'Team', value: '250', wording: 'Suvarna Durga Paper Boards has a team of 250 professionals.', ...SHEET, order: 60, source: 'Fact sheet. sdg.in still says 200.' },
  { factId: 'SDG-041', category: 'Paper', business: 'paper', claim: 'Paper machines', value: '2', wording: 'The paper business operates two paper machines of distinctive advantage.', ...SHEET, order: 61 },
  { factId: 'WEB-30', category: 'Paper', business: 'paper', claim: 'Capacity', value: '600 TPD', wording: 'Suvarna Durga Paper grew from 20 to 600 tonnes per day in a very short period.', ...WEB, source: 'sdg.in Paper page', order: 62 },
  { factId: 'SDG-044', category: 'Paper', business: 'paper', claim: 'Burst factor', value: '18–28 BF', wording: 'Kraft paper is produced in the 18 to 28 BF range.', ...SHEET, order: 63, source: 'Fact sheet. sdg.in says 14 to 28 BF.' },
  { factId: 'SDG-045', category: 'Paper', business: 'paper', claim: 'Grammage', value: '100–250 GSM', wording: 'Kraft paper is produced from 100 to 250 GSM.', ...SHEET, order: 64 },
  { factId: 'SDG-043', category: 'Paper', business: 'paper', claim: 'Markets', wording: 'The paper business supplies packaging-industry customers across Telangana, Andhra Pradesh, Tamil Nadu, Karnataka and Maharashtra.', ...SHEET, order: 65 },
  { factId: 'WEB-31', category: 'Paper', business: 'paper', claim: 'Revenue growth', value: '₹75 Cr', wording: 'Paper revenues grew from ₹9 crore to ₹75 crore in seven years.', ...WEB, source: 'sdg.in Paper page', order: 66 },
  { factId: 'WEB-32', category: 'Paper', business: 'paper', claim: 'Growth rate', value: '35.38%', wording: 'A compound annual growth rate of 35.38% in the paper business.', ...WEB, source: 'sdg.in Paper page', order: 67 },
  { factId: 'WEB-33', category: 'Paper', business: 'paper', claim: 'Customers', wording: 'One of the leading suppliers to corrugated box manufacturers.', ...WEB, source: 'sdg.in Paper page', order: 68 },
  { factId: 'SDG-040', category: 'Paper', business: 'paper', claim: 'Market position', wording: 'One of the largest manufacturers of kraft paper in South India.', status: 'draft', order: 69, source: 'Fact sheet: supporting evidence required before publication (sdg.in publishes the claim).' },
  // Bottle recycling
  { factId: 'SDG-050', category: 'Bottle Recycling', business: 'glass', claim: 'Warehouses', value: '11', wording: 'The recycling network includes 11 warehouses across Telangana and Andhra Pradesh.', ...SHEET, order: 70, source: 'Fact sheet. sdg.in says 12.' },
  { factId: 'SDG-048', category: 'Bottle Recycling', business: 'glass', claim: 'Full-time team', value: '100', wording: 'Suvarna Durga Bottles has 100 full-time team members.', ...SHEET, order: 71 },
  { factId: 'SDG-049', category: 'Bottle Recycling', business: 'glass', claim: 'Self-employed youth', value: '250', wording: 'The recycling network supports 250 self-employed youth.', ...SHEET, order: 72 },
  { factId: 'WEB-40', category: 'Bottle Recycling', business: 'glass', claim: 'Per-warehouse capacity', value: '3M+', wording: 'Each dedicated warehouse can handle more than 3 million bottles a month.', ...WEB, source: 'sdg.in Bottles page', order: 73 },
  { factId: 'WEB-41', category: 'Bottle Recycling', business: 'glass', claim: 'Transport fleet', value: '32', wording: 'SDG owns and operates 32 transportation vehicles for smooth supply to its customers.', ...WEB, source: 'sdg.in Bottles page', order: 74 },
  { factId: 'WEB-42', category: 'Bottle Recycling', business: 'glass', claim: 'Customer contracts', wording: 'Exclusive contracts with all of its customers give a steady flow of bottles.', ...WEB, source: 'sdg.in Bottles page', order: 75 },
  { factId: 'WEB-43', category: 'Bottle Recycling', business: 'glass', claim: 'Automation', wording: 'A pilot automated bottle washing and cleaning plant tests quality, durability and operational efficiency.', ...WEB, source: 'sdg.in Bottles page', order: 76 },
  { factId: 'SDG-053', category: 'Bottle Recycling', business: 'glass', claim: 'Market share', wording: '65% of the Telangana and Andhra Pradesh market.', status: 'draft', order: 77, source: 'Fact sheet: evidence and methodology required; "will discuss" (sdg.in publishes the claim).' },
  // Agro products
  { factId: 'WEB-50', category: 'Agro Products', business: 'agro', claim: 'Sourcing states', value: '7', wording: 'A sourcing network across Andhra Pradesh, Telangana, Chhattisgarh, Maharashtra, Karnataka, Madhya Pradesh and Odisha.', ...WEB, source: 'sdg.in Agro Products page', order: 80 },
  { factId: 'WEB-51', category: 'Agro Products', business: 'agro', claim: 'Products', wording: 'Rejection rice, broken rice, maize and DDGS, delivered on time across India.', ...WEB, source: 'sdg.in Agro Products page', order: 81 },
  { factId: 'WEB-52', category: 'Agro Products', business: 'agro', claim: 'Revenue growth', value: '₹178 Cr', wording: 'Agro revenues grew from ₹128.31 crore to ₹178.32 crore in just two years.', ...WEB, source: 'sdg.in Agro Products page', order: 82 },
  { factId: 'WEB-53', category: 'Agro Products', business: 'agro', claim: 'Growth rate', value: '17.89%', wording: 'A compound annual growth rate of 17.89% in agro products.', ...WEB, source: 'sdg.in Agro Products page', order: 83 },
  // CSR
  { factId: 'WEB-60', category: 'CSR & Sustainability', business: 'group', claim: 'Group Trust', value: '2016', wording: 'The Suvarna Durga Group Trust was set up in 2016.', ...WEB, source: 'sdg.in CSR page', order: 90 },
  { factId: 'WEB-61', category: 'CSR & Sustainability', business: 'group', claim: 'Scholarships', value: '20', wording: 'Twenty deserving students receive a scholarship of ₹20,000 each to complete their undergraduate studies.', ...WEB, source: 'sdg.in CSR page', order: 91 },
  { factId: 'WEB-62', category: 'CSR & Sustainability', business: 'group', claim: 'School', value: '3,000 sq ft', wording: 'The Trust refurbished a Zilla Parishad High School in LB Nagar and built a new 3,000 sq ft first-floor facility for its students.', ...WEB, source: 'sdg.in CSR page', order: 92 },
  { factId: 'WEB-63', category: 'CSR & Sustainability', business: 'group', claim: 'Indirect employment', wording: 'By the nature of its work and dealings, the Group has generated thousands of individual entrepreneurs through indirect employment.', ...WEB, source: 'sdg.in CSR page', order: 93 },
] as const

const SALES = 'An SDG consultant confirms this directly so you get an accurate answer. Book a site visit or request a call and we will come back within working hours.'

export const PRINIA_FAQS = [
  { q: 'What is the project location?', a: 'SDG Prinia is in Kismatpur, south-west Hyderabad.' },
  { q: 'What configurations are available?', a: 'Prinia is an exclusive 3 BHK community. Homes come in 2,466, 2,499 and 2,577 sq ft.' },
  { q: 'What is the size of the apartments?', a: 'Three sizes: 2,466, 2,499 and 2,577 sq ft, all 3 BHK.' },
  { q: 'What is the price?', a: SALES, restricted: true },
  { q: 'What is the price per sq ft?', a: SALES, restricted: true },
  { q: 'How many floors does the building have?', a: 'Two basements, five podium levels and 45 residential floors in each of the two towers.' },
  { q: 'How many units are there?', a: '344 homes across two towers.' },
  { q: 'Are all apartments 3 BHK?', a: 'Yes. Prinia is an exclusive 3 BHK community.' },
  { q: 'What is the group profile?', a: 'Suvarna Durga Group is a diversified business group with four business interests: construction and realty, paper manufacturing, glass bottle recycling and agro products, with origins in 1978 and a team of 800+.' },
  { q: 'What is the background of the developer?', a: 'SDG traces its origins to 1978, when Sri Jakkireddy Subba Reddy started the business. The Group entered construction and realty in 2011 and has completed VSD Tech Park in the Financial District and Centrum on the Golden Mile.' },
  { q: 'Are all apartments corner units?', a: 'Yes. Each floor has four all-corner flats.' },
  { q: 'What amenities are available?', a: 'More than fifty amenities spread across four levels above the elevated podium. The full list is in the project brochure.' },
  { q: 'What is the parking arrangement?', a: 'Parking is in the two basement levels. Allocation is confirmed with your consultant at booking.' },
  { q: 'What is the possession timeline?', a: 'The RERA registration states September 2030. A consultant confirms the current schedule.', restricted: true },
  { q: 'What is the RERA number?', a: 'P02400010277.' },
  { q: 'What are the payment plans?', a: SALES, restricted: true },
  { q: 'What is the booking amount?', a: SALES, restricted: true },
  { q: 'Is a home loan available?', a: SALES, restricted: true },
  { q: 'Which banks are associated?', a: SALES, restricted: true },
  { q: 'Can I schedule a site visit?', a: 'Yes. Use the Book a site visit button on this page; visits run Monday to Saturday, 09:30 to 18:30.' },
  { q: 'What is the construction status?', a: 'Under construction. Progress is updated by the project team through the admin.' },
  { q: 'What are the nearby locations and landmarks?', a: 'Kismatpur sits in south-west Hyderabad with quick access to the Outer Ring Road. Your consultant can walk you through the neighbourhood on a visit.' },
  { q: 'Which past projects has SDG completed?', a: 'VSD Tech Park in the Financial District and SDG Centrum on the Golden Mile, Kokapet, both completed, and Blue Oak Prime and Blue Oak Elite in Krishna Lanka, Vijayawada.' },
] as const

/** Desk emails are placeholders until SDG names the mailboxes; the phone is the published corporate number. */
export const CONSULTANTS = [
  { name: 'Construction sales desk', email: 'sales-construction@sdg.in', phone: '+91 9013 292929', businesses: ['construction'], enquiryTypes: ['home', 'commercial'], locations: ['Kokapet', 'Kismatpur', 'Raidurg', 'Financial District'] },
  { name: 'Paper trade desk', email: 'trade@sdg.in', phone: '+91 9013 292929', businesses: ['paper'], enquiryTypes: ['paper-trade'], locations: ['Sangareddy'] },
  { name: 'Glass operations desk', email: 'glass@sdg.in', phone: '+91 9013 292929', businesses: ['glass'], enquiryTypes: ['glass-supply'], locations: ['Hyderabad'] },
] as const

export const DOCUMENTS = [
  {
    title: 'SDG Group profile', kind: 'company-profile', business: 'group',
    text: `Suvarna Durga Group (SDG) is a diversified business group with four distinct business interests: construction and realty (Suvarna Durga Constructions), paper manufacturing (Suvarna Durga Paper), glass bottle recycling (Suvarna Durga Bottles) and agro products (Suvarna Durga Agro Products). SDG describes itself as a leader in all that it does, and a brand whose promise is as good as gold.

SDG traces its origins to 1978, when Sri Jakkireddy Subba Reddy, a farmer's son from the village of Vinukonda, started the business in his individual capacity, trading waste paper. Milestones: 1997 bottle recycling begins; 2005 a network of entrepreneurs across Telangana and Andhra Pradesh; 2010 paper manufacturing; 2011 construction and realty; 2012 bottling turnover reaches ₹100 crore; 2017 agro products; 2018 turnover of ₹250 crore in bottling and ₹75 crore in paper, and the launch of VSD Tech Park (32 floors, over 1 million sq ft) in the Financial District; 2023 launch of Trilight (56 floors, 2.2 million sq ft) at Kokapet; 2025 the corporate office moves to VSD Tech Park and Premise (G+8, 1.1 lakh sq ft) launches at Raidurg; 2026 launch of Prinia, an exclusive 3 BHK community of two towers and 344 homes at Kismatpur.

SDG has a team of 800+ employees. The paper business produces 175,000 tonnes of paper per annum. The realty portfolio includes over 6 million sq ft under development across key locations in Hyderabad. For over 25 years B2B buyers have seen SDG as a preferred business partner, trusted to deliver as promised with the highest quality standards, absolute transparency and ethical dealings.

Values: integrity, honesty and transparency; keeping people at the centre of things; inclusive and responsible growth; delivering value.

Leadership: Dr. J. Srinivasa Reddy, Managing Director (MBBS, MD, MBA from ISB), developed the Group multifold and founded the construction and realty vertical. Directors: P. Koti Reddy (bottling and recycling), J. Subhaskara Reddy, M.Com (sales, procurement and operations in paper), J. Sanjeev Reddy, B.Tech (construction; helped achieve the ₹200 crore target in the first fiscal year) and J. Chandrasekhar Reddy, MS USA (oversees Suvarna Durga Paper Mills). Ajay Kumar Bansal, B.Com, is Partner for Constructions. Management team: Akshay Reddy, Director (IIM Indore); Hari Prakash, Executive Director (20+ years in real estate consulting); MLV Sastry, Senior GM Sales (Bottles and Agri, three decades with the family).

Corporate social responsibility: the Suvarna Durga Group Trust, set up in 2016, awards 20 students a scholarship of ₹20,000 each for undergraduate studies and refurbished a Zilla Parishad High School in LB Nagar with a new 3,000 sq ft first-floor facility. The Group has generated thousands of individual entrepreneurs through indirect employment.

Corporate office: VSD Tech Park, 30 & 31 Floor (West Block), Survey No. 142, Financial District, Hyderabad 500032. Email info@sdg.in. Phone +91 9013 292929.`,
  },
  {
    title: 'SDG Prinia fact sheet', kind: 'fact-sheet', business: 'construction', projectSlug: 'prinia',
    text: `SDG Prinia is a premium residential project in Kismatpur, Hyderabad, launched in 2026. RERA registration number P02400010277. Status: under construction. Possession as per RERA: September 2030.

Prinia is an exclusive 3 BHK community of 344 homes across two towers. Each tower has two basements, five podium levels and 45 residential floors, with a 3.3 metre floor-to-floor height. Saleable area is 8.6 lakh sq ft.

Homes come in three sizes: 2,466, 2,499 and 2,577 sq ft. Every floor has four all-corner flats. The podium is uniquely elevated, and more than fifty amenities are spread across four levels.

Parking is in the two basement levels. Site visits run Monday to Saturday, 09:30 to 18:30 IST.`,
  },
  {
    title: 'SDG Centrum and VSD Tech Park fact sheet', kind: 'fact-sheet', business: 'construction',
    text: `SDG Centrum, Golden Mile Layout Road, Kokapet, Hyderabad 500075. RERA P02400006073. Completed and fully owned by SDG Group. Grade A warm shell and fully furnished office spaces. Four basements, ground and seventeen floors. Saleable area 4.3 lakh sq ft. Floor plates from 18,000 to 32,000 sq ft. Floor-to-floor height 3.9 metres. IGBC Platinum pre-certification. Occupiers include Unykloud and Lanarsy.

VSD Tech Park, Survey No. 142, Financial District, Nanakramguda, Hyderabad 500032. RERA P02400001907. Completed in 2018 and now leasing: the tallest IT park in the heart of progress, built by SDG and Vamsiram for global capability centres. Grade A warm shell and fully furnished office spaces across 31 floors with four basements. 1.1 million sq ft of leasable area. Floor plates from 11,000 to 42,000 sq ft. Features: Grade A IT building, luxury retail spaces, 100% power back-up, centralised air conditioning, fire fighting systems, one car park for every 1,000 sq ft, 22 passenger and 2 service elevators, access control for office spaces and a double-glazed glass facade. SDG's corporate office is on the 30th and 31st floors of the West Block. Occupiers include Starbucks, CDSL, Zaggle, Sonata, Techwave, Anand Rathi, Evergent, Monocept, ADTech, Dadus, eYantra, UnyKloud, QMart, Solunus, TechStar, Tenet and The Liquor Story.

SDG Premise, Raidurg near the Biodiversity junction. RERA P02400009718. Ongoing, launched 2025. Resplendent boutique commercial spaces: two basements, ground and eight floors, 1.1 lakh sq ft saleable, floor plates 13,000 to 20,055 sq ft.

Trilight, Golden Mile, Kokapet. RERA P02400005390. A partner project launched in 2023: 462 uber-luxury 3, 4 and 5 BHK residences across three towers of 56, 46 and 49 floors, 2.2 million sq ft, three clubhouses across one lakh sq ft, IGBC Platinum pre-certification.

Completed earlier in Krishna Lanka, Vijayawada: Blue Oak Prime, a residential project of 25,000 sq ft built-up area completed in 2014, and Blue Oak Elite, luxury apartments of 15,000 sq ft built-up area completed in 2019.`,
  },
  {
    title: 'SDG Paper product sheet', kind: 'product', business: 'paper',
    text: `Suvarna Durga Paper Boards Pvt Ltd and Suvarna Durga Paper Mills Pvt Ltd manufacture machine-finished kraft paper at Malkapur/Mucharla village, Hathnoora mandal, Sangareddy district, Telangana 502296.

Product: MF kraft paper in natural and golden shades, 18 to 28 BF, 100 to 250 GSM, made on two paper machines of distinctive advantage. Certifications: FSC and RoHS. Capacity grew from 20 to 600 tonnes per day in a very short period; revenues grew from ₹9 crore to ₹75 crore in seven years, a compound annual growth rate of 35.38%.

Industries served: corrugation (one of the leading suppliers to corrugated box manufacturers), paper plates, paper bags and wrapping paper. Markets: Telangana, Andhra Pradesh, Tamil Nadu, Karnataka and Maharashtra. Customers include BN Corru Packaging, Purnachandra Packaging, Vinayaka Industries, Dhanalaxmi, Vasantha and Carlsberg India. The paper business produces 175,000 tonnes per annum and has a team of 250 professionals.

Trade enquiries: tell us the grade, GSM, BF, quantity per month and delivery location; the trade desk replies with availability and a quotation within one working day.`,
  },
  {
    title: 'SDG Bottles overview', kind: 'product', business: 'glass',
    text: `Suvarna Durga Bottles Pvt Ltd recovers and recycles empty glass bottles through a robust and strategically located network of 11 warehouses across Telangana and Andhra Pradesh, including Batasingaram, Shadnagar, Bachupally, Jeedimetla, Pragnyapur, Pebbair and Sangareddy. Each dedicated warehouse can handle more than 3 million bottles a month, and the Group owns and operates 32 transportation vehicles. Exclusive contracts with all of its customers give a steady flow of bottles.

The bottle cycle: recovery of empties from distributors, hotels and retail returns; sorting by shape, size and colour to each filler's specification; soak, caustic wash and rinse; drying and light inspection with chipped, cracked or stained bottles rejected; palletising; warehousing; and return to the distillery or brewery line. A pilot automated washing and cleaning plant tests quality, durability and operational efficiency, with more plants to be automated.

Customers include United Spirits, ABD, ABV, Sentini, Carlsberg India, BIRA 91, ND and Brindavan. The business has 100 full-time team members and supports 250 self-employed youth. Supply and offtake enquiries: tell us the bottle type, volume per month and location.`,
  },
  {
    title: 'SDG Agro Products overview', kind: 'product', business: 'agro',
    text: `Suvarna Durga Agro Products Pvt Ltd entered agri products trading in 2017 to leverage the Group's core strengths of procurement and supply-chain management. It is a sustainable and synergistic business with a procurement network extending to grassroots level.

Products: rejection rice, broken rice, maize and DDGS, procured at source, transported and quality-checked, and delivered on time across India at attractive, competitive prices. Sourcing network: Andhra Pradesh, Telangana, Chhattisgarh, Maharashtra, Karnataka, Madhya Pradesh and Odisha. Revenues grew from ₹128.31 crore to ₹178.32 crore in two years, a compound annual growth rate of 17.89%.

For sellers: a better selling price for the farmer, negligible middleman dealings, acknowledged expertise in supply-chain management. For buyers: superior quality, consistent and timely delivery, attractive pricing and just-in-time supply so no capital is locked up. Customers include Nadhi Bio, ABD, Priviage, Pioneer, Pearl Distillery and Sentini.

Enquiries: use the contact form and choose Group; the enquiry is routed to the agro team.`,
  },
] as const
