"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaTag, FaCalendar, FaTimes, FaBookOpen } from "react-icons/fa";
import useNotes from "@/hooks/admin/useNotes";

// Import dictionary lokal
import idDict from "@/lib/dictionaries/id.json";
import enDict from "@/lib/dictionaries/en.json";

const getDict = (lang) => (lang === "en" ? enDict : idDict);
const tOr = (path, fallback, lang) => {
  const val = path.split(".").reduce((o, i) => o?.[i], getDict(lang));
  return val || fallback;
};

export default function NotesPage() {
  return (
    <Suspense fallback={<NotesPageSkeleton />}>
      <NotesContent />
    </Suspense>
  );
}

function NotesPageSkeleton() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-5 md:px-0 py-16 md:py-24 animate-pulse">
        <div className="h-4 w-36 rounded bg-surface mb-6" />
        <div className="h-10 w-3/4 rounded bg-surface mb-3" />
        <div className="h-4 w-full max-w-xl rounded bg-surface mb-10" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border/40 rounded-lg p-6 space-y-3">
              <div className="h-4 w-32 bg-surface rounded" />
              <div className="h-6 w-3/4 bg-surface rounded" />
              <div className="h-4 w-full bg-surface rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function NotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const [lang, setLang] = useState("id");

  useEffect(() => {
    setLang(document.cookie.includes("lang=en") ? "en" : "id");
  }, []);

  const { notes, loading, error } = useNotes();

  const selectedNote = notes.find((n) => n.id === selectedId);

  // Format tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Tutup modal dan bersihkan URL
  const closeModal = () => {
    router.push("/notes");
  };

  return (
    <main className="min-h-screen relative">
      <div className="max-w-4xl mx-auto px-5 md:px-0 py-16 md:py-24">
        {/* ===== Header Halaman ===== */}
        <div className="mb-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors mb-6"
          >
            <FaArrowLeft className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" />
            {tOr("notes.backToHome", "Kembali ke Beranda", lang)}
          </Link>
          
          <div className="flex items-baseline gap-4 mb-3">
            <span className="text-xs font-mono text-accent tracking-widest">06</span>
            <h1 className="text-3xl md:text-5xl font-bold text-text-main tracking-tighter">
              {tOr("sections.notes", "Catatan & Pemikiran", lang)}
            </h1>
          </div>
          <p className="text-sm md:text-base text-text-muted max-w-xl">
            {tOr(
              "sections.notesDesc",
              "Refleksi, ide, observasi, dan random thoughts tentang segala hal.",
              lang
            )}
          </p>
        </div>

        {/* ===== List Catatan ===== */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border/40 rounded-lg p-6 space-y-3">
                <div className="h-4 w-32 bg-surface rounded" />
                <div className="h-6 w-3/4 bg-surface rounded" />
                <div className="h-4 w-full bg-surface rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="border border-red-500/30 bg-red-500/5 rounded-lg p-6 text-center">
            <p className="text-sm text-red-400">⚠ {error}</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="border border-border/40 rounded-lg p-12 text-center">
            <FaBookOpen className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
            <p className="text-sm font-medium text-text-main mb-1">
              {tOr("notes.empty", "Belum ada catatan yang dipublikasikan.", lang)}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes?id=${note.id}`}
                className={`group block border rounded-lg p-5 md:p-6 transition-all duration-300 ${
                  selectedId === note.id
                    ? "border-accent bg-accent/5"
                    : "border-border/40 hover:border-accent/40 hover:bg-surface/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {note.category && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 border border-accent/30 rounded text-[10px] font-mono uppercase tracking-widest text-accent">
                        <FaTag className="w-2 h-2" />
                        {note.category}
                      </span>
                    )}
                    {note.published_at && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-text-muted/60">
                        <FaCalendar className="w-2.5 h-2.5" />
                        {formatDate(note.published_at)}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg md:text-xl font-bold text-text-main tracking-tight mb-1.5 group-hover:text-accent transition-colors duration-300">
                  {note.title}
                </h3>

                <p className="text-sm text-text-muted/80 leading-relaxed mb-3 line-clamp-2">
                  {note.excerpt || note.content?.substring(0, 160) || ""}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.slice(0, 4).map((tag, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 bg-surface rounded text-[11px] font-mono text-text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* DETAIL MODAL (Muncul jika ?id= ada di URL)   */}
      {/* ============================================ */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
            onClick={closeModal}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-background border border-border/40 rounded-xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur border-b border-border/40">
              <button
                onClick={closeModal}
                className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
              >
                <FaArrowLeft className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" />
                {tOr("notes.backToList", "Kembali ke daftar", lang)}
              </button>
              <button
                onClick={closeModal}
                className="p-2 text-text-muted hover:text-text-main hover:bg-surface rounded-lg transition-colors"
                aria-label="Tutup"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 md:px-10 py-8">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {selectedNote.category && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 border border-accent/30 rounded text-[10px] font-mono uppercase tracking-widest text-accent">
                    <FaTag className="w-2 h-2" />
                    {selectedNote.category}
                  </span>
                )}
                {selectedNote.published_at && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-text-muted/60">
                    <FaCalendar className="w-2.5 h-2.5" />
                    {formatDate(selectedNote.published_at)}
                  </span>
                )}
              </div>

              {/* Judul */}
              <h2 className="text-2xl md:text-4xl font-bold text-text-main tracking-tight leading-tight mb-8">
                {selectedNote.title}
              </h2>

              {/* Divider */}
              <div className="h-px w-full bg-border/60 mb-8" />

              {/* Konten (whitespace-pre-wrap menjaga format enter/paragraf dari textarea) */}
              <div className="text-base md:text-lg text-text-main/90 leading-relaxed whitespace-pre-wrap font-sans mb-10">
                {selectedNote.content}
              </div>

              {/* Tags Footer */}
              {selectedNote.tags && selectedNote.tags.length > 0 && (
                <div className="pt-6 border-t border-border/60">
                  <div className="flex items-center gap-2 mb-3">
                    <FaTag className="w-3 h-3 text-text-muted/60" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60">
                      {tOr("notes.tags", "Tags", lang)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNote.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-surface border border-border/40 rounded text-xs font-mono text-text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}