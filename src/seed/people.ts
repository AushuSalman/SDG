/**
 * Leadership, partners, clients and press coverage, migrated from sdg.in on 21 Oct 2026 (names and qualifications
 * checked against the client's fact sheet, which wins where they differ). Edited in the admin afterwards.
 */
import type { Asset } from './data'

type Business = 'group' | 'construction' | 'paper' | 'glass'
type Section = 'leadership' | 'management'

export const LEADERS: { name: string; role: string; section: Section; business: Business; qualifications?: string; bio: string; order: number }[] = [
  { name: 'Dr. J. Srinivasa Reddy', role: 'Managing Director', section: 'leadership', business: 'group', qualifications: 'MBBS, MD, MBA (ISB)', order: 1,
    bio: 'Has developed the Group multifold, venturing into newer areas and increasing existing capacities, and founded the Suvarna Durga Construction and Realty vertical.' },
  { name: 'P. Koti Reddy', role: 'Director', section: 'leadership', business: 'glass', qualifications: 'BSc / BA', order: 2,
    bio: 'His rich experience in the bottling and recycling domain helps the bottle recycling and paper mill units grow exponentially.' },
  { name: 'J. Subhaskara Reddy', role: 'Director', section: 'leadership', business: 'paper', qualifications: 'M.Com', order: 3,
    bio: 'His experience in sales, procurement and operations drives growth in the paper mills vertical.' },
  { name: 'J. Sanjeev Reddy', role: 'Director', section: 'leadership', business: 'construction', qualifications: 'B.Tech', order: 4,
    bio: 'Played a key role in achieving the ₹200 crore target in the first fiscal year itself. His experience in construction strengthens the Construction and Realty vertical.' },
  { name: 'J. Chandrasekhar Reddy', role: 'Director', section: 'leadership', business: 'paper', qualifications: 'MS (USA)', order: 5,
    bio: 'An engineering graduate who joined the family legacy after his MS from International Technological University, California. He has overseen multiple phases of expansion, built the paper mills\' customer base and manages the day-to-day operations of Suvarna Durga Paper Mills.' },
  { name: 'Ajay Kumar Bansal', role: 'Partner, Constructions', section: 'leadership', business: 'construction', qualifications: 'B.Com', order: 6,
    bio: 'A dynamic entrepreneur who played a pivotal role in transforming an unorganised logistics venture into a ₹150 crore enterprise. His forward-looking leadership and strategic vision helped deliver a range of residential, commercial and villa projects across Hyderabad.' },
  { name: 'Akshay Reddy', role: 'Director', section: 'management', business: 'group', qualifications: 'PGDM (IIM Indore)', order: 10,
    bio: 'A management professional with a post-graduate degree from the Indian Institute of Management, Indore, and close to a decade with a global consulting firm: deal structuring, strategy formulation, project funding and financial feasibility.' },
  { name: 'MLV Sastry', role: 'Senior GM, Sales', section: 'management', business: 'glass', order: 11,
    bio: 'A strong backbone of the Group, associated with the family for over three decades and supporting sales in the Bottles and Agri verticals. His contribution continues to be significant in the Suvarna Durga growth story.' },
  { name: 'Hari Prakash', role: 'Executive Director', section: 'management', business: 'construction', order: 12,
    bio: 'An accomplished real-estate leader with over 20 years in global consulting firms: client relationship management, commercial real estate, residential sales and data centres.' },
]

type PartnerBusiness = 'construction' | 'paper' | 'glass' | 'agro'
export type PartnerSeed = { name: string; summary?: string; business: PartnerBusiness; kind: 'partner' | 'client'; order: number; logo?: Asset }

export const PARTNERS: PartnerSeed[] = [
  { name: 'Home-loan partners', summary: 'Leading banks and HFCs', business: 'construction', kind: 'partner', order: 1 },
  { name: 'Architects & consultants', summary: 'Design partners', business: 'construction', kind: 'partner', order: 2 },
  { name: 'Channel partners', summary: 'Registered brokers', business: 'construction', kind: 'partner', order: 3 },
  { name: 'Interiors & fit-out', summary: 'Turnkey partners', business: 'construction', kind: 'partner', order: 4 },
  { name: 'Packaging converters', summary: 'Trade buyers in five states', business: 'paper', kind: 'partner', order: 1 },
  { name: 'Recovered-fibre suppliers', summary: 'Collection network', business: 'paper', kind: 'partner', order: 2 },
  { name: 'Logistics', summary: 'Reel transport', business: 'paper', kind: 'partner', order: 3 },
  { name: 'Certification', summary: 'FSC and RoHS', business: 'paper', kind: 'partner', order: 4 },
  { name: 'Bottlers & fillers', summary: 'Offtake partners', business: 'glass', kind: 'partner', order: 1 },
  { name: 'Distributors & hotels', summary: 'Return programmes', business: 'glass', kind: 'partner', order: 2 },
  { name: 'Warehouse network', summary: 'Eleven locations, two states', business: 'glass', kind: 'partner', order: 3 },
  { name: 'Self-employed collectors', summary: '250 youth supported', business: 'glass', kind: 'partner', order: 4 },
  { name: 'Farmer network', summary: 'Grassroots procurement in seven states', business: 'agro', kind: 'partner', order: 1 },
  { name: 'Distilleries & feed buyers', summary: 'Rice, maize and DDGS offtake', business: 'agro', kind: 'partner', order: 2 },
]

const logo = (file: string, name: string): Asset => ({ file: `logos/${file}`, alt: `${name} logo` })
const client = (business: PartnerBusiness, name: string, order: number, file?: string, summary?: string): PartnerSeed =>
  ({ name, business, kind: 'client', order, summary, ...(file ? { logo: logo(file, name) } : {}) })

/** Client and occupier logos as published on sdg.in, plus the VSD Tech Park occupiers named in the fact sheet. */
export const CLIENTS: PartnerSeed[] = [
  client('construction', 'ADTech', 1, 'adtech.png', 'VSD Tech Park'), client('construction', 'Dadus', 2, 'dadus.png', 'VSD Tech Park'),
  client('construction', 'eYantra', 3, 'eyantra.png', 'VSD Tech Park'), client('construction', 'UnyKloud', 4, 'unykloud.png', 'VSD Tech Park and Centrum'),
  client('construction', 'Monocept', 5, 'monocept.png', 'VSD Tech Park'), client('construction', 'QMart', 6, 'qmart.png', 'VSD Tech Park'),
  client('construction', 'Solunus', 7, 'solunus.png', 'VSD Tech Park'), client('construction', 'TechStar', 8, 'techstar.png', 'VSD Tech Park'),
  client('construction', 'Tenet', 9, 'tenet.png', 'VSD Tech Park'), client('construction', 'The Liquor Story', 10, 'the-liquor-story.png', 'VSD Tech Park'),
  client('construction', 'Starbucks', 11, undefined, 'VSD Tech Park'), client('construction', 'CDSL', 12, undefined, 'VSD Tech Park'),
  client('construction', 'Zaggle', 13, undefined, 'VSD Tech Park'), client('construction', 'Sonata', 14, undefined, 'VSD Tech Park'),
  client('construction', 'Techwave', 15, undefined, 'VSD Tech Park'), client('construction', 'Anand Rathi', 16, undefined, 'VSD Tech Park'),
  client('construction', 'Evergent', 17, undefined, 'VSD Tech Park'), client('construction', 'Lanarsy', 18, undefined, 'Centrum'),
  client('paper', 'BN Corru Packaging', 1, 'bn-corru.png'), client('paper', 'Purnachandra Packaging', 2, 'purnachandra.png'),
  client('paper', 'Vinayaka Industries', 3, 'vinayaka.png'), client('paper', 'Dhanalaxmi', 4, 'dhanalaxmi.png'),
  client('paper', 'Vasantha', 5, 'vasantha.png'), client('paper', 'Carlsberg India', 6, 'carlsberg-india.png'),
  client('glass', 'United Spirits', 1, 'united-spirits.png'), client('glass', 'ABD', 2, 'abd.png'), client('glass', 'ABV', 3, 'abv.png'),
  client('glass', 'Sentini', 4, 'sentini.png'), client('glass', 'Carlsberg India', 5, 'carlsberg-india.png'), client('glass', 'BIRA 91', 6, 'bira-91.png'),
  client('glass', 'ND', 7, 'nd.png'), client('glass', 'Brindavan', 8, 'brindavan.png'),
  client('agro', 'Nadhi Bio', 1, 'nadhi-bio.png'), client('agro', 'ABD', 2, 'abd.png'), client('agro', 'Priviage', 3, 'priviage.png'),
  client('agro', 'Pioneer', 4, 'pioneer.png'), client('agro', 'Pearl Distillery', 5, 'pearl-distillery.png'), client('agro', 'Sentini', 6, 'sentini.png'),
]

/** Press coverage listed under News & Events on sdg.in; each card opens the publication. */
export const NEWS: { title: string; slug: string; business: 'group' | 'construction'; source: string; url: string; excerpt: string; publishedAt?: string; cover: Asset }[] = [
  { title: 'Sonata Software opens new facility in Hyderabad', slug: 'sonata-software-new-facility-hyderabad', business: 'construction', source: 'SMEStreet',
    url: 'https://smestreet.in/infocus/sonata-software-opens-new-facility-in-hyderabad-9063823',
    excerpt: 'SMEStreet on Sonata Software\'s new Hyderabad facility. Sonata is an occupier at VSD Tech Park.', cover: { file: 'news/article-1.jpg', alt: 'Sonata Software opens a new facility in Hyderabad' } },
  { title: 'M/s De Blueoak & P. Mangatram Properties LLP', slug: 'de-blueoak-mangatram-properties', business: 'construction', source: 'Times Property',
    url: 'https://timesproperty.com/m-s-de-blueoak-p-mangatram-properties-llp-new-projects-blid-1700',
    excerpt: 'Times Property\'s listing for M/s De Blueoak & P. Mangatram Properties LLP and its new projects.', cover: { file: 'news/article-2.jpg', alt: 'De Blueoak and P. Mangatram Properties LLP' } },
  { title: 'With 10 skyscrapers on the anvil, Hyderabad to beat south cities', slug: 'hyderabad-10-skyscrapers', business: 'construction', source: 'The New Indian Express', publishedAt: '2023-08-29',
    url: 'https://www.newindianexpress.com/hyderabad/2023/Aug/29/with-10-skyscrapers-on-the-anvil-hyderabad-to-beat-south-cities-2609603.html',
    excerpt: 'The New Indian Express on the ten skyscrapers planned for Hyderabad and the city\'s rising skyline.', cover: { file: 'news/article-3.jpg', alt: 'Hyderabad skyline with skyscrapers under construction' } },
  { title: 'Trilight hosts art show and vintage car showcase to support child heart care', slug: 'trilight-art-show-vintage-cars', business: 'construction', source: 'Deccan Chronicle',
    url: 'https://www.deccanchronicle.com/southern-states/telangana/hyderabad-trilight-hosts-art-show-vintage-car-showcse-to-support-child-heart-care-1869282',
    excerpt: 'Deccan Chronicle on the art show and vintage car showcase hosted at Trilight in support of child heart care.', cover: { file: 'news/article-5.jpg', alt: 'Art show and vintage car showcase at Trilight' } },
  { title: 'The Trilight Luxury Homes felicitates doctors', slug: 'trilight-felicitates-doctors', business: 'construction', source: 'Deccan Chronicle', publishedAt: '2023-07-04',
    url: 'https://www.deccanchronicle.com/nation/in-other-news/040723/the-trilight-luxury-homes-felicitates-doctors.html',
    excerpt: 'Deccan Chronicle on Trilight Luxury Homes felicitating doctors on Doctors\' Day.', cover: { file: 'news/article-6.jpg', alt: 'Doctors felicitated at Trilight Luxury Homes' } },
  { title: 'Top 10 tallest buildings in Hyderabad to come up in these localities', slug: 'top-10-tallest-buildings-hyderabad', business: 'construction', source: 'Siasat',
    url: 'https://www.siasat.com/top-10-tallest-buildings-in-hyderabad-to-come-up-in-these-localities-2680223/',
    excerpt: 'Siasat on the ten tallest buildings coming up in Hyderabad and where they are being built.', cover: { file: 'news/article-7.jpg', alt: 'Tall buildings under construction in Hyderabad' } },
]

/** Imagery for the Website copy global: founder, galleries and the warehouse map. */
export const COPY_ASSETS = {
  legacyPhoto: { file: 'site/founder.jpg', alt: 'Sri Jakkireddy Subbareddy, founder of Suvarna Durga Group' } as Asset,
  warehouseMap: { file: 'site/warehouse-map.png', alt: 'Map of Suvarna Durga Bottles warehouses across Telangana and Andhra Pradesh' } as Asset,
  officeGallery: [1, 2, 3, 4, 5, 6].map((n): Asset => ({ file: `site/office-0${n}.jpg`, alt: `SDG corporate office at VSD Tech Park, view ${n}` })),
  paperGallery: Array.from({ length: 12 }, (_, i): Asset => ({ file: `galleries/paper-plant-${String(i + 1).padStart(2, '0')}.jpg`, alt: `Suvarna Durga Paper Mills plant and equipment, photo ${i + 1}` })),
  glassGallery: Array.from({ length: 12 }, (_, i): Asset => ({ file: `galleries/bottle-plant-${String(i + 1).padStart(2, '0')}.jpg`, alt: `Suvarna Durga Bottles automated washing plant, photo ${i + 1}` })),
  csrGallery: Array.from({ length: 12 }, (_, i): Asset => ({ file: `galleries/csr-${String(i + 1).padStart(2, '0')}.jpg`, alt: `Suvarna Durga Group Trust activities, photo ${i + 1}` })),
}
