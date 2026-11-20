// src/app/(admin)/admin/experiences/page.js
"use client";

import { useState } from "react";
import { useExperiences } from "@/hooks/admin/useExperiences";

import { Form, FormField, FileUpload, FormActions } from "../components/Form";
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
  ImagePreview,
} from "../components/Table";
import Button from "../components/Button";
import BackButton from "../components/BackButton";

import { FaBriefcase, FaPlus, FaTimes, FaCalendarAlt } from "react-icons/fa";

// Helper: format rentang tahun
// - (2023, 2024) => "2023 — 2024"
// - (2023, null) => "2023 — Sekarang"
// - (2023, 2023) => "2023"
// - (null, null) => null (tidak ditampilkan)
const formatYearRange = (start, end) => {
  if (!start && !end) return null;
  if (start && !end) return `${start} — Sekarang`;
  if (!start && end) return `${end}`;
  if (start === end) return `${start}`;
  return `${start} — ${end}`;
};

export default function ManageExperiencesPage() {
  const {
    experiences,
    loading,
    saving,
    deletingId,
    error,
    successMessage,
    createExperience,
    updateExperience,
    deleteExperience,
    clearMessages,
  } = useExperiences();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    start_year: "",
    end_year: "",
    image_url: "",
  });

  const [imageFile, setImageFile] = useState(null);

  // ============================================
  // HANDLERS
  // ============================================
  const handleOpenAdd = () => {
    clearMessages();
    setEditingId(null);
    setFormData({
      type: "",
      title: "",
      description: "",
      start_year: "",
      end_year: "",
      image_url: "",
    });
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (exp) => {
    clearMessages();
    setEditingId(exp.id);
    setFormData({
      type: exp.type || "",
      title: exp.title || "",
      description: exp.description || "",
      start_year: exp.start_year ?? "",
      end_year: exp.end_year ?? "",
      image_url: exp.image_url || "",
    });
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setImageFile(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file) => {
    setImageFile(file);
    if (!file) {
      setFormData((prev) => ({ ...prev, image_url: null }));
    }
  };

  const handleSubmit = async () => {
    clearMessages();
    let success = false;

    if (editingId) {
      success = await updateExperience(editingId, formData, imageFile);
    } else {
      success = await createExperience(formData, imageFile);
    }

    if (success) {
      handleCloseForm();
    }
  };

  const handleDelete = async (id, imageUrl) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengalaman ini?")) {
      clearMessages();
      await deleteExperience(id, imageUrl);
    }
  };

  // Helper untuk warna Badge berdasarkan jenis pengalaman
  const getTypeBadgeVariant = (type) => {
    const variants = {
      pkl: "info",
      magang: "info",
      seminar: "purple",
      project: "success",
      organization: "warning",
      volunteer: "warning",
      other: "default",
    };
    return variants[type] || "default";
  };

  // Format label badge (uppercase)
  const formatTypeLabel = (type) => {
    if (!type) return "LAINNYA";
    return type.toUpperCase();
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ===== Header Halaman ===== */}
      <div>
        <BackButton />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-baseline gap-4 mb-3">
              <span className="text-xs font-mono text-accent tracking-widest">
                04
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
                Manage Experiences
              </h1>
            </div>
            <p className="text-sm md:text-base text-text-muted max-w-2xl">
              Kelola pengalaman PKL, magang, seminar, dan kegiatan lainnya.
            </p>
          </div>

          <Button
            leftIcon={FaPlus}
            onClick={handleOpenAdd}
            disabled={isFormOpen}
          >
            Tambah Pengalaman
          </Button>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent" />
      </div>

      {/* ===== Alert Messages ===== */}
      {successMessage && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2.5">
          <span className="text-green-400 text-sm">✓</span>
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
                {editingId ? "Edit Pengalaman" : "Tambah Pengalaman Baru"}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Jenis Pengalaman"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleChange}
                options={[
                  { value: "pkl", label: "PKL (Praktek Kerja Lapangan)" },
                  { value: "magang", label: "Magang / Internship" },
                  { value: "seminar", label: "Seminar / Workshop" },
                  { value: "project", label: "Project Pribadi / Kampus" },
                  { value: "organization", label: "Organisasi" },
                  { value: "volunteer", label: "Volunteer" },
                  { value: "other", label: "Lainnya" },
                ]}
                required
              />

              <FormField
                label="Judul Pengalaman"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Frontend Developer Intern di PT X"
                required
              />
            </div>

            {/* ===== Baris Tahun ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Tahun Mulai"
                name="start_year"
                type="number"
                value={formData.start_year}
                onChange={handleChange}
                placeholder="Contoh: 2023"
                min="1980"
                max="2100"
                required
              />

              <FormField
                label="Tahun Selesai"
                name="end_year"
                type="number"
                value={formData.end_year}
                onChange={handleChange}
                placeholder="Kosongkan jika masih berjalan"
                min="1980"
                max="2100"
                helpText="Biarkan kosong jika pengalaman masih berjalan (akan ditampilkan sebagai 'Sekarang')"
              />
            </div>

            <FormField
              label="Deskripsi"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan peran, tanggung jawab, atau hal yang dipelajari..."
              rows={4}
              required
            />

            <FileUpload
              label="Bukti / Dokumentasi Gambar"
              name="image"
              value={formData.image_url}
              onChange={handleFileChange}
              helpText="Upload foto kegiatan, sertifikat, atau screenshot hasil (PNG, JPG, WEBP)"
            />

            <FormActions
              submitLabel={editingId ? "Perbarui Pengalaman" : "Simpan Pengalaman"}
              onCancel={handleCloseForm}
              isLoading={saving}
            />
          </Form>
        </div>
      )}

      {/* ============================================ */}
      {/* BAGIAN TABEL DAFTAR PENGALAMAN               */}
      {/* ============================================ */}
      <div className="bg-surface/30 border border-border/40 rounded-xl overflow-hidden">
        {loading ? (
          <LoadingState rows={5} columns={5} />
        ) : !experiences || experiences.length === 0 ? (
          <EmptyState
            message="Belum ada data pengalaman ditambahkan"
            icon={FaBriefcase}
          />
        ) : (
          <Table>
            <TableHeader
              columns={[
                { label: "No", width: "60px" },
                { label: "Dokumentasi", width: "100px" },
                { label: "Judul, Jenis & Tahun" },
                { label: "Deskripsi", width: "300px" },
                { label: "Aksi", width: "150px" },
              ]}
            />
            <TableBody>
              {experiences.map((exp, index) => {
                const yearRange = formatYearRange(exp.start_year, exp.end_year);

                return (
                  <TableRow key={exp.id}>
                    {/* No */}
                    <TableCell className="text-text-muted/60 font-mono text-xs">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>

                    {/* Dokumentasi */}
                    <TableCell>
                      <ImagePreview
                        src={exp.image_url}
                        alt={exp.title}
                        size="sm"
                      />
                    </TableCell>

                    {/* Judul, Jenis & Tahun */}
                    <TableCell>
                      <div className="flex items-center gap-2 mb-1.5">
                        <FaBriefcase className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="font-medium text-text-main text-sm">
                          {exp.title}
                        </span>
                      </div>
                      <div className="ml-5.5 flex flex-wrap items-center gap-1.5">
                        <Badge variant={getTypeBadgeVariant(exp.type)}>
                          {formatTypeLabel(exp.type)}
                        </Badge>
                        {yearRange && (
                          <Badge variant="default">
                            <span className="inline-flex items-center gap-1">
                              <FaCalendarAlt className="w-2.5 h-2.5" />
                              {yearRange}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Deskripsi */}
                    <TableCell>
                      <div className="text-xs text-text-muted/80 line-clamp-3">
                        {exp.description || (
                          <span className="italic text-text-muted/40">
                            Tidak ada deskripsi
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell>
                      <TableActions
                        onEdit={() => handleOpenEdit(exp)}
                        onDelete={() => handleDelete(exp.id, exp.image_url)}
                        isLoading={deletingId === exp.id}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}