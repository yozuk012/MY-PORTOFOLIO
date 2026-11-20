// src/app/(admin)/admin/spectrum/page.js
"use client";

import { useState } from "react";
import { useSpectrum } from "@/hooks/admin/useSpectrum";

import { Form, FormField, FormActions } from "../components/Form";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableActions,
  EmptyState,
  LoadingState,
  Badge,
} from "../components/Table";
import Button from "../components/Button";
import BackButton from "../components/BackButton";

import {
  FaPlus,
  FaTimes,
  FaMusic,
  FaPlay,
  FaPalette,
  FaWaveSquare,
  FaExternalLinkAlt,
  FaCheck,
} from "react-icons/fa";

export default function ManageSpectrumPage() {
  const {
    songs,
    activeSong,
    loading,
    saving,
    deletingId,
    error,
    successMessage,
    addSong,
    updateSong,
    deleteSong,
    setActiveSongById,
    clearMessages,
  } = useSpectrum();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    youtube_url: "",
    youtube_id: "",
    vibe_1: "#0F172A",
    vibe_2: "#3B82F6",
    vibe_3: "#A5B4FC",
    wave_speed: "slow",
    wave_amplitude: "low",
    is_active: false,
    order_index: 1,
  });

  // ============================================
  // HANDLERS
  // ============================================
  const handleOpenAdd = () => {
    clearMessages();
    setEditingId(null);
    setFormData({
      title: "",
      artist: "",
      youtube_url: "",
      youtube_id: "",
      vibe_1: "#0F172A",
      vibe_2: "#3B82F6",
      vibe_3: "#A5B4FC",
      wave_speed: "slow",
      wave_amplitude: "low",
      is_active: songs.length === 0, // Jika belum ada lagu, langsung aktif
      order_index: songs.length + 1,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (song) => {
    clearMessages();
    setEditingId(song.id);
    setFormData({
      title: song.title || "",
      artist: song.artist || "",
      youtube_url: song.youtube_url || "",
      youtube_id: song.youtube_id || "",
      vibe_1: song.vibe_1 || "#0F172A",
      vibe_2: song.vibe_2 || "#3B82F6",
      vibe_3: song.vibe_3 || "#A5B4FC",
      wave_speed: song.wave_speed || "slow",
      wave_amplitude: song.wave_amplitude || "low",
      is_active: song.is_active || false,
      order_index: song.order_index || 1,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    clearMessages();
    let success = false;

    if (editingId) {
      success = await updateSong(editingId, formData);
    } else {
      success = await addSong(formData);
    }

    if (success) {
      handleCloseForm();
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Hapus "${title}" dari playlist?`)) {
      clearMessages();
      await deleteSong(id);
    }
  };

  const handleSetActive = async (id) => {
    clearMessages();
    await setActiveSongById(id);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ===== Header Halaman ===== */}
      <div>
        <BackButton />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-xs font-mono text-accent tracking-widest">
                06
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
                Manage Spectrum
              </h1>
            </div>
            <p className="text-sm md:text-base text-text-muted max-w-2xl">
              Kelola playlist background (maksimal 5 lagu). Setiap lagu memiliki
              "DNA visual" berupa 3 warna dan gerakan gelombang yang menentukan
              suasana halaman utama portofolio.
            </p>
          </div>

          <Button
            leftIcon={FaPlus}
            onClick={handleOpenAdd}
            disabled={isFormOpen || songs.length >= 5}
          >
            {songs.length >= 5 ? "Playlist Penuh (5/5)" : "Tambah Lagu"}
          </Button>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent" />
      </div>

      {/* ===== Alert Messages ===== */}
      {successMessage && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2.5">
          <FaCheck className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-mono text-green-400">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2.5">
          <span className="text-red-400 text-sm">⚠</span>
          <p className="text-xs font-mono text-red-400">{error}</p>
        </div>
      )}

      {/* ============================================ */}
      {/* BAGIAN FORM                                  */}
      {/* ============================================ */}
      {isFormOpen && (
        <div className="bg-surface/30 border border-border/40 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-mono text-accent tracking-widest">
                {editingId ? "EDIT" : "NEW"}
              </span>
              <h2 className="text-xl font-semibold text-text-main tracking-tight">
                {editingId ? "Edit Lagu" : "Tambah Lagu Baru"}
              </h2>
            </div>
            <button
              onClick={handleCloseForm}
              className="p-2 text-text-muted hover:text-text-main hover:bg-surface rounded-lg transition-colors"
              aria-label="Tutup form"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          <Form onSubmit={handleSubmit} isLoading={saving} className="space-y-6">
            {/* Info Lagu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Judul Lagu"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Imagine"
                required
              />

              <FormField
                label="Nama Artis"
                name="artist"
                type="text"
                value={formData.artist}
                onChange={handleChange}
                placeholder="Contoh: John Lennon"
                required
              />
            </div>

            <FormField
              label="Link YouTube"
              name="youtube_url"
              type="url"
              value={formData.youtube_url}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              helpText="ID video akan diekstrak otomatis. Pastikan link valid."
              required
            />

            {/* 🎨 Vibe Colors + Live Preview */}
            <div className="border-t border-border/40 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FaPalette className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-text-main">
                  Vibe Colors (DNA Visual)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Color Pickers */}
                <div className="space-y-4">
                  {[
                    { name: "vibe_1", label: "Warna 1 (Base / Latar)" },
                    { name: "vibe_2", label: "Warna 2 (Mid / Gradient)" },
                    { name: "vibe_3", label: "Warna 3 (Accent / Highlight)" },
                  ].map((color) => (
                    <div key={color.name} className="flex items-center gap-3">
                      <input
                        type="color"
                        name={color.name}
                        value={formData[color.name]}
                        onChange={handleChange}
                        className="w-12 h-10 rounded-lg border border-border/40 cursor-pointer bg-transparent"
                      />
                      <div className="flex-1">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-text-muted block mb-1">
                          {color.label}
                        </label>
                        <input
                          type="text"
                          name={color.name}
                          value={formData[color.name]}
                          onChange={handleChange}
                          className="w-full px-3 py-1.5 bg-surface/40 border border-border/40 rounded-lg text-xs font-mono text-text-main focus:outline-none focus:border-accent transition-colors"
                          maxLength={7}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 🎨 Live Vibe Preview */}
                <div className="flex flex-col">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
                    Live Preview
                  </label>
                  <div
                    className="flex-1 min-h-[160px] rounded-lg border border-border/40 overflow-hidden relative group"
                    style={{
                      background: `linear-gradient(135deg, ${formData.vibe_1} 0%, ${formData.vibe_2} 50%, ${formData.vibe_3} 100%)`,
                      transition: "background 0.5s ease",
                    }}
                  >
                    {/* Simulasi gelombang */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 opacity-30">
                      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                        <path
                          d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-mono uppercase tracking-widest text-white/80 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded">
                        {formData.title || "Preview"} — {formData.artist || "Artis"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Wave Motion */}
            <div className="border-t border-border/40 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FaWaveSquare className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-text-main">
                  Wave Motion (Gerakan Gelombang)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Kecepatan Gelombang"
                  name="wave_speed"
                  type="select"
                  value={formData.wave_speed}
                  onChange={handleChange}
                  options={[
                    { value: "slow", label: "Slow (20s) — Tenang, santai" },
                    { value: "normal", label: "Normal (10s) — Seimbang" },
                    { value: "fast", label: "Fast (5s) — Energik, cepat" },
                  ]}
                />

                <FormField
                  label="Tinggi Gelombang (Amplitudo)"
                  name="wave_amplitude"
                  type="select"
                  value={formData.wave_amplitude}
                  onChange={handleChange}
                  options={[
                    { value: "low", label: "Low (20px) — Halus, lembut" },
                    { value: "medium", label: "Medium (40px) — Sedang" },
                    { value: "high", label: "High (80px) — Besar, dramatis" },
                  ]}
                />
              </div>
            </div>

            {/* Order & Active */}
            <div className="border-t border-border/40 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Urutan Playlist"
                name="order_index"
                type="number"
                value={formData.order_index}
                onChange={handleChange}
                helpText="Angka lebih kecil tampil lebih kiri/atas. Default: otomatis."
              />

              <FormField
                label="Jadikan Lagu Aktif (Now Playing)"
                name="is_active"
                type="toggle"
                value={formData.is_active}
                onChange={handleChange}
                helpText="Hanya 1 lagu yang bisa aktif. Mengaktifkan ini akan menonaktifkan lagu lain."
              />
            </div>

            <FormActions
              submitLabel={editingId ? "Perbarui Lagu" : "Simpan Lagu"}
              onCancel={handleCloseForm}
              isLoading={saving}
            />
          </Form>
        </div>
      )}

      {/* ============================================ */}
      {/* BAGIAN TABEL DAFTAR LAGU                     */}
      {/* ============================================ */}
      <div className="bg-surface/30 border border-border/40 rounded-xl overflow-hidden">
        {loading ? (
          <LoadingState rows={5} columns={6} />
        ) : !songs || songs.length === 0 ? (
          <EmptyState
            message="Belum ada lagu ditambahkan"
            icon={FaMusic}
          />
        ) : (
          <Table>
            <TableHeader
              columns={[
                { label: "No", width: "50px" },
                { label: "Lagu & Artis" },
                { label: "Vibe Preview", width: "180px" },
                { label: "Wave", width: "140px" },
                { label: "Status", width: "120px" },
                { label: "Aksi", width: "180px" },
              ]}
            />
            <TableBody>
              {songs.map((song, index) => (
                <TableRow key={song.id}>
                  {/* No */}
                  <TableCell className="text-text-muted/60 font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>

                  {/* Lagu & Artis */}
                  <TableCell>
                    <div className="flex items-center gap-2 mb-1">
                      <FaMusic className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="font-medium text-text-main text-sm">
                        {song.title}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted/80 ml-5.5">
                      {song.artist}
                    </div>
                    <a
                      href={song.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-accent/70 hover:text-accent transition-colors ml-5.5 mt-1"
                    >
                      <FaExternalLinkAlt className="w-2.5 h-2.5" />
                      Buka di YouTube
                    </a>
                  </TableCell>

                  {/* Vibe Preview */}
                  <TableCell>
                    <div
                      className="w-full h-10 rounded-md border border-border/40"
                      style={{
                        background: `linear-gradient(135deg, ${song.vibe_1} 0%, ${song.vibe_2} 50%, ${song.vibe_3} 100%)`,
                      }}
                      title={`${song.vibe_1} → ${song.vibe_2} → ${song.vibe_3}`}
                    />
                  </TableCell>

                  {/* Wave */}
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="info">
                        {song.wave_speed}
                      </Badge>
                      <Badge variant="default">
                        {song.wave_amplitude}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {song.is_active ? (
                      <Badge variant="success">
                        <FaPlay className="w-2 h-2 mr-1" />
                        Now Playing
                      </Badge>
                    ) : (
                      <Badge variant="default">Idle</Badge>
                    )}
                  </TableCell>

                  {/* Aksi */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {/* Tombol Set Active (hanya muncul jika belum aktif) */}
                      {!song.is_active && (
                        <button
                          type="button"
                          onClick={() => handleSetActive(song.id)}
                          disabled={saving}
                          className="p-2 text-text-muted hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-40"
                          title="Jadikan lagu aktif"
                          aria-label="Set active"
                        >
                          <FaPlay className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <TableActions
                        onEdit={() => handleOpenEdit(song)}
                        onDelete={() => handleDelete(song.id, song.title)}
                        isLoading={deletingId === song.id}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ===== Info Counter ===== */}
      <div className="flex items-center justify-between text-xs font-mono text-text-muted/60 px-1">
        <span>
          {songs.length}/5 lagu dalam playlist
        </span>
        {activeSong && (
          <span className="text-accent">
            ♪ Now Playing: {activeSong.title} — {activeSong.artist}
          </span>
        )}
      </div>
    </div>
  );
}