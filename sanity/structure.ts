import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
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

      S.listItem()
        .title('🎯  Goals (Step 1)')
        .child(S.documentTypeList('goal').title('Marketing Goals')),

      S.listItem()
        .title('⚡  Actions (Step 2)')
        .child(S.documentTypeList('action').title('Campaign Actions')),

      S.listItem()
        .title('📦  Needs (Step 3)')
        .child(S.documentTypeList('need').title('Asset Needs')),

      S.listItem()
        .title('🏷️  Subject Filters')
        .child(S.documentTypeList('subject').title('Subject Tags')),

      S.listItem()
        .title('🎨  Visual Styles')
        .child(S.documentTypeList('visualStyle').title('Visual Styles')),
    ])
