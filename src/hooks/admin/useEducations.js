"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/client";
import { translateToEnglish } from "@/lib/translate";

const getErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;

  const details = [error.message, error.details, error.hint, error.code]
    .filter(Boolean)
    .join(" | ");

  return details || fallbackMessage;
};

export function useEducations() {
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ✅ FIX: Gunakan useMemo agar client tidak dibuat ulang setiap render
  const supabase = useMemo(() => createClient(), []);

  // ============================================
  // 1. FETCH ALL EDUCATIONS
  // ============================================
  const fetchEducations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("educations")
        .select("*")
        .order("start_year", { ascending: false }); // Urutkan dari tahun terbaru

      if (error) throw error;

      setEducations(data || []);
    } catch (err) {
      console.error("Error fetching educations:", err);
      setError(err.message || "Gagal memuat data edukasi");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================
  // 2. CREATE EDUCATION + AUTO TRANSLATE + MAJOR
  // ============================================
  const createEducation = async (formData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // 🆕 BARU: Tambahkan major ke dalam auto-translate paralel
      const [institution_en, degree_en, description_en, major_en] = await Promise.all([
        translateToEnglish(formData.institution),
        translateToEnglish(formData.degree),
        translateToEnglish(formData.description),
        translateToEnglish(formData.major || ""),
      ]);

      const { data, error } = await supabase
        .from("educations")
        .insert([
          {
            institution: formData.institution,
            institution_en: institution_en,
            start_year: parseInt(formData.start_year),
            end_year: formData.end_year ? parseInt(formData.end_year) : null,
            degree: formData.degree,
            degree_en: degree_en,
            // 🆕 BARU: Field Jurusan
            major: formData.major || null,
            major_en: major_en || null,
            description: formData.description,
            description_en: description_en,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setEducations((prev) => [data, ...prev]);
      setSuccessMessage("Data edukasi berhasil ditambahkan dan diterjemahkan!");
      return true;
    } catch (err) {
      console.error("Error creating education:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        error: err,
      });
      setError(getErrorMessage(err, "Gagal menambahkan data edukasi"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 3. UPDATE EDUCATION + AUTO TRANSLATE + MAJOR
  // ============================================
  const updateEducation = async (id, formData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // 🆕 BARU: Tambahkan major ke dalam auto-translate paralel
      const [institution_en, degree_en, description_en, major_en] = await Promise.all([
        translateToEnglish(formData.institution),
        translateToEnglish(formData.degree),
        translateToEnglish(formData.description),
        translateToEnglish(formData.major || ""),
      ]);

      const { data, error } = await supabase
        .from("educations")
        .update({
          institution: formData.institution,
          institution_en: institution_en,
          start_year: parseInt(formData.start_year),
          end_year: formData.end_year ? parseInt(formData.end_year) : null,
          degree: formData.degree,
          degree_en: degree_en,
          // 🆕 BARU: Field Jurusan
          major: formData.major || null,
          major_en: major_en || null,
          description: formData.description,
          description_en: description_en,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setEducations((prev) => prev.map((edu) => (edu.id === id ? data : edu)));
      setSuccessMessage("Data edukasi berhasil diperbarui dan diterjemahkan!");
      return true;
    } catch (err) {
      console.error("Error updating education:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        error: err,
      });
      setError(getErrorMessage(err, "Gagal memperbarui data edukasi"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 4. DELETE EDUCATION
  // ============================================
  const deleteEducation = async (id) => {
    try {
      setDeletingId(id);
      setError(null);
      setSuccessMessage(null);

      const { error } = await supabase
        .from("educations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setEducations((prev) => prev.filter((edu) => edu.id !== id));
      setSuccessMessage("Data edukasi berhasil dihapus!");
      return true;
    } catch (err) {
      console.error("Error deleting education:", {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        error: err,
      });
      setError(getErrorMessage(err, "Gagal menghapus data edukasi"));
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================
  // 5. CLEAR MESSAGES
  // ============================================
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // ============================================
  // AUTO FETCH ON MOUNT
  // ============================================
  useEffect(() => {
    fetchEducations();
  }, [fetchEducations]);

  return {
    educations,
    loading,
    saving,
    deletingId,
    error,
    successMessage,
    fetchEducations,
    createEducation,
    updateEducation,
    deleteEducation,
    clearMessages,
  };
}