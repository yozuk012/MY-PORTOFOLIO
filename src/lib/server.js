// src/lib/server.js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();
  
  // 1. Tentukan schema berdasarkan environment
  const schema = process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'prod' : 'dev';

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      // 2. Beritahu Supabase untuk menggunakan schema yang dipilih
      db: {
        schema: schema,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component tidak bisa set cookies, abaikan error
          }
        },
      },
    }
  );
};