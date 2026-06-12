import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

// A reusable design (a pre-made visual). Grouped into Themes for the briefing Design
// tab, and referenced by Campaigns so a campaign can ship as a package of
// asset-type + design pairs. Decoupled from asset types (a design is asset-agnostic).
export const design = defineType({
  name: 'design',
  title: 'Design',
  type: 'document',
  icon: () => '🖼️',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'design' }),
    defineField({
      name: 'title',
      title: 'Design name',
      type: 'string',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'image',
      title: 'Design image',
      type: 'image',
      options: { hotspot: true },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'previewVideo',
      title: 'Scroll-preview (mp4, optioneel)',
      type: 'file',
      options: { accept: 'video/mp4' },
      description: 'Alleen gebruikt voor landingspagina-designs.',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to hide this design without deleting it',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image' },
  },
})
