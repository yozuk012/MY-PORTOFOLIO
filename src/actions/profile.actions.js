'use server';

import { localPool, isLocal } from '@/config/database';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function getHeroProfile() {
  if (!localPool) return null;

  try {
    const res = await localPool.query('SELECT * FROM public.profile LIMIT 1');
    return res.rows[0] || null;
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    return null;
  }
}

export async function updateHeroProfile(formData) {
  try {
    let avatarUrl = formData.current_avatar_url;

    // 1. Handle File Upload jika ada file baru
    if (formData.avatar_file) {
      const file = formData.avatar_file;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Pastikan direktori public/uploads ada
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadDir, { recursive: true });

      // Buat nama file unik agar tidak tertimpa
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `avatar-${uniqueSuffix}${path.extname(file.name)}`;
      const filepath = path.join(uploadDir, filename);

      // Simpan file ke disk
      await writeFile(filepath, buffer);
      avatarUrl = `/uploads/${filename}`; // Path relatif untuk diakses publik
    }

    // 2. Cek apakah sudah ada data profile di database
    const checkRes = await localPool.query('SELECT id FROM public.profile LIMIT 1');
    const profileId = checkRes.rows.length > 0 ? checkRes.rows[0].id : null;

    if (profileId) {
      // UPDATE data yang sudah ada
      await localPool.query(
        `UPDATE public.profile 
         SET full_name = $1, role = $2, bio = $3, avatar_url = $4, 
             skills = $5, social_links = $6, status = $7, updated_at = NOW()
         WHERE id = $8`,
        [
          formData.full_name,
          formData.role,
          formData.bio,
          avatarUrl,
          formData.skills, // pg otomatis mengonversi JS Array ke PostgreSQL text[]
          JSON.stringify(formData.social_links), // pg mengonversi ke JSONB
          formData.status,
          profileId,
        ]
      );
    } else {
      // INSERT data baru jika tabel masih kosong
      await localPool.query(
        `INSERT INTO public.profile (full_name, role, bio, avatar_url, skills, social_links, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          formData.full_name,
          formData.role,
          formData.bio,
          avatarUrl,
          formData.skills,
          JSON.stringify(formData.social_links),
          formData.status,
        ]
      );
    }

    return { success: true, message: 'Profil Hero Section berhasil diperbarui!', avatar_url: avatarUrl };
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return { success: false, message: error.message || 'Gagal memperbarui profil.' };
  }
}