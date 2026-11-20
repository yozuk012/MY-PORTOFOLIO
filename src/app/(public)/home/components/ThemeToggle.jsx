'use client';

import { useTheme } from '@/hooks/public/useTheme';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = theme === 'dark';

  // Mencegah layout shift & hydration mismatch
  if (!mounted) {
    return (
      <div 
        className="w-14 h-8 rounded-full border border-border bg-surface opacity-50 cursor-wait"
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={`Ganti ke mode ${isDark ? 'terang' : 'gelap'}`}
      onClick={toggleTheme}
      className={`
        group relative w-14 h-8 rounded-full border transition-all duration-300 
        focus:outline-none focus:ring-2 focus:ring-accent/40 
        focus:ring-offset-2 focus:ring-offset-[var(--color-background)]
        ${isDark 
          ? 'bg-accent/20 border-accent/50' // Track saat Dark Mode
          : 'bg-surface border-border'       // Track saat Light Mode
        }
      `}
    >
      {/* Ikon Latar Belakang (Sun & Moon) */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <FaSun 
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            isDark ? 'text-accent/40 scale-90' : 'text-yellow-500 scale-100'
          }`} 
        />
        <FaMoon 
          className={`w-3.5 h-3.5 transition-all duration-300 ${
            isDark ? 'text-accent scale-100' : 'text-slate-300 scale-90'
          }`} 
        />
      </div>

      {/* Thumb (Lingkaran yang Bergerak) */}
      <div
        className={`
          absolute top-1 left-1 w-6 h-6 rounded-full shadow-md 
          flex items-center justify-center transition-transform duration-300 
          ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isDark ? 'translate-x-6 bg-slate-200' : 'translate-x-0 bg-white'}
        `}
      >
        {/* Ikon Kecil di Dalam Thumb (Opsional, untuk detail premium) */}
        {isDark ? (
          <FaMoon className="w-3 h-3 text-slate-600" />
        ) : (
          <FaSun className="w-3 h-3 text-yellow-500" />
        )}
      </div>
    </button>
  );
}