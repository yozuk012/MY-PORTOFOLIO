'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/client';

/**
 * Helper: Generate URL-friendly slug dari title
 * Contoh: "Thoughts on Modern Web Development" → "thoughts-on-modern-web-development"
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Hapus karakter spesial
    .replace(/\s+/g, '-')     // Spasi menjadi dash
    .replace(/-+/g, '-')      // Collapse multiple dashes
    .replace(/^-+|-+$/g, ''); // Trim dashes di awal/akhir
};

/**
 * useNotes - Admin hook untuk CRUD notes
 */
export default function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'published' | 'draft'

  const supabase = createClient();

  // ============================================
  // 1. FETCH ALL NOTES
  // ============================================
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filterStatus === 'published') {
        query = query.eq('is_published', true);
      } else if (filterStatus === 'draft') {
        query = query.eq('is_published', false);
      }

      // Apply category filter
      if (filterCategory) {
        query = query.eq('category', filterCategory);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      // Client-side search (title, content, excerpt, tags)
      let filteredData = data || [];
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredData = filteredData.filter((note) =>
          note.title.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term) ||
          (note.excerpt && note.excerpt.toLowerCase().includes(term)) ||
          (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(term)))
        );
      }

      setNotes(filteredData);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err.message || 'Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  }, [supabase, searchTerm, filterCategory, filterStatus]);

  // ============================================
  // 2. CREATE NOTE
  // ============================================
  const createNote = useCallback(async (noteData) => {
    try {
      setError(null);

      // Auto-generate slug
      let slug = noteData.slug || generateSlug(noteData.title);

      // Check duplicate slug
      const { data: existingNote } = await supabase
        .from('notes')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existingNote) {
        slug = `${slug}-${Date.now()}`; // Append timestamp jika duplicate
      }

      const payload = {
        title: noteData.title,
        slug,
        content: noteData.content,
        excerpt: noteData.excerpt || null,
        category: noteData.category || null,
        tags: Array.isArray(noteData.tags) ? noteData.tags : [],
        is_published: noteData.is_published === true, // Strict boolean check
        published_at: noteData.is_published === true ? new Date().toISOString() : null,
      };

      const { data, error: createError } = await supabase
        .from('notes')
        .insert([payload])
        .select()
        .single();

      if (createError) {
        console.error('Create error:', createError);
        if (createError.code === '23505') {
          throw new Error('Slug sudah digunakan. Silakan ubah judul.');
        } else if (createError.code === '42501') {
          throw new Error('Permission denied. Pastikan Anda sudah login.');
        }
        throw new Error(createError.message || 'Gagal membuat note.');
      }

      await fetchNotes();
      return { success: true, data };
    } catch (err) {
      console.error('Error creating note:', err);
      const errorMessage = err.message || 'Failed to create note';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [supabase, fetchNotes]);

  // ============================================
  // 3. UPDATE NOTE
  // ============================================
  const updateNote = useCallback(async (id, noteData) => {
    try {
      setError(null);

      const payload = { ...noteData };
      
      // Auto-regenerate slug jika title berubah dan slug tidak di-set manual
      if (payload.title && !payload.slug) {
        let newSlug = generateSlug(payload.title);
        
        const { data: existingNote } = await supabase
          .from('notes')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', id)
          .maybeSingle();

        if (existingNote) {
          newSlug = `${newSlug}-${Date.now()}`;
        }
        payload.slug = newSlug;
      }

      // Handle published_at logic secara aman
      const existingNote = notes.find((n) => n.id === id);
      if (payload.is_published !== undefined && existingNote) {
        if (payload.is_published === true && existingNote.is_published === false) {
          payload.published_at = new Date().toISOString();
        } else if (payload.is_published === false && existingNote.is_published === true) {
          payload.published_at = null;
        }
      }

      // Ensure tags is array
      if (payload.tags && !Array.isArray(payload.tags)) {
        payload.tags = [];
      }

      const { data, error: updateError } = await supabase
        .from('notes')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        if (updateError.code === '23505') {
          throw new Error('Slug sudah digunakan.');
        } else if (updateError.code === '42501') {
          throw new Error('Permission denied.');
        }
        throw new Error(updateError.message || 'Gagal update note.');
      }

      await fetchNotes();
      return { success: true, data };
    } catch (err) {
      console.error('Error updating note:', err);
      const errorMessage = err.message || 'Failed to update note';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [supabase, notes, fetchNotes]);

  // ============================================
  // 4. DELETE NOTE
  // ============================================
  const deleteNote = useCallback(async (id) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        if (deleteError.code === '42501') {
          throw new Error('Permission denied.');
        }
        throw new Error(deleteError.message || 'Gagal delete note.');
      }

      await fetchNotes();
      return { success: true };
    } catch (err) {
      console.error('Error deleting note:', err);
      const errorMessage = err.message || 'Failed to delete note';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [supabase, fetchNotes]);

  // ============================================
  // 5. TOGGLE PUBLISH STATUS (Quick Action)
  // ============================================
  const togglePublish = useCallback(async (id) => {
    try {
      setError(null);

      const note = notes.find((n) => n.id === id);
      if (!note) throw new Error('Note not found');

      const newStatus = !note.is_published;
      const payload = {
        is_published: newStatus,
        published_at: newStatus ? new Date().toISOString() : null,
      };

      const { data, error: toggleError } = await supabase
        .from('notes')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (toggleError) {
        console.error('Toggle error:', toggleError);
        throw new Error(toggleError.message || 'Failed to toggle publish status');
      }

      await fetchNotes();
      return { success: true, data };
    } catch (err) {
      console.error('Error toggling publish status:', err);
      const errorMessage = err.message || 'Failed to toggle publish status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [supabase, notes, fetchNotes]);

  // ============================================
  // 6. HELPERS & STATS
  // ============================================
  const getCategories = useCallback(() => {
    const categories = [...new Set(notes.map((n) => n.category).filter(Boolean))];
    return categories.sort();
  }, [notes]);

  const stats = {
    total: notes.length,
    published: notes.filter((n) => n.is_published === true).length,
    draft: notes.filter((n) => n.is_published === false).length,
  };

  // ============================================
  // 7. INITIAL FETCH
  // ============================================
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return {
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
    refetch: fetchNotes,
    getCategories,
    generateSlug,
  };
}