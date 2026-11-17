// src/app/(admin)/admin/projects/page.js
"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/admin/useProjects";

import {
  Form,
  FormField,
  DynamicArrayInput,
  FileUpload,
  FormActions,
} from "../components/Form";
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
  TagsList,
} from "../components/Table";
import Button from "../components/Button";
import BackButton from "../components/BackButton";

import {
  FaProjectDiagram,
  FaPlus,
  FaTimes,
  FaExternalLinkAlt,
} from "react-icons/fa";

export default function ManageProjectsPage() {
  const {
    projects,
    loading,
    saving,
    deletingId,
    error,
    successMessage,
    createProject,
    updateProject,
    deleteProject,
    clearMessages,
  } = useProjects();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "progress",
    demo_url: "",
    tech_tags: [],
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
      title: "",
      description: "",
      status: "progress",
      demo_url: "",
      tech_tags: [],
      image_url: "",
    });
    setImageFile(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (proj) => {
    clearMessages();
    setEditingId(proj.id);
    setFormData({
      title: proj.title || "",
      description: proj.description || "",
      status: proj.status || "progress",
      demo_url: proj.demo_url || "",
      tech_tags: proj.tech_tags || [],
      image_url: proj.image_url || "",
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

  const handleTagsChange = (newTags) => {
    setFormData((prev) => ({ ...prev, tech_tags: newTags }));
  };

  const handleFileChange = (file, previewUrl) => {
    setImageFile(file);
    setFormData((prev) => ({ ...prev, image_url: previewUrl || "" }));
  };

  const handleSubmit = async () => {
    clearMessages();
    let success = false;

    if (editingId) {
      success = await updateProject(editingId, formData, imageFile);
    } else {
      success = await createProject(formData, imageFile);
    }

    if (success) {
      handleCloseForm();
    }
  };

  const handleDelete = async (id, imageUrl) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus project ini?")) {
      clearMessages();
      await deleteProject(id, imageUrl);
    }
  };

  // Helper warna Badge Status
  const getStatusVariant = (status) => {
    const variants = {
      active: "success",
      done: "info",
      progress: "warning",
      inactive: "danger",
    };
    return variants[status] || "default";
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
                05
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
                Manage Projects
              </h1>
            </div>
            <p className="text-sm md:text-base text-text-muted max-w-2xl">
              Kelola portofolio project, status, dan teknologi yang digunakan.
            </p>
          </div>

          <Button
            leftIcon={FaPlus}
            onClick={handleOpenAdd}
            disabled={isFormOpen}
          >
            Tambah Project
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
                {editingId ? "Edit Project" : "Tambah Project Baru"}
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
                label="Judul Project"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Website E-Commerce UMKM"
                required
              />

              <FormField
                label="Status Project"
                name="status"
                type="select"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: "progress", label: "Sedang Dikerjakan (Progress)" },
                  { value: "active", label: "Aktif / Live" },
                  { value: "done", label: "Selesai (Done)" },
                  { value: "inactive", label: "Tidak Aktif" },
                ]}
                required
              />
            </div>

            <FormField
              label="Deskripsi Project"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan tujuan, fitur utama, dan peran kamu dalam project ini..."
              rows={4}
              required
            />

            <FormField
              label="URL Demo / Live Website"
              name="demo_url"
              type="url"
              value={formData.demo_url}
              onChange={handleChange}
              placeholder="https://..."
              helpText="Opsional. Link ke website yang sudah live atau repository GitHub."
            />

            <DynamicArrayInput
              label="Tech Stack / Teknologi"
              name="tech_tags"
              value={formData.tech_tags}
              onChange={handleTagsChange}
              placeholder="Contoh: Next.js"
              helpText="Tekan Enter atau klik Tambah untuk menambahkan teknologi."
            />

            <FileUpload
              label="Thumbnail / Screenshot Project"
              name="image"
              value={formData.image_url}
              onChange={handleFileChange}
              helpText="Upload gambar representatif project (PNG, JPG, WEBP). Rasio 16:9 disarankan."
            />

            <FormActions
              submitLabel={editingId ? "Perbarui Project" : "Simpan Project"}
              onCancel={handleCloseForm}
              isLoading={saving}
            />
          </Form>
        </div>
      )}

      {/* ============================================ */}
      {/* BAGIAN TABEL DAFTAR PROJECT                  */}
      {/* ============================================ */}
      <div className="bg-surface/30 border border-border/40 rounded-xl overflow-hidden">
        {loading ? (
          <LoadingState rows={5} columns={6} />
        ) : !projects || projects.length === 0 ? (
          <EmptyState
            message="Belum ada project ditambahkan"
            icon={FaProjectDiagram}
          />
        ) : (
          <Table>
            <TableHeader
              columns={[
                { label: "No", width: "60px" },
                { label: "Thumbnail", width: "120px" },
                { label: "Judul & Demo" },
                { label: "Status", width: "120px" },
                { label: "Tech Stack", width: "250px" },
                { label: "Aksi", width: "150px" },
              ]}
            />
            <TableBody>
              {projects.map((proj, index) => (
                <TableRow key={proj.id}>
                  {/* No */}
                  <TableCell className="text-text-muted/60 font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>

                  {/* Thumbnail */}
                  <TableCell>
                    <ImagePreview
                      src={proj.image_url}
                      alt={proj.title}
                      size="md"
                    />
                  </TableCell>

                  {/* Judul & Demo */}
                  <TableCell>
                    <div className="flex items-center gap-2 mb-1">
                      <FaProjectDiagram className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="font-medium text-text-main text-sm">
                        {proj.title}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted/80 line-clamp-2 max-w-sm mb-1 ml-5.5">
                      {proj.description}
                    </div>
                    {proj.demo_url && (
                      <a
                        href={proj.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-accent hover:opacity-80 transition-opacity ml-5.5"
                      >
                        <FaExternalLinkAlt className="w-2.5 h-2.5" />
                        Lihat Demo
                      </a>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={getStatusVariant(proj.status)}>
                      {proj.status ? proj.status.toUpperCase() : "UNKNOWN"}
                    </Badge>
                  </TableCell>

                  {/* Tech Stack */}
                  <TableCell>
                    <TagsList tags={proj.tech_tags} maxVisible={3} />
                  </TableCell>

                  {/* Aksi */}
                  <TableCell>
                    <TableActions
                      onEdit={() => handleOpenEdit(proj)}
                      onDelete={() => handleDelete(proj.id, proj.image_url)}
                      isLoading={deletingId === proj.id}
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