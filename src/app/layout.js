import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";

// 1. Konfigurasi Font
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

// 2. Metadata SEO & Social Sharing
export const metadata = {
  title: {
    default: "Achmad Aldino | Web Developer & UI/UX Enthusiast",
    template: "%s | Achmad Aldino",
  },
  description: "Portofolio Web Developer yang fokus pada pembuatan website modern, responsif, dan aksesibel dengan Next.js, Tailwind CSS, dan standar desain yang bersih.",
  keywords: ["Achmad Aldino", "Web Developer", "Portfolio", "Next.js", "React", "UI/UX Design", "Banyuwangi", "Frontend Developer"],
  authors: [{ name: "Achmad Aldino" }],
  creator: "Achmad Aldino",
  openGraph: {
    title: "Achmad Aldino | Web Developer",
    description: "Membangun pengalaman web modern dengan fokus pada detail, performa, dan desain yang bersih.",
    type: "website",
    locale: "id_ID",
    siteName: "Achmad Aldino Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Achmad Aldino | Web Developer",
    description: "Membangun pengalaman web modern dengan fokus pada detail, performa, dan desain yang bersih.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

// 3. Viewport Configuration
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFFFF", // Default light mode, akan di-override oleh script di bawah jika dark mode
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="id" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning // Wajib: Mencegah warning karena class 'dark' ditambahkan client-side
    >
      <head>
        {/* 
          CRITICAL: Inline script untuk mencegah Flash of Unstyled Content (FOUC).
          Script ini berjalan SEBELUM React di-hydrate, memastikan tema yang benar 
          sudah diterapkan ke <html> sejak awal paint.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getInitialTheme() {
                  if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
                    return localStorage.getItem('theme');
                  }
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                
                const theme = getInitialTheme();
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  // Update warna address bar browser mobile agar sesuai dengan dark mode
                  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                  if (metaThemeColor) metaThemeColor.setAttribute('content', '#0F172A');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-background text-text-main font-sans antialiased selection:bg-accent/20 selection:text-accent transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}