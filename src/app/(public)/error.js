'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaTools, FaHome, FaSyncAlt, FaBug } from 'react-icons/fa';

/**
 * Next.js Error Boundary untuk Route Group (public)
 * File ini otomatis menangkap error yang terjadi di dalam (public)
 * dan mencegahnya meruntuhkan seluruh aplikasi.
 */
export default function PublicError({ error, reset }) {
  useEffect(() => {
    // 1. Log error ke console (atau ke layanan monitoring seperti Sentry)
    console.error('🚨 [Public Page Error]:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center animate-in fade-in zoom-in-95 duration-300">
      
      {/* Ikon Utama */}
      <div className="w-20 h-20 rounded-full bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center mb-6 ring-1 ring-red-500/20">
        <FaTools className="w-10 h-10 text-red-500" />
      </div>

      {/* Teks Utama */}
      <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-3 tracking-tight">
        Ups! Terjadi Kesalahan
      </h1>
      <p className="text-text-muted max-w-md mb-8 leading-relaxed text-sm md:text-base">
        Maaf, halaman yang Anda coba akses sedang mengalami gangguan teknis atau sedang dalam pemeliharaan. Tim kami sedang memperbaikinya.
      </p>

      {/* Tombol Aksi */}
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        {/* Tombol Reset: Mencoba me-render ulang komponen yang error */}
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40 shadow-sm hover:shadow-md"
        >
          <FaSyncAlt className="w-4 h-4" />
          Coba Muat Ulang
        </button>
        
        {/* Tombol Kembali ke Home */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-border bg-surface text-text-main font-medium hover:bg-background hover:border-accent/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <FaHome className="w-4 h-4" />
          Kembali ke Beranda
        </Link>
      </div>

      {/* Detail Error (Hanya muncul di Development untuk debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-10 text-left w-full max-w-lg bg-surface border border-border rounded-lg overflow-hidden group">
          <summary className="px-4 py-3 text-xs font-mono text-text-muted cursor-pointer hover:text-accent hover:bg-background/50 transition-colors flex items-center gap-2">
            <FaBug className="w-3 h-3" />
            Lihat Detail Error (Development Mode)
          </summary>
          <div className="p-4 bg-red-950/10 border-t border-border">
            <pre className="text-xs font-mono text-red-500 whitespace-pre-wrap break-words">
              {error.message || 'Unknown error occurred'}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}