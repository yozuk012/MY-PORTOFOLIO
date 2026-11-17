// src/hooks/admin/useExperiences.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/client";

// Konfigurasi Storage
const BUCKET_NAME = "my-portofolio";
const EXPERIENCE_FOLDER = "experiences-picture";

// Helper: konversi input tahun dari form (string) ke integer atau null
const parseYear = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
};

// Helper: ekstrak pesan dari Supabase error object
// Supabase error: { code, message, details, hint }
// Network error : Error instance (punya .message)
const extractErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (err.message) return err.message;
  if (err.details) return err.details;
  if (err.hint) return err.hint;
  if (err.code) return `Database error (code: ${err.code})`;
  try {
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
};

// Helper: validasi tahun sebelum kirim ke DB
// Return error string kalau tidak valid, null kalau valid
const validateYears = (startYear, endYear) => {
  if (startYear !== null && (startYear < 1980 || startYear > 2100)) {
    return "Tahun mulai harus di antara 1980 dan 2100";
  }
  if (endYear !== null && (endYear < 1980 || endYear > 2100)) {
    return "Tahun selesai harus di antara 1980 dan 2100";
  }
  if (startYear !== null && endYear !== null && endYear < startYear) {
    return "Tahun selesai tidak boleh lebih kecil dari tahun mulai";
  }
  return null;
};

export function useExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const supabase = createClient();

  // ============================================
  // 1. FETCH ALL EXPERIENCES
  // ============================================
  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("start_year", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) {
        // Log full object dulu supaya kelihatan code/details/hint-nya
        console.error("[fetchExperiences] Supabase error:", error);
        throw new Error(extractErrorMessage(error, "Gagal memuat data pengalaman"));
      }

      setExperiences(data || []);
    } catch (err) {
      console.error("[fetchExperiences] Caught:", err);
      setError(extractErrorMessage(err, "Gagal memuat data pengalaman"));
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 2. UPLOAD IMAGE TO STORAGE
  // ============================================
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `exp-${Date.now()}.${fileExt}`;
      const filePath = `${EXPERIENCE_FOLDER}/${fileName}`;

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        console.error("[uploadImage] Supabase error:", error);
        throw new Error(extractErrorMessage(error, "Gagal mengupload gambar"));
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error("[uploadImage] Caught:", err);
      throw new Error(
        "Gagal mengupload gambar: " + extractErrorMessage(err, "unknown error")
      );
    }
  };

  // ============================================
  // 3. DELETE IMAGE FROM STORAGE
  // ============================================
  const deleteImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const urlParts = imageUrl.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
      if (urlParts.length < 2) return;

      const filePath = urlParts[1];

      await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
    } catch (err) {
      console.warn("[deleteImage] Gagal menghapus gambar:", err);
    }
  };

  // ============================================
  // 4. CREATE EXPERIENCE
  // ============================================
  const createExperience = async (formData, imageFile = null) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // --- Parse & validasi tahun ---
      const startYear = parseYear(formData.start_year);
      const endYear = parseYear(formData.end_year);

      const yearError = validateYears(startYear, endYear);
      if (yearError) {
        setError(yearError);
        return false;
      }

      // --- Upload gambar jika ada ---
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { data, error } = await supabase
        .from("experiences")
        .insert([
          {
            type: formData.type,
            title: formData.title,
            description: formData.description,
            start_year: startYear,
            end_year: endYear,
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("[createExperience] Supabase error:", error);
        throw new Error(extractErrorMessage(error, "Gagal menambahkan pengalaman"));
      }

      setExperiences((prev) => [data, ...prev]);
      setSuccessMessage("Pengalaman berhasil ditambahkan!");
      return true;
    } catch (err) {
      console.error("[createExperience] Caught:", err);
      setError(extractErrorMessage(err, "Gagal menambahkan pengalaman"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 5. UPDATE EXPERIENCE
  // ============================================
  const updateExperience = async (id, formData, imageFile = null) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // --- Parse & validasi tahun ---
      const startYear = parseYear(formData.start_year);
      const endYear = parseYear(formData.end_year);

      const yearError = validateYears(startYear, endYear);
      if (yearError) {
        setError(yearError);
        return false;
      }

      // --- Handle image ---
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (formData.image_url) {
          await deleteImage(formData.image_url);
        }
      }

      const { data, error } = await supabase
        .from("experiences")
        .update({
          type: formData.type,
          title: formData.title,
          description: formData.description,
          start_year: startYear,
          end_year: endYear,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        // Log full object — code, details, hint semua bakal kelihatan di console
        console.error("[updateExperience] Supabase error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(extractErrorMessage(error, "Gagal memperbarui pengalaman"));
      }

      setExperiences((prev) => prev.map((exp) => (exp.id === id ? data : exp)));
      setSuccessMessage("Pengalaman berhasil diperbarui!");
      return true;
    } catch (err) {
      console.error("[updateExperience] Caught:", err);
      setError(extractErrorMessage(err, "Gagal memperbarui pengalaman"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 6. DELETE EXPERIENCE
  // ============================================
  const deleteExperience = async (id, imageUrl) => {
    try {
      setDeletingId(id);
      setError(null);
      setSuccessMessage(null);

      const { error } = await supabase
        .from("experiences")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("[deleteExperience] Supabase error:", error);
        throw new Error(extractErrorMessage(error, "Gagal menghapus pengalaman"));
      }

      if (imageUrl) {
        await deleteImage(imageUrl);
      }

      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
      setSuccessMessage("Pengalaman berhasil dihapus!");
      return true;
    } catch (err) {
      console.error("[deleteExperience] Caught:", err);
      setError(extractErrorMessage(err, "Gagal menghapus pengalaman"));
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================
  // 7. CLEAR MESSAGES
  // ============================================
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // ============================================
  // AUTO FETCH ON MOUNT
  // ============================================
  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  return {
    experiences,
    loading,
    saving,
    deletingId,
    error,
    successMessage,
    createExperience,
    updateExperience,
    deleteExperience,
    clearMessages,
  };
}