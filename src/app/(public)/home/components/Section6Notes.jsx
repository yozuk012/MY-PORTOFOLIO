// src/app/(public)/home/components/Section6Notes.jsx
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/server";
import { FaArrowRight, FaTag, FaClock } from "react-icons/fa";

// Import dictionary lokal
import idDict from "@/lib/dictionaries/id.json";
import enDict from "@/lib/dictionaries/en.json";

// Helper dictionary
const getDict = (lang) => (lang === "en" ? enDict : idDict);

export default async function Section6Notes() {
  // 🔑 Wajib: render per-request (hindari cache Date/cookies)
  await connection();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";

  // Helper: ambil nilai dari dictionary dengan fallback
  const tOr = (path, fallback) => {
    const val = path.split(".").reduce((o, i) => o?.[i], getDict(lang));
    return val || fallback;
  };

  const supabase = await createClient();

  // ✅ PERBAIKAN UTAMA DI SINI:
  // 1. Tambahkan show_on_home dan home_order ke select
  // 2. Filter: is_published = true DAN show_on_home = true
  // 3. Order: berdasarkan home_order (ascending), BUKAN published_at
  // 4. Limit dihapus agar admin punya kontrol penuh berapa banyak yang muncul 
  //    (atau bisa tetap .limit(3) jika ingin memaksa maksimal 3)
  const { data: notes, error } = await supabase
    .from("notes")
    .select(
      "id, title, title_en, slug, excerpt, excerpt_en, content, content_en, category, category_en, tags, tags_en, published_at, show_on_home, home_order"
    )
    .eq("is_published", true)
    .eq("show_on_home", true) // ⭐ Hanya ambil yang di-toggle "ON" di admin
    .order("home_order", { ascending: true }) // ⭐ Urutkan sesuai angka home_order
    .limit(3); // Opsional: Hapus baris ini jika ingin admin bisa menampilkan >3 notes

  if (error) {
    console.error("Error fetching public notes:", error);
  }

  const noteList = notes || [];

  // Format tanggal sesuai bahasa
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(
      lang === "en" ? "en-US" : "id-ID",
      { year: "numeric", month: "long", day: "numeric" }
    );
  };

  return (
    <section
      id="notes"
      className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24"
    >
      {/* ===== Header ===== */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-4">
          <span className="text-xs font-mono text-accent tracking-widest">
            06
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-text-main tracking-tighter">
            {tOr("sections.notes", "Catatan & Pemikiran")}
          </h2>
        </div>
        <a
          href="/notes"
          className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
        >
          {tOr("notes.viewAll", "Lihat semua catatan")}
          <FaArrowRight className="w-3 h-3" />
        </a>
      </div>
      <p className="text-sm md:text-base text-text-muted mb-10 max-w-xl">
        {tOr(
          "sections.notesDesc",
          "Refleksi, ide, observasi, dan random thoughts tentang segala hal — tidak terbatas pada teknologi."
        )}
      </p>

      {/* ===== List Catatan ===== */}
      {noteList.length > 0 ? (
        <div className="space-y-4">
          {noteList.map((note) => (
            <a
              key={note.id}
              href={`/notes?id=${note.id}`}
              className="group block border border-border/40 rounded-lg p-5 md:p-6 hover:border-accent/40 hover:bg-surface/30 transition-all duration-300"
            >
              {/* Meta row: kategori + tanggal (kiri), arrow (kanan) */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {(lang === "en" ? note.category_en || note.category : note.category) && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/10 border border-accent/30 rounded text-[10px] font-mono uppercase tracking-widest text-accent">
                      <FaTag className="w-2 h-2" />
                      {lang === "en" ? note.category_en || note.category : note.category}
                    </span>
                  )}
                  {note.published_at && (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-text-muted/60">
                      <FaClock className="w-2 h-2" />
                      {formatDate(note.published_at)}
                    </span>
                  )}
                </div>

                {/* Arrow sejajar kanan */}
                <FaArrowRight className="w-3 h-3 flex-shrink-0 text-text-muted/40 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
              </div>

              {/* Judul */}
              <h3 className="text-lg md:text-xl font-bold text-text-main tracking-tight mb-1.5 group-hover:text-accent transition-colors duration-300">
                {lang === "en" ? note.title_en || note.title : note.title}
              </h3>

              {/* Excerpt / fallback potongan content */}
              <p className="text-sm text-text-muted/80 leading-relaxed mb-3 line-clamp-2">
                {lang === "en"
                  ? note.excerpt_en || note.excerpt || note.content_en || note.content?.substring(0, 160) || ""
                  : note.excerpt || note.content?.substring(0, 160) || ""}
              </p>

              {/* Tags */}
              {(() => {
                const tags = lang === "en" ? (note.tags_en?.length ? note.tags_en : note.tags) : note.tags;
                return tags && tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 4).map((tag, j) => (
                      <span
                        key={j}
                        className="px-2 py-0.5 bg-surface rounded text-[11px] font-mono text-text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null;
              })()}
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted py-8 italic">
          {tOr("notes.empty", "Belum ada catatan yang ditampilkan.")}
        </p>
      )}

      {/* ===== CTA mobile-only ===== */}
      <div className="mt-10 md:hidden flex justify-end">
        <a
          href="/notes"
          className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
        >
          {tOr("notes.viewAll", "Lihat semua catatan")}
          <FaArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}