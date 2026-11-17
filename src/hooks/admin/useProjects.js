// src/hooks/admin/useProjects.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/client";

// Konfigurasi Storage
const BUCKET_NAME = "my-portofolio";
const PROJECT_FOLDER = "projects-picture";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const supabase = createClient();

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
        .order("created_at", { ascending: false }); // Urutkan dari yang terbaru

      if (error) throw error;

      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message || "Gagal memuat data projects");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // 2. UPLOAD IMAGE TO STORAGE
  // ============================================
  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `proj-${Date.now()}.${fileExt}`;
      const filePath = `${PROJECT_FOLDER}/${fileName}`;

      const { error } = await supabase.storage
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
  // 3. DELETE IMAGE FROM STORAGE
  // ============================================
  const deleteImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const urlParts = imageUrl.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
      if (urlParts.length < 2) return;

      const filePath = urlParts[1];

      await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
    } catch (err) {
      console.warn("Gagal menghapus gambar dari storage:", err);
    }
  };

  // ============================================
  // 4. CREATE PROJECT
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

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            demo_url: formData.demo_url || null,
            tech_tags: formData.tech_tags || [],
            image_url: imageUrl,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

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
  // 5. UPDATE PROJECT
  // ============================================
  const updateProject = async (id, formData, imageFile = null) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      let imageUrl = formData.image_url; // Pertahankan URL lama

      if (imageFile) {
        // Upload gambar baru
        imageUrl = await uploadImage(imageFile);
        
        // Hapus gambar lama dari storage
        if (formData.image_url) {
          await deleteImage(formData.image_url);
        }
      }

      const { data, error } = await supabase
        .from("projects")
        .update({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          demo_url: formData.demo_url || null,
          tech_tags: formData.tech_tags || [],
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

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

      // Hapus data dari database
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Hapus gambar dari storage jika ada
      if (imageUrl) {
        await deleteImage(imageUrl);
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
    createProject,
    updateProject,
    deleteProject,
    clearMessages,
  };
}