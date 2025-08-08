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
          // FSRS columns (formal version)
          fsrs_stability_days?: number
          fsrs_difficulty?: number
          fsrs_scheduled_at?: string
          fsrs_last_reviewed_at?: string | null
          fsrs_reps?: number
          fsrs_lapses?: number
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
          fsrs_stability_days?: number
          fsrs_difficulty?: number
          fsrs_scheduled_at?: string
          fsrs_last_reviewed_at?: string | null
          fsrs_reps?: number
          fsrs_lapses?: number
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
          fsrs_stability_days?: number
          fsrs_difficulty?: number
          fsrs_scheduled_at?: string
          fsrs_last_reviewed_at?: string | null
          fsrs_reps?: number
          fsrs_lapses?: number
        }
      }
      , review_logs: {
        Row: {
          id: number
          term_id: number
          reviewed_at: string
          grade: 'again' | 'hard' | 'good' | 'easy'
          stability_days: number
          difficulty: number
          next_due_at: string
        },
        Insert: {
          id?: number
          term_id: number
          reviewed_at?: string
          grade: 'again' | 'hard' | 'good' | 'easy'
          stability_days: number
          difficulty: number
          next_due_at: string
        },
        Update: {
          id?: number
          term_id?: number
          reviewed_at?: string
          grade?: 'again' | 'hard' | 'good' | 'easy'
          stability_days?: number
          difficulty?: number
          next_due_at?: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
