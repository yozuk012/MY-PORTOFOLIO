import "./globals.css";

export const metadata = {
  title: "Uji Tailwind",
  description:
    "Halaman sederhana untuk memastikan Tailwind CSS sudah aktif di proyek ini.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
