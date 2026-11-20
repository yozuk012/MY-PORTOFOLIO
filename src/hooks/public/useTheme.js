'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook untuk mengelola Dark Mode.
 * Menangani inisialisasi tema, persistensi ke localStorage, 
 * dan mencegah hydration mismatch di Next.js.
 */
export function useTheme() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Tandai bahwa komponen sudah di-mount di sisi klien
    setMounted(true);

    // 1. Cek preferensi yang tersimpan di localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // 2. Jika tidak ada di localStorage, cek preferensi sistem operasi
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
      
    const initialTheme = savedTheme || systemTheme;
    
    // 3. Terapkan tema
    setTheme(initialTheme);
    applyThemeClass(initialTheme);
  }, []);

  /**
   * Fungsi untuk menambahkan/menghapus class 'dark' pada tag <html>
   * Sesuai dengan konfigurasi @custom-variant dark di Tailwind CSS v4
   */
  const applyThemeClass = (currentTheme) => {
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  /**
   * Fungsi untuk beralih antara Light dan Dark mode
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyThemeClass(newTheme);
  };

  /**
   * Fungsi opsional untuk memaksa tema tertentu (berguna untuk tombol spesifik)
   */
  const setThemeExplicitly = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      applyThemeClass(newTheme);
    }
  };

  // Mencegah Hydration Mismatch:
  // Saat rendering pertama di server, kembalikan nilai default.
  // UI tidak akan dirender sampai useEffect berjalan di client.
  if (!mounted) {
    return { theme: 'light', toggleTheme, setThemeExplicitly, mounted: false };
  }

  return { theme, toggleTheme, setThemeExplicitly, mounted: true };
}