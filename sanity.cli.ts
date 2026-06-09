import { defineCliConfig } from 'sanity/cli'

// Enables the `npx sanity ...` CLI (dataset create / copy / import, etc.).
// Reads project/dataset from your env (.env.local), so CLI and app stay in sync.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  },
})
