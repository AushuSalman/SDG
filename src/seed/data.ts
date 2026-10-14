/**
 * Seed content from the client's approved material: SDG_Master_Fact_Sheet_Draft_v1.xlsx (approvals by
 * Akshay, 10 Oct 2026) and SDG_Website_Questionnaire.docx. Anything not approved there is either left
 * out or marked draft / do-not-publish so it never reaches the site or the assistant.
 */

export const PROJECTS = [
  {
    name: 'SDG Prinia', slug: 'prinia', business: 'construction', category: 'residential', status: 'ongoing',
    location: 'Kismatpur', rera: 'P02400010277', possession: 'Sep 2030, as per RERA', sdgRole: 'developer',
    tagline: 'An exclusive 3 BHK community on an elevated podium.',
    summary: 'Prinia is a premium residential project in Kismatpur: 344 homes across two towers, four all-corner flats on every floor, and more than fifty amenities spread across four levels above a uniquely elevated podium.',
    specs: { towers: 2, floors: '2 basements + 5 podium levels + 45 floors', units: 344, saleableArea: '8.6 lakh sq ft', floorHeight: '3.3 m floor to floor' },
    configurations: [{ label: '3 BHK', sizeSqft: 2466 }, { label: '3 BHK', sizeSqft: 2499 }, { label: '3 BHK', sizeSqft: 2577 }],
    highlights: ['Exclusive 3 BHK community', 'Four all-corner flats per floor', '50+ amenities across 4 levels', 'Uniquely elevated podium', 'Under construction'],
    featured: true, order: 1,
  },
  {
    name: 'SDG Premise', slug: 'premise', business: 'construction', category: 'commercial', status: 'ongoing',
    location: 'Raidurg, near Biodiversity', rera: 'P02400009718', sdgRole: 'developer',
    tagline: 'Resplendent boutique workspaces in Raidurg.',
    summary: 'Premise brings boutique office space to Raidurg, near the Biodiversity junction: two basements, ground and eight floors with floor plates from 13,000 to 20,055 sq ft.',
    specs: { floors: '2 basements + ground + 8 floors', saleableArea: '1.1 lakh sq ft', floorPlate: '13,000 to 20,055 sq ft' },
    highlights: ['Boutique commercial spaces', 'Near the Biodiversity junction'],
    order: 2,
  },
  {
    name: 'SDG Centrum', slug: 'centrum', business: 'construction', category: 'commercial', status: 'completed',
    location: 'Golden Mile, Kokapet', address: 'Golden Mile Layout Road, Kokapet, Hyderabad, Telangana 500075',
    rera: 'P02400006073', sdgRole: 'developer',
    tagline: 'Grade A warm shell and fully furnished offices on the Golden Mile.',
    summary: 'Centrum is a completed, fully SDG-owned office development at Golden Mile, Kokapet: four basements, ground and seventeen floors, IGBC Platinum pre-certified, with floor plates from 18,000 to 32,000 sq ft and a 3.9 m floor-to-floor height.',
    specs: { floors: '4 basements + ground + 17 floors', saleableArea: '4.3 lakh sq ft', floorPlate: '18,000 to 32,000 sq ft', floorHeight: '3.9 m', certification: 'IGBC Platinum pre-certification' },
    highlights: ['Fully owned by SDG Group', 'Grade A warm shell and fully furnished options', 'Occupiers include Unykloud and Lanarsy'],
    order: 3,
  },
  {
    name: 'VSD Tech Park', slug: 'vsd-tech-park', business: 'construction', category: 'commercial', status: 'completed',
    location: 'Financial District, Nanakramguda', address: 'Survey No. 142, Financial District, Nanakramguda, Hyderabad 500032',
    rera: 'P02400001907', sdgRole: 'developer',
    tagline: 'Grade A warm shell offices in the Financial District. Home to SDG\'s head office.',
    summary: 'VSD Tech Park is a completed 31-floor office tower with four basements and floor plates from 11,000 to 42,000 sq ft, offering 1.1 million sq ft of leasable Grade A warm shell space.',
    specs: { floors: 'Ground + 4 basements + 31 floors', saleableArea: '1.1 million sq ft leasable', floorPlate: '11,000 to 42,000 sq ft' },
    highlights: ['1.1 million sq ft leasable', 'SDG head office', 'Occupiers include Starbucks, CDSL, Zaggle, Sonata and Techwave'],
    order: 4,
  },
  {
    name: 'Trilight', slug: 'trilight', business: 'construction', category: 'residential', status: 'ongoing',
    location: 'Golden Mile, Kokapet', rera: 'P02400005390', sdgRole: 'partner',
    tagline: 'Uber-luxury 3, 4 and 5 BHK residences on the Golden Mile.',
    summary: 'Trilight is a partner project at Golden Mile, Kokapet: 462 residences across three towers of 56, 46 and 49 floors, three clubhouses spread across one lakh sq ft, and IGBC Platinum pre-certification.',
    specs: { towers: 3, floors: '56 / 46 / 49 floors', units: 462, saleableArea: '2.2 million sq ft', certification: 'IGBC Platinum pre-certification' },
    configurations: [
      { label: '3 BHK', sizeSqft: 2888 }, { label: '4 BHK', sizeSqft: 3666 }, { label: '4 BHK', sizeSqft: 4777 }, { label: '5 BHK', sizeSqft: 5777 },
      { label: 'Limited edition', sizeSqft: 10111 }, { label: 'Limited edition', sizeSqft: 11333 },
    ],
    highlights: ['Three clubhouses across 1 lakh sq ft', 'IGBC Platinum pre-certification', 'Partner project'],
    order: 5,
  },
] as const

export const FACTS = [
  { factId: 'SDG-002', category: 'Corporate Identity', business: 'group', claim: 'Brand name', wording: 'Suvarna Durga Group (SDG).', status: 'approved', order: 1 },
  { factId: 'SDG-003', category: 'Corporate Identity', business: 'group', claim: 'Group description', wording: 'SDG is a diversified business group with interests across construction and realty, paper manufacturing, bottle recycling and agri products.', status: 'approved', order: 2 },
  { factId: 'SDG-005', category: 'Corporate Identity', business: 'group', claim: 'Founder', wording: 'The foundations of Suvarna Durga Group were laid by Sri Jakkireddy Subba Reddy, who started the business in his individual capacity in 1978.', status: 'approved', order: 3 },
  { factId: 'SDG-008', category: 'Corporate Identity', business: 'group', claim: 'Values', wording: 'Integrity, honesty, transparency, people-centricity, responsible growth and value creation guide the Group.', status: 'approved', order: 4 },
  { factId: 'SDG-004', category: 'History & Timeline', business: 'group', claim: 'Since', value: '1978', wording: 'Suvarna Durga Group (SDG) traces its origins to 1978.', status: 'approved', showOnHome: true, order: 10 },
  { factId: 'SDG-010', category: 'History & Timeline', business: 'glass', claim: 'Bottle recycling', value: '1997', wording: 'Bottle recycling became an SDG business in 1997.', status: 'approved', order: 11 },
  { factId: 'SDG-011', category: 'History & Timeline', business: 'paper', claim: 'Paper manufacturing', value: '2010', wording: 'SDG entered paper manufacturing in 2010.', status: 'approved', order: 12 },
  { factId: 'SDG-012', category: 'History & Timeline', business: 'construction', claim: 'Construction and realty', value: '2011', wording: 'SDG entered construction and realty in 2011.', status: 'approved', order: 13 },
  { factId: 'SDG-013', category: 'History & Timeline', business: 'group', claim: 'Agro products', value: '2017', wording: 'SDG entered agro products in 2017.', status: 'approved', order: 14 },
  { factId: 'SDG-006', category: 'Group Metrics', business: 'group', claim: 'Employees', value: '800+', wording: 'SDG has a team of 800+ employees.', status: 'approved', showOnHome: true, order: 20 },
  { factId: 'SDG-020', category: 'Group Metrics', business: 'paper', claim: 'Tonnes of paper a year', value: '175,000', wording: 'SDG\'s paper business produces 175,000 tonnes of paper per annum.', status: 'approved', showOnHome: true, order: 21 },
  { factId: 'SDG-021', category: 'Group Metrics', business: 'construction', claim: 'Sq ft under development', value: '6M+', wording: 'SDG\'s realty portfolio includes over 6 million sq ft under development.', status: 'approved', showOnHome: true, order: 22 },
  { factId: 'SDG-018', category: 'Group Metrics', business: 'glass', claim: 'Bottles recycled a month', value: '5 million', wording: 'Over 5 million bottles are recycled every month.', status: 'do-not-publish', order: 23, source: 'Workbook: Website Approved Facts says Do not publish; three other sheets say 5 million. Awaiting one answer from SDG.' },
  { factId: 'SDG-027', category: 'Realty', business: 'construction', claim: 'Realty geography', wording: 'SDG develops commercial and residential projects across key locations in Hyderabad.', status: 'approved', order: 30 },
  { factId: 'SDG-039', category: 'Paper', business: 'paper', claim: 'Team', value: '250', wording: 'Suvarna Durga Paper Boards has a team of 250 professionals.', status: 'approved', order: 40 },
  { factId: 'SDG-041', category: 'Paper', business: 'paper', claim: 'Paper machines', value: '2', wording: 'The paper business operates two paper machines.', status: 'approved', order: 41 },
  { factId: 'SDG-044', category: 'Paper', business: 'paper', claim: 'Burst factor', value: '18–28 BF', wording: 'Kraft paper is produced in the 18 to 28 BF range.', status: 'approved', order: 42 },
  { factId: 'SDG-045', category: 'Paper', business: 'paper', claim: 'Grammage', value: '100–250 GSM', wording: 'Kraft paper is produced from 100 to 250 GSM.', status: 'approved', order: 43 },
  { factId: 'SDG-043', category: 'Paper', business: 'paper', claim: 'Markets', wording: 'The paper business supplies packaging-industry customers across Telangana, Andhra Pradesh, Tamil Nadu, Karnataka and Maharashtra.', status: 'approved', order: 44 },
  { factId: 'SDG-040', category: 'Paper', business: 'paper', claim: 'Market position', wording: 'One of the largest manufacturers of kraft paper in South India.', status: 'draft', order: 45, source: 'Supporting evidence required before publication.' },
  { factId: 'SDG-050', category: 'Bottle Recycling', business: 'glass', claim: 'Warehouses', value: '11', wording: 'The recycling network includes 11 warehouses across Telangana and Andhra Pradesh.', status: 'approved', order: 50 },
  { factId: 'SDG-048', category: 'Bottle Recycling', business: 'glass', claim: 'Full-time team', value: '100', wording: 'Suvarna Durga Bottles has 100 full-time team members.', status: 'approved', order: 51 },
  { factId: 'SDG-049', category: 'Bottle Recycling', business: 'glass', claim: 'Self-employed youth', value: '250', wording: 'The recycling network supports 250 self-employed youth.', status: 'approved', order: 52 },
  { factId: 'SDG-053', category: 'Bottle Recycling', business: 'glass', claim: 'Market share', wording: '65% of the Telangana and Andhra Pradesh market.', status: 'draft', order: 53, source: 'Evidence and methodology required; "will discuss".' },
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
  { q: 'What is the group profile?', a: 'Suvarna Durga Group is a diversified business group with interests across construction and realty, paper manufacturing, bottle recycling and agri products, with origins in 1978 and a team of 800+.' },
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
  { q: 'Which past projects has SDG completed?', a: 'VSD Tech Park in the Financial District and SDG Centrum on the Golden Mile, Kokapet, both completed.' },
] as const

export const CONSULTANTS = [
  { name: 'Construction sales desk', email: 'sales-construction@sdg.in', phone: '+91 40 4000 1978', businesses: ['construction'], enquiryTypes: ['home', 'commercial'], locations: ['Kokapet', 'Kismatpur', 'Raidurg', 'Financial District'] },
  { name: 'Paper trade desk', email: 'trade@sdg.in', phone: '+91 40 4000 1978', businesses: ['paper'], enquiryTypes: ['paper-trade'], locations: ['Sangareddy'] },
  { name: 'Glass operations desk', email: 'glass@sdg.in', phone: '+91 40 4000 1978', businesses: ['glass'], enquiryTypes: ['glass-supply'], locations: ['Hyderabad'] },
] as const

export const DOCUMENTS = [
  {
    title: 'SDG Group profile', kind: 'company-profile', business: 'group',
    text: `Suvarna Durga Group (SDG) is a diversified business group with interests across construction and realty, paper manufacturing, bottle recycling and agri products.

SDG traces its origins to 1978, when Sri Jakkireddy Subba Reddy started the business in his individual capacity, trading waste paper. Bottle recycling followed in 1997, paper manufacturing in 2010, construction and realty in 2011 and agro products in 2017.

SDG has a team of 800+ employees. The paper business produces 175,000 tonnes of paper per annum. The realty portfolio includes over 6 million sq ft under development across key locations in Hyderabad.

Values: integrity, honesty, transparency, people-centricity, responsible growth and value creation guide the Group.

Leadership: Dr. J. Srinivasa Reddy, Managing Director (MBBS, MD, MBA from ISB), developed the Group multifold and founded the construction and realty vertical. Directors: J. Sanjeev Reddy (B.Tech), P. Koti Reddy, J. Subhaskara Reddy (M.Com) and J. Chandrasekhar Reddy (MS, USA), who oversees Suvarna Durga Paper Mills.

Head office: VSD Tech Park, Survey No. 142, Financial District, Nanakramguda, Hyderabad 500032.`,
  },
  {
    title: 'SDG Prinia fact sheet', kind: 'fact-sheet', business: 'construction', projectSlug: 'prinia',
    text: `SDG Prinia is a premium residential project in Kismatpur, Hyderabad. RERA registration number P02400010277. Status: under construction. Possession as per RERA: September 2030.

Prinia is an exclusive 3 BHK community of 344 homes across two towers. Each tower has two basements, five podium levels and 45 residential floors, with a 3.3 metre floor-to-floor height. Saleable area is 8.6 lakh sq ft.

Homes come in three sizes: 2,466, 2,499 and 2,577 sq ft. Every floor has four all-corner flats. The podium is uniquely elevated, and more than fifty amenities are spread across four levels.

Parking is in the two basement levels. Site visits run Monday to Saturday, 09:30 to 18:30 IST.`,
  },
  {
    title: 'SDG Centrum and VSD Tech Park fact sheet', kind: 'fact-sheet', business: 'construction',
    text: `SDG Centrum, Golden Mile Layout Road, Kokapet, Hyderabad 500075. RERA P02400006073. Completed and fully owned by SDG Group. Grade A warm shell and fully furnished office spaces. Four basements, ground and seventeen floors. Saleable area 4.3 lakh sq ft. Floor plates from 18,000 to 32,000 sq ft. Floor-to-floor height 3.9 metres. IGBC Platinum pre-certification. Occupiers include Unykloud and Lanarsy.

VSD Tech Park, Survey No. 142, Financial District, Nanakramguda, Hyderabad 500032. RERA P02400001907. Completed. Grade A warm shell office spaces across 31 floors with four basements. 1.1 million sq ft of leasable area. Floor plates from 11,000 to 42,000 sq ft. SDG's head office is here. Occupiers include Starbucks, CDSL, Zaggle, Sonata, Techwave, Anand Rathi, Evergent and Monocept.

SDG Premise, Raidurg near the Biodiversity junction. RERA P02400009718. Ongoing. Boutique commercial spaces: two basements, ground and eight floors, 1.1 lakh sq ft saleable, floor plates 13,000 to 20,055 sq ft.

Trilight, Golden Mile, Kokapet. RERA P02400005390. A partner project of 462 uber-luxury 3, 4 and 5 BHK residences across three towers of 56, 46 and 49 floors, 2.2 million sq ft, three clubhouses across one lakh sq ft, IGBC Platinum pre-certification.`,
  },
  {
    title: 'SDG Paper product sheet', kind: 'product', business: 'paper',
    text: `Suvarna Durga Paper Boards Pvt Ltd and Suvarna Durga Paper Mills Pvt Ltd manufacture machine-finished kraft paper at Malkapur/Mucharla village, Hathnoora mandal, Sangareddy district, Telangana 502296.

Product: MF kraft paper in natural and golden shades, 18 to 28 BF, 100 to 250 GSM, made on two paper machines. Certifications: FSC and RoHS.

Industries served: corrugation, paper plates, paper bags and wrapping paper. Markets: Telangana, Andhra Pradesh, Tamil Nadu, Karnataka and Maharashtra. The paper business produces 175,000 tonnes per annum and has a team of 250 professionals.

Trade enquiries: tell us the grade, GSM, BF, quantity per month and delivery location; the trade desk replies with availability and a quotation within one working day.`,
  },
  {
    title: 'SDG Bottles overview', kind: 'product', business: 'glass',
    text: `Suvarna Durga Bottles Pvt Ltd recovers and recycles empty glass bottles through a network of 11 warehouses across Telangana and Andhra Pradesh, including Batasingaram, Shadnagar, Bachupally, Jeedimetla, Pragnyapur, Pebbair and Sangareddy.

The bottle cycle: recovery of empties from distributors, hotels and retail returns; sorting by shape, size and colour to each filler's specification; soak, caustic wash and rinse; drying and light inspection with chipped, cracked or stained bottles rejected; palletising; warehousing; and return to the distillery or brewery line.

The business has 100 full-time team members and supports 250 self-employed youth. Supply and offtake enquiries: tell us the bottle type, volume per month and location.`,
  },
] as const
