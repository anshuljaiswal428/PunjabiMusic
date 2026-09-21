import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (see .env.local.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Shape of a row in the public.messages table.
export type ChatMessage = {
  id: number;
  nickname: string;
  gender: string | null;
  text: string;
  created_at: string;
};
