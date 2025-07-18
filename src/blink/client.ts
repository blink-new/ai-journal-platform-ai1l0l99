import { createClient } from '@blinkdotnew/sdk'

// Blink client for auth, database, and AI features
export const blink = createClient({
  projectId: 'ai-journal-platform-ai1l0l99',
  authRequired: true
})

export default blink