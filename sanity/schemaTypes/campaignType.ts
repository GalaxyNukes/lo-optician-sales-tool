import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

// Library filter categories — the campaign "Asset type". Managed here so the filter
// chips in the Library can be added, removed, renamed or recoloured without code edits.
// (Distinct from `assetType`, which drives the Step 3 briefing field sets.)
export const campaignType = defineType({
  name: 'campaignType',
  title: 'Asset Type (Library filter)',
  type: 'document',
  icon: () => '🏷️',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'campaignType' }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Shown as the filter chip in the Library, e.g. "Digital advertising".',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'color',
      title: 'Accent color (hex)',
      type: 'string',
      description: 'Filter-chip dot + card/badge accent. e.g. #1A9E7E  #2A4E8B  #8B3A2A  #6B2A8B  #8B6B2A',
      initialValue: '#0D2340',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to hide this filter without deleting it',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'color' },
    prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle || '' }),
  },
})
