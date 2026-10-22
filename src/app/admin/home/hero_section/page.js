'use client';

import { useState, useEffect } from 'react';
import { useHeroSection } from '@/hooks/useHeroSection';
import { getHeroProfile, updateHeroProfile } from '@/actions/profile.actions';

export default function HeroSectionPage() {
  // Data profil diambil lewat Server Action karena halaman ini Client Component
  const [initialProfile, setInitialProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    getHeroProfile()
      .then((data) => {
        if (isActive) setInitialProfile(data);
      })
      .catch((err) => {
        console.error('Gagal memuat data profil:', err);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const {
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
  } = useHeroSection(initialProfile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveProfile(updateHeroProfile);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Hero Section</h1>
          <p className="text-sm text-gray-600">Kelola informasi utama yang tampil di halaman depan.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
          
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}
          {successMessage && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">{successMessage}</div>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role / Pekerjaan</label>
              <input type="text" name="role" value={formData.role} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Bio Singkat</label>
            <textarea name="bio" rows={3} value={formData.bio} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Foto Profil</label>
            <div className="mt-2 flex items-center gap-4">
              {formData.avatar_url && (
                <img src={formData.avatar_url} alt="Preview" className="h-16 w-16 rounded-full object-cover border border-gray-200" />
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">3 Skills Utama</label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[0, 1, 2].map((index) => (
                <input key={index} type="text" value={formData.skills[index]} onChange={(e) => handleSkillChange(index, e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder={`Skill ${index + 1}`} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Media Sosial</label>
              <button type="button" onClick={addSocialLink} className="text-sm font-medium text-blue-600 hover:text-blue-800">+ Tambah</button>
            </div>
            <div className="space-y-3">
              {formData.social_links.map((link, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input type="text" placeholder="Platform (cth: GitHub)" value={link.platform || ''} onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <input type="url" placeholder="URL" value={link.url || ''} onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                    className="flex-[2] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <button type="button" onClick={() => removeSocialLink(index)} className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100">Hapus</button>
                </div>
              ))}
              {formData.social_links.length === 0 && <p className="text-sm text-gray-500 italic">Belum ada media sosial.</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status Ketersediaan</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="available">Available for Hire</option>
              <option value="busy">Busy / Working on Projects</option>
              <option value="unavailable">Not Available</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button type="submit" disabled={isSaving}
              className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
