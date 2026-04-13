import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export const subject = defineType({
  name: 'subject',
  title: 'Subject Filter',
  type: 'document',
  icon: () => '🏷️',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'subject' }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "Spring", "Summer", "Myopia", "Optician focused"',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'label' } },
})
