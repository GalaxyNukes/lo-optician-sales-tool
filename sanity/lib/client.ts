import { createClient, type SanityClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2024-01-01'

// Lazy clients — only instantiated when actually called, not at import time
let _client: SanityClient | null = null
let _previewClient: SanityClient | null = null

export function getClient(preview = false): SanityClient {
  if (!projectId) {
    throw new Error(
      'NEXT_PUBLIC_SANITY_PROJECT_ID is not set. Add it to your Vercel environment variables and redeploy.'
    )
  }

  if (preview) {
    if (!_previewClient) {
      _previewClient = createClient({
        projectId,
        dataset,
        apiVersion,
        useCdn: false,
        token: process.env.SANITY_API_READ_TOKEN,
        perspective: 'previewDrafts',
      })
    }
    return _previewClient
  }

  if (!_client) {
    _client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
    })
  }
  return _client
}

// Named export for convenience
export const client = {
  fetch: (...args: Parameters<SanityClient['fetch']>) => getClient(false).fetch(...args),
}
