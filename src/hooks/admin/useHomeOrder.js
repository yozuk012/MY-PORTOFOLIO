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
    notes: [],
  });
  
  // ✅ PERBAIKAN 1: Tambahkan notes ke state changes
  const [changes, setChanges] = useState({
    skills: {},
    experiences: {},
    projects: {},
    notes: {},
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const supabase = createClient();

  // ============================================
  // 1. FETCH SEMUA DATA
  // ============================================
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ PERBAIKAN 2: Hapus prefix 'dev.' (client sudah handle schema)
      // ✅ PERBAIKAN 3: Fetch show_on_home & home_order langsung dari DB untuk notes
      const [skillsRes, expRes, projRes, notesRes] = await Promise.all([
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
        supabase
          .from("notes")
          .select("id, title, show_on_home, home_order, is_published, published_at")
          .order("home_order", { ascending: true })
          .order("published_at", { ascending: false }),
      ]);

      if (skillsRes.error) throw skillsRes.error;
      if (expRes.error) throw expRes.error;
      if (projRes.error) throw projRes.error;
      if (notesRes.error) throw notesRes.error;

      setData({
        skills: skillsRes.data || [],
        experiences: expRes.data || [],
        projects: projRes.data || [],
        // ✅ PERBAIKAN 4: Tidak ada lagi hardcode mapping untuk notes
        notes: notesRes.data || [],
      });
      
      setChanges({ skills: {}, experiences: {}, projects: {}, notes: {} });
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

    // ✅ PERBAIKAN 5: Hapus guard 'if (table === "notes") return;' 
    // Sekarang notes bisa di-toggle seperti tabel lainnya
    const newVisibility = !item.show_on_home;
    setError(null);

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

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const currentItem = list[currentIndex];
    const targetItem = list[targetIndex];

    const tempOrder = currentItem.home_order;
    updateOrder(table, currentItem.id, targetItem.home_order);
    updateOrder(table, targetItem.id, tempOrder);
  };

  // ============================================
  // 5. SAVE ALL CHANGES (MENGGUNAKAN RPC ATOMIK)
  // ============================================
  const saveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // ✅ PERBAIKAN 6: Format payload untuk RPC
      const payload = {
        p_skills: Object.entries(changes.skills).map(([id, c]) => ({
          id,
          show_on_home: c.show_on_home,
          home_order: c.home_order,
        })),
        p_experiences: Object.entries(changes.experiences).map(([id, c]) => ({
          id,
          show_on_home: c.show_on_home,
          home_order: c.home_order,
        })),
        p_projects: Object.entries(changes.projects).map(([id, c]) => ({
          id,
          show_on_home: c.show_on_home,
          home_order: c.home_order,
        })),
        p_notes: Object.entries(changes.notes).map(([id, c]) => ({
          id,
          show_on_home: c.show_on_home,
          home_order: c.home_order,
        })),
      };

      // ✅ PERBAIKAN 7: Panggil RPC 1x saja (tanpa prefix 'dev.')
      const { data: totalUpdated, error: rpcError } = await supabase.rpc(
        "save_home_order", 
        payload
      );

      if (rpcError) throw rpcError;

      // Reset state & refresh data
      setChanges({ skills: {}, experiences: {}, projects: {}, notes: {} });
      setSuccessMessage(`Berhasil menyimpan ${totalUpdated || 0} perubahan tampilan.`);
      await fetchAll();
      
    } catch (err) {
      console.error("Error saving changes via RPC:", {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
      });

      const msg =
        err?.message ||
        err?.details ||
        err?.hint ||
        "Gagal menyimpan perubahan. Pastikan Anda sudah login dan memiliki akses.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 6. RESET CHANGES
  // ============================================
  const resetChanges = () => {
    setChanges({ skills: {}, experiences: {}, projects: {}, notes: {} });
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

  // Menghitung total perubahan (otomatis mencakup 'notes')
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