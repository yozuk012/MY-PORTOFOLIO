// src/app/(public)/layout.js
import { Suspense } from 'react';

// ✅ IMPORT BARU: MaintenanceGate untuk proteksi level layout
import MaintenanceGate from './home/components/MaintenanceGate';

import LanguageToggle from './home/components/LanguageToggle';
import ThemeToggle from './home/components/ThemeToggle';
import MiniPlayer from './home/components/MiniPlayer';
import ActiveSongSection from './ActiveSongSection';
import CustomCursor from './home/components/CustomCursor';

export default function PublicLayout({ children }) {
  return (
    // MaintenanceGate akan mengecek status database & toggle global.
    // Jika maintenance aktif, ia akan merender UI maintenance dan mengabaikan children di bawahnya.
    <MaintenanceGate>
      {/* 
        `isolate` membuat stacking context sendiri, sehingga layer -z-10 
        milik SpectrumBackground tampil DI ATAS bg-background wrapper ini 
        (tapi tetap di belakang konten).
      */}
      <div className="min-h-screen flex flex-col bg-background text-text-main relative isolate">
        
        {/* Custom Cursor: z-[9999] dan fixed, aman di sini */}
        <CustomCursor />

        {/* Bagian dinamis — di-stream saat request */}
        <Suspense fallback={null}>
          <ActiveSongSection />
        </Suspense>

        {/* Floating Controls */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 sm:top-5 sm:right-5 sm:gap-4">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full relative z-10">{children}</main>

        {/* MiniPlayer — client component, tidak perlu Suspense */}
        <MiniPlayer />
      </div>
    </MaintenanceGate>
  );
}