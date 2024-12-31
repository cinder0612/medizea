import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// Create a single instance of the Supabase client for client components
export const supabase = createClientComponentClient<Database>()

// Export a function to create a fresh client when needed (for server components)
export function createClient() {
  return createClientComponentClient<Database>()
}

// ... (rest of the code remains the same)
