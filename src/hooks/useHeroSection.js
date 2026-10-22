'use client';

import { useState, useEffect } from 'react';

/**
 * Custom Hook untuk mengelola data dan state form Hero Section (Profile)
 * @param {Object} initialProfileData - Data profile awal dari database (diteruskan dari Server Component)
 */
export function useHeroSection(initialProfileData) {
  
  // 1. State utama untuk menampung data form
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    bio: '',
    avatar_url: '',
    skills: ['', '', ''], // Fixed array untuk 3 skills utama
    social_links: [],     // Dynamic array of objects: { platform: '', url: '' }
    status: 'available',
    avatar_file: null,    // Menampung File object sementara sebelum di-upload ke server
  });

  // 2. State untuk UI feedback (Loading, Error, Success)
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // 3. Inisialisasi data jika ada data dari database (initialProfileData)
  useEffect(() => {
    if (initialProfileData) {
      // Ambil maksimal 3 skills, jika kurang dari 3, sisanya diisi string kosong
      const dbSkills = initialProfileData.skills || [];
      const formattedSkills = [
        dbSkills[0] || '',
        dbSkills[1] || '',
        dbSkills[2] || '',
      ];

      setFormData({
        full_name: initialProfileData.full_name || '',
        role: initialProfileData.role || '',
        bio: initialProfileData.bio || '',
        avatar_url: initialProfileData.avatar_url || '',
        skills: formattedSkills,
        social_links: Array.isArray(initialProfileData.social_links) ? initialProfileData.social_links : [],
        status: initialProfileData.status || 'available',
        avatar_file: null,
      });
    }
  }, [initialProfileData]);

  // --- HANDLERS (Logika Manipulasi State) ---

  // Handler untuk input teks biasa (full_name, role, bio)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFeedback();
  };

  // Handler khusus untuk array skills (hanya bisa diisi maksimal 3)
  const handleSkillChange = (index, value) => {
    setFormData((prev) => {
      const newSkills = [...prev.skills];
      newSkills[index] = value;
      return { ...prev, skills: newSkills };
    });
    clearFeedback();
  };

  // Handler untuk social links (bisa ditambah/dikurangi)
  const handleSocialLinkChange = (index, field, value) => {
    setFormData((prev) => {
      const newLinks = [...prev.social_links];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return { ...prev, social_links: newLinks };
    });
    clearFeedback();
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      social_links: [...prev.social_links, { platform: '', url: '' }],
    }));
  };

  const removeSocialLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index),
    }));
  };

  // Handler untuk upload gambar Avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simpan file object untuk dikirim ke Server Action, dan buat preview URL
      setFormData((prev) => ({ 
        ...prev, 
        avatar_file: file, 
        avatar_url: URL.createObjectURL(file) // Untuk preview di UI
      }));
    }
  };

  // --- FEEDBACK MANAGEMENT ---
  const clearFeedback = () => {
    if (error) setError(null);
    if (successMessage) setSuccessMessage('');
  };

  // --- SAVE ACTION (Persiapan payload untuk Server Action) ---
  const saveProfile = async (serverAction) => {
    setIsSaving(true);
    clearFeedback();

    try {
      // Validasi dasar
      if (!formData.full_name.trim()) {
        throw new Error('Nama lengkap tidak boleh kosong.');
      }

      // Filter skills yang kosong agar tidak menyimpan array kosong di DB
      const validSkills = formData.skills.filter(skill => skill.trim() !== '');

      // Susun payload yang akan dikirim ke Server Action
      const payload = {
        full_name: formData.full_name,
        role: formData.role,
        bio: formData.bio,
        skills: validSkills,
        social_links: formData.social_links,
        status: formData.status,
        avatar_file: formData.avatar_file, // File object (akan dihandle di server)
        current_avatar_url: formData.avatar_file ? null : formData.avatar_url, // URL lama jika tidak upload baru
      };

      // Panggil Server Action yang dikirim dari component
      const result = await serverAction(payload);

      if (!result?.success) {
        throw new Error(result?.message || 'Gagal menyimpan data.');
      }

      setSuccessMessage(result.message || 'Profil Hero Section berhasil diperbarui!');

      // Setelah upload, ganti preview blob dengan path asli dari server
      if (result.avatar_url) {
        setFormData((prev) => ({ ...prev, avatar_url: result.avatar_url, avatar_file: null }));
      } else {
        setFormData((prev) => ({ ...prev, avatar_file: null }));
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setIsSaving(false);
    }
  };

  // Kembalikan semua state dan handler yang dibutuhkan oleh UI Component
  return {
    formData,
    isSaving,
    error,
    successMessage,
    handleChange,
    handleSkillChange,
    handleSocialLinkChange,
    addSocialLink,
    removeSocialLink,
    handleAvatarChange,
    saveProfile,
  };
}