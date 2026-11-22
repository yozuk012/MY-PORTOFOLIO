// src/app/(public)/experiences/page.js
import { Suspense } from "react";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/server";
import PublicPageGate from "../home/components/PublicPageGate";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

// Import dictionary lokal
import idDict from "@/lib/dictionaries/id.json";
import enDict from "@/lib/dictionaries/en.json";

// Helper dictionary
const getDict = (lang) => (lang === "en" ? enDict : idDict);

// Fallback bilingual: jika EN kosong, pakai ID
const getBilingual = (lang, idVal, enVal) =>
  lang === "en" ? enVal || idVal : idVal;

export const metadata = {
  title: "Experiences | Achmad Aldino",
  description:
    "Perjalanan profesional, magang, dan kegiatan nyata yang telah saya jalani.",
};

// ============================================================
// STATIC SHELL
// ============================================================
export default function ExperiencesPage() {
  return (
    <PublicPageGate featureKey="page_experiences">
      <ExperiencesPageContent />
    </PublicPageGate>
  );
}

function ExperiencesPageContent() {
  return (
    <main className="min-h-screen px-5 md:px-0 max-w-5xl mx-auto py-20 md:py-28">
      {/* HEADER — perlu cookies, dibungkus Suspense */}
      <Suspense fallback={<HeaderSkeleton />}>
        <PageHeader />
      </Suspense>

      {/* CONTENT — fetch data, dibungkus Suspense */}
      <Suspense fallback={<ExperiencesSkeleton />}>
        <ExperiencesContent />
      </Suspense>
    </main>
  );
}

// ============================================================
// HEADER (dynamic — baca cookies + dictionary)
// ============================================================
async function PageHeader() {
  // 🔑 Wajib: render per-request
  await connection();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";
  const t = (path) =>
    path.split(".").reduce((o, i) => o?.[i], getDict(lang)) || path;

  return (
    <div className="mb-16">
      <a
        href="/"
        className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors mb-8"
      >
        <FaArrowLeft className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" />
        {t("experiences.backToHome")}
      </a>

      <div className="flex items-baseline gap-4 mb-3">
        <span className="text-xs font-mono text-accent tracking-widest">
          04
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-text-main tracking-tighter">
          {t("experiences.allExperiences")}
        </h1>
      </div>
      <p className="text-base md:text-lg text-text-muted max-w-2xl">
        {t("sections.experiencesDesc")}
      </p>
    </div>
  );
}

// ============================================================
// SKELETON FALLBACKS
// ============================================================
function HeaderSkeleton() {
  return (
    <div className="mb-16 animate-pulse">
      <div className="h-4 w-32 rounded bg-surface mb-8" />
      <div className="flex items-baseline gap-4 mb-3">
        <div className="h-3 w-8 rounded bg-surface" />
        <div className="h-12 md:h-16 w-56 md:w-80 rounded bg-surface" />
      </div>
      <div className="h-4 w-full max-w-2xl rounded bg-surface" />
    </div>
  );
}

function ExperiencesSkeleton() {
  return (
    <>
      <div className="divide-y divide-border/60">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="py-10 md:py-14 first:pt-0 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">
              {/* Konten skeleton (kiri) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-6 rounded bg-surface" />
                  <div className="h-px w-8 bg-surface" />
                  <div className="h-3 w-14 rounded bg-surface" />
                  <div className="h-4 w-16 rounded bg-surface" />
                </div>
                <div className="h-8 w-3/4 rounded bg-surface" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-surface" />
                  <div className="h-3 w-5/6 rounded bg-surface" />
                  <div className="h-3 w-2/3 rounded bg-surface" />
                </div>
              </div>
              {/* Gambar skeleton (kanan) */}
              <div className="md:col-span-5">
                <div className="aspect-[4/3] w-full rounded-xl bg-surface" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-20 pt-8 border-t border-border/60 flex justify-between items-center">
        <div className="h-3 w-32 rounded bg-surface animate-pulse" />
        <div className="h-3 w-28 rounded bg-surface animate-pulse" />
      </div>
    </>
  );
}

// ============================================================
// DYNAMIC CONTENT
// ============================================================
async function ExperiencesContent() {
  // 🔑 Wajib: render per-request
  await connection();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";
  const t = (path) =>
    path.split(".").reduce((o, i) => o?.[i], getDict(lang)) || path;

  const supabase = await createClient();

  const { data: experiences } = await supabase
    .from("experiences")
    .select(
      "type, title, title_en, description, description_en, image_url, start_year, end_year, created_at"
    )
    .order("start_year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const expList = experiences || [];

  // Helper: label tipe bilingual
  const formatType = (type) => {
    const key = type?.toLowerCase();
    const fallback = key?.toUpperCase() || "EXPERIENCE";
    const translated = t(`experiences.types.${key}`);
    return translated !== `experiences.types.${key}` ? translated : fallback;
  };

  // Helper: rentang tahun bilingual
  const formatYearRange = (start, end) => {
    if (!start && !end) return null;
    if (start && !end) return `${start} — ${t("experiences.present")}`;
    if (!start && end) return `${end}`;
    if (start === end) return `${start}`;
    return `${start} — ${end}`;
  };

  if (expList.length === 0) {
    return (
      <>
        <div className="py-20 text-center border-t border-border/60">
          <p className="text-text-muted italic">{t("experiences.empty")}</p>
        </div>
        <ExperiencesFooter count={0} t={t} />
      </>
    );
  }

  return (
    <>
      <div className="divide-y divide-border/60">
        {expList.map((exp, i) => {
          const yearRange = formatYearRange(exp.start_year, exp.end_year);
          const displayTitle = getBilingual(lang, exp.title, exp.title_en);
          const displayDesc = getBilingual(
            lang,
            exp.description,
            exp.description_en
          );

          return (
            <article key={i} className="group py-10 md:py-14 first:pt-0">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
                {/* ===== KONTEN (KIRI) — 7 kolom ===== */}
                <div className="md:col-span-7 space-y-4">
                  {/* Meta bar */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono text-accent tracking-widest">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-8 bg-border/60" />
                    {yearRange && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted">
                        <FaCalendarAlt className="w-3 h-3" />
                        {yearRange}
                      </span>
                    )}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-surface border border-border/50 text-[10px] font-mono uppercase tracking-wider text-text-muted group-hover:border-accent/30 group-hover:text-accent transition-colors duration-300">
                      {formatType(exp.type)}
                    </span>
                  </div>

                  {/* Judul */}
                  <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight group-hover:text-accent transition-colors duration-300 leading-snug">
                    {displayTitle}
                  </h2>

                  {/* Deskripsi */}
                  <p className="text-sm md:text-base text-text-muted/80 leading-relaxed whitespace-pre-line">
                    {displayDesc || t("experiences.noDescription")}
                  </p>
                </div>

                {/* ===== GAMBAR (KANAN) — 5 kolom ===== */}
                <div className="md:col-span-5 flex-shrink-0 self-start w-full">
                  {exp.image_url ? (
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl ring-1 ring-black/5 bg-surface">
                      <img
                        src={exp.image_url}
                        alt={displayTitle}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full rounded-xl bg-surface ring-1 ring-black/5 flex items-center justify-center text-text-muted/30">
                      <span className="text-xs font-mono">
                        {t("experiences.noImage")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <ExperiencesFooter count={expList.length} t={t} />
    </>
  );
}

// ============================================================
// FOOTER
// ============================================================
function ExperiencesFooter({ count, t }) {
  return (
    <div className="mt-20 pt-8 border-t border-border/60 flex justify-between items-center">
      <span className="text-xs font-mono text-text-muted/60">
        {count} {t("experiences.recorded")}
      </span>
      <a
        href="/"
        className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
      >
        {t("experiences.backToHome")}
        <FaArrowLeft className="w-3 h-3 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </div>
  );
}