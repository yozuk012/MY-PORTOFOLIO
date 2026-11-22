// src/hooks/admin/useFeatureToggles.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/client";

// Helper: format error Supabase jadi objek yang readable (konsisten dengan hook lain)
const normalizeError = (err) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;

  const parts = [err.message, err.details, err.hint, err.code]
    .filter(Boolean)
    .join(" | ");
  return parts || JSON.stringify(err);
};

export function useFeatureToggles() {
  const [toggles, setToggles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); // State untuk loading saat toggle diklik
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const supabase = createClient();

  // ============================================
  // 1. FETCH SEMUA TOGGLES
  // ============================================
  const fetchToggles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Urutkan berdasarkan feature_key agar grouping (section_ dan page_) rapi di UI
      const { data, error } = await supabase
        .from("feature_toggles")
        .select("feature_key, is_enabled, description")
        .order("feature_key", { ascending: true });

      if (error) throw error;

      setToggles(data || []);
    } catch (err) {
      console.error("Error fetching feature toggles:", normalizeError(err));
      setError(normalizeError(err) || "Gagal memuat data fitur.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 2. TOGGLE STATUS FITUR
  // ============================================
  const toggleFeature = async (featureKey, currentValue) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const newValue = !currentValue;

      // Update langsung ke database
      const { error } = await supabase
        .from("feature_toggles")
        .update({ 
          is_enabled: newValue,
          updated_at: new Date().toISOString() // Eksplisit update timestamp
        })
        .eq("feature_key", featureKey);

      if (error) throw error;

      setSuccessMessage(
        `Status fitur berhasil diperbarui menjadi ${newValue ? "Aktif" : "Nonaktif"}.`
      );
      
      // Refresh data untuk memastikan UI sinkron dengan database
      await fetchToggles();
      
    } catch (err) {
      console.error("Error toggling feature:", normalizeError(err));
      setError(normalizeError(err) || "Gagal memperbarui status fitur.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 3. AUTO FETCH ON MOUNT
  // ============================================
  useEffect(() => {
    fetchToggles();
  }, [fetchToggles]);

  return {
    toggles,
    loading,
    saving,
    error,
    successMessage,
    toggleFeature,
  };
}