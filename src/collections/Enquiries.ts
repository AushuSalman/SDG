import type { CollectionConfig } from 'payload'

import { canSeeCustomers } from '@/lib/access'
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
  admin: {
    useAsTitle: 'id',
    group: 'Relationships',
    defaultColumns: ['customer', 'type', 'project', 'band', 'score', 'status', 'createdAt'],
  },
  access: {
    read: canSeeCustomers,
    create: canSeeCustomers,
    update: canSeeCustomers,
    delete: ({ req }) => req.user?.role === 'super-admin',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
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
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        const id = String(doc.id)
        // Everything outbound goes through the job queue so a CRM or WhatsApp outage never loses a lead.
        await req.payload.jobs.queue({ task: 'propfloSync', input: { enquiryId: id } })
        await req.payload.jobs.queue({ task: 'whatsappSend', input: { enquiryId: id, template: 'enquiry_ack' } })
        await req.payload.jobs.queue({ task: 'consultantAllocate', input: { enquiryId: id } })
        return doc
      },
    ],
  },
  fields: [
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
      { name: 'budgetBand', type: 'select', options: [...BUDGET_BANDS] },
      { name: 'timeline', type: 'select', options: [...TIMELINES] },
    ] },
    { type: 'row', fields: [
      { name: 'preferredLocation', type: 'text' },
      { name: 'configuration', type: 'text', admin: { description: 'e.g. 3 BHK, or area for commercial' } },
      { name: 'loanRequired', type: 'select', defaultValue: 'unknown', options: ['yes', 'no', 'unknown'] },
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
          { name: 'utmSource', type: 'text' },
          { name: 'utmMedium', type: 'text' },
          { name: 'utmCampaign', type: 'text' },
        ] },
        { type: 'row', fields: [
          { name: 'utmContent', type: 'text' },
          { name: 'utmTerm', type: 'text' },
          { name: 'landingPage', type: 'text' },
        ] },
        { name: 'referrer', type: 'text' },
      ],
    },
    { type: 'row', fields: [
      { name: 'otpVerified', type: 'checkbox', defaultValue: false, admin: { readOnly: true } },
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
    { name: 'scoreReasons', type: 'array', admin: { readOnly: true }, fields: [{ name: 'reason', type: 'text' }] },
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
      name: 'crm',
      type: 'group',
      admin: { description: 'PropFlo sync, performed by the job queue with retries' },
      fields: [
        { type: 'row', fields: [
          { name: 'propfloId', type: 'text', admin: { readOnly: true } },
          { name: 'syncStatus', type: 'select', defaultValue: 'pending', options: ['pending', 'synced', 'failed', 'skipped'], admin: { readOnly: true } },
          { name: 'syncedAt', type: 'date', admin: { readOnly: true } },
        ] },
        { name: 'lastError', type: 'text', admin: { readOnly: true } },
      ],
    },
    {
      name: 'acknowledgement',
      type: 'group',
      fields: [
        { type: 'row', fields: [
          { name: 'whatsappStatus', type: 'select', defaultValue: 'pending', options: ['pending', 'sent', 'failed', 'skipped'], admin: { readOnly: true } },
          { name: 'whatsappAt', type: 'date', admin: { readOnly: true } },
        ] },
      ],
    },
  ],
}
