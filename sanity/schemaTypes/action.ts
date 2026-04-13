import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export const action = defineType({
  name: 'action',
  title: 'Campaign Action',
  type: 'document',
  icon: () => '⚡',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'action' }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "10% on EyeDefinition" or "Custom action"',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'isCustom',
      title: 'Is "Custom action"?',
      type: 'boolean',
      description: 'Enable to show a free-text input field when this action is selected',
      initialValue: false,
    }),
    defineField({
      name: 'icon',
      title: 'Icon key',
      type: 'string',
      options: {
        list: [
          { title: 'Hexagon outline', value: 'o' },
          { title: 'Hexagon filled', value: 'f' },
          { title: 'Hexagon split', value: 's' },
          { title: 'Split rectangle', value: 'sp' },
          { title: 'Diamond', value: 'd' },
          { title: 'Circle', value: 'c' },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'active' },
    prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle ? '✅ Active' : '⏸️ Hidden' }),
  },
})
