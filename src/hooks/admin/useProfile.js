"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/client";
import { translateToEnglish } from "@/lib/translate";

// ============================================
// KONFIGURASI STORAGE
// ============================================
const BUCKET_NAME = "my-portofolio";
const PROFILE_FOLDER = "profiles";
const CV_FOLDER = "curriculum vitae"; // Sesuai dengan nama folder di bucket Anda
const MAX_CV_SIZE = 5 * 1024 * 1024;

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
  // 🆕 3. UPLOAD CV (KHUSUS FILE PDF/DOKUMEN)
  // ============================================
  const uploadCV = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      if (fileExt !== "pdf" || (file.type && file.type !== "application/pdf")) {
        throw new Error("File CV harus berformat PDF.");
      }

      if (file.size > MAX_CV_SIZE) {
        throw new Error("Ukuran file CV maksimal 5 MB.");
      }

      const fileName = `cv-${Date.now()}.${fileExt}`;
      const filePath = `${CV_FOLDER}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: "application/pdf",
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Error uploading CV:", err);
      throw new Error("Gagal mengupload CV: " + err.message);
    }
  };

  // ============================================
  // 4. DELETE OLD IMAGE (BEST EFFORT / FIRE-AND-FORGET)
  // ============================================
  const deleteOldImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
      const markerIndex = imageUrl.indexOf(marker);
      
      let filePath = "";
      if (markerIndex !== -1) {
        filePath = decodeURIComponent(imageUrl.slice(markerIndex + marker.length).split(/[?#]/)[0]);
      } else if (imageUrl.startsWith(`${PROFILE_FOLDER}/`)) {
        filePath = decodeURIComponent(imageUrl.split(/[?#]/)[0]);
      }

      if (!filePath || !filePath.startsWith(`${PROFILE_FOLDER}/`)) {
        console.warn("⛔ [deleteOldImage] Path tidak valid:", filePath);
        return;
      }

      const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      if (error) console.warn("⚠️ [deleteOldImage] Gagal menghapus gambar lama:", error.message);
    } catch (err) {
      console.warn("⚠️ [deleteOldImage] Exception:", err);
    }
  };

  // ============================================
  // 🆕 5. DELETE OLD CV (BEST EFFORT / FIRE-AND-FORGET)
  // ============================================
  const deleteOldCV = async (cvUrl) => {
    if (!cvUrl) return;

    try {
      const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
      const markerIndex = cvUrl.indexOf(marker);
      
      let filePath = "";
      if (markerIndex !== -1) {
        filePath = decodeURIComponent(cvUrl.slice(markerIndex + marker.length).split(/[?#]/)[0]);
      } else if (cvUrl.includes(CV_FOLDER)) {
        const folderIndex = cvUrl.indexOf(CV_FOLDER);
        filePath = decodeURIComponent(cvUrl.slice(folderIndex).split(/[?#]/)[0]);
      }

      if (!filePath) return;

      const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      if (error) console.warn("⚠️ [deleteOldCV] Gagal menghapus CV lama:", error.message);
    } catch (err) {
      console.warn("⚠️ [deleteOldCV] Exception:", err);
    }
  };

  // ============================================
  // 6. UPDATE PROFILE (Create or Update) + AUTO TRANSLATE + CV
  // ============================================
  const updateProfile = async (formData, imageFile = null, cvFile = null) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccessMessage(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Sesi login tidak valid. Silakan logout lalu login kembali.");
      }

      let photoUrl = formData.photo_url;
      let cvUrl = formData.cv_url; // Ambil dari form (bisa URL lama, atau null jika dihapus)
      
      const oldPhotoUrl = profile?.photo_url;
      const oldCvUrl = profile?.cv_url;

      // 1. Upload file baru terlebih dahulu (jika ada)
      if (imageFile) {
        photoUrl = await uploadImage(imageFile);
      }
      if (cvFile) {
        cvUrl = await uploadCV(cvFile);
      } else if (formData.cv_url === null || formData.cv_url === "") {
        cvUrl = null; // User secara eksplisit menghapus CV
      }

      // 2. Prepare data dasar untuk database (Bahasa Indonesia)
      const baseData = {
        full_name: formData.full_name,
        bio: formData.bio,
        photo_url: photoUrl,
        cv_url: cvUrl, // 🆕 BARU: Simpan URL CV
        role: formData.role,
        top_skills: formData.top_skills || [],
        social_links: (formData.social_links || []).map((link) => ({
          platform: link.platform?.trim() || "",
          url: link.url?.trim() || "",
        })),
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      // 3. AUTO-TRANSLATE field teks utama ke Bahasa Inggris (Paralel)
      const [full_name_en, bio_en, role_en] = await Promise.all([
        translateToEnglish(baseData.full_name),
        translateToEnglish(baseData.bio),
        translateToEnglish(baseData.role),
      ]);

      // 4. Gabungkan data ID dan data EN
      const finalData = {
        ...baseData,
        full_name_en,
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
      const imageChanged = (imageFile !== null || photoUrl === null) && oldPhotoUrl && oldPhotoUrl !== photoUrl;
      if (imageChanged) {
        deleteOldImage(oldPhotoUrl);
      }

      const cvChanged = (cvFile !== null || cvUrl === null) && oldCvUrl && oldCvUrl !== cvUrl;
      if (cvChanged) {
        deleteOldCV(oldCvUrl);
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
  // 7. UPDATE AVAILABILITY STATUS
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
        isActive ? "Status availability diaktifkan." : "Status availability dinonaktifkan."
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
  // 8. CLEAR MESSAGES
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