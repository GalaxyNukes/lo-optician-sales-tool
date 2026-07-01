import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

// Per-category budget + running-time values (Activatiemenu A/B/C tiers).
// Reused for categoryA / categoryB / categoryC.
const categoryValueFields = [
  defineField({ name: 'budgetMin',   title: 'Budget (van)', type: 'string' }),
  defineField({ name: 'budgetMax',   title: 'Budget (tot)', type: 'string' }),
  defineField({ name: 'budgetNote',  title: 'Budget note',  type: 'string' }),
  defineField({
    name: 'runningTime',
    title: 'Looptijd',
    type: 'string',
    description: 'bv. "4 weken per kwartaal", "doorlopend", "2x per jaar"',
  }),
]

export const partnerBlock = defineType({
  name: 'partnerBlock',
  title: 'Partner Activation Block',
  type: 'document',
  icon: () => '📋',
  orderings: [orderRankOrdering],
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media',   title: 'Media & Images' },
    { name: 'menu',    title: 'Menu / One-pager' },
  ],
  fields: [
    orderRankField({ type: 'partnerBlock' }),

    // ── CONTENT ─────────────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Block title',
      type: 'string',
      group: 'content',
      description: 'e.g. "Onboarding & Launch"',
      validation: (R) => R.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle / context line',
      type: 'string',
      group: 'content',
      description: 'Short line shown under the title, e.g. "Zichtbaar van dag één"',
    }),
    defineField({
      name: 'badge',
      title: 'Badge label',
      type: 'string',
      group: 'content',
      description: 'e.g. "Bij start", "Altijd actief", "Seizoensgebonden"',
    }),
    defineField({
      name: 'badgeColor',
      title: 'Accent color (hex)',
      type: 'string',
      group: 'content',
      description: 'Left border + badge color. e.g. #0D2340  #1A9E7E  #BA7517  #6B2A8B  #E24B4A  #1A6B4A',
      initialValue: '#0D2340',
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
      name: 'deliverables',
      title: 'Deliverables (tags)',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'content',
      description: 'e.g. "Media kit", "Landingspagina", "Banners & vlaggen"',
    }),
    defineField({
      name: 'warning',
      title: 'Warning / note (optional)',
      type: 'string',
      group: 'content',
      description: 'Highlighted note at the bottom of the block, e.g. "★ Badge vereist na LensOnline opleiding"',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      group: 'content',
      initialValue: true,
    }),

    // ── MEDIA ────────────────────────────────────────────────────
    defineField({
      name: 'images',
      title: 'Asset images (bento gallery)',
      type: 'array',
      group: 'media',
      description: 'Upload mockups, campaign assets or artist impressions. Shown in a bento grid on the brochure page.',
      of: [{
        type: 'image',
        options: { hotspot: true },
        fields: [
          defineField({
            name: 'caption',
            title: 'Caption',
            type: 'string',
            description: 'e.g. "Flyer A5", "Social post", "Bushokje mockup"',
          }),
          defineField({
            name: 'lang',
            title: 'Taal (optioneel)',
            type: 'string',
            options: { list: [{ title: 'NL', value: 'nl' }, { title: 'FR', value: 'fr' }, { title: 'EN', value: 'en' }] },
            description: 'Leeg = getoond in elke taal',
          }),
        ],
      }],
    }),
    defineField({
      name: 'imageLayout',
      title: 'Beeldweergave (Partnergids)',
      type: 'string',
      group: 'media',
      options: {
        list: [
          { title: 'Raster (bento grid)', value: 'grid' },
          { title: 'Carrousel (horizontaal scrollen)', value: 'carousel' },
        ],
        layout: 'radio',
      },
      initialValue: 'grid',
      description: 'Hoe de beelden van dit blok getoond worden op de Partnergids.',
    }),
    defineField({
      name: 'noVisualAssets',
      title: 'Heeft bewust geen visuals',
      type: 'boolean',
      group: 'media',
      initialValue: false,
      description: 'Aanvinken voor activaties zonder beeld (bv. SEO). Toont een neutrale melding i.p.v. de "voeg toe via Studio"-prompt.',
    }),

    // ── MENU / ONE-PAGER ─────────────────────────────────────────
    defineField({
      name: 'minCategory',
      title: 'Zichtbaar vanaf categorie',
      type: 'string',
      group: 'menu',
      options: {
        list: [
          { title: 'C — iedereen (A, B, C)', value: 'C' },
          { title: 'B — alleen B en A',      value: 'B' },
          { title: 'A — alleen A',           value: 'A' },
        ],
        layout: 'radio',
      },
      initialValue: 'C',
      description: 'Cascade: C-blokken zijn zichtbaar in alle 3 schermen, B-blokken in B+A, A-blokken enkel in A.',
    }),
    defineField({
      name: 'section',
      title: 'Sectie',
      type: 'string',
      group: 'menu',
      options: {
        list: [
          { title: 'Wat we altijd voor je doen', value: 'always' },
          { title: 'Wat je kan activeren op aanvraag', value: 'request' },
        ],
        layout: 'radio',
      },
      description: 'Bepaalt onder welke sectie dit blok verschijnt op de Partnergids & het Activatiemenu. Leeg = automatisch bepaald via Timing. Sleep blokken in de lijst om de volgorde te bepalen.',
    }),
    defineField({
      name: 'timing',
      title: 'Timing',
      type: 'string',
      group: 'menu',
      options: {
        list: [
          { title: 'Always-on',        value: 'always'      },
          { title: 'Bij start',         value: 'start'       },
          { title: 'Seizoensgebonden',  value: 'seasonal'    },
          { title: 'Conditioneel',      value: 'conditional' },
          { title: 'Op aanvraag',       value: 'request'     },
          { title: 'Doorlopend',        value: 'ongoing'     },
        ],
        layout: 'radio',
      },
    }),

    // Legacy flat budget — kept until the A/B/C migration runs, then removed in Segment A cleanup.
    defineField({
      name: 'budgetMin',
      title: 'Budget (van) — legacy',
      type: 'string',
      group: 'menu',
      description: 'Verplaatst naar Categorie A/B/C. Wordt verwijderd na migratie.',
    }),
    defineField({ name: 'budgetMax', title: 'Budget (tot) — legacy', type: 'string', group: 'menu' }),
    defineField({ name: 'budgetNote', title: 'Budget note — legacy', type: 'string', group: 'menu' }),

    defineField({
      name: 'categoryA',
      title: 'Categorie A — waarden',
      type: 'object',
      group: 'menu',
      fields: categoryValueFields,
    }),
    defineField({
      name: 'categoryB',
      title: 'Categorie B — waarden',
      type: 'object',
      group: 'menu',
      fields: categoryValueFields,
      hidden: ({ document }) => document?.minCategory === 'A',
    }),
    defineField({
      name: 'categoryC',
      title: 'Categorie C — waarden',
      type: 'object',
      group: 'menu',
      fields: categoryValueFields,
      hidden: ({ document }) => document?.minCategory !== 'C',
    }),

    defineField({
      name: 'impactLevel',
      title: 'Impact level (1–5)',
      type: 'number',
      group: 'menu',
      initialValue: 3,
      validation: (R) => R.min(1).max(5).integer(),
      description: '5 = maximum impact — shown as filled dots in the one-pager',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'badge', active: 'active' },
    prepare({ title, subtitle, active }) {
      return {
        title: `${active === false ? '🔴 ' : ''}${title || 'Untitled block'}`,
        subtitle: subtitle || '',
      }
    },
  },
})
