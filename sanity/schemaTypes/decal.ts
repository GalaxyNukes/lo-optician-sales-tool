import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

// A reusable sticker decal for the storefront mockup tool. Opticians don't upload
// raw PNGs — they pick from this curated library (logos, quotes, badges, specials)
// and drag them onto their storefront photo.
export const decal = defineType({
  name: 'decal',
  title: 'Storefront Decal',
  type: 'document',
  icon: () => '🩷',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'decal' }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "Logo wit", "−30% badge", "Zomeractie quote"',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Logo variant', value: 'logo' },
          { title: 'Quote variant', value: 'quote' },
          { title: 'Badge', value: 'badge' },
          { title: 'Special decal', value: 'special' },
        ],
        layout: 'radio',
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'lang',
      title: 'Taal',
      type: 'string',
      description: 'Voor taalspecifieke decals (bv. quotes). Kies "Taalneutraal" voor logos/badges zonder tekst — die tonen altijd.',
      options: {
        list: [
          { title: 'Taalneutraal (beide)', value: 'both' },
          { title: 'Nederlands (NL)', value: 'nl' },
          { title: 'Frans (FR)', value: 'fr' },
        ],
        layout: 'radio',
      },
      initialValue: 'both',
    }),
    defineField({
      name: 'image',
      title: 'Decal (transparent PNG)',
      type: 'image',
      description: 'Use a transparent PNG so it sits cleanly on the storefront photo.',
      options: { hotspot: false },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to hide this decal without deleting it',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'category', media: 'image' },
  },
})
