// src/app/(admin)/admin/skills/page.js
"use client";

import { useState } from "react";
import { useSkills } from "@/hooks/admin/useSkills";

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
} from "../components/Table";
import Button from "../components/Button";
import BackButton from "../components/BackButton";

import { FaCode, FaPlus, FaTimes, FaStar } from "react-icons/fa";

export default function ManageSkillsPage() {
  const {
    skills,
    loading,
    saving,
    deletingId,
    error,
    successMessage,
    createSkill,
    updateSkill,
    deleteSkill,
    clearMessages,
  } = useSkills();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    score: 5,
  });

  // ============================================
  // HANDLERS
  // ============================================
  const handleOpenAdd = () => {
    clearMessages();
    setEditingId(null);
    setFormData({ name: "", description: "", score: 5 });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (skill) => {
    clearMessages();
    setEditingId(skill.id);
    setFormData({
      name: skill.name || "",
      description: skill.description || "",
      score: skill.score ?? 5,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "score" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    clearMessages();
    let success = false;

    if (editingId) {
      success = await updateSkill(editingId, formData);
    } else {
      success = await createSkill(formData);
    }

    if (success) {
      handleCloseForm();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus skill ini?")) {
      clearMessages();
      await deleteSkill(id);
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
                02
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
                Manage Skills
              </h1>
            </div>
            <p className="text-sm md:text-base text-text-muted max-w-2xl">
              Kelola daftar keahlian teknis dan non-teknis beserta skor kemahiran.
            </p>
          </div>

          <Button leftIcon={FaPlus} onClick={handleOpenAdd} disabled={isFormOpen}>
            Tambah Skill
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
                {editingId ? "Edit Skill" : "Tambah Skill Baru"}
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
            <FormField
              label="Nama Skill"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: React.js, Figma, Node.js"
              required
            />

            {/* ===== SLIDER SKOR 1-10 ===== */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="score"
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-text-muted"
                >
                  Skor Kemahiran
                  <span className="text-accent">*</span>
                </label>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/10 border border-accent/30 text-accent text-xs font-mono font-semibold">
                  <FaStar className="w-2.5 h-2.5" />
                  {formData.score}/10
                </span>
              </div>

              <input
                id="score"
                name="score"
                type="range"
                min="1"
                max="10"
                step="1"
                value={formData.score}
                onChange={handleChange}
                className="w-full h-2 bg-surface border border-border/40 rounded-lg appearance-none cursor-pointer accent-accent"
              />

              <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-text-muted/60 mt-2">
                <span>1 · Pemula</span>
                <span>5 · Menengah</span>
                <span>10 · Ahli</span>
              </div>
            </div>

            <FormField
              label="Deskripsi Singkat"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan tingkat kemahiran atau pengalaman menggunakan skill ini..."
              rows={3}
            />

            <FormActions
              submitLabel={editingId ? "Perbarui Skill" : "Simpan Skill"}
              onCancel={handleCloseForm}
              isLoading={saving}
            />
          </Form>
        </div>
      )}

      {/* ============================================ */}
      {/* BAGIAN TABEL DAFTAR SKILL                    */}
      {/* ============================================ */}
      <div className="bg-surface/30 border border-border/40 rounded-xl overflow-hidden">
        {loading ? (
          <LoadingState rows={5} columns={5} />
        ) : !skills || skills.length === 0 ? (
          <EmptyState message="Belum ada skill ditambahkan" icon={FaCode} />
        ) : (
          <Table>
            <TableHeader
              columns={[
                { label: "No", width: "60px" },
                { label: "Nama Skill", width: "220px" },
                { label: "Skor", width: "200px" },
                { label: "Deskripsi" },
                { label: "Aksi", width: "140px" },
              ]}
            />
            <TableBody>
              {skills.map((skill, index) => (
                <TableRow key={skill.id}>
                  {/* No */}
                  <TableCell className="text-text-muted/60 font-mono text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </TableCell>

                  {/* Nama Skill */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FaCode className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="font-medium text-text-main">
                        {skill.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Skor dengan progress bar */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 bg-surface rounded-full h-1.5 max-w-[100px] overflow-hidden border border-border/40">
                        <div
                          className="bg-accent h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${(skill.score || 0) * 10}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-medium text-text-main whitespace-nowrap">
                        {skill.score ?? "-"}/10
                      </span>
                    </div>
                  </TableCell>

                  {/* Deskripsi */}
                  <TableCell>
                    <div className="text-xs text-text-muted/80 line-clamp-2">
                      {skill.description || (
                        <span className="italic text-text-muted/40">
                          Tidak ada deskripsi
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Aksi */}
                  <TableCell>
                    <TableActions
                      onEdit={() => handleOpenEdit(skill)}
                      onDelete={() => handleDelete(skill.id)}
                      isLoading={deletingId === skill.id}
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