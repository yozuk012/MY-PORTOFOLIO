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
  FaGithub,
  FaSync,
} from "react-icons/fa";

export default function ManageProjectsPage() {
  const {
    projects,
    loading,
    saving,
    deletingId,
    syncingId,
    error,
    successMessage,
    createProject,
    updateProject,
    deleteProject,
    syncGithubProject,
    clearMessages,
  } = useProjects();

  // State untuk Form & Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State untuk GitHub Import
  const [githubRepos, setGithubRepos] = useState([]);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [githubError, setGithubError] = useState(null);
  const [searchRepo, setSearchRepo] = useState("");

  // Form state (homepage settings sudah dihapus)
  const initialFormData = {
    title: "",
    description: "",
    status: "progress",
    demo_url: "",
    tech_tags: [],
    image_url: "",
    source: "manual",
    github_repo: "",
    github_stars: 0,
    github_last_synced: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);

  // ============================================
  // GITHUB IMPORT HANDLERS
  // ============================================
  const fetchGithubRepos = async () => {
    setLoadingGithub(true);
    setGithubError(null);
    try {
      const res = await fetch("/api/github/repos");
      const result = res.headers.get("content-type")?.includes("application/json")
        ? await res.json()
        : null;
      if (res.ok && result?.success && Array.isArray(result.data)) {
        setGithubRepos(result.data);
      } else {
        setGithubError(result?.error || `Gagal memuat repository GitHub (HTTP ${res.status}).`);
      }
    } catch (err) {
      console.error("Gagal mengambil repo GitHub:", err);
      setGithubError("Terjadi kesalahan saat mengambil repository. Coba lagi.");
    } finally {
      setLoadingGithub(false);
    }
  };

  const handleOpenGithubImport = () => {
    clearMessages();
    setSearchRepo("");
    setGithubRepos([]);
    setGithubError(null);
    fetchGithubRepos();
    setIsGithubModalOpen(true);
  };

  const handleCloseGithubImport = () => {
    setIsGithubModalOpen(false);
    setSearchRepo("");
    setGithubError(null);
  };

  const handleSelectRepo = (repo) => {
    const topics = Array.isArray(repo.topics) ? repo.topics : [];
    const language = repo.language ? [repo.language] : [];
    const techTags = topics.length > 0 ? topics : language;

    setFormData({
      title: repo.name || "",
      description: "",
      status: "done",
      demo_url: repo.homepage || repo.html_url || "",
      tech_tags: techTags,
      image_url: "",
      source: "github",
      github_repo: repo.full_name || "",
      github_stars: repo.stargazers_count || 0,
      github_last_synced: new Date().toISOString(),
    });
    setIsGithubModalOpen(false);
    setIsFormOpen(true);
  };

  // ============================================
  // FORM HANDLERS
  // ============================================
  const handleOpenAdd = () => {
    clearMessages();
    setEditingId(null);
    setFormData(initialFormData);
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
      source: proj.source || "manual",
      github_repo: proj.github_repo || "",
      github_stars: proj.github_stars || 0,
      github_last_synced: proj.github_last_synced || null,
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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTagsChange = (newTags) => {
    setFormData((prev) => ({ ...prev, tech_tags: newTags }));
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

  const handleSync = async (id, githubRepo) => {
    clearMessages();
    await syncGithubProject(id, githubRepo);
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

  // Filter repo GitHub (guard jika name null)
  const filteredRepos = githubRepos.filter((repo) =>
    (repo?.name || "").toLowerCase().includes(searchRepo.toLowerCase())
  );

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
              <span className="text-xs font-mono text-accent tracking-widest">05</span>
              <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
                Manage Projects
              </h1>
            </div>
            <p className="text-sm md:text-base text-text-muted max-w-2xl">
              Kelola portofolio project. Anda bisa menambah secara manual atau mengimpor langsung dari repository GitHub.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              leftIcon={FaGithub}
              onClick={handleOpenGithubImport}
              disabled={isFormOpen || isGithubModalOpen}
            >
              Import dari GitHub
            </Button>
            <Button
              leftIcon={FaPlus}
              onClick={handleOpenAdd}
              disabled={isFormOpen || isGithubModalOpen}
            >
              Tambah Manual
            </Button>
          </div>
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
      {/* MODAL PILIH REPOSITORY GITHUB (DIPERBAIKI)   */}
      {/* ============================================ */}
      {isGithubModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={handleCloseGithubImport}
        >
          <div
            className="bg-background border border-border rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-main flex items-center gap-2">
                <FaGithub className="text-text-main" /> Pilih Repository GitHub
              </h3>
              <button
                type="button"
                onClick={handleCloseGithubImport}
                className="text-text-muted hover:text-text-main transition-colors"
                aria-label="Tutup modal"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Search + Refresh */}
            <div className="p-4 border-b border-border flex gap-2">
              <input
                type="text"
                placeholder="Cari nama repository..."
                value={searchRepo}
                onChange={(e) => setSearchRepo(e.target.value)}
                className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                disabled={loadingGithub}
              />
              <button
                type="button"
                onClick={fetchGithubRepos}
                disabled={loadingGithub}
                className="px-3 py-2 border border-border rounded-lg text-text-muted hover:text-accent hover:border-accent transition-colors disabled:opacity-50"
                title="Muat ulang daftar repository"
              >
                <FaSync className={`w-4 h-4 ${loadingGithub ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* List Repository */}
            <div className="overflow-y-auto p-2 flex-1">
              {loadingGithub ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted text-sm">
                  <FaSync className="w-5 h-5 animate-spin text-accent" />
                  <span>Memuat repository...</span>
                </div>
              ) : githubError ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 px-4 text-center">
                  <p className="text-sm text-red-400 font-mono">{githubError}</p>
                  <button
                    type="button"
                    onClick={fetchGithubRepos}
                    className="text-xs text-accent hover:underline"
                  >
                    Coba lagi
                  </button>
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm">
                  {githubRepos.length === 0
                    ? "Tidak ada repository yang ditemukan."
                    : "Tidak ada repository yang cocok dengan pencarian."}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => handleSelectRepo(repo)}
                      className="w-full text-left p-4 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-all group"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-text-main group-hover:text-accent transition-colors truncate">
                            {repo.name}
                          </h4>
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">
                            {repo.description || "Tidak ada deskripsi di GitHub."}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-muted/70 font-mono">
                            {repo.language && <span>{repo.language}</span>}
                            <span>⭐ {repo.stargazers_count || 0}</span>
                            {repo.updated_at && (
                              <span>
                                Updated:{" "}
                                {new Date(repo.updated_at).toLocaleDateString("id-ID")}
                              </span>
                            )}
                          </div>
                        </div>
                        <FaPlus className="text-accent opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* BAGIAN FORM (Homepage Settings DIHAPUS)      */}
      {/* ============================================ */}
      {isFormOpen && (
        <div className="bg-surface/30 border border-border/40 rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-mono text-accent tracking-widest">
                {editingId ? "EDIT" : formData.source === "github" ? "IMPORT" : "NEW"}
              </span>
              <h2 className="text-xl font-semibold text-text-main tracking-tight">
                {editingId
                  ? "Edit Project"
                  : formData.source === "github"
                  ? "Lengkapi Detail Project GitHub"
                  : "Tambah Project Baru"}
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
            {/* Badge Sumber */}
            {formData.source === "github" && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3">
                <FaGithub className="text-blue-500 w-5 h-5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    Diimpor dari GitHub
                  </p>
                  <p className="text-blue-600/70 dark:text-blue-400/70 text-xs font-mono">
                    {formData.github_repo}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Judul Project"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Website E-Commerce UMKM"
                required
                readOnly={formData.source === "github" && !editingId}
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
              placeholder={
                formData.source === "github"
                  ? "Jelaskan peran Anda, tantangan, dan solusi yang Anda buat (Jangan hanya copy dari README GitHub)..."
                  : "Jelaskan tujuan, fitur utama, dan peran kamu dalam project ini..."
              }
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
              helpText="Link ke website yang sudah live. (Otomatis terisi dari GitHub Homepage jika ada)"
            />

            <DynamicArrayInput
              label="Tech Stack / Teknologi"
              name="tech_tags"
              value={formData.tech_tags}
              onChange={handleTagsChange}
              placeholder="Contoh: Next.js"
              helpText="Tekan Enter atau klik Tambah. (Otomatis terisi dari GitHub Topics/Language)"
            />

            <FileUpload
              label="Thumbnail / Screenshot Project"
              name="image"
              value={formData.image_url}
              onChange={handleFileChange}
              helpText="Wajib upload gambar representatif project (PNG, JPG, WEBP). Rasio 16:9 disarankan."
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
          <LoadingState rows={5} columns={7} />
        ) : !projects || projects.length === 0 ? (
          <EmptyState message="Belum ada project ditambahkan" icon={FaProjectDiagram} />
        ) : (
          <Table>
            <TableHeader
              columns={[
                { label: "No", width: "50px" },
                { label: "Thumbnail", width: "100px" },
                { label: "Judul & Demo" },
                { label: "Sumber", width: "100px" },
                { label: "Status", width: "100px" },
                { label: "Tech Stack", width: "200px" },
                { label: "Aksi", width: "180px" },
              ]}
            />
            <TableBody>
              {projects.map((proj, index) => (
                <TableRow key={proj.id}>
                  <TableCell className="text-text-muted/60 font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>

                  <TableCell>
                    <ImagePreview src={proj.image_url} alt={proj.title} size="sm" />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 mb-1">
                      <FaProjectDiagram className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="font-medium text-text-main text-sm">{proj.title}</span>
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
                        {/* FIX: ikon sebelumnya corrupt "w-2. اكتب" */}
                        <FaExternalLinkAlt className="w-2.5 h-2.5" /> Lihat Demo
                      </a>
                    )}
                  </TableCell>

                  <TableCell>
                    {proj.source === "github" ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="info" className="w-fit text-[10px]">
                          GitHub
                        </Badge>
                        <span
                          className="text-[10px] text-text-muted font-mono truncate max-w-[90px]"
                          title={proj.github_repo}
                        >
                          {proj.github_repo?.split("/")[1]}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="default" className="w-fit text-[10px]">
                        Manual
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusVariant(proj.status)}>
                      {proj.status ? proj.status.toUpperCase() : "UNKNOWN"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <TagsList tags={proj.tech_tags} maxVisible={3} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {proj.source === "github" && (
                        <button
                          onClick={() => handleSync(proj.id, proj.github_repo)}
                          disabled={syncingId === proj.id}
                          className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Refresh Metadata dari GitHub"
                        >
                          <FaSync
                            className={`w-3.5 h-3.5 ${
                              syncingId === proj.id ? "animate-spin" : ""
                            }`}
                          />
                        </button>
                      )}
                      <TableActions
                        onEdit={() => handleOpenEdit(proj)}
                        onDelete={() => handleDelete(proj.id, proj.image_url)}
                        isLoading={deletingId === proj.id}
                      />
                    </div>
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