# Personal Web Portfolio & CMS — Achmad Aldino

Repositori kode sumber untuk website portofolio pribadi sekaligus sistem manajemen konten (*Portfolio CMS*) yang dibangun menggunakan **Next.js (App Router)** dan **Supabase**. Dirancang khusus untuk mengelola seluruh identitas digital, etalase proyek, riwayat pengalaman, hingga catatan pribadi secara dinamis dari satu pusat kendali.

**Live Website:** [achmadaldino.my.id](https://www.achmadaldino.my.id/)

---

## Arsitektur & Fitur Utama

### 1. Halaman Publik (*Public Showcase*)
- **Dynamic Availability Status:** Indikator status ketersediaan kerja (*Available for work* / *Offline*) yang diperbarui secara langsung.
- **Profile, Skills & Education:** Penyajian informasi profil, tingkat kemahiran teknis, riwayat pendidikan formal, serta akses unduh CV.
- **Experiences & Projects Showcase:** Daftar pengalaman (PKL, magang, kegiatan) dan katalog proyek pengembangan perangkat lunak maupun karya kreatif lengkap dengan *tech stack* dan status pengerjaan.
- **Spectrum Song Player:** Pemutar musik terintegrasi dengan visualisasi spektrum audio interaktif.
- **Public Notes:** Ruang tulisan digital untuk membagikan pemikiran, refleksi, dan ulasan bacaan.
- **Adaptive UI:** Dukungan mode gelap (*Dark Mode*) dan terang (*Light Mode*) dengan tata letak responsif.

### 2. Pusat Kendali Konten (*Private Portfolio CMS v1.0*)
Sistem pengelolaan konten terintegrasi yang terbagi menjadi 10 modul utama untuk kontrol penuh tanpa perlu mengubah kode secara manual:
1. **Profile:** Pengelolaan foto profil, bio, *role*, serta tautan sosial media utama.
2. **Skills:** Manajemen daftar keahlian teknis beserta skor kemahiran.
3. **Education:** Pengelolaan riwayat pendidikan formal.
4. **Experiences:** Pencatatan riwayat PKL, magang, dan kegiatan relevan.
5. **Projects:** Manajemen katalog proyek, status pengerjaan, *tech stack*, serta fitur impor otomatis dari repositori GitHub.
6. **Contacts:** Pembaruan informasi kontak (email, nomor telepon, dan lokasi).
7. **Spectrum Song:** Pengelolaan daftar lagu yang diputar pada fitur *Spectrum Song* di halaman utama.
8. **Notes:** Editor dan manajemen catatan publik yang ditampilkan di portofolio.
9. **Homepage Order:** Pengaturan urutan serta visibilitas item pada halaman utama.
10. **Feature Toggles:** Kontrol aktif/nonaktif (*FeatureGate*) untuk setiap *section* dan halaman publik.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Deployment:** Vercel

---

## Catatan Pengelolaan

- Seluruh perubahan data pada halaman publik dikendalikan secara terpusat melalui panel CMS internal yang dilindungi autentikasi.
- Struktur database memisahkan skema pengembangan dan produksi dengan penerapan *Row Level Security* (RLS) untuk menjaga keamanan akses tulis/baca data.