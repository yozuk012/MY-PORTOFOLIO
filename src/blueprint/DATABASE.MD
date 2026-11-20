Berikut adalah catatan skema database yang disusun dengan gaya *developer notes* (seperti catatan di Notion/Obsidian), lebih ringkas, *to-the-point*, dan fokus pada hal-hal yang penting untuk implementasi frontend (Next.js + Supabase).

***

📝 **DEV NOTES: DB Schema - Portfolio App**
*Stack: Next.js + Supabase (PostgreSQL)*

**📌 General Rules:**
- Semua tabel pakai `id` (UUID, auto `gen_random_uuid()`).
- Semua tabel punya `created_at` & `updated_at` (auto `now()`).
- Ini skema *single-user* (tidak ada FK ke tabel user/auth). Kalau nanti butuh multi-user, tinggal tambahin `profile_id` di tabel anak.

---

### 🗂️ TABEL BREAKDOWN

**1. `profile` (Data Diri)**
- `full_name`, `bio`, `photo_url`
- `role`: Enum (`Web Developer`, `Writer`, `UI/UX Design`, `Student`, `Other`)
- `top_skills`: Array (Max 3 item)
- `social_links`: JSONB (Max 3 item) ➡️ *Note: Di frontend, map array ini buat render dynamic social icons.*
- `is_active`: Boolean

**2. `educations` (Pendidikan)**
- `institution`, `start_year`, `end_year`, `description`
- `degree`: Enum (`SMK`, `D1`-`D4`, `S1`-`S3`, `Bootcamp`, `Course`, `Other`)

**3. `experiences` (Pengalaman: PKL, Magang, Organisasi, dll)**
- `title`, `description`, `image_url`, `start_year`, `end_year`
- `type`: Enum (`project`, `seminar`, `magang`, `pkl`, `organization`, `volunteer`, `other`)
- 🌟 **Home Feature:** `show_on_home` (bool), `home_order` (int, default 999)

**4. `projects` (Proyek)**
- `title`, `description`, `image_url`, `demo_url`
- `status`: Enum (`active`, `inactive`, `done`, `progress`)
- `tech_tags`: Array ➡️ *Note: Buat render badge/tag teknologi di card component.*
- 🌟 **Home Feature:** `show_on_home` (bool), `home_order` (int, default 999)

**5. `skills` (Keahlian)**
- `name`, `description`
- `score`: Integer (1-10, default 5) ➡️ *Note: Binding ke width/percentage progress bar di UI.*
- 🌟 **Home Feature:** `show_on_home` (bool), `home_order` (int, default 999)

**6. `contacts` (Kontak)**
- `email`, `phone`, `whatsapp`, `address`, `location`

---

### 💡 IMPLEMENTATION NOTES (Frontend & Supabase)

1. **Featured Section di Homepage:**
   Gunakan flag `show_on_home` dan `home_order` untuk membuat section "Highlight" di landing page. 
   *Query example:* 
   `.from('projects').select().eq('show_on_home', true).order('home_order', { ascending: true })`

2. **Handling JSONB & Arrays:**
   - `social_links` (JSONB) dan `tech_tags` (Array) akan otomatis di-parse jadi Object/Array oleh Supabase JS client. Tinggal di-*map* untuk render komponen dinamis.
   - *Validasi Form:* Jangan lupa kasih validasi di frontend untuk `top_skills` dan `social_links` (max 3 items) sebelum di-*submit* ke Supabase biar nggak kena error constraint.

3. **Score Skills:**
   Constraint DB-nya 1-10. Di form (misal pakai slider atau input number), pastikan *min=1* dan *max=10*.

4. **Dark Mode & UI:**
   Karena fokus ke UI/UX dan *dark mode*, pastikan field `image_url` dan `photo_url` di-handle dengan komponen `<Image>` Next.js yang punya fallback/blur placeholder biar *tactile feedback* dan *vibe* codingnya tetap smooth.

---
*Last updated: Nov 18, 2026*