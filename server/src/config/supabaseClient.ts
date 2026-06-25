import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and SUPABASE_SECRET_KEY",
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false, // Not needed server-side
      persistSession: false, // Not needed server-side
    },
  },
);
