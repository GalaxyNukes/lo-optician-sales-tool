import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'

export default defineConfig({
  name: 'lo-optician-sales-tool',
  title: 'LensOnline Campaign Catalog',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'placeholder',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: '2024-01-01' }),
  ],
  schema: { types: schemaTypes },
})
