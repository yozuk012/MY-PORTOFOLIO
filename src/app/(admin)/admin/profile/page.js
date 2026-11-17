// src/app/(admin)/admin/profile/page.js
"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/admin/useProfile";
import {
  Form,
  FormField,
  DynamicArrayInput,
  DynamicSocialLinks,
  FileUpload,
  FormActions,
  PLATFORMS,
} from "../components/Form";
import BackButton from "../components/BackButton";
import {
  FaUserCircle,
  FaSpinner,
  FaMapMarkerAlt,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function ManageProfilePage() {
  const {
    profile,
    loading,
    updating,
    error,
    successMessage,
    updateProfile,
    clearMessages,
  } = useProfile();

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    photo_url: "",
    role: "",
    top_skills: [],
    social_links: [],
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        photo_url: profile.photo_url || "",
        role: profile.role || "",
        top_skills: profile.top_skills || [],
        social_links: profile.social_links || [],
        is_active: profile.is_active ?? true,
      });
    }
  }, [profile]);

  // ============================================
  // DETEKSI FIELD YANG DIUBAH
  // ============================================
  const isDirty = (field) => {
    if (!profile) return false;
    const original =
      profile[field] ?? (field === "is_active" ? true : field === "top_skills" || field === "social_links" ? [] : "");
    const current = formData[field];
    return JSON.stringify(original) !== JSON.stringify(current);
  };

  const dirtyFields = ["full_name", "bio", "role", "photo_url", "top_skills", "social_links", "is_active"].filter(isDirty);

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSkillsChange = (newSkills) => {
    setFormData((prev) => ({ ...prev, top_skills: newSkills }));
  };

  const handleSocialChange = (newLinks) => {
    setFormData((prev) => ({ ...prev, social_links: newLinks }));
  };

  const handleFileChange = (file, previewUrl) => {
    setImageFile(file);
    setFormData((prev) => ({ ...prev, photo_url: previewUrl || "" }));
  };

  const handleSubmit = async () => {
    clearMessages();
    const updated = await updateProfile(formData, imageFile);
    if (updated) setImageFile(null);
  };

  const handleDiscard = () => {
    if (!profile) return;
    setFormData({
      full_name: profile.full_name || "",
      bio: profile.bio || "",
      photo_url: profile.photo_url || "",
      role: profile.role || "",
      top_skills: profile.top_skills || [],
      social_links: profile.social_links || [],
      is_active: profile.is_active ?? true,
    });
    setImageFile(null);
    clearMessages();
  };

  // Helper ikon untuk preview card
  const getPlatformIcon = (platform) => {
    const found = PLATFORMS.find((p) => p.value === platform?.toLowerCase());
    return found?.icon || FaUserCircle;
  };

  // ✅ Helper untuk format link di preview card
  const formatUrl = (platform, url) => {
    if (!url) return "#";
    const key = platform?.toLowerCase().trim();
    const cleanUrl = url.trim();
    if (key === "email") {
      return cleanUrl.startsWith("mailto:") ? cleanUrl : `mailto:${cleanUrl}`;
    }
    return cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`;
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="w-6 h-6 animate-spin text-accent" />
          <p className="text-xs font-mono uppercase tracking-widest text-text-muted">
            Memuat data profile...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN
  // ============================================
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ===== Header ===== */}
      <div className="mb-8">
        <BackButton />
        <div className="flex items-baseline gap-4 mb-3">
          <span className="text-xs font-mono text-accent tracking-widest">01</span>
          <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
            Manage Profile
          </h1>
        </div>
        <p className="text-sm md:text-base text-text-muted max-w-2xl">
          Kelola informasi utama, bio, dan link sosial yang tampil di halaman utama portofolio.
        </p>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mb-8" />

      {/* ===== Alert Messages ===== */}
      {successMessage && (
        <div className="mb-6 p-3.5 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2.5">
          <FaCheck className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-mono text-green-400">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2.5">
          <FaExclamationTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-mono text-red-400 font-medium">Terjadi kesalahan</p>
            <p className="text-[11px] font-mono text-red-400/70 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* ===== PREVIEW: Current Live Profile ===== */}
      {profile && (
        <div className="mb-6 p-5 bg-surface/30 border border-border/40 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
              Current Live Profile
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted/40 ml-auto">
              Ini yang tampil di halaman publik
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-border/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center border border-border/40">
                  <FaUserCircle className="w-7 h-7 text-text-muted/40" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                <h3 className="text-lg font-semibold text-text-main truncate">
                  {profile.full_name || "—"}
                </h3>
                <span className="text-xs font-mono text-accent">
                  {profile.role || "—"}
                </span>
                {profile.is_active ? (
                  <span className="text-[9px] font-mono uppercase tracking-widest text-green-400 bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                ) : (
                  <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted/60 bg-surface border border-border/40 px-1.5 py-0.5 rounded">
                    Offline
                  </span>
                )}
              </div>

              <p className="text-xs text-text-muted/80 line-clamp-2 mb-2.5">
                {profile.bio || <span className="italic text-text-muted/40">Belum ada bio</span>}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {/* Skills */}
                {profile.top_skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.top_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 bg-accent/10 text-accent rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Socials */}
                {profile.social_links?.length > 0 && (
                  <div className="flex gap-2.5 ml-auto sm:ml-0">
                    {profile.social_links.map((link, i) => {
                      const Icon = getPlatformIcon(link.platform);
                      return (
                        <a
                          key={i}
                          // ✅ FIX: Gunakan formatUrl agar preview link email/website valid
                          href={formatUrl(link.platform, link.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-muted hover:text-accent transition-colors"
                          title={link.platform}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Status Perubahan ===== */}
      {dirtyFields.length > 0 && (
        <div className="mb-6 p-3.5 bg-accent/5 border border-accent/30 rounded-lg flex items-center justify-between gap-3">
          <p className="text-xs font-mono text-accent">
            <span className="font-semibold">{dirtyFields.length}</span> perubahan belum disimpan
          </p>
          <button
            type="button"
            onClick={handleDiscard}
            className="text-[10px] font-mono uppercase tracking-widest text-text-muted hover:text-accent transition-colors"
          >
            Batalkan semua
          </button>
        </div>
      )}

      {/* ===== FORM ===== */}
      <div className="bg-surface/30 border border-border/40 rounded-xl p-6 sm:p-8">
        <Form onSubmit={handleSubmit} isLoading={updating} className="space-y-8">

          {/* BAGIAN 1: Foto & Info Dasar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <FileUpload
                label="Foto Profile"
                name="photo"
                value={formData.photo_url}
                onChange={handleFileChange}
                helpText="PNG, JPG, WEBP (Maks. 5MB)"
              />
            </div>

            <div className="md:col-span-2 space-y-6">
              <FormField
                label="Nama Lengkap"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Contoh: Achmad Aldino"
                required
                dirty={isDirty("full_name")}
              />

              <FormField
                label="Role / Posisi"
                name="role"
                type="select"
                value={formData.role}
                onChange={handleChange}
                options={[
                  { value: "Web Developer", label: "Web Developer" },
                  { value: "Writer", label: "Writer" },
                  { value: "UI/UX Design", label: "UI/UX Design" },
                  { value: "Student", label: "Student" },
                  { value: "Other", label: "Other" },
                ]}
                required
                dirty={isDirty("role")}
              />

              <FormField
                label="Bio Singkat"
                name="bio"
                type="textarea"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Ceritakan sedikit tentang dirimu, passion, dan apa yang sedang kamu pelajari..."
                rows={4}
                dirty={isDirty("bio")}
              />
            </div>
          </div>

          {/* BAGIAN 2: Top Skills */}
          <div className="pt-6 border-t border-border/40">
            <DynamicArrayInput
              label="Top Skills Utama"
              name="top_skills"
              value={formData.top_skills}
              onChange={handleSkillsChange}
              maxItems={3}
              placeholder="Contoh: Next.js"
              helpText="Maksimal 3 skill yang paling kamu kuasai untuk ditampilkan di halaman utama."
              dirty={isDirty("top_skills")}
            />
          </div>

          {/* BAGIAN 3: Social Links */}
          <div className="pt-6 border-t border-border/40">
            <DynamicSocialLinks
              label="Social Links Utama"
              value={formData.social_links}
              onChange={handleSocialChange}
              maxItems={3}
              dirty={isDirty("social_links")}
            />
          </div>

          {/* BAGIAN 4: Status & Actions */}
          <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="w-full sm:w-auto">
              <FormField
                label="Status Tampilan"
                name="is_active"
                type="toggle"
                value={formData.is_active}
                onChange={handleChange}
                helpText="Matikan jika sedang maintenance atau tidak ingin profile tampil di halaman utama."
              />
            </div>

            <div className="w-full sm:w-auto">
              <FormActions
                submitLabel={profile ? "Perbarui Profile" : "Simpan Profile"}
                isLoading={updating}
              />
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}