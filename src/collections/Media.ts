import type { CollectionConfig } from 'payload'

import { canEditContent } from '@/lib/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image or file', plural: 'Images & files' },
  admin: { group: 'Website', description: 'Images and files used across the site.', listSearchableFields: ['alt', 'filename'] },
  access: {
    read: () => true,
    create: canEditContent,
    update: canEditContent,
    delete: canEditContent,
  },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumb', width: 480, height: 320, position: 'centre' },
      { name: 'card', width: 960, height: 640, position: 'centre' },
      { name: 'wide', width: 1600 },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Alt text', required: true, admin: { description: 'Describe the image in a few words; read by screen readers and search engines' } },
    { name: 'credit', type: 'text', label: 'Photo credit', admin: { description: 'Shown under the photo in project galleries' } },
  ],
}
