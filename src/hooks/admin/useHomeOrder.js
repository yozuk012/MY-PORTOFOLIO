// src/hooks/admin/useHomeOrder.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/client";

// Helper: format error Supabase jadi objek yang readable
const normalizeError = (err) => {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err.message) return err.message;

  // PostgrestError / plain object
  const parts = [err.message, err.details, err.hint, err.code]
    .filter(Boolean)
    .join(" | ");
  return parts || JSON.stringify(err);
};

export function useHomeOrder() {
  const [data, setData] = useState({
    skills: [],
    experiences: [],
    projects: [],
  });
  const [changes, setChanges] = useState({
    skills: {},
    experiences: {},
    projects: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const supabase = createClient();

  // ============================================
  // 1. FETCH SEMUA DATA DARI 3 TABEL
  // ============================================
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [skillsRes, expRes, projRes] = await Promise.all([
        supabase
          .from("skills")
          .select("id, name, score, show_on_home, home_order")
          .order("home_order", { ascending: true })
          .order("name", { ascending: true }),
        supabase
          .from("experiences")
          .select("id, title, type, show_on_home, home_order")
          .order("home_order", { ascending: true })
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id, title, status, show_on_home, home_order")
          .order("home_order", { ascending: true })
          .order("created_at", { ascending: false }),
      ]);

      if (skillsRes.error) throw skillsRes.error;
      if (expRes.error) throw expRes.error;
      if (projRes.error) throw projRes.error;

      setData({
        skills: skillsRes.data || [],
        experiences: expRes.data || [],
        projects: projRes.data || [],
      });
      setChanges({ skills: {}, experiences: {}, projects: {} });
    } catch (err) {
      console.error("Error fetching home order data:", normalizeError(err));
      setError(normalizeError(err) || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 2. TOGGLE VISIBILITY (show_on_home)
  // ============================================
  const toggleVisibility = (table, id) => {
    const item = data[table].find((i) => i.id === id);
    if (!item) return;

    const newVisibility = !item.show_on_home;

    setData((prev) => ({
      ...prev,
      [table]: prev[table].map((i) =>
        i.id === id ? { ...i, show_on_home: newVisibility } : i
      ),
    }));

    setChanges((prev) => ({
      ...prev,
      [table]: {
        ...prev[table],
        [id]: {
          ...(prev[table][id] || {}),
          show_on_home: newVisibility,
        },
      },
    }));
  };

  // ============================================
  // 3. UPDATE ORDER (home_order)
  // ============================================
  const updateOrder = (table, id, newOrder) => {
    const order = Math.max(0, parseInt(newOrder) || 0);

    setData((prev) => ({
      ...prev,
      [table]: prev[table].map((i) =>
        i.id === id ? { ...i, home_order: order } : i
      ),
    }));

    setChanges((prev) => ({
      ...prev,
      [table]: {
        ...prev[table],
        [id]: {
          ...(prev[table][id] || {}),
          home_order: order,
        },
      },
    }));
  };

  // ============================================
  // 4. MOVE UP / MOVE DOWN
  // ============================================
  const moveItem = (table, id, direction) => {
    const list = data[table];
    const currentIndex = list.findIndex((i) => i.id === id);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const currentItem = list[currentIndex];
    const targetItem = list[targetIndex];

    const tempOrder = currentItem.home_order;
    updateOrder(table, currentItem.id, targetItem.home_order);
    updateOrder(table, targetItem.id, tempOrder);
  };

  // ============================================
  // 5. SAVE ALL CHANGES (pakai .update() per-row)
  // ============================================
  const saveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const tables = ["skills", "experiences", "projects"];
      let totalUpdated = 0;

      for (const table of tables) {
        const tableChanges = changes[table];
        const changedIds = Object.keys(tableChanges);

        if (changedIds.length === 0) continue;

        for (const id of changedIds) {
          const original = data[table].find((i) => i.id === id);

          // Skip jika item tidak ditemukan (stale state)
          if (!original) {
            console.warn(
              `[useHomeOrder] Item ${id} tidak ditemukan di tabel ${table}, dilewati.`
            );
            continue;
          }

          // Build payload: gabungkan perubahan dengan nilai original
          const payload = {
            show_on_home:
              tableChanges[id].show_on_home ?? original.show_on_home,
            home_order: tableChanges[id].home_order ?? original.home_order,
            updated_at: new Date().toISOString(),
          };

          // ✅ FIX: gunakan .update() bukan .upsert()
          // .upsert() gagal karena PostgreSQL mengevaluasi NOT NULL constraint
          // (mis. skills.name, experiences.title/type, projects.title) SEBELUM
          // deteksi konflik, padahal payload kita tidak menyertakan kolom tersebut.
          const { error: updateError } = await supabase
            .from(table)
            .update(payload)
            .eq("id", id);

          if (updateError) {
            console.error(
              `[useHomeOrder] Gagal update ${table}/${id}:`,
              {
                message: updateError.message,
                details: updateError.details,
                hint: updateError.hint,
                code: updateError.code,
              }
            );
            throw updateError;
          }

          totalUpdated++;
        }
      }

      // Reset changes & refresh data
      setChanges({ skills: {}, experiences: {}, projects: {} });
      setSuccessMessage(
        `Berhasil menyimpan ${totalUpdated} perubahan tampilan.`
      );
      await fetchAll();
    } catch (err) {
      // Log detail lengkap untuk debugging
      console.error("Error saving changes:", {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        stack: err?.stack,
        raw: err,
      });

      // Pesan error untuk user
      const msg =
        err?.message ||
        err?.details ||
        err?.hint ||
        "Gagal menyimpan perubahan. Periksa console untuk detail.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 6. RESET CHANGES
  // ============================================
  const resetChanges = () => {
    setChanges({ skills: {}, experiences: {}, projects: {} });
    fetchAll();
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
    fetchAll();
  }, [fetchAll]);

  const pendingChangesCount = Object.values(changes).reduce(
    (acc, table) => acc + Object.keys(table).length,
    0
  );

  return {
    data,
    changes,
    loading,
    saving,
    error,
    successMessage,
    pendingChangesCount,
    toggleVisibility,
    updateOrder,
    moveItem,
    saveChanges,
    resetChanges,
    clearMessages,
  };
}