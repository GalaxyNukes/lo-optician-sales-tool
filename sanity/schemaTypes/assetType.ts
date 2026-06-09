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
      title: 'Field set key',
      type: 'string',
      description: 'Determines which briefing fields show for this asset. Must match a key the frontend knows.',
      options: {
        list: [
          'social-meta', 'social-google',
          'print-flyer', 'print-poster', 'print-dm',
          'banner-outdoor', 'banner-lightbox', 'banner-vlag',
          'sticker-etalage', 'pos',
          'email', 'landing', 'video',
          'partner-branding', 'other',
        ].map((v) => ({ title: v, value: v })),
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'blockType',
      title: 'Block type (accent / grouping)',
      type: 'string',
      options: {
        list: [
          { title: '🪟 Sticker / in-store', value: 'af-sticker' },
          { title: '🚩 Banner / outdoor', value: 'af-banner' },
          { title: '🖨️ Print', value: 'af-print' },
          { title: '📱 Social', value: 'af-social' },
          { title: '🌐 Landing', value: 'af-landing' },
          { title: '✉️ Email', value: 'af-email' },
          { title: '🎬 Video', value: 'af-video' },
          { title: '🧩 Other', value: 'af-other' },
        ],
      },
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon (emoji)',
      type: 'string',
      description: 'Emoji shown on the Step 3 card, e.g. 🖨️',
    }),
    defineField({
      name: 'linkedAssetFilters',
      title: 'Linked asset filters',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Reference tags (kept for parity with the legacy need taxonomy).',
      options: {
        list: [
          'Meta ADS', 'Google ADS',
          'Flyer A4/A5/A6', 'Poster A1-A3', 'DM',
          'Banner', 'Spandoek', 'Vlag', 'Reboard', 'Lightbox',
          'Stickering', 'POS',
          'Email', 'Video', 'Landing Page',
        ].map((v) => ({ title: v, value: v })),
      },
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
