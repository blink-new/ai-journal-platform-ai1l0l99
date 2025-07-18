import { createClient } from '@blinkdotnew/sdk'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Blink client for auth and AI features
export const blink = createClient({
  projectId: 'ai-journal-platform-ai1l0l99',
  authRequired: true
})

// Supabase client for database operations
const supabaseUrl = 'https://ilfqkfjzfgfnmwsfwshu.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsZnFrZmp6Zmdmbm13c2Z3c2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MTM5MDMsImV4cCI6MjA2ODM4OTkwM30.lBZD1woKiLz_AbOWG2U4skZtx9bLKbz2VGkFch9yo_Y'

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export default blink