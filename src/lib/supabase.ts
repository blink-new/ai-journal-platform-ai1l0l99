import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          content: string
          tags: string[]
          mood: string | null
          is_favorite: boolean
          word_count: number
          reading_time: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          tags?: string[]
          mood?: string | null
          is_favorite?: boolean
          word_count?: number
          reading_time?: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          tags?: string[]
          mood?: string | null
          is_favorite?: boolean
          word_count?: number
          reading_time?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      writing_goals: {
        Row: {
          id: string
          user_id: string
          type: string
          target_value: number
          current_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          target_value: number
          current_value?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          target_value?: number
          current_value?: number
          created_at?: string
          updated_at?: string
        }
      }
      writing_sessions: {
        Row: {
          id: string
          user_id: string
          start_time: string
          end_time: string | null
          word_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_time: string
          end_time?: string | null
          word_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_time?: string
          end_time?: string | null
          word_count?: number
          created_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          name: string
          password_hash: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          password_hash?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          password_hash?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}