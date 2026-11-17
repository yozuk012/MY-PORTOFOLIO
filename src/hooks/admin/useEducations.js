// src/hooks/admin/useEducations.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/client";

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
  const [deletingId, setDeletingId] = useState(null); // Menyimpan ID yang sedang dihapus
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const supabase = createClient();

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
  }, []);

  // ============================================
  // 2. CREATE EDUCATION
  // ============================================
  const createEducation = async (formData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const { data, error } = await supabase
        .from("educations")
        .insert([
          {
            institution: formData.institution,
            start_year: parseInt(formData.start_year),
            end_year: formData.end_year ? parseInt(formData.end_year) : null,
            degree: formData.degree,
            description: formData.description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Tambahkan data baru ke state (atau fetch ulang)
      setEducations((prev) => [data, ...prev]);
      setSuccessMessage("Data edukasi berhasil ditambahkan!");
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
  // 3. UPDATE EDUCATION
  // ============================================
  const updateEducation = async (id, formData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const { data, error } = await supabase
        .from("educations")
        .update({
          institution: formData.institution,
          start_year: parseInt(formData.start_year),
          end_year: formData.end_year ? parseInt(formData.end_year) : null,
          degree: formData.degree,
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update state
      setEducations((prev) => prev.map((edu) => (edu.id === id ? data : edu)));
      setSuccessMessage("Data edukasi berhasil diperbarui!");
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

      // Hapus dari state
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
    createEducation,
    updateEducation,
    deleteEducation,
    clearMessages,
  };
}