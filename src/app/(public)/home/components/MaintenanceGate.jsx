import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/server";
import { FaTools, FaHome } from "react-icons/fa";

/**
 * Maintenance UI Component
 * Ditampilkan ketika website sedang dalam mode perbaikan atau database kosong.
 */
function MaintenanceUI() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 md:px-0 relative overflow-hidden bg-background text-text-main font-sans antialiased">
      {/* Watermark Angka di Background (Subtle Editorial Touch) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-0">
        <span className="text-[15vw] md:text-[20vw] font-bold text-surface tracking-tighter leading-none opacity-40">
          DEV
        </span>
      </div>

      {/* Konten Utama */}
      <div className="relative z-10 max-w-lg w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Ikon Utama */}
        <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
          <FaTools className="w-10 h-10 text-accent" />
        </div>

        {/* Eyebrow Monospace */}
        <div className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
          <span className="text-xs font-mono text-accent uppercase tracking-widest">
            Under Development
          </span>
        </div>

        {/* Judul Besar */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-[1.1]">
          Website Sedang Dalam Perbaikan
        </h1>

        {/* Deskripsi */}
        <p className="text-sm md:text-base text-text-muted max-w-md mx-auto leading-relaxed">
          Mohon maaf, portofolio ini sedang dalam tahap pengembangan atau pemeliharaan data. 
          Silakan kembali lagi nanti untuk melihat versi lengkapnya.
        </p>

        {/* Tombol Kembali */}
        <div className="pt-4">
          <a
            href="/"
            className="group inline-flex items-center gap-3 text-sm font-medium text-text-main hover:text-accent transition-colors duration-300"
          >
            <FaHome className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="border-b border-border pb-0.5 group-hover:border-accent transition-colors duration-300">
              Coba Muat Ulang Halaman
            </span>
          </a>
        </div>

        {/* Footer kecil */}
        <p className="mt-12 text-[10px] text-text-muted/40 font-mono uppercase tracking-widest">
          System Status: Maintenance Mode Active
        </p>
      </div>
    </main>
  );
}

/**
 * MaintenanceGate Wrapper
 * Mengecek apakah website harus menampilkan mode maintenance.
 */
async function MaintenanceGateResolver({ children }) {
  // Supabase SSR harus diinisialisasi setelah request masuk, bukan saat prerender.
  await connection();
  const supabase = await createClient();

  // 1. Cek apakah Global Maintenance diaktifkan secara manual oleh Admin
  const { data: toggleData } = await supabase
    .from("feature_toggles")
    .select("is_enabled")
    .eq("feature_key", "global_maintenance")
    .single();

  if (toggleData?.is_enabled) {
    return <MaintenanceUI />;
  }

  // 2. Cek apakah database inti kosong (Kita pakai tabel 'profile' sebagai indikator utama)
  // Jika profile tidak ada (PGRST116), berarti schema (misal: prod) benar-benar kosong.
  const { data: profile, error } = await supabase
    .from("profile")
    .select("id")
    .limit(1)
    .single();

  // PGRST116 adalah kode error Supabase untuk "Row not found"
  if (error && error.code === "PGRST116") {
    return <MaintenanceUI />;
  }

  // Jika ada error lain (misal koneksi), kita tetap tampilkan children agar tidak memblokir total, 
  // atau bisa dikembalikan <MaintenanceUI /> jika ingin strict.
  if (error) {
    console.warn("[MaintenanceGate] Database check failed:", error.message);
  }

  // Jika semua aman, render website normal
  return children;
}

export default function MaintenanceGate({ children }) {
  return (
    <Suspense fallback={null}>
      <MaintenanceGateResolver>{children}</MaintenanceGateResolver>
    </Suspense>
  );
}