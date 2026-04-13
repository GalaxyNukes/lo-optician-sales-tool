import type { StructureResolver } from 'sanity/structure'
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('LensOnline CMS')
    .items([
      S.listItem()
        .title('🗂️  Campaigns')
        .child(
          S.documentTypeList('campaign')
            .title('All Campaigns')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),

      S.divider(),

      // Drag-and-drop ordering for all taxonomy types
      orderableDocumentListDeskItem({ type: 'goal',        title: '🎯  Goals (Step 1)',      S, context }),
      orderableDocumentListDeskItem({ type: 'action',      title: '⚡  Actions (Step 2)',     S, context }),
      orderableDocumentListDeskItem({ type: 'need',        title: '📦  Needs (Step 3)',       S, context }),
      orderableDocumentListDeskItem({ type: 'subject',     title: '🏷️  Subject Filters',     S, context }),
      orderableDocumentListDeskItem({ type: 'visualStyle', title: '🎨  Visual Styles',        S, context }),
    ])
