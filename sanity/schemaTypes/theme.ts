import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

// A Theme groups pre-made designs (e.g. "Zomer 2025"). Inside the briefing flow,
// the account manager picks a theme and then a specific design from it for each
// asset instance. Designs are intentionally NOT tagged by asset type — the asset
// type is already fixed by the briefing block the design is chosen in.
export const theme = defineType({
  name: 'theme',
  title: 'Theme & Designs',
  type: 'document',
  icon: () => '🎨',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'theme' }),
    defineField({
      name: 'title',
      title: 'Theme name',
      type: 'string',
      description: 'e.g. "Zomercampagne 2025", "Solden", "Black Friday"',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'season',
      title: 'Season / Quarter',
      type: 'string',
      options: { list: ['Q1', 'Q2', 'Q3', 'Q4', 'Year-round'].map((v) => ({ title: v, value: v })) },
    }),
    defineField({
      name: 'subjects',
      title: 'Subject tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'subject' }] }],
      description: 'Used by the subject filter chips to narrow which themes show in the Design tab.',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Theme thumbnail',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional cover image for the theme.',
    }),
    defineField({
      name: 'designs',
      title: 'Designs',
      type: 'array',
      description: 'Designs grouped under this theme. Pick existing Design documents, or create a new one inline.',
      of: [{ type: 'reference', to: [{ type: 'design' }] }],
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to hide this theme without deleting it',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'season', media: 'thumbnail', designs: 'designs' },
    prepare: ({ title, subtitle, media, designs }) => ({
      title,
      subtitle: `${subtitle ? subtitle + ' · ' : ''}${(designs?.length ?? 0)} design${(designs?.length ?? 0) !== 1 ? 's' : ''}`,
      media,
    }),
  },
})
