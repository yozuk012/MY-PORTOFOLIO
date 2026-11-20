// src/app/(public)/home/components/Section4Experiences.jsx
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/server";
import { FaArrowRight } from "react-icons/fa";

// Import dictionary lokal
import idDict from "@/lib/dictionaries/id.json";
import enDict from "@/lib/dictionaries/en.json";

// Helper dictionary
const getDict = (lang) => (lang === "en" ? enDict : idDict);

// Fallback bilingual: jika EN kosong, pakai ID
const getBilingual = (lang, idVal, enVal) =>
  lang === "en" ? enVal || idVal : idVal;

export default async function Section4Experiences() {
  // 🔑 Wajib: render per-request (hindari error Date.now())
  await connection();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";
  const t = (path) =>
    path.split(".").reduce((o, i) => o?.[i], getDict(lang)) || path;

  const supabase = await createClient();

  // ✅ Fetch: filter show_on_home + order by home_order + kolom _en
  const { data: experiences } = await supabase
    .from("experiences")
    .select(
      "type, title, title_en, description, description_en, image_url, start_year, end_year, created_at"
    )
    .eq("show_on_home", true)
    .order("home_order", { ascending: true })
    .order("created_at", { ascending: false });

  const expList = experiences || [];

  // ============================================
  // HELPER: label tipe (bilingual via dictionary)
  // ============================================
  const formatType = (type) => {
    const key = type?.toLowerCase();
    const fallback = key?.toUpperCase() || "EXPERIENCE";
    return t(`experiences.types.${key}`) !== `experiences.types.${key}`
      ? t(`experiences.types.${key}`)
      : fallback;
  };

  // Helper: format rentang tahun (bilingual "Sekarang"/"Present")
  const formatYearRange = (start, end) => {
    if (!start && !end) return null;
    if (start && !end) return `${start} — ${t("experiences.present")}`;
    if (!start && end) return `${end}`;
    if (start === end) return `${start}`;
    return `${start} — ${end}`;
  };

  return (
    <section
      id="experiences"
      className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24"
    >
      {/* ===== Eyebrow + Judul ===== */}
      <div className="flex items-baseline gap-4 mb-3">
        <span className="text-xs font-mono text-accent tracking-widest">
          04
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-text-main tracking-tighter">
          {t("sections.experiences")}
        </h2>
      </div>
      <p className="text-sm md:text-base text-text-muted mb-12 max-w-xl">
        {t("sections.experiencesDesc")}
      </p>

      <div className="space-y-0">
        {expList.length > 0 ? (
          expList.map((exp, i) => {
            const yearRange = formatYearRange(exp.start_year, exp.end_year);
            const displayTitle = getBilingual(lang, exp.title, exp.title_en);
            const displayDesc = getBilingual(
              lang,
              exp.description,
              exp.description_en
            );

            return (
              <div
                key={i}
                className="group py-7 md:py-9 border-b border-border/60 hover:border-accent/40 transition-colors duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                  {/* Kolom Kiri: Tahun + Tipe */}
                  <div className="md:col-span-2 space-y-2.5">
                    <span className="text-sm font-mono text-text-muted">
                      {yearRange || "—"}
                    </span>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-surface border border-border/50 text-[10px] font-mono uppercase tracking-wider text-text-muted group-hover:border-accent/30 group-hover:text-accent transition-colors duration-300">
                        {formatType(exp.type)}
                      </span>
                    </div>
                  </div>

                  {/* Kolom Tengah: Judul + Deskripsi */}
                  <div className="md:col-span-6 flex-1 space-y-2.5">
                    <h3 className="text-lg md:text-xl font-semibold text-text-main group-hover:text-accent transition-colors duration-300 leading-snug">
                      {displayTitle}
                    </h3>
                    {displayDesc && (
                      <p className="text-sm text-text-muted/80 leading-relaxed">
                        {displayDesc}
                      </p>
                    )}
                  </div>

                  {/* Kolom Kanan: Gambar (Opsional) */}
                  {exp.image_url && (
                    <div className="md:col-span-4 flex-shrink-0 self-start w-full">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg ring-1 ring-black/5 bg-surface">
                        <img
                          src={exp.image_url}
                          alt={displayTitle}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-text-muted py-8 italic">
            {t("experiences.empty")}
          </p>
        )}
      </div>

      {/* ===== CTA: View All ===== */}
      <div className="mt-10 flex justify-end">
        <a
          href="/experiences"
          className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
        >
          {t("experiences.viewAll")}
          <FaArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}