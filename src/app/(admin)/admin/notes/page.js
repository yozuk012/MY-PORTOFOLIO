"use client";

import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaBook,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import {
  Form,
  FormField,
  DynamicArrayInput,
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
  TagsList,
} from "../components/Table";
import useNotes from "@/hooks/admin/useNotes";

export default function NotesPage() {
  const {
    notes,
    loading,
    error,
    stats,
    searchTerm,
    filterCategory,
    filterStatus,
    setSearchTerm,
    setFilterCategory,
    setFilterStatus,
    createNote,
    updateNote,
    deleteNote,
    togglePublish,
    getCategories,
  } = useNotes();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    is_published: false,
  });

  // Form errors
  const [formErrors, setFormErrors] = useState({});

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "",
      tags: [],
      is_published: false,
    });
    setFormErrors({});
    setEditingNote(null);
  };

  // Open modal for create
  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title || "",
      content: note.content || "",
      excerpt: note.excerpt || "",
      category: note.category || "",
      tags: note.tags || [],
      is_published: note.is_published || false,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handle tags change
  const handleTagsChange = (newTags) => {
    setFormData((prev) => ({ ...prev, tags: newTags }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Judul wajib diisi";
    }

    if (!formData.content.trim()) {
      errors.content = "Konten wajib diisi";
    }

    if (!formData.category.trim()) {
      errors.category = "Kategori wajib diisi";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (editingNote) {
        // Update existing note
        result = await updateNote(editingNote.id, formData);
      } else {
        // Create new note
        result = await createNote(formData);
      }

      if (result.success) {
        handleCloseModal();
        // Optional: Show success toast/notification
      } else {
        setFormErrors({ submit: result.error || "Gagal menyimpan note" });
      }
    } catch (err) {
      setFormErrors({ submit: err.message || "Terjadi kesalahan" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (note) => {
    if (window.confirm(`Yakin mau hapus note "${note.title}"?`)) {
      await deleteNote(note.id);
    }
  };

  // Handle toggle publish
  const handleTogglePublish = async (note) => {
    await togglePublish(note.id);
  };

  // Get unique categories
  const categories = getCategories();

  // Table columns
  const tableColumns = [
    { label: "Judul", width: "35%" },
    { label: "Kategori", width: "15%" },
    { label: "Tags", width: "20%" },
    { label: "Status", width: "10%" },
    { label: "Aksi", width: "20%" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackButton />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
                <FaBook className="text-accent" />
                Notes Management
              </h1>
              <p className="mt-2 text-sm text-text-muted">
                Kelola catatan dan pemikiran pribadimu
              </p>
            </div>
            <Button
              variant="primary"
              leftIcon={FaPlus}
              onClick={handleOpenCreate}
            >
              Tambah Note
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface/40 border border-border/40 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                  Total Notes
                </p>
                <p className="text-3xl font-bold text-text-main">{stats.total}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <FaBook className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-surface/40 border border-border/40 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                  Published
                </p>
                <p className="text-3xl font-bold text-green-400">
                  {stats.published}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <FaCheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-surface/40 border border-border/40 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1">
                  Draft
                </p>
                <p className="text-3xl font-bold text-yellow-400">
                  {stats.draft}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <FaClock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface/40 border border-border/40 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/40 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background/40 border border-border/40 rounded-lg text-text-main placeholder-text-muted/40 text-sm font-mono focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/40 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-background/40 border border-border/40 rounded-lg text-text-main text-sm font-mono focus:outline-none focus:border-accent transition-colors cursor-pointer appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 bg-background/40 border border-border/40 rounded-lg text-text-main text-sm font-mono focus:outline-none focus:border-accent transition-colors cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-surface/40 border border-border/40 rounded-lg">
            <LoadingState rows={5} columns={5} />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-400 text-sm">⚠ {error}</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-surface/40 border border-border/40 rounded-lg">
            <EmptyState
              message="Belum ada notes"
              icon={FaBook}
            />
          </div>
        ) : (
          <Table>
            <TableHeader columns={tableColumns} />
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-text-main mb-1">
                        {note.title}
                      </p>
                      <p className="text-xs text-text-muted line-clamp-2">
                        {note.excerpt || note.content.substring(0, 100)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{note.category || "-"}</Badge>
                  </TableCell>
                  <TableCell>
                    <TagsList tags={note.tags} maxVisible={3} />
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleTogglePublish(note)}
                      className="cursor-pointer"
                      title="Klik untuk toggle status"
                    >
                      {note.is_published ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="warning">Draft</Badge>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <TableActions
                      onEdit={() => handleOpenEdit(note)}
                      onDelete={() => handleDelete(note)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-background border border-border/40 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b border-border/40 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-main">
                {editingNote ? "Edit Note" : "Tambah Note Baru"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-text-muted hover:text-text-main hover:bg-surface rounded-lg transition-colors"
                aria-label="Tutup modal"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <Form onSubmit={handleSubmit}>
                <FormField
                  label="Judul"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Masukkan judul note..."
                  required
                  error={formErrors.title}
                  helpText="Judul akan otomatis dijadikan slug URL"
                />

                <FormField
                  label="Kategori"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Contoh: Reflection, Idea, Observation, Life, Career..."
                  required
                  error={formErrors.category}
                  helpText="Kategori bebas, bisa apa saja"
                />

                <FormField
                  label="Excerpt (Ringkasan)"
                  name="excerpt"
                  type="textarea"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Ringkasan singkat untuk preview..."
                  rows={2}
                  helpText="Opsional, akan muncul di card listing"
                />

                <FormField
                  label="Konten"
                  name="content"
                  type="textarea"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Tulis isi note kamu di sini..."
                  required
                  error={formErrors.content}
                  rows={8}
                  helpText="Support plain text atau markdown"
                />

                <DynamicArrayInput
                  label="Tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleTagsChange}
                  placeholder="Tambah tag..."
                  helpText="Tags untuk filtering dan search"
                />

                <FormField
                  label="Status Publish"
                  name="is_published"
                  type="toggle"
                  value={formData.is_published}
                  onChange={handleInputChange}
                  helpText="Published = tampil di public, Draft = hanya kamu yang bisa lihat"
                />

                {formErrors.submit && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-400">⚠ {formErrors.submit}</p>
                  </div>
                )}

                <FormActions
                  submitLabel={editingNote ? "Update" : "Simpan"}
                  cancelLabel="Batal"
                  onCancel={handleCloseModal}
                  isLoading={isSubmitting}
                />
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}