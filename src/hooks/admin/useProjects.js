"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/client";
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
  const [syncingId, setSyncingId] = useState(null); // 🆕 State untuk loading saat sync GitHub
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
  // 2. UPLOAD IMAGE TO STORAGE
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
          upsert: false,
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
  // 3. DELETE IMAGE (BEST EFFORT)
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

      if (!filePath || !filePath.startsWith(`${PROJECT_FOLDER}/`)) {
        console.warn("⛔ [deleteImage] Path tidak valid:", filePath);
        return;
      }

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.warn("⚠️ [deleteImage] Gagal menghapus gambar lama:", error.message);
      }
    } catch (err) {
      console.warn("⚠️ [deleteImage] Exception:", err);
    }
  };

  // ============================================
  // 4. CREATE PROJECT + AUTO TRANSLATE + GITHUB FIELDS
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
            title_en: title_en,
            description: formData.description,
            description_en: description_en,
            status: formData.status,
            status_en: status_en,
            demo_url: formData.demo_url || null,
            tech_tags: formData.tech_tags || [],
            image_url: imageUrl,
            // 🆕 BARU: Field Integrasi GitHub
            source: formData.source || "manual",
            github_repo: formData.github_repo || null,
            github_stars: formData.github_stars || 0,
            github_last_synced: formData.github_last_synced || new Date().toISOString(),
            // 🆕 BARU: Field Homepage Order (jika ada di form)
            show_on_home: formData.show_on_home || false,
            home_order: formData.home_order || 999,
            
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        if (imageUrl) deleteImage(imageUrl);
        throw error;
      }

      setProjects((prev) => [data, ...prev]);
      setSuccessMessage("Project berhasil ditambahkan!");
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
  // 5. UPDATE PROJECT + AUTO TRANSLATE + GITHUB FIELDS
  // ============================================
  const updateProject = async (id, formData, imageFile = null) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const { data: existingData } = await supabase
        .from("projects")
        .select("image_url")
        .eq("id", id)
        .maybeSingle();

      const oldImageUrl = existingData?.image_url || (typeof formData.image_url === "string" ? formData.image_url : null);
      let imageUrl = oldImageUrl;
      let newImageUrl = null;

      if (imageFile) {
        newImageUrl = await uploadImage(imageFile);
        imageUrl = newImageUrl;
      } else if (formData.image_url === null || formData.image_url === "") {
        imageUrl = null;
      }

      const [title_en, description_en, status_en] = await Promise.all([
        translateToEnglish(formData.title),
        translateToEnglish(formData.description),
        translateToEnglish(formData.status),
      ]);

      const { data, error } = await supabase
        .from("projects")
        .update({
          title: formData.title,
          title_en: title_en,
          description: formData.description,
          description_en: description_en,
          status: formData.status,
          status_en: status_en,
          demo_url: formData.demo_url || null,
          tech_tags: formData.tech_tags || [],
          image_url: imageUrl,
          // 🆕 BARU: Field Integrasi GitHub (bisa diupdate jika perlu)
          source: formData.source || "manual",
          github_repo: formData.github_repo || null,
          github_stars: formData.github_stars !== undefined ? formData.github_stars : 0,
          github_last_synced: formData.github_last_synced || new Date().toISOString(),
          // 🆕 BARU: Field Homepage Order
          show_on_home: formData.show_on_home || false,
          home_order: formData.home_order || 999,
          
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        if (newImageUrl) deleteImage(newImageUrl);
        throw error;
      }

      if (!data) {
        if (newImageUrl) deleteImage(newImageUrl);
        throw new Error("Project tidak ditemukan atau tidak memiliki izin.");
      }

      const imageChanged = (newImageUrl !== null || imageUrl === null) && oldImageUrl && oldImageUrl !== imageUrl;
      if (imageChanged) {
        deleteImage(oldImageUrl); 
      }

      setProjects((prev) => prev.map((proj) => (proj.id === id ? data : proj)));
      setSuccessMessage("Project berhasil diperbarui!");
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
  // 🆕 7. SYNC GITHUB METADATA (Refresh Stars/Info)
  // ============================================
  const syncGithubProject = async (id, githubRepoName) => {
    try {
      setSyncingId(id);
      setError(null);
      
      // Memanggil API route Next.js untuk mengambil data terbaru dari GitHub
      const response = await fetch(`/api/github/sync?repo=${encodeURIComponent(githubRepoName)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Gagal mengambil data dari GitHub");
      }

      // Update database dengan data terbaru
      const { data, error } = await supabase
        .from("projects")
        .update({
          github_stars: result.data.stargazers_count,
          github_last_synced: new Date().toISOString(),
          // Opsional: update tech_tags jika bahasa di GitHub berubah
          tech_tags: result.data.topics.length > 0 ? result.data.topics : (result.data.language ? [result.data.language] : []),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setProjects((prev) => prev.map((proj) => (proj.id === id ? data : proj)));
      setSuccessMessage(`Metadata "${githubRepoName}" berhasil diperbarui!`);
      return true;
    } catch (err) {
      console.error("Error syncing github project:", err);
      setError(err.message || "Gagal menyinkronkan data GitHub");
      return false;
    } finally {
      setSyncingId(null);
    }
  };

  // ============================================
  // 8. CLEAR MESSAGES
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
    syncingId, // 🆕 Export state syncing
    error,
    successMessage,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    syncGithubProject, // 🆕 Export fungsi sync
    clearMessages,
  };
}