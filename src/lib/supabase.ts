import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase Environment Variables')
}

// ใส่ Generic <Database> เพื่อให้ IDE รู้จัก Table ของเราทันที
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)