import { defineField, defineType } from 'sanity'

export const subject = defineType({
  name: 'subject',
  title: 'Subject Filter',
  type: 'document',
  icon: () => '🏷️',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "Spring", "Summer", "Myopia", "Optician focused"',
      validation: (R) => R.required(),
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number' }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'label' } },
})
