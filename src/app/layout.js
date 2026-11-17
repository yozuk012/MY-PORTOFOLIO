// src/app/layout.js
import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";

// 1. Konfigurasi Font Inter (untuk teks utama, judul, dan paragraf)
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// 2. Konfigurasi Font JetBrains Mono (untuk label teknis, tahun, dan tags)
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

// 3. Metadata SEO & Social Sharing (Standar Big Tech / Vercel)
export const metadata = {
  title: {
    default: "Achmad Aldino | Web Developer & UI/UX Enthusiast",
    template: "%s | Achmad Aldino", // Otomatis jadi "Skills | Achmad Aldino" untuk sub-halaman
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
    // apple: "/apple-touch-icon.png", // Tambahkan nanti jika ada file khusus Apple
  },
};

// 4. Viewport Configuration (Penting untuk Mobile UX)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Mencegah zoom otomatis yang tidak perlu di iOS
  themeColor: "#FFFFFF", // Membuat address bar browser HP berwarna putih, menyatu dengan bg-background
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="id" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      // Menambahkan scroll-behavior smooth di level HTML untuk navigasi yang halus
      style={{ scrollBehavior: "smooth" }}
    >
      <body className="bg-background text-text-main font-sans antialiased selection:bg-accent/20 selection:text-accent">
        {/* 
          Penjelasan Class Tailwind:
          - bg-background: Putih bersih (#FFFFFF)
          - text-text-main: Hitam arang (#0F172A)
          - font-sans: Font Inter
          - antialiased: Rendering font lebih halus (standar macOS/iOS)
          - selection:bg-accent/20: Highlight teks berwarna biru muda transparan
          - selection:text-accent: Teks yang di-highlight berwarna biru teknologi
        */}
        {children}
      </body>
    </html>
  );
}