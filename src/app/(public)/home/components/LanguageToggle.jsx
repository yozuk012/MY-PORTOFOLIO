'use client';

import { useState, useEffect } from 'react';

export default function LanguageToggle() {
  const [lang, setLang] = useState('id');

  // Baca cookie saat pertama kali load di client
  useEffect(() => {
    const cookies = document.cookie.split(';');
    const langCookie = cookies.find((c) => c.trim().startsWith('lang='));
    if (langCookie) {
      setLang(langCookie.split('=')[1]);
    }
  }, []);

  const handleSwitch = (newLang) => {
    setLang(newLang);
    // Simpan ke cookie agar Server Component bisa membacanya
    document.cookie = `lang=${newLang}; path=/; max-age=31536000`; // 1 tahun
    // Refresh halaman agar Server Component merender ulang dengan bahasa baru
    window.location.reload();
  };

  return (
    // ⬇️ Positioning `fixed top-5 right-5 z-50` dihapus
    <div className="flex rounded-full border border-border/60 bg-surface/70 p-1 shadow-sm backdrop-blur-md">
      {['id', 'en'].map((code) => (
        <button
          key={code}
          onClick={() => handleSwitch(code)}
          aria-pressed={lang === code}
          className={`rounded-full px-3 py-1 font-mono text-xs uppercase tracking-widest transition-all duration-200 active:scale-95 ${
            lang === code
              ? 'bg-accent text-white shadow'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}