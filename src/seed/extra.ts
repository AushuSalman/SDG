/**
 * Layout-review content for the sections the wireframe carries but the client has not yet supplied:
 * articles, open roles and testimonials. Every record is flagged `sample`, which shows a "Sample" chip on
 * the site, so marketing can replace them from the admin without touching code.
 */

const text = (t: string) => ({ type: 'text', text: t, format: 0, detail: 0, mode: 'normal', style: '', version: 1 })
const para = (t: string) => ({ type: 'paragraph', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, textFormat: 0, textStyle: '', children: [text(t)] })
export const richText = (paras: string[]) => ({ root: { type: 'root', format: '' as const, indent: 0, version: 1, direction: 'ltr' as const, children: paras.map(para) } })

export const POSTS = [
  {
    title: 'What handover day should feel like', slug: 'what-handover-day-should-feel-like', business: 'construction', readMinutes: 5, publishedAt: '2026-09-18',
    excerpt: 'Keys, documents, a walk through every room and a snag list that gets closed. How SDG plans the last day of a project so it feels like the first day at home.',
    body: ['Handover is the day a project stops being ours and becomes yours. We plan it like a milestone, not a formality.', 'Every buyer walks the home with the site team, records anything that needs attention, and leaves with a dated snag list. The same team stays on until that list is closed.', 'This article is placeholder content for layout review. SDG supplies the final text through the admin.'],
    cover: 'homedusk',
  },
  {
    title: 'Choosing the right kraft grade for your line', slug: 'choosing-the-right-kraft-grade', business: 'paper', readMinutes: 4, publishedAt: '2026-09-04',
    excerpt: 'GSM sets the weight, BF sets the strength. A short guide to matching the reel to the box you make, from 100 to 250 GSM and 18 to 28 BF.',
    body: ['Grammage and burst factor are the two numbers every corrugator asks about first. Together they decide how a sheet forms, prints and stacks.', 'SDG kraft runs from 100 to 250 GSM and 18 to 28 BF. Talk to the trade desk about your deckle and we match the reel to the line.', 'This article is placeholder content for layout review. SDG supplies the final text through the admin.'],
    cover: 'papermill',
  },
  {
    title: 'Where a returned bottle actually goes', slug: 'where-a-returned-bottle-goes', business: 'glass', readMinutes: 6, publishedAt: '2026-08-22',
    excerpt: 'Recovery, sorting, washing, inspection and the trip back to the filler: the cycle behind SDG\'s bottle network across Telangana and Andhra Pradesh.',
    body: ['A bottle does not have to be broken to be recycled. Most of the empties we collect are washed, inspected and returned to the line that filled them.', 'Eleven warehouses across Telangana and Andhra Pradesh hold the stock until the filler calls for it.', 'This article is placeholder content for layout review. SDG supplies the final text through the admin.'],
    cover: 'cullet',
  },
] as const

export const JOBS = [
  { title: 'Project Manager, Residential', business: 'construction', location: 'Kismatpur', type: 'full-time', order: 1 },
  { title: 'Site Engineer', business: 'construction', location: 'Kokapet', type: 'full-time', order: 2 },
  { title: 'Sales Consultant, Homes', business: 'construction', location: 'Hyderabad', type: 'full-time', order: 3 },
  { title: 'Shift In-charge, Paper Machine', business: 'paper', location: 'Sangareddy', type: 'full-time', order: 4 },
  { title: 'Quality Lab Technician', business: 'paper', location: 'Sangareddy', type: 'full-time', order: 5 },
  { title: 'Warehouse Operations Lead', business: 'glass', location: 'Shadnagar', type: 'full-time', order: 6 },
  { title: 'Collection Partnerships Executive', business: 'glass', location: 'Hyderabad', type: 'full-time', order: 7 },
] as const

export const TESTIMONIALS = [
  { quote: 'Handover was on the committed date, and the snag list was closed within a week.', name: 'Resident', role: 'SDG home, 2024', business: 'construction', order: 1 },
  { quote: 'The site team walked us through every stage of construction, and the portal kept the paperwork in one place.', name: 'Buyer', role: 'Prinia, Kismatpur', business: 'construction', order: 2 },
  { quote: 'Reels arrive on the schedule we agreed, tested, every time. That reliability is why we moved our volume to SDG.', name: 'Operations head', role: 'Packaging converter, Vijayawada', business: 'paper', order: 3 },
] as const
