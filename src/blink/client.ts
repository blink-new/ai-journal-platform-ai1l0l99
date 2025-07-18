import { createClient } from '@blinkdotnew/sdk'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Blink client for auth and AI features
export const blink = createClient({
  projectId: 'ai-journal-platform-ai1l0l99',
  authRequired: true
})

// Supabase client for database operations - using service role key temporarily
const supabaseUrl = 'https://ilfqkfjzfgfnmwsfwshu.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZnFrZmp6Zmdmbm13c2Z3c2h1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjgxMzkwMywiZXhwIjoyMDY4Mzg5OTAzfQ.W0OVTMxIR2k9M62pRZHnwqQ1oI9qusL_DOilhIDHrh4'

export const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

export default blink