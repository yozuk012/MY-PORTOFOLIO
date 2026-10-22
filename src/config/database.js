import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Pool } = pkg;

// Cek apakah kita ingin menggunakan database lokal berdasarkan environment variable
const isLocal = process.env.USE_LOCAL_DB === 'true';

let dbClient = null;
let localPool = null;

if (isLocal) {
  // Konfigurasi untuk PostgreSQL Lokal (Docker Raspberry Pi)
  localPool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  });
} else {
  // Konfigurasi untuk Supabase (Production)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    dbClient = createClient(supabaseUrl, supabaseKey);
  }
}

// Ekspor instance database dan status lingkungan
export { localPool, dbClient, isLocal };