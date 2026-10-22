import type { GlobalConfig } from 'payload'

import { canEditContent } from '@/lib/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Website', description: 'Group name, phone, WhatsApp, email, office hours and the AI assistant\'s limits.' },
  access: { read: () => true, update: canEditContent },
  fields: [
    { name: 'groupName', type: 'text', defaultValue: 'Suvarna Durga Group' },
    { name: 'shortName', type: 'text', label: 'Short name', defaultValue: 'SDG', admin: { description: 'Used in browser-tab titles, e.g. "Projects · SDG Group"' } },
    { name: 'tagline', type: 'text', defaultValue: 'Recycling to Realty. A promise as good as gold.', admin: { description: 'The home-page headline; the first sentence becomes the first line' } },
    { type: 'row', fields: [
      { name: 'phone', type: 'text', defaultValue: '+91 9013 292929' },
      { name: 'whatsapp', type: 'text', label: 'WhatsApp number', defaultValue: '919013292929', admin: { description: 'Digits only, with country code' } },
      { name: 'email', type: 'email', defaultValue: 'info@sdg.in' },
    ] },
    { name: 'hoursText', type: 'text', label: 'Office hours', defaultValue: 'Mon–Sat, 09:30 – 18:30 IST', admin: { description: 'Shown on the home page, the Construction page, the booking forms and the scheduler' } },
    { name: 'headOffice', type: 'textarea', label: 'Head office address', defaultValue: 'VSD Tech Park, 30 & 31 Floor (West Block), Survey No. 142, Financial District, Hyderabad – 500032' },
    // Bumped by the seed when it rewrites content from a new source; hidden because staff never edit it.
    { name: 'contentVersion', type: 'number', admin: { hidden: true } },
    {
      name: 'consultHours',
      type: 'group',
      label: 'Consultation hours',
      admin: { description: 'Bookable slots on the site-visit and meeting forms run hourly between these times' },
      fields: [
        { type: 'row', fields: [
          { name: 'from', type: 'text', defaultValue: '10:00' },
          { name: 'to', type: 'text', defaultValue: '18:00' },
        ] },
      ],
    },
    {
      name: 'ai',
      type: 'group',
      label: 'AI assistant',
      admin: { description: 'Assistant limits. Budget alerts fire when monthly tokens pass the cap.' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { type: 'row', fields: [
          { name: 'monthlyTokenCap', type: 'number', label: 'Monthly token cap', defaultValue: 50_000_000 },
          { name: 'sessionTurnCap', type: 'number', label: 'Turns per conversation', defaultValue: 20 },
          { name: 'retentionDays', type: 'number', label: 'Chat log retention (days)', defaultValue: 365, admin: { description: 'Chat log retention. Agreed with SDG in M1.' } },
        ] },
        { name: 'handoffMessage', type: 'textarea', label: 'Hand-off message', defaultValue: 'That is something an SDG consultant confirms directly, so you get an accurate answer. I can arrange a call or a site visit now.' },
      ],
    },
    { name: 'social', type: 'array', label: 'Social links', admin: { description: 'Shown in the website footer' }, fields: [
      { type: 'row', fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', label: 'URL', required: true },
      ] },
    ] },
  ],
}
