import type { CollectionConfig } from 'payload'

/**
 * One-time passcodes for forms and portal login. Hidden from the admin; a TTL index on expiresAt
 * (created at init) removes rows automatically, so no Redis is needed at this volume.
 */
export const Otps: CollectionConfig = {
  slug: 'otps',
  admin: { hidden: true },
  access: {
    read: () => false,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'phone', type: 'text', required: true, index: true },
    { name: 'purpose', type: 'select', required: true, options: ['enquiry', 'portal'] },
    { name: 'codeHash', type: 'text', required: true },
    { name: 'salt', type: 'text', required: true },
    { name: 'expiresAt', type: 'date', required: true, index: true },
    { name: 'attempts', type: 'number', defaultValue: 0 },
    { name: 'verified', type: 'checkbox', defaultValue: false },
    { name: 'ip', type: 'text', index: true },
  ],
}
