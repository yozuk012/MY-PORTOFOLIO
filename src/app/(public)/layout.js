import LanguageToggle from './home/components/LanguageToggle';
import ThemeToggle from './home/components/ThemeToggle';

export default function PublicLayout({ children }) {
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-main">
      {/* Floating Controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 sm:top-5 sm:right-5 sm:gap-4">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}