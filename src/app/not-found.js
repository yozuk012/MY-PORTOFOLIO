// src/app/not-found.js
import { FaArrowLeft } from "react-icons/fa";

export const metadata = {
  title: "404 - Page Not Found | Achmad Aldino",
  description: "Halaman yang Anda cari tidak ditemukan.",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 md:px-0 relative overflow-hidden">
      
      {/* Watermark Angka 404 di Background (Subtle Editorial Touch) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
        <span className="text-[20vw] md:text-[25vw] font-bold text-surface tracking-tighter leading-none opacity-60">
          404
        </span>
      </div>

      {/* Konten Utama */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        
        {/* Eyebrow Monospace */}
        <div className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
          <span className="text-xs font-mono text-accent uppercase tracking-widest">
            Error 404
          </span>
        </div>

        {/* Judul Besar */}
        <h1 className="text-5xl md:text-7xl font-bold text-text-main tracking-tighter leading-[1.05]">
          Page Not Found
        </h1>

        {/* Deskripsi */}
        <p className="text-base md:text-lg text-text-muted max-w-lg mx-auto leading-relaxed">
          Halaman yang Anda cari tidak ada, telah dipindahkan, atau sedang dalam perbaikan.
        </p>

        {/* Tombol Kembali (Gaya Editorial, bukan tombol kotak) */}
        <div className="pt-6">
          <a
            href="/"
            className="group inline-flex items-center gap-3 text-sm font-medium text-text-main hover:text-accent transition-colors duration-300"
          >
            <FaArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="border-b border-border pb-0.5 group-hover:border-accent transition-colors duration-300">
              Kembali ke Beranda
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}