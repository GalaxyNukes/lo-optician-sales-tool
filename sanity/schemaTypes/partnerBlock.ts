import { defineField, defineType } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

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
        ],
      }],
    }),

    // ── MENU / ONE-PAGER ─────────────────────────────────────────
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
    defineField({
      name: 'budgetMin',
      title: 'Budget (van)',
      type: 'string',
      group: 'menu',
      description: 'e.g. "€500" — or use "Inbegrepen" / "Op kostprijs" as the only value',
    }),
    defineField({
      name: 'budgetMax',
      title: 'Budget (tot)',
      type: 'string',
      group: 'menu',
      description: 'e.g. "€2.500" — leave empty when budgetMin is a label like "Inbegrepen"',
    }),
    defineField({
      name: 'budgetNote',
      title: 'Budget note',
      type: 'string',
      group: 'menu',
      description: 'e.g. "Partnervoordeel", "Afhankelijk van media", "Bestelbaar via DEX"',
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
