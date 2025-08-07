import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// And here is the rest of your database type definitions.
//
// You can also use the CLI to generate this file fully typed:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
//
// See: https://supabase.com/docs/reference/javascript/typescript-support
//
export type Database = {
  public: {
    Tables: {
      literary_terms: {
        Row: {
          id: number
          created_at: string
          term: string
          explanation: string
          exercise: string
          answer: any // Changed to any to support jsonb
          isDifficult: boolean
          status: 'unanswered' | 'correct' | 'incorrect'
          userAnswer: any // Changed to any to support jsonb
          group_name: string | null
        },
        Insert: {
          id?: number
          created_at?: string
          term: string
          explanation: string
          exercise: string
          answer: any // Changed to any to support jsonb
          isDifficult?: boolean
          status?: 'unanswered' | 'correct' | 'incorrect'
          userAnswer?: any // Changed to any to support jsonb
          group_name?: string | null
        },
        Update: {
          id?: number
          created_at?: string
          term?: string
          explanation?: string
          exercise?: string
          answer?: any // Changed to any to support jsonb
          isDifficult?: boolean
          status?: 'unanswered' | 'correct' | 'incorrect'
          userAnswer?: any // Changed to any to support jsonb
          group_name?: string | null
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
