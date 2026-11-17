// src/hooks/admin/useProfile.js
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/client";

// Konfigurasi Storage
const BUCKET_NAME = "my-portofolio";
const PROFILE_FOLDER = "picture-profile";

const getErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;

  if (error.code === "PGRST116") {
    return "Profile tidak dapat diperbarui. Periksa RLS Supabase: user yang sudah login harus memiliki policy UPDATE pada tabel profile.";
  }

  const details = [error.message, error.details, error.hint, error.code]
    .filter(Boolean)
    .join(" | ");

  return details || fallbackMessage;
};

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const supabase = useMemo(() => createClient(), []);

  // ============================================
  // FETCH PROFILE
  // ============================================
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        // PGRST116 = tidak ada data (tabel kosong)
        if (error.code === "PGRST116") {
          setProfile(null);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Gagal memuat data profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // UPLOAD IMAGE TO SUPABASE STORAGE
  // ============================================
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      // Generate unique filename dengan timestamp
      const fileExt = file.name.split(".").pop();
      const fileName = `profile-${Date.now()}.${fileExt}`;
      const filePath = `${PROFILE_FOLDER}/${fileName}`;

      // Upload ke bucket my-portofolio, folder picture-profile
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

      // Dapatkan public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Error uploading image:", err);
      throw new Error("Gagal mengupload gambar: " + err.message);
    }
  };

  // ============================================
  // DELETE OLD IMAGE (opsional, untuk cleanup)
  // ============================================
  const deleteOldImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
      const markerIndex = imageUrl.indexOf(marker);
      if (markerIndex === -1) return;

      const filePath = decodeURIComponent(
        imageUrl.slice(markerIndex + marker.length).split(/[?#]/)[0]
      );

      if (!filePath.startsWith(`${PROFILE_FOLDER}/`)) return;

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) throw error;
    } catch (err) {
      // Gagal hapus tidak fatal, hanya log
      console.warn("Gagal menghapus gambar lama:", err);
    }
  };

  // ============================================
  // UPDATE PROFILE
  // ============================================
  const updateProfile = async (formData, imageFile = null) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccessMessage(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Sesi login tidak valid. Silakan logout lalu login kembali.");
      }

      let photoUrl = formData.photo_url;
      const oldPhotoUrl = profile?.photo_url;

      // Upload file baru terlebih dahulu. URL blob hanya untuk preview di browser.
      if (imageFile) {
        photoUrl = await uploadImage(imageFile);
      }

      // Prepare data untuk update
      const updateData = {
        full_name: formData.full_name,
        bio: formData.bio,
        photo_url: photoUrl,
        role: formData.role,
        top_skills: formData.top_skills || [],
        social_links: (formData.social_links || []).map((link) => ({
          platform: link.platform?.trim() || "",
          url: link.url?.trim() || "",
        })),
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      // Jika profile belum ada, insert baru
      if (!profile) {
        const { data, error } = await supabase
          .from("profile")
          .insert([updateData])
          .select()
          .single();

        if (error) throw error;

        setProfile(data);
        setSuccessMessage("Profile berhasil dibuat!");
      } else {
        // Jika sudah ada, update
        const { data, error } = await supabase
          .from("profile")
          .update(updateData)
          .eq("id", profile.id)
          .select()
          .single();

        if (error) throw error;

        setProfile(data);
        setSuccessMessage("Profile berhasil diperbarui!");
      }

      // Hapus file lama hanya setelah URL baru berhasil disimpan ke database.
      if (imageFile && oldPhotoUrl && oldPhotoUrl !== photoUrl) {
        await deleteOldImage(oldPhotoUrl);
      }

      return true;
    } catch (err) {
      console.error("Error updating profile:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        error: err,
      });
      setError(getErrorMessage(err, "Gagal memperbarui profile"));
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateAvailability = async (isActive) => {
    if (!profile) return false;

    try {
      setUpdating(true);
      setError(null);
      setSuccessMessage(null);

      const { error } = await supabase
        .from("profile")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, is_active: isActive });
      setSuccessMessage(
        isActive
          ? "Status availability diaktifkan."
          : "Status availability dinonaktifkan."
      );
      return true;
    } catch (err) {
      console.error("Error updating availability:", err);
      setError(getErrorMessage(err, "Gagal memperbarui status availability"));
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // ============================================
  // CLEAR MESSAGES
  // ============================================
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // ============================================
  // AUTO FETCH ON MOUNT
  // ============================================
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    updating,
    error,
    successMessage,
    fetchProfile,
    updateProfile,
    updateAvailability,
    clearMessages,
  };
}