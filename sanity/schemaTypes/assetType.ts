import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

// Step 3 asset types. Each maps to a frontend field set via `key`, and to an
// accent/grouping bucket via `blockType`. Managed here so labels/subtitles/icons
// and ordering can change without code edits.
export const assetType = defineType({
  name: 'assetType',
  title: 'Asset Type',
  type: 'document',
  icon: () => '🧱',
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: 'assetType' }),
    defineField({
      name: 'label',
      title: 'Label (NL)',
      type: 'string',
      description: 'Shown on the Step 3 card, e.g. "Flyer (A4/A5/A6)"',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Ondertitel',
      type: 'string',
      description: 'Short subtitle under the label, e.g. "Papier, oriëntatie en designwensen"',
    }),
    defineField({
      name: 'key',
      title: 'Deliverable key',
      type: 'string',
      description: 'Which deliverable this maps to. Must match a deliverable key in components/deliverables.ts. Drives the briefing fields when a campaign package is opened from the Library.',
      options: {
        list: [
          'flyer', 'leaflet', 'banner', 'poster', 'voucher', 'sticker',
          'storefront', 'reboard', 'digiscreen',
          'billboard', 'flag', 'lightbox',
          'social', 'email', 'other',
        ].map((v) => ({ title: v, value: v })),
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'blockType',
      title: 'Block type (legacy)',
      type: 'string',
      description: 'Legacy grouping bucket — no longer drives the UI (the deliverable key does). Kept for backward compatibility.',
      options: {
        list: [
          { title: '🖨️ Print', value: 'af-print' },
          { title: '🛒 POS & retail', value: 'af-pos' },
          { title: '🌆 Outdoor', value: 'af-outdoor' },
          { title: '📱 Social', value: 'af-social' },
          { title: '✉️ Email', value: 'af-email' },
        ],
      },
    }),
    defineField({
      name: 'icon',
      title: 'Icon (emoji)',
      type: 'string',
      description: 'Emoji shown on the Step 3 card, e.g. 🖨️',
    }),
    defineField({
      name: 'heroImage',
      title: 'Inspiratiebeeld (optioneel)',
      type: 'image',
      options: { hotspot: true },
      description: 'Klein inspiratiebeeld bovenaan de briefinggroep (bv. voor POS).',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Uncheck to hide this asset type without deleting it',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'key', media: 'icon' },
    prepare: ({ title, subtitle }) => ({ title, subtitle: subtitle || 'No field set' }),
  },
})
