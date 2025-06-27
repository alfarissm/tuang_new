
import { createClient } from '@supabase/supabase-js';

// Ambil variabel lingkungan. Ganti dengan kredensial Supabase jika tidak menggunakan .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-public-key';

// Beri peringatan jika kredensial tidak diatur
if (supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-anon-public-key')) {
  console.warn("Supabase credentials are not set. Please update src/lib/supabase.ts or create a .env.local file with your actual Supabase URL and Anon Key. The app will not function correctly without them.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
