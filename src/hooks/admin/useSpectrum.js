"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/client";

// ============================================
// HELPER: Ekstrak YouTube ID dari URL
// ============================================
const extractYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getErrorMessage = (error, fallbackMessage) => {
  if (!error) return fallbackMessage;
  const details = [error.message, error.details, error.hint, error.code]
    .filter(Boolean)
    .join(" | ");
  return details || fallbackMessage;
};

export function useSpectrum() {
  const [songs, setSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const supabase = useMemo(() => createClient(), []);

  // ============================================
  // 1. FETCH ALL SONGS
  // ============================================
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("featured_songs")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;

      setSongs(data || []);
      
      // Cari lagu yang sedang aktif
      const active = data?.find((song) => song.is_active) || null;
      setActiveSong(active);
    } catch (err) {
      console.error("Error fetching songs:", err);
      setError(err.message || "Gagal memuat data playlist");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================
  // 2. ADD SONG
  // ============================================
  const addSong = async (formData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Validasi maksimal 5 lagu di sisi client (sebelum ke DB)
      if (songs.length >= 5) {
        throw new Error("Maksimal hanya 5 lagu yang diizinkan dalam playlist.");
      }

      // Auto-extract YouTube ID jika user hanya memasukkan URL
      const youtubeId = formData.youtube_id || extractYoutubeId(formData.youtube_url);
      if (!youtubeId) {
        throw new Error("Link YouTube tidak valid. Pastikan format URL benar.");
      }

      const { data, error } = await supabase
        .from("featured_songs")
        .insert([
          {
            title: formData.title,
            artist: formData.artist,
            youtube_url: formData.youtube_url,
            youtube_id: youtubeId,
            vibe_1: formData.vibe_1 || "#0F172A",
            vibe_2: formData.vibe_2 || "#3B82F6",
            vibe_3: formData.vibe_3 || "#A5B4FC",
            wave_speed: formData.wave_speed || "slow",
            wave_amplitude: formData.wave_amplitude || "low",
            is_active: formData.is_active || false,
            order_index: formData.order_index || (songs.length + 1),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSongs((prev) => [...prev, data].sort((a, b) => a.order_index - b.order_index));
      if (data.is_active) setActiveSong(data);
      
      setSuccessMessage("Lagu berhasil ditambahkan ke playlist!");
      return true;
    } catch (err) {
      console.error("Error adding song:", err);
      setError(getErrorMessage(err, "Gagal menambahkan lagu"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 3. UPDATE SONG
  // ============================================
  const updateSong = async (id, formData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const youtubeId = formData.youtube_id || extractYoutubeId(formData.youtube_url);
      if (!youtubeId) {
        throw new Error("Link YouTube tidak valid.");
      }

      const { data, error } = await supabase
        .from("featured_songs")
        .update({
          title: formData.title,
          artist: formData.artist,
          youtube_url: formData.youtube_url,
          youtube_id: youtubeId,
          vibe_1: formData.vibe_1,
          vibe_2: formData.vibe_2,
          vibe_3: formData.vibe_3,
          wave_speed: formData.wave_speed,
          wave_amplitude: formData.wave_amplitude,
          is_active: formData.is_active, // Trigger DB akan otomatis mematikan lagu lain jika ini true
          order_index: formData.order_index,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setSongs((prev) => 
        prev.map((song) => (song.id === id ? data : song))
            .sort((a, b) => a.order_index - b.order_index)
      );
      
      if (data.is_active) {
        setActiveSong(data);
      } else if (activeSong?.id === id) {
        setActiveSong(null); // Jika lagu yang aktif di-uncheck
      }

      setSuccessMessage("Data lagu berhasil diperbarui!");
      return true;
    } catch (err) {
      console.error("Error updating song:", err);
      setError(getErrorMessage(err, "Gagal memperbarui lagu"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 4. DELETE SONG
  // ============================================
  const deleteSong = async (id) => {
    try {
      setDeletingId(id);
      setError(null);
      setSuccessMessage(null);

      const { error } = await supabase
        .from("featured_songs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSongs((prev) => prev.filter((song) => song.id !== id));
      if (activeSong?.id === id) setActiveSong(null);
      
      setSuccessMessage("Lagu berhasil dihapus dari playlist!");
      return true;
    } catch (err) {
      console.error("Error deleting song:", err);
      setError(getErrorMessage(err, "Gagal menghapus lagu"));
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================
  // 5. SET ACTIVE SONG (Quick Toggle)
  // ============================================
  const setActiveSongById = async (id) => {
    try {
      setSaving(true);
      setError(null);

      // Update is_active = true. 
      // Trigger DB 'ensure_single_active_song' akan otomatis mematikan lagu lainnya.
      const { data, error } = await supabase
        .from("featured_songs")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setSongs((prev) => prev.map((song) => ({
        ...song,
        is_active: song.id === id
      })));
      setActiveSong(data);
      setSuccessMessage(`Vibe "${data.title}" sekarang aktif!`);
      return true;
    } catch (err) {
      console.error("Error setting active song:", err);
      setError(getErrorMessage(err, "Gagal mengubah lagu aktif"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 6. CLEAR MESSAGES
  // ============================================
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // ============================================
  // AUTO FETCH ON MOUNT
  // ============================================
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return {
    songs,
    activeSong,
    loading,
    saving,
    deletingId,
    error,
    successMessage,
    fetchSongs,
    addSong,
    updateSong,
    deleteSong,
    setActiveSongById,
    clearMessages,
  };
}