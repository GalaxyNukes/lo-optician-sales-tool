import { defineField, defineType } from 'sanity'

export const goal = defineType({
  name: 'goal',
  title: 'Marketing Goal',
  type: 'document',
  icon: () => '🎯',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Shown on the selection card, e.g. "Get new customers to shop"',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'labelNL',
      title: 'Label (NL)',
      type: 'string',
      description: 'Dutch translation if needed',
    }),
    defineField({
      name: 'icon',
      title: 'Icon key',
      type: 'string',
      description: 'Internal icon identifier (o, f, s, sp, d, c)',
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
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to hide this goal without deleting it',
      initialValue: true,
    }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'label', subtitle: 'active' }, prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle ? '✅ Active' : '⏸️ Hidden' }) },
})
