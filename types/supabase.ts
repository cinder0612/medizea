export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          name: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
        }
      }
      customer_subscriptions: {
        Row: {
          id: string
          user_id: string
          status: string
          price_id: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          status: string
          price_id: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          price_id?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

