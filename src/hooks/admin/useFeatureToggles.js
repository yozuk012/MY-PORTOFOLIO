// src/hooks/admin/useFeatureToggles.js
"use client";

import { useState, useEffect, useMemo } from "react";
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

  const supabase = useMemo(() => createClient(), []);

  // ============================================
  // 1. FETCH SEMUA TOGGLES
  // ============================================
  useEffect(() => {
    let ignore = false;

    const query = supabase
      .from("feature_toggles")
      .select("feature_key, is_enabled, description")
      .order("feature_key", { ascending: true });

    Promise.resolve(query)
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) throw error;
        setToggles(data || []);
      })
      .catch((err) => {
        if (ignore) return;
        console.error("Error fetching feature toggles:", normalizeError(err));
        setError(normalizeError(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [supabase]);

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
      const { data, error } = await supabase
        .from("feature_toggles")
        .update({ 
          is_enabled: newValue,
          updated_at: new Date().toISOString() // Eksplisit update timestamp
        })
        .eq("feature_key", featureKey)
        .select("feature_key, is_enabled")
        .maybeSingle();

      if (error) throw error;
      if (!data || data.is_enabled !== newValue) {
        throw new Error("Status fitur tidak berubah. Periksa apakah toggle tersedia dan akun ini memiliki izin untuk mengubahnya.");
      }

      setToggles((items) => items.map((item) =>
        item.feature_key === data.feature_key ? { ...item, is_enabled: data.is_enabled } : item
      ));
      setSuccessMessage(
        `Status fitur berhasil diperbarui menjadi ${newValue ? "Aktif" : "Nonaktif"}.`
      );
      
    } catch (err) {
      console.error("Error toggling feature:", normalizeError(err));
      setError(normalizeError(err) || "Gagal memperbarui status fitur.");
    } finally {
      setSaving(false);
    }
  };

  return {
    toggles,
    loading,
    saving,
    error,
    successMessage,
    toggleFeature,
  };
}