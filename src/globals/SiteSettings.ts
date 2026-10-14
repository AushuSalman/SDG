import type { GlobalConfig } from 'payload'

import { canEditContent } from '@/lib/access'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: { group: 'Content' },
  access: { read: () => true, update: canEditContent },
  fields: [
    { name: 'groupName', type: 'text', defaultValue: 'Suvarna Durga Group' },
    { name: 'shortName', type: 'text', defaultValue: 'SDG' },
    { name: 'tagline', type: 'text', defaultValue: 'Three businesses. One forward vision.' },
    { type: 'row', fields: [
      { name: 'phone', type: 'text', defaultValue: '+91 40 4000 1978' },
      { name: 'whatsapp', type: 'text', defaultValue: '914040001978', admin: { description: 'Digits only, with country code' } },
      { name: 'email', type: 'email', defaultValue: 'hello@sdg.in' },
    ] },
    { name: 'hoursText', type: 'text', defaultValue: 'Mon–Sat, 09:30 – 18:30 IST' },
    { name: 'headOffice', type: 'textarea', defaultValue: 'VSD Tech Park, Survey No. 142, Financial District, Nanakramguda, Hyderabad 500032' },
    {
      name: 'consultHours',
      type: 'group',
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
      admin: { description: 'Assistant limits. Budget alerts fire when monthly tokens pass the cap.' },
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { type: 'row', fields: [
          { name: 'monthlyTokenCap', type: 'number', defaultValue: 50_000_000 },
          { name: 'sessionTurnCap', type: 'number', defaultValue: 20 },
          { name: 'retentionDays', type: 'number', defaultValue: 365, admin: { description: 'Chat log retention. Agreed with SDG in M1.' } },
        ] },
        { name: 'handoffMessage', type: 'textarea', defaultValue: 'That is something an SDG consultant confirms directly, so you get an accurate answer. I can arrange a call or a site visit now.' },
      ],
    },
    { name: 'social', type: 'array', fields: [
      { type: 'row', fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ] },
    ] },
  ],
}
