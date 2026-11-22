This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Toggle halaman publik

Jalankan SQL ini di Supabase SQL Editor pada tabel `feature_toggles` yang sudah
dipakai beranda. Untuk production, ganti `dev.feature_toggles` menjadi
`prod.feature_toggles`. Seed ini tidak menimpa status toggle yang sudah ada.

```sql
insert into dev.feature_toggles (feature_key, is_enabled, description)
values
  ('page_contacts', true, 'Halaman publik Contacts'),
  ('page_experiences', true, 'Halaman publik Experiences'),
  ('page_notes', true, 'Halaman publik Notes, termasuk tampilan detail'),
  ('page_projects', true, 'Halaman publik Projects'),
  ('page_skills', true, 'Halaman publik Skills')
on conflict (feature_key) do nothing;
```

Kelola kelima toggle lewat `/admin/feature-toggles` → **Public Pages**. Toggle
ini terpisah dari `section_*` di beranda. Pastikan pengunjung anonim bisa membaca
flag melalui kebijakan Supabase yang sudah dipakai beranda. Jika flag nonaktif,
belum terdaftar, atau gagal dibaca, halaman memakai tampilan 404 bawaan situs
(`src/app/not-found.js`). Section beranda yang nonaktif hanya disembunyikan.
Gate ini mengatur tampilan, bukan akses langsung ke data Supabase.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
