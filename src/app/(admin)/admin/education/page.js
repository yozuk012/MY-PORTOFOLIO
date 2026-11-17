// src/app/(admin)/admin/education/page.js
"use client";

import { useState } from "react";
import { useEducations } from "@/hooks/admin/useEducations";

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

import { FaPlus, FaGraduationCap, FaTimes } from "react-icons/fa";

export default function ManageEducationPage() {
  const {
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
  } = useEducations();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    institution: "",
    degree: "",
    start_year: "",
    end_year: "",
    description: "",
  });

  // ============================================
  // HANDLERS
  // ============================================
  const handleOpenAdd = () => {
    clearMessages();
    setEditingId(null);
    setFormData({
      institution: "",
      degree: "",
      start_year: "",
      end_year: "",
      description: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (edu) => {
    clearMessages();
    setEditingId(edu.id);
    setFormData({
      institution: edu.institution || "",
      degree: edu.degree || "",
      start_year: edu.start_year || "",
      end_year: edu.end_year || "",
      description: edu.description || "",
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    clearMessages();
    let success = false;

    if (editingId) {
      success = await updateEducation(editingId, formData);
    } else {
      success = await createEducation(formData);
    }

    if (success) {
      handleCloseForm();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data edukasi ini?")) {
      clearMessages();
      await deleteEducation(id);
    }
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
                03
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
                Manage Education
              </h1>
            </div>
            <p className="text-sm md:text-base text-text-muted max-w-2xl">
              Kelola riwayat pendidikan dan jenjang akademik Anda.
            </p>
          </div>

          <Button
            leftIcon={FaPlus}
            onClick={handleOpenAdd}
            disabled={isFormOpen}
          >
            Tambah Edukasi
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
                {editingId ? "Edit Data Edukasi" : "Tambah Data Edukasi Baru"}
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
                label="Nama Institusi"
                name="institution"
                type="text"
                value={formData.institution}
                onChange={handleChange}
                placeholder="Contoh: Universitas Indonesia"
                required
              />

              <FormField
                label="Jenjang Pendidikan"
                name="degree"
                type="select"
                value={formData.degree}
                onChange={handleChange}
                options={[
                  { value: "SMK", label: "SMK" },
                  { value: "D1", label: "D1" },
                  { value: "D2", label: "D2" },
                  { value: "D3", label: "D3" },
                  { value: "D4", label: "D4" },
                  { value: "S1", label: "S1" },
                  { value: "S2", label: "S2" },
                  { value: "S3", label: "S3" },
                  { value: "Bootcamp", label: "Bootcamp" },
                  { value: "Course", label: "Course" },
                  { value: "Other", label: "Other" },
                ]}
                required
              />

              <FormField
                label="Tahun Masuk"
                name="start_year"
                type="number"
                value={formData.start_year}
                onChange={handleChange}
                placeholder="2020"
                required
              />

              <FormField
                label="Tahun Lulus"
                name="end_year"
                type="number"
                value={formData.end_year}
                onChange={handleChange}
                placeholder="2024 (Kosongkan jika masih berjalan)"
              />
            </div>

            <FormField
              label="Deskripsi Singkat"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jurusan apa, prestasi, atau kegiatan utama..."
              rows={3}
            />

            <FormActions
              submitLabel={editingId ? "Perbarui Edukasi" : "Simpan Edukasi"}
              onCancel={handleCloseForm}
              isLoading={saving}
            />
          </Form>
        </div>
      )}

      {/* ============================================ */}
      {/* BAGIAN TABEL DAFTAR EDUKASI                  */}
      {/* ============================================ */}
      <div className="bg-surface/30 border border-border/40 rounded-xl overflow-hidden">
        {loading ? (
          <LoadingState rows={5} columns={5} />
        ) : !educations || educations.length === 0 ? (
          <EmptyState
            message="Belum ada data edukasi ditambahkan"
            icon={FaGraduationCap}
          />
        ) : (
          <Table>
            <TableHeader
              columns={[
                { label: "No", width: "60px" },
                { label: "Institusi & Deskripsi" },
                { label: "Jenjang", width: "120px" },
                { label: "Periode", width: "150px" },
                { label: "Aksi", width: "150px" },
              ]}
            />
            <TableBody>
              {educations.map((edu, index) => (
                <TableRow key={edu.id}>
                  {/* No */}
                  <TableCell className="text-text-muted/60 font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>

                  {/* Institusi & Deskripsi */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FaGraduationCap className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="font-medium text-text-main text-sm">
                        {edu.institution}
                      </span>
                    </div>
                    {edu.description && (
                      <div className="text-xs text-text-muted/80 mt-1 line-clamp-2 max-w-md ml-5.5">
                        {edu.description}
                      </div>
                    )}
                  </TableCell>

                  {/* Jenjang */}
                  <TableCell>
                    {edu.degree ? (
                      <Badge variant="info">{edu.degree}</Badge>
                    ) : (
                      <span className="text-xs font-mono text-text-muted/40 italic">
                        —
                      </span>
                    )}
                  </TableCell>

                  {/* Periode */}
                  <TableCell>
                    <div className="text-xs font-mono text-text-muted">
                      {edu.start_year} — {edu.end_year || "Sekarang"}
                    </div>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell>
                    <TableActions
                      onEdit={() => handleOpenEdit(edu)}
                      onDelete={() => handleDelete(edu.id)}
                      isLoading={deletingId === edu.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}