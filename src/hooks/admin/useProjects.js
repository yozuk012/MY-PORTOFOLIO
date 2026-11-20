"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/client";
// 🆕 BARU: Import fungsi translate
import { translateToEnglish } from "@/lib/translate";

// ============================================
// KONFIGURASI STORAGE
// ============================================
const BUCKET_NAME = "my-portofolio";
const PROJECT_FOLDER = "projects";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ✅ FIX: Gunakan useMemo agar client tidak dibuat ulang setiap render
  const supabase = useMemo(() => createClient(), []);

  // ============================================
  // 1. FETCH ALL PROJECTS
  // ============================================
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Gagal memuat data projects");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ============================================
  // 2. UPLOAD IMAGE TO STORAGE (STABIL: NAMA BARU)
  // ============================================
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `proj-${Date.now()}.${fileExt}`;
      const filePath = `${PROJECT_FOLDER}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false, // ✅ Murni INSERT, menghindari bug RLS upsert
          contentType: file.type,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Error uploading image:", err);
      throw new Error("Gagal mengupload gambar: " + err.message);
    }
  };

  // ============================================
  // 3. DELETE IMAGE (BEST EFFORT / FIRE-AND-FORGET)
  // ============================================
  const deleteImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      let filePath = "";
      const publicMarker = `/storage/v1/object/public/${BUCKET_NAME}/`;

      if (imageUrl.includes(publicMarker)) {
        filePath = imageUrl.split(publicMarker)[1].split(/[?#]/)[0];
      } else if (imageUrl.startsWith(`${PROJECT_FOLDER}/`)) {
        filePath = imageUrl.split(/[?#]/)[0];
      } else {
        const folderIndex = imageUrl.indexOf(`${PROJECT_FOLDER}/`);
        if (folderIndex !== -1) {
          filePath = imageUrl.slice(folderIndex).split(/[?#]/)[0];
        }
      }

      filePath = decodeURIComponent(filePath).trim();

      // SAFEGUARD: Pastikan hanya menghapus file di dalam folder projects
      if (!filePath || !filePath.startsWith(`${PROJECT_FOLDER}/`)) {
        console.warn("⛔ [deleteImage] Path tidak valid atau di luar folder projects:", filePath);
        return;
      }

      // ✅ BEST EFFORT: Coba hapus, tapi JANGAN throw error atau blokir UI.
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.warn("⚠️ [deleteImage] Gagal menghapus gambar lama (Best Effort):", error.message);
      } else {
        console.log("✅ [deleteImage] Berhasil dihapus:", filePath);
      }
    } catch (err) {
      console.warn("⚠️ [deleteImage] Exception saat menghapus:", err);
    }
  };

  // ============================================
  // 4. CREATE PROJECT + AUTO TRANSLATE
  // ============================================
  const createProject = async (formData, imageFile = null) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // 🆕 BARU: Auto-translate text fields secara paralel (lebih cepat)
      const [title_en, description_en, status_en] = await Promise.all([
        translateToEnglish(formData.title),
        translateToEnglish(formData.description),
        translateToEnglish(formData.status),
      ]);

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            title: formData.title,
            title_en: title_en, // 🆕 Simpan hasil translate
            description: formData.description,
            description_en: description_en, // 🆕 Simpan hasil translate
            status: formData.status,
            status_en: status_en, // 🆕 Simpan hasil translate
            demo_url: formData.demo_url || null,
            tech_tags: formData.tech_tags || [],
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        // Rollback: Coba hapus gambar jika insert ke database gagal (Best Effort)
        if (imageUrl) deleteImage(imageUrl);
        throw error;
      }

      setProjects((prev) => [data, ...prev]);
      setSuccessMessage("Project berhasil ditambahkan dan diterjemahkan!");
      return true;
    } catch (err) {
      console.error("Error creating project:", err);
      setError(err.message || "Gagal menambahkan project");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 5. UPDATE PROJECT + AUTO TRANSLATE
  // ============================================
  const updateProject = async (id, formData, imageFile = null) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Ambil gambar lama dari DB
      const { data: existingData, error: existingError } = await supabase
        .from("projects")
        .select("image_url")
        .eq("id", id)
        .maybeSingle();

      if (existingError) {
        console.warn("[updateProject] Gagal membaca gambar lama:", existingError);
      }

      const oldImageUrl =
        existingData?.image_url ||
        (typeof formData.image_url === "string" ? formData.image_url : null);

      let imageUrl = oldImageUrl;
      let newImageUrl = null;

      if (imageFile) {
        newImageUrl = await uploadImage(imageFile);
        imageUrl = newImageUrl;
      } else if (formData.image_url === null || formData.image_url === "") {
        imageUrl = null;
      }

      // 🆕 BARU: Auto-translate text fields secara paralel
      const [title_en, description_en, status_en] = await Promise.all([
        translateToEnglish(formData.title),
        translateToEnglish(formData.description),
        translateToEnglish(formData.status),
      ]);

      // Update DB (Ini yang utama)
      const { data, error } = await supabase
        .from("projects")
        .update({
          title: formData.title,
          title_en: title_en, // 🆕 Update hasil translate
          description: formData.description,
          description_en: description_en, // 🆕 Update hasil translate
          status: formData.status,
          status_en: status_en, // 🆕 Update hasil translate
          demo_url: formData.demo_url || null,
          tech_tags: formData.tech_tags || [],
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        // Rollback: Coba hapus gambar baru jika update database gagal
        if (newImageUrl) deleteImage(newImageUrl);
        throw error;
      }

      if (!data) {
        if (newImageUrl) deleteImage(newImageUrl);
        throw new Error(
          "Project tidak ditemukan atau sesi tidak memiliki izin untuk memperbarui project ini"
        );
      }

      // ✅ Hapus gambar lama di background (Best Effort / Fire-and-Forget)
      const imageChanged =
        (newImageUrl !== null || imageUrl === null) &&
        oldImageUrl &&
        oldImageUrl !== imageUrl;

      if (imageChanged) {
        deleteImage(oldImageUrl); 
      }

      setProjects((prev) => prev.map((proj) => (proj.id === id ? data : proj)));
      setSuccessMessage("Project berhasil diperbarui dan diterjemahkan!");
      return true;
    } catch (err) {
      console.error("Error updating project:", err);
      setError(err.message || "Gagal memperbarui project");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 6. DELETE PROJECT
  // ============================================
  const deleteProject = async (id, imageUrl) => {
    try {
      setDeletingId(id);
      setError(null);
      setSuccessMessage(null);

      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;

      // Hapus gambar dari storage di background (Best Effort)
      if (imageUrl) {
        deleteImage(imageUrl);
      }

      setProjects((prev) => prev.filter((proj) => proj.id !== id));
      setSuccessMessage("Project berhasil dihapus!");
      return true;
    } catch (err) {
      console.error("Error deleting project:", err);
      setError(err.message || "Gagal menghapus project");
      return false;
    } finally {
      setDeletingId(null);
    }
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
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    saving,
    deletingId,
    error,
    successMessage,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    clearMessages,
  };
}