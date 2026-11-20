// src/lib/client.js
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  // 1. Tentukan schema berdasarkan environment
  const schema = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'prod' : 'dev';

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      // 2. Beritahu Supabase untuk menggunakan schema yang dipilih
      db: {
        schema: schema,
      },
    }
  );
};