import { defineField, defineType } from 'sanity'

export const visualStyle = defineType({
  name: 'visualStyle',
  title: 'Visual Style',
  type: 'document',
  icon: () => '🎨',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "Lifestyle", "Lifestyle + Product", "Illustrative"',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number' }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'label' } },
})
