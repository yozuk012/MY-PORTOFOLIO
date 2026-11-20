'use client'; // Wajib: global-error.js harus Client Component

import { useEffect } from 'react';
import Link from 'next/link';
import { FaTools, FaHome, FaSyncAlt } from 'react-icons/fa';

// PENTING: Import CSS global agar variabel warna (--color-background, dll) terbaca
// karena file ini menimpa root layout dan tidak mewarisi CSS secara otomatis.
import '@/app/globals.css'; 

/**
 * GLOBAL ERROR BOUNDARY (Last Resort)
 * File ini menangkap SEMUA error fatal yang terjadi di aplikasi,
 * termasuk error di Server Component atau Layout utama.
 * Ini mencegah Next.js menampilkan halaman error default yang jelek di production.
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log error ke console (Nanti bisa diintegrasikan dengan Sentry/LogRocket)
    console.error('🚨 [CRITICAL GLOBAL ERROR]:', error);
  }, [error]);

  return (
    // WAJIB: File ini harus memiliki tag <html> dan <body> sendiri
    // karena ia menimpa root layout (src/app/layout.js) saat error terjadi.
    <html lang="id">
      <body className="bg-[var(--color-background)] text-[var(--color-text-main)] font-sans antialiased min-h-screen flex items-center justify-center p-4 transition-colors duration-300">
        
        <div className="text-center max-w-lg w-full animate-in fade-in zoom-in-95 duration-300">
          
          {/* Ikon Utama */}
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <FaTools className="w-10 h-10 text-red-500" />
          </div>

          {/* Teks Utama */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Halaman Sedang Dalam Perbaikan
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-md mx-auto mb-8 leading-relaxed text-sm md:text-base">
            Maaf, terjadi gangguan teknis yang tidak terduga pada sistem kami. 
            Tim developer sedang bekerja untuk memperbaikinya. Silakan coba kembali nanti.
          </p>

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40 shadow-sm"
            >
              <FaSyncAlt className="w-4 h-4" />
              Coba Muat Ulang
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-main)] font-medium hover:bg-[var(--color-background)] hover:border-[var(--color-accent)]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
            >
              <FaHome className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>

          {/* Footer kecil */}
          <p className="mt-12 text-xs text-[var(--color-text-muted)]/50 font-mono">
            Error Code: 500 • Internal Server Error
          </p>
        </div>

      </body>
    </html>
  );
}