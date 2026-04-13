import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export const need = defineType({
  name: 'need',
  title: 'Asset Need',
  type: 'document',
  icon: () => '📦',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'need' }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "A4 Flyer", "Instagram Post", "Window Banner", "Vlag"',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'briefingBlockType',
      title: 'Briefing block type',
      type: 'string',
      description: 'Which briefing block this need triggers when selected',
      options: {
        list: [
          { title: '🪟 Partnerbranding', value: 'af-sticker' },
          { title: '🚩 Banners, lightboxes & Vlaggen', value: 'af-banner' },
          { title: '🖨️ Print & Drukwerk', value: 'af-print' },
          { title: '📱 Socialmediacampagne', value: 'af-social' },
          { title: '🌐 Landingspagina', value: 'af-landing' },
          { title: '✉️ E-mailcampagne', value: 'af-email' },
          { title: '🎬 Video', value: 'af-video' },
          { title: '🧩 Anderen', value: 'af-other' },
          { title: '— None', value: 'none' },
        ],
      },
    }),
    defineField({
      name: 'linkedAssetFilters',
      title: 'Linked campaign asset filters',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Campaigns tagged with any of these will appear when this need is selected.',
      options: {
        list: [
          // Digital
          { title: 'Meta ADS', value: 'Meta ADS' },
          { title: 'Google ADS', value: 'Google ADS' },
          // Print formats
          { title: 'Flyer', value: 'Flyer' },
          { title: 'Flyer A6', value: 'Flyer A6' },
          { title: 'Flyer A5', value: 'Flyer A5' },
          { title: 'Flyer A4', value: 'Flyer A4' },
          { title: 'Poster A3', value: 'Poster A3' },
          { title: 'Poster A2', value: 'Poster A2' },
          { title: 'Poster A1', value: 'Poster A1' },
          { title: 'DM / Direct mail', value: 'DM' },
          // Banners & outdoor
          { title: 'Banner', value: 'Banner' },
          { title: 'Spandoek', value: 'Spandoek' },
          { title: 'Vlag', value: 'Vlag' },
          { title: 'Reboard', value: 'Reboard' },
          { title: 'Lightbox', value: 'Lightbox' },
          // In-store
          { title: 'Stickering', value: 'Stickering' },
          { title: 'POS', value: 'POS' },
          // Other
          { title: 'Email', value: 'Email' },
          { title: 'Video', value: 'Video' },
          { title: 'Landing Page', value: 'Landing Page' },
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
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'briefingBlockType' },
    prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle || 'No briefing block' }),
  },
})
