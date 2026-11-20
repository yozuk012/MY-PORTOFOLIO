// src/app/(public)/ActiveSongSection.js
import { connection } from 'next/server';
import { createClient } from '@/lib/server';
import SpectrumBackground from './home/components/SpectrumBackground';

export default async function ActiveSongSection() {
  // ⬅️ WAJIB: tandai bahwa komponen ini request-bound.
  // Tanpa ini, Next.js akan mencoba prerender dan menemukan Date.now().
  await connection();

  let activeSong = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('featured_songs')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!error && data) {
      activeSong = data;
    }
  } catch (err) {
    console.warn('Failed to fetch active song:', err);
  }

  if (!activeSong) return null;

  return <SpectrumBackground activeSong={activeSong} />;
}