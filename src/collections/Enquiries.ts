import type { CollectionConfig } from 'payload'

import { canSeeCustomers } from '@/lib/access'
import { runQueueSoon } from '@/lib/queue'
import { scoreEnquiry } from '@/lib/scoring'

export const ENQUIRY_TYPES = [
  { label: 'Home buyer', value: 'home' },
  { label: 'Commercial space', value: 'commercial' },
  { label: 'Paper trade', value: 'paper-trade' },
  { label: 'Glass supply / offtake', value: 'glass-supply' },
  { label: 'Careers', value: 'careers' },
  { label: 'General', value: 'general' },
] as const

export const BUDGET_BANDS = [
  { label: 'Under ₹1 Cr', value: 'under-1cr' },
  { label: '₹1 – 2 Cr', value: '1-2cr' },
  { label: '₹2 – 4 Cr', value: '2-4cr' },
  { label: '₹4 Cr and above', value: '4cr-plus' },
  { label: 'Prefer not to say', value: 'undisclosed' },
] as const

export const TIMELINES = [
  { label: 'Within 3 months', value: '0-3m' },
  { label: '3 to 6 months', value: '3-6m' },
  { label: '6 to 12 months', value: '6-12m' },
  { label: 'More than a year', value: '12m-plus' },
  { label: 'Just exploring', value: 'exploring' },
] as const

export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    useAsTitle: 'title',
    group: 'Enquiries & customers',
    description: 'Every lead from the site forms and the AI assistant, with its score and status. Update the status as the conversation moves on.',
    defaultColumns: ['title', 'type', 'project', 'band', 'score', 'status', 'createdAt'],
    listSearchableFields: ['title', 'message', 'preferredLocation', 'configuration'],
  },
  access: {
    read: canSeeCustomers,
    create: canSeeCustomers,
    update: canSeeCustomers,
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        const result = scoreEnquiry({
          type: data.type,
          budgetBand: data.budgetBand,
          timeline: data.timeline,
          purpose: data.purpose,
          visitReady: data.visitReady,
          locationGiven: Boolean(data.preferredLocation || data.project),
          loanRequired: data.loanRequired,
          otpVerified: data.otpVerified,
          quantityGiven: Boolean(data.quantity),
          recurring: data.recurring,
        })
        data.score = result.score
        data.band = result.band
        data.scoreReasons = result.reasons.map((reason) => ({ reason }))
        // Title for the admin list and page header: who, and what about.
        try {
          const customerId = typeof data.customer === 'object' && data.customer ? data.customer.id : data.customer
          const projectId = typeof data.project === 'object' && data.project ? data.project.id : data.project
          const [customer, project] = await Promise.all([
            customerId ? req.payload.findByID({ collection: 'customers', id: customerId, depth: 0, overrideAccess: true }) : null,
            projectId ? req.payload.findByID({ collection: 'projects', id: projectId, depth: 0, overrideAccess: true }) : null,
          ])
          const who = customer?.name || customer?.phone || 'Enquiry'
          const what = project?.name || ENQUIRY_TYPES.find((t) => t.value === data.type)?.label || data.business || ''
          data.title = what ? `${who} · ${what}` : who
        } catch {
          // The title is cosmetic; never block a lead on it.
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        const id = String(doc.id)
        // Everything outbound goes through the job queue so a CRM or WhatsApp outage never loses a lead.
        if (operation === 'create') {
          await req.payload.jobs.queue({ task: 'crmSync', input: { enquiryId: id } })
          await req.payload.jobs.queue({ task: 'whatsappSend', input: { enquiryId: id, template: 'enquiry_ack' } })
          await req.payload.jobs.queue({ task: 'consultantAllocate', input: { enquiryId: id } })
        }
        // A scheduler request goes on the consultant's calendar once the visitor has verified their number.
        const verifiedNow = Boolean(doc.otpVerified) && (operation === 'create' || !previousDoc?.otpVerified)
        const booking = verifiedNow && doc.meeting?.date && doc.meeting?.time && doc.meeting?.calendarStatus !== 'booked'
        if (booking) await req.payload.jobs.queue({ task: 'calendarBook', input: { enquiryId: id } })
        if (operation === 'create' || booking) runQueueSoon(req.payload)
        return doc
      },
    ],
  },
  fields: [
    // Set by the beforeChange hook from the customer and the project; what the admin shows as the record's name.
    { name: 'title', type: 'text', admin: { hidden: true } },
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true, index: true },
    { type: 'row', fields: [
      {
        name: 'business',
        type: 'select',
        required: true,
        defaultValue: 'construction',
        options: ['construction', 'paper', 'glass', 'group'],
      },
      { name: 'type', type: 'select', required: true, options: [...ENQUIRY_TYPES] },
      { name: 'project', type: 'relationship', relationTo: 'projects' },
    ] },
    { type: 'row', fields: [
      {
        name: 'purpose',
        type: 'select',
        options: [
          { label: 'End use', value: 'end-use' },
          { label: 'Investment', value: 'investment' },
          { label: 'Business requirement', value: 'business' },
        ],
      },
      { name: 'budgetBand', type: 'select', label: 'Budget', options: [...BUDGET_BANDS] },
      { name: 'timeline', type: 'select', options: [...TIMELINES] },
    ] },
    { type: 'row', fields: [
      { name: 'preferredLocation', type: 'text' },
      { name: 'configuration', type: 'text', admin: { description: 'e.g. 3 BHK, or area for commercial' } },
      { name: 'loanRequired', type: 'select', label: 'Home loan needed', defaultValue: 'unknown', options: ['yes', 'no', 'unknown'] },
    ] },
    { type: 'row', fields: [
      { name: 'quantity', type: 'text', admin: { description: 'Paper or glass: required quantity' } },
      { name: 'recurring', type: 'checkbox', defaultValue: false, admin: { description: 'Recurring requirement (paper trade)' } },
      { name: 'visitReady', type: 'checkbox', defaultValue: false, label: 'Ready to visit' },
    ] },
    { name: 'message', type: 'textarea' },
    {
      name: 'source',
      type: 'group',
      label: 'Where the lead came from',
      fields: [
        {
          name: 'channel',
          type: 'select',
          defaultValue: 'website',
          options: [
            'website', 'whatsapp', 'google-ads', 'meta-ads', 'instagram', 'channel-partner',
            'walk-in', 'event', 'prop-ai-bot', 'other',
          ],
        },
        { type: 'row', fields: [
          { name: 'utmSource', type: 'text', label: 'UTM source' },
          { name: 'utmMedium', type: 'text', label: 'UTM medium' },
          { name: 'utmCampaign', type: 'text', label: 'UTM campaign' },
        ] },
        { type: 'row', fields: [
          { name: 'utmContent', type: 'text', label: 'UTM content' },
          { name: 'utmTerm', type: 'text', label: 'UTM term' },
          { name: 'landingPage', type: 'text' },
        ] },
        { name: 'referrer', type: 'text' },
      ],
    },
    { type: 'row', fields: [
      { name: 'otpVerified', type: 'checkbox', label: 'OTP verified', defaultValue: false, admin: { readOnly: true } },
      { name: 'consent', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
    ] },
    {
      name: 'score',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true, description: 'Rules-based (questionnaire Q17 weights)' },
    },
    {
      name: 'band',
      type: 'select',
      admin: { position: 'sidebar', readOnly: true },
      options: ['hot', 'warm', 'cold'],
    },
    { name: 'scoreReasons', type: 'array', label: 'Why this score', admin: { readOnly: true }, fields: [{ name: 'reason', type: 'text' }] },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      admin: { position: 'sidebar' },
      options: [
        'new', 'contacted', 'visit-booked', 'proposal', 'negotiation', 'booked', 'closed-lost',
      ],
    },
    { name: 'consultant', type: 'relationship', relationTo: 'consultants', admin: { position: 'sidebar' } },
    {
      name: 'meeting',
      type: 'group',
      label: 'Meeting request',
      admin: { description: 'Set by the Book a meeting page. Once the number is verified the slot is booked on the consultant\'s connected Outlook calendar.' },
      fields: [
        { type: 'row', fields: [
          { name: 'date', type: 'text', admin: { description: 'YYYY-MM-DD' } },
          { name: 'time', type: 'text', admin: { description: 'HH:MM IST' } },
          { name: 'mode', type: 'text', admin: { description: 'e.g. Video call, In person at the site' } },
        ] },
        { type: 'row', fields: [
          { name: 'calendarStatus', type: 'select', label: 'Calendar', defaultValue: 'pending', options: ['pending', 'booked', 'failed', 'skipped'], admin: { readOnly: true } },
          { name: 'bookedAt', type: 'date', label: 'Booked at', admin: { readOnly: true } },
          { name: 'eventId', type: 'text', label: 'Outlook event ID', admin: { readOnly: true } },
        ] },
        { name: 'eventLink', type: 'text', label: 'Open in Outlook', admin: { readOnly: true } },
        { name: 'joinUrl', type: 'text', label: 'Teams link', admin: { readOnly: true } },
        { name: 'lastError', type: 'text', label: 'Last error', admin: { readOnly: true } },
      ],
    },
    {
      name: 'crm',
      type: 'group',
      label: 'CRM sync',
      admin: { description: 'Pushed to the CRM (PropFlo, or HubSpot on staging) by the job queue with retries' },
      fields: [
        { type: 'row', fields: [
          { name: 'provider', type: 'text', label: 'CRM', admin: { readOnly: true } },
          { name: 'leadId', type: 'text', label: 'CRM lead ID', admin: { readOnly: true } },
          { name: 'syncStatus', type: 'select', label: 'Sync status', defaultValue: 'pending', options: ['pending', 'synced', 'failed', 'skipped'], admin: { readOnly: true } },
          { name: 'syncedAt', type: 'date', label: 'Synced at', admin: { readOnly: true } },
        ] },
        { name: 'lastError', type: 'text', label: 'Last error', admin: { readOnly: true } },
      ],
    },
    {
      name: 'acknowledgement',
      type: 'group',
      label: 'WhatsApp acknowledgement',
      fields: [
        { type: 'row', fields: [
          { name: 'whatsappStatus', type: 'select', label: 'WhatsApp status', defaultValue: 'pending', options: ['pending', 'sent', 'failed', 'skipped'], admin: { readOnly: true } },
          { name: 'whatsappAt', type: 'date', label: 'Sent at', admin: { readOnly: true } },
        ] },
      ],
    },
  ],
}
