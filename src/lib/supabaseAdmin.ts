import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ตัวนี้มีสิทธิ์ระดับพระเจ้า (Admin) เข้าถึงได้ทุกอย่างโดยไม่สน RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);