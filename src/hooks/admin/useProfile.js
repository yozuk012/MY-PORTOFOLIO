"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/client";
// 🆕 BARU: Import fungsi translate dari lib yang sudah kamu buat
import { translateToEnglish } from "@/lib/translate";

// ============================================
// KONFIGURASI STORAGE
// ============================================
const BUCKET_NAME = "my-portofolio";
const PROFILE_FOLDER = "profiles";

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
  // 1. FETCH PROFILE
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
        if (error.code === "PGRST116") {
          setProfile(null); // Tabel kosong, ini normal untuk pertama kali
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
  }, [supabase]);

  // ============================================
  // 2. UPLOAD IMAGE (STABIL: NAMA BARU + UPSERT FALSE)
  // ============================================
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `profile-${Date.now()}.${fileExt}`;
      const filePath = `${PROFILE_FOLDER}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

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
  // 3. DELETE OLD IMAGE (BEST EFFORT / FIRE-AND-FORGET)
  // ============================================
  const deleteOldImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
      const markerIndex = imageUrl.indexOf(marker);
      
      let filePath = "";
      if (markerIndex !== -1) {
        filePath = decodeURIComponent(
          imageUrl.slice(markerIndex + marker.length).split(/[?#]/)[0]
        );
      } else if (imageUrl.startsWith(`${PROFILE_FOLDER}/`)) {
        filePath = decodeURIComponent(imageUrl.split(/[?#]/)[0]);
      }

      if (!filePath || !filePath.startsWith(`${PROFILE_FOLDER}/`)) {
        console.warn("⛔ [deleteOldImage] Path tidak valid atau di luar folder profiles:", filePath);
        return;
      }

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.warn("⚠️ [deleteOldImage] Gagal menghapus gambar lama (Best Effort):", error.message);
      } else {
        console.log("✅ [deleteOldImage] Berhasil dihapus:", filePath);
      }
    } catch (err) {
      console.warn("⚠️ [deleteOldImage] Exception saat menghapus:", err);
    }
  };

  // ============================================
  // 4. UPDATE PROFILE (Create or Update) + AUTO TRANSLATE
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

      // 1. Upload file baru terlebih dahulu (jika ada)
      if (imageFile) {
        photoUrl = await uploadImage(imageFile);
      }

      // 2. Prepare data dasar untuk database (Bahasa Indonesia)
      const baseData = {
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

      // 🆕 BARU: 3. AUTO-TRANSLATE field teks utama ke Bahasa Inggris
      // Kita gunakan Promise.all agar proses translate berjalan paralel (lebih cepat)
      const [full_name_en, bio_en, role_en] = await Promise.all([
        translateToEnglish(baseData.full_name),
        translateToEnglish(baseData.bio),
        translateToEnglish(baseData.role),
      ]);

      // 4. Gabungkan data ID dan data EN
      const finalData = {
        ...baseData,
        full_name_en, // Akan jadi null jika API gagal (aman, frontend akan fallback ke ID)
        bio_en,
        role_en,
      };

      // 5. Insert atau Update ke database
      if (!profile) {
        const { data, error } = await supabase
          .from("profile")
          .insert([finalData])
          .select()
          .single();

        if (error) throw error;

        setProfile(data);
        setSuccessMessage("Profile berhasil dibuat dan diterjemahkan!");
      } else {
        const { data, error } = await supabase
          .from("profile")
          .update(finalData)
          .eq("id", profile.id)
          .select()
          .single();

        if (error) throw error;

        setProfile(data);
        setSuccessMessage("Profile berhasil diperbarui dan diterjemahkan!");
      }

      // 6. Hapus file lama HANYA JIKA update database berhasil (Best Effort)
      if (imageFile && oldPhotoUrl && oldPhotoUrl !== photoUrl) {
        deleteOldImage(oldPhotoUrl);
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

  // ============================================
  // 5. UPDATE AVAILABILITY STATUS
  // ============================================
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
  // 6. CLEAR MESSAGES
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