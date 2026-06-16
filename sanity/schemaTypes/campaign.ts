import { defineField, defineType } from 'sanity'

export const campaign = defineType({
  name: 'campaign',
  title: 'Campaign',
  type: 'document',
  icon: () => '🗂️',
  groups: [
    { name: 'content',   title: 'Content',   default: true },
    { name: 'media',     title: 'Media' },
    { name: 'targeting', title: 'Targeting & Filters' },
    { name: 'prefill',   title: 'Briefing Prefill' },
    { name: 'meta',      title: 'Meta' },
  ],
  fields: [
    // ── CONTENT ─────────────────────────────────
    defineField({
      name: 'title',
      title: 'Campaign title',
      type: 'string',
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'type',
      title: 'Asset type',
      type: 'reference',
      to: [{ type: 'campaignType' }],
      group: 'content',
      description: 'Library filter category. Manage the list under "Asset Types (Library filters)".',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      group: 'content',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'formats',
      title: 'Included formats',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'content',
      description: 'e.g. "A4 Flyer", "Instagram Post", "Facebook Banner"',
    }),

    // ── MEDIA ────────────────────────────────────
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      description: 'Main card image shown in the campaign grid',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'mockups',
      title: 'Mockup images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      group: 'media',
      description: 'Gallery images shown in the detail overlay (first = main image)',
    }),

    // ── TARGETING ────────────────────────────────
    defineField({
      name: 'goals',
      title: 'Marketing goals',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'goal' }] }],
      group: 'targeting',
      description: 'Which step-1 goals this campaign supports',
    }),
    defineField({
      name: 'visualStyle',
      title: 'Visual style',
      type: 'reference',
      to: [{ type: 'visualStyle' }],
      group: 'targeting',
    }),
    defineField({
      name: 'subjects',
      title: 'Subject tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'subject' }] }],
      group: 'targeting',
      description: 'Used for subject filter chips below the grid',
    }),
    defineField({
      name: 'assets',
      title: 'Assets in this campaign ★',
      type: 'array',
      group: 'targeting',
      description: 'The asset types this campaign produces (from Step 3 / Asset Types), each optionally paired with a design from Themes & Designs. Used to pre-build a briefing when an account manager starts from this campaign.',
      of: [{
        type: 'object',
        name: 'campaignAsset',
        fields: [
          defineField({
            name: 'assetType',
            title: 'Asset type (Step 3)',
            type: 'reference',
            to: [{ type: 'assetType' }],
            validation: (R) => R.required(),
          }),
          defineField({
            name: 'design',
            title: 'Design (optioneel)',
            type: 'reference',
            to: [{ type: 'design' }],
          }),
        ],
        preview: {
          select: { title: 'assetType.label', subtitle: 'design.title', media: 'design.image' },
          prepare: ({ title, subtitle, media }) => ({ title: title || 'Asset', subtitle: subtitle ? `→ ${subtitle}` : 'geen design', media }),
        },
      }],
    }),

    // ── BRIEFING PREFILL ─────────────────────────
    defineField({
      name: 'prefill',
      title: 'Briefing prefill data',
      type: 'object',
      group: 'prefill',
      description: 'Pre-populates briefing fields when this campaign is selected. Leave blank to not prefill.',
      fields: [
        defineField({
          name: 'printPaper',
          title: 'Print — Paper format',
          type: 'string',
          options: { list: ['A6 (flyer)', 'A5', 'A4', 'A3', 'A2', 'A1', 'Aangepast formaat'].map(v => ({ title: v, value: v })) },
        }),
        defineField({ name: 'printQty', title: 'Print — Estimated quantity', type: 'number' }),
        defineField({
          name: 'socialPlatforms',
          title: 'Social — Platforms',
          type: 'array',
          of: [{ type: 'string' }],
          options: {
            list: ['Instagram (post + story)', 'Facebook', 'LinkedIn', 'TikTok', 'Google Display Ads'].map(v => ({ title: v, value: v })),
          },
        }),
        defineField({
          name: 'bannerMaterial',
          title: 'Banner — Material type',
          type: 'string',
          options: { list: ['Spandoek PVC', 'Textiel banner', 'Vlag (wimpel)', 'Lichtbak folie', 'Nog niet bepaald'].map(v => ({ title: v, value: v })) },
        }),
        defineField({
          name: 'videoType',
          title: 'Video — Type',
          type: 'string',
          options: { list: ['Campagnevideo (winkel)', 'Lifestyle / algemeen', 'Product showcase', 'Social media Reel'].map(v => ({ title: v, value: v })) },
        }),
        defineField({
          name: 'videoDuration',
          title: 'Video — Duration',
          type: 'string',
          options: { list: ['15 seconden', '30 seconden', '60 seconden', '+1 minuut'].map(v => ({ title: v, value: v })) },
        }),
        defineField({ name: 'stickerNotes', title: 'Sticker — Notes', type: 'text', rows: 2 }),
      ],
    }),

    // ── META ─────────────────────────────────────
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: '✅ Published', value: 'published' },
          { title: '📝 Draft', value: 'draft' },
          { title: '🔒 Internal only', value: 'internal' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'season',
      title: 'Season / Quarter',
      type: 'string',
      group: 'meta',
      options: { list: ['Q1', 'Q2', 'Q3', 'Q4', 'Year-round'].map(v => ({ title: v, value: v })) },
    }),
  ],

  preview: {
    select: {
      title: 'title',
      type: 'type',
      status: 'status',
      media: 'thumbnail',
    },
    prepare({ title, type, status, media }) {
      const statusIcon = status === 'published' ? '✅' : status === 'draft' ? '📝' : '🔒'
      return { title, subtitle: `${statusIcon} ${type || ''}`, media }
    },
  },
})
