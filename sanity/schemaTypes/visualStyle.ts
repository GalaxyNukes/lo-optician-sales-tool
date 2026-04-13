import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export const visualStyle = defineType({
  name: 'visualStyle',
  title: 'Visual Style',
  type: 'document',
  icon: () => '🎨',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'visualStyle' }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "Lifestyle", "Lifestyle + Product", "Illustrative"',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'label' } },
})
