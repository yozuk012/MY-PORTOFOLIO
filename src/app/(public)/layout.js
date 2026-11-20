import LanguageToggle from './home/components/LanguageToggle';
import ThemeToggle from './home/components/ThemeToggle';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-main">
      {/* 
        Sticky Header untuk Toggle 
        - backdrop-blur-md: Efek kaca buram
        - bg-background/80: Transparansi 80% agar konten di belakangnya sedikit terlihat
        - border-b: Garis pemisah halus sesuai design token
      */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-end gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}