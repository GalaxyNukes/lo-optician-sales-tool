import { defineField, defineType } from 'sanity'

export const need = defineType({
  name: 'need',
  title: 'Asset Need',
  type: 'document',
  icon: () => '📦',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "Social Media campaign", "Google ADS", "Printed materials"',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'briefingBlockType',
      title: 'Briefing block type',
      type: 'string',
      description: 'Which briefing block this need triggers',
      options: {
        list: [
          { title: 'Stickering & Artist Impression', value: 'af-sticker' },
          { title: 'Banners & Vlaggen', value: 'af-banner' },
          { title: 'Print & Drukwerk', value: 'af-print' },
          { title: 'Social Media', value: 'af-social' },
          { title: 'Landingspagina', value: 'af-landing' },
          { title: 'E-mailcampagne', value: 'af-email' },
          { title: 'Video', value: 'af-video' },
          { title: 'None', value: 'none' },
        ],
      },
    }),
    defineField({
      name: 'linkedAssetFilters',
      title: 'Linked asset filter tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Which campaign asset filter tags this need corresponds to. Campaigns matching any of these tags will be shown when this need is selected.',
      options: {
        list: [
          { title: 'Meta ADS', value: 'Meta ADS' },
          { title: 'Google ADS', value: 'Google ADS' },
          { title: 'Flyer', value: 'Flyer' },
          { title: 'Banner', value: 'Banner' },
          { title: 'Stickering', value: 'Stickering' },
          { title: 'Reboard', value: 'Reboard' },
          { title: 'Lightbox', value: 'Lightbox' },
        ],
      },
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
    defineField({ name: 'order', title: 'Display order', type: 'number' }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: { select: { title: 'label', subtitle: 'briefingBlockType' }, prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle || 'No briefing block' }) },
})
