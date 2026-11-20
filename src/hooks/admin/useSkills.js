"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/client";
// 🆕 BARU: Import fungsi translate
import { translateToEnglish } from "@/lib/translate";

export function useSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const supabase = createClient();

  // ============================================
  // 1. FETCH ALL SKILLS
  // ============================================
  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("score", { ascending: false }) // urut dari skor tertinggi
        .order("name", { ascending: true });

      if (error) throw error;

      setSkills(data || []);
    } catch (err) {
      console.error("Error fetching skills:", err);
      setError(err.message || "Gagal memuat data skills");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 2. CREATE SKILL + AUTO TRANSLATE
  // ============================================
  const createSkill = async (formData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // 🆕 BARU: Auto-translate name dan description secara paralel (lebih cepat)
      const [name_en, description_en] = await Promise.all([
        translateToEnglish(formData.name),
        translateToEnglish(formData.description),
      ]);

      const { data, error } = await supabase
        .from("skills")
        .insert([
          {
            name: formData.name,
            name_en: name_en, // 🆕 Simpan hasil translate
            description: formData.description,
            description_en: description_en, // 🆕 Simpan hasil translate
            score: Number(formData.score) || 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSkills((prev) =>
        [...prev, data].sort(
          (a, b) => b.score - a.score || a.name.localeCompare(b.name)
        )
      );
      setSuccessMessage("Skill baru berhasil ditambahkan dan diterjemahkan!");
      return true;
    } catch (err) {
      console.error("Error creating skill:", err);
      setError(err.message || "Gagal menambahkan skill");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 3. UPDATE SKILL + AUTO TRANSLATE
  // ============================================
  const updateSkill = async (id, formData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // 🆕 BARU: Auto-translate name dan description secara paralel
      const [name_en, description_en] = await Promise.all([
        translateToEnglish(formData.name),
        translateToEnglish(formData.description),
      ]);

      const { data, error } = await supabase
        .from("skills")
        .update({
          name: formData.name,
          name_en: name_en, // 🆕 Update hasil translate
          description: formData.description,
          description_en: description_en, // 🆕 Update hasil translate
          score: Number(formData.score) || 5,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setSkills((prev) =>
        prev
          .map((skill) => (skill.id === id ? data : skill))
          .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      );
      setSuccessMessage("Skill berhasil diperbarui dan diterjemahkan!");
      return true;
    } catch (err) {
      console.error("Error updating skill:", err);
      setError(err.message || "Gagal memperbarui skill");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 4. DELETE SKILL
  // ============================================
  const deleteSkill = async (id) => {
    try {
      setDeletingId(id);
      setError(null);
      setSuccessMessage(null);

      const { error } = await supabase.from("skills").delete().eq("id", id);

      if (error) throw error;

      setSkills((prev) => prev.filter((skill) => skill.id !== id));
      setSuccessMessage("Skill berhasil dihapus!");
      return true;
    } catch (err) {
      console.error("Error deleting skill:", err);
      setError(err.message || "Gagal menghapus skill");
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
    fetchSkills();
  }, [fetchSkills]);

  return {
    skills,
    loading,
    saving,
    deletingId,
    error,
    successMessage,
    createSkill,
    updateSkill,
    deleteSkill,
    clearMessages,
  };
}