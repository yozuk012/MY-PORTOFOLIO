"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/client";
// 🆕 BARU: Import fungsi translate
import { translateToEnglish } from "@/lib/translate";

export function useContacts() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const supabase = createClient();

  // ============================================
  // 1. FETCH CONTACT
  // ============================================
  const fetchContact = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .limit(1)
        .single();

      if (error) {
        // PGRST116 = tabel kosong, belum ada data kontak
        if (error.code === "PGRST116") {
          setContact(null);
        } else {
          throw error;
        }
      } else {
        setContact(data);
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError(err.message || "Gagal memuat data kontak");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 2. UPDATE / INSERT CONTACT (Upsert) + AUTO TRANSLATE
  // ============================================
  const updateContact = async (formData) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccessMessage(null);

      // 🆕 BARU: Auto-translate hanya field teks yang relevan (address & location)
      // Email, phone, whatsapp TIDAK diterjemahkan karena format universal
      const [address_en, location_en] = await Promise.all([
        translateToEnglish(formData.address),
        translateToEnglish(formData.location),
      ]);

      const updateData = {
        email: formData.email || null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        address: formData.address || null,
        address_en: address_en, // 🆕 Simpan hasil translate
        location: formData.location || null,
        location_en: location_en, // 🆕 Simpan hasil translate
        updated_at: new Date().toISOString(),
      };

      // Jika data kontak belum ada, insert baru
      if (!contact) {
        const { data, error } = await supabase
          .from("contacts")
          .insert([updateData])
          .select()
          .single();

        if (error) throw error;

        setContact(data);
        setSuccessMessage("Data kontak berhasil dibuat dan diterjemahkan!");
      } else {
        // Jika sudah ada, update
        const { data, error } = await supabase
          .from("contacts")
          .update(updateData)
          .eq("id", contact.id)
          .select()
          .single();

        if (error) throw error;

        setContact(data);
        setSuccessMessage("Data kontak berhasil diperbarui dan diterjemahkan!");
      }

      return true;
    } catch (err) {
      console.error("Error updating contacts:", err);
      setError(err.message || "Gagal memperbarui data kontak");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // ============================================
  // 3. CLEAR MESSAGES
  // ============================================
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // ============================================
  // AUTO FETCH ON MOUNT
  // ============================================
  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  return {
    contact,
    loading,
    updating,
    error,
    successMessage,
    updateContact,
    clearMessages,
  };
}