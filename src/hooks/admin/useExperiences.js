"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/client";
// 🆕 BARU: Import fungsi translate
import { translateToEnglish } from "@/lib/translate";

// ============================================
// KONFIGURASI STORAGE
// ============================================
const BUCKET_NAME = "my-portofolio";
const EXPERIENCE_FOLDER = "experiences";

const parseYear = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
};

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

  const supabase = useMemo(() => createClient(), []);

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

      if (error) throw new Error(extractErrorMessage(error, "Gagal memuat data pengalaman"));
      setExperiences(data || []);
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal memuat data pengalaman"));
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================
  // 2. UPLOAD IMAGE (SELALU NAMA BARU, TANPA UPSERT)
  // ============================================
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `exp-${Date.now()}.${fileExt}`;
      const filePath = `${EXPERIENCE_FOLDER}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (error) throw new Error(extractErrorMessage(error, "Gagal mengupload gambar"));

      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (err) {
      throw new Error("Gagal mengupload gambar: " + extractErrorMessage(err, "unknown error"));
    }
  };

  // ============================================
  // 3. DELETE IMAGE (BEST EFFORT - JANGAN BLOKIR UI)
  // ============================================
  const deleteImage = async (imageUrl) => {
    if (!imageUrl) return true;

    try {
      let filePath = "";
      if (imageUrl.includes(`/public/${BUCKET_NAME}/`)) {
        filePath = imageUrl.split(`/public/${BUCKET_NAME}/`)[1].split(/[?#]/)[0];
      } else if (imageUrl.startsWith(`${EXPERIENCE_FOLDER}/`)) {
        filePath = imageUrl.split(/[?#]/)[0];
      }

      filePath = decodeURIComponent(filePath).trim();
      if (!filePath) return false;

      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return true; 
    } catch (err) {
      return false;
    }
  };

  // ============================================
  // 4. CREATE EXPERIENCE + AUTO TRANSLATE
  // ============================================
  const createExperience = async (formData, imageFile = null) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const yearError = validateYears(parseYear(formData.start_year), parseYear(formData.end_year));
      if (yearError) {
        setError(yearError);
        return false;
      }

      let imageUrl = null;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      // 🆕 BARU: Auto-translate text fields secara paralel (lebih cepat)
      const [title_en, description_en, type_en] = await Promise.all([
        translateToEnglish(formData.title),
        translateToEnglish(formData.description),
        translateToEnglish(formData.type),
      ]);

      const { data, error } = await supabase
        .from("experiences")
        .insert([{
          type: formData.type,
          type_en: type_en, // 🆕 Simpan hasil translate
          title: formData.title,
          title_en: title_en, // 🆕 Simpan hasil translate
          description: formData.description,
          description_en: description_en, // 🆕 Simpan hasil translate
          start_year: parseYear(formData.start_year),
          end_year: parseYear(formData.end_year),
          image_url: imageUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        if (imageUrl) await deleteImage(imageUrl); // Rollback
        throw new Error(extractErrorMessage(error, "Gagal menambahkan pengalaman"));
      }

      setExperiences((prev) => [data, ...prev]);
      setSuccessMessage("Pengalaman berhasil ditambahkan dan diterjemahkan!");
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal menambahkan pengalaman"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 5. UPDATE EXPERIENCE + AUTO TRANSLATE
  // ============================================
  const updateExperience = async (id, formData, imageFile = null) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const yearError = validateYears(parseYear(formData.start_year), parseYear(formData.end_year));
      if (yearError) {
        setError(yearError);
        return false;
      }

      // 1. Ambil URL lama dari database
      const { data: existingData } = await supabase
        .from("experiences")
        .select("image_url")
        .eq("id", id)
        .maybeSingle();

      const oldImageUrl = existingData?.image_url || null;
      let imageUrl = oldImageUrl;

      // 2. Jika ada file baru, upload sebagai file BARU (bukan upsert)
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      } else if (formData.image_url === null || formData.image_url === "") {
        imageUrl = null; // User menghapus gambar
      }

      // 🆕 BARU: Auto-translate text fields secara paralel
      const [title_en, description_en, type_en] = await Promise.all([
        translateToEnglish(formData.title),
        translateToEnglish(formData.description),
        translateToEnglish(formData.type),
      ]);

      // 3. Update Database (Ini yang utama)
      const { data, error } = await supabase
        .from("experiences")
        .update({
          type: formData.type,
          type_en: type_en, // 🆕 Update hasil translate
          title: formData.title,
          title_en: title_en, // 🆕 Update hasil translate
          description: formData.description,
          description_en: description_en, // 🆕 Update hasil translate
          start_year: parseYear(formData.start_year),
          end_year: parseYear(formData.end_year),
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(extractErrorMessage(error, "Gagal memperbarui pengalaman"));
      }

      // 4. BEST EFFORT DELETE: Coba hapus file lama, tapi JANGAN gagalkan proses jika gagal.
      if (imageFile && oldImageUrl && oldImageUrl !== imageUrl) {
        deleteImage(oldImageUrl);
      }

      setExperiences((prev) => prev.map((exp) => (exp.id === id ? data : exp)));
      setSuccessMessage("Pengalaman berhasil diperbarui dan diterjemahkan!");
      return true;
    } catch (err) {
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

      const { error } = await supabase.from("experiences").delete().eq("id", id);
      if (error) throw new Error(extractErrorMessage(error, "Gagal menghapus pengalaman"));

      if (imageUrl) await deleteImage(imageUrl);

      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
      setSuccessMessage("Pengalaman berhasil dihapus!");
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "Gagal menghapus pengalaman"));
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

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
    fetchExperiences,
    createExperience,
    updateExperience,
    deleteExperience,
    clearMessages,
  };
}