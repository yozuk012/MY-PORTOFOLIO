// src/app/(public)/experiences/page.js
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/server";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";

export const metadata = {
  title: "Experiences | Achmad Aldino",
  description: "Perjalanan profesional, magang, dan kegiatan nyata yang telah saya jalani.",
};

const formatType = (type) => {
  const map = {
    pkl: "PKL",
    magang: "Magang",
    seminar: "Seminar",
    project: "Project",
    organization: "Organisasi",
    volunteer: "Volunteer",
    other: "Lainnya",
  };
  return map[type] || type?.toUpperCase() || "EXPERIENCE";
};

// Helper: format rentang tahun
// - (2023, 2024) => "2023 — 2024"
// - (2023, null) => "2023 — Sekarang"
// - (2023, 2023) => "2023"
// - (null, null) => null
const formatYearRange = (start, end) => {
  if (!start && !end) return null;
  if (start && !end) return `${start} — Sekarang`;
  if (!start && end) return `${end}`;
  if (start === end) return `${start}`;
  return `${start} — ${end}`;
};

// ============================================================
// STATIC SHELL
// ============================================================
export default function ExperiencesPage() {
  return (
    <main className="min-h-screen px-5 md:px-0 max-w-5xl mx-auto py-20 md:py-28">
      {/* ===== HEADER ===== */}
      <div className="mb-16">
        <a
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors mb-8"
        >
          <FaArrowLeft className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Home
        </a>

        <div className="flex items-baseline gap-4 mb-3">
          <span className="text-xs font-mono text-accent tracking-widest">
            04
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-text-main tracking-tighter">
            All Experiences
          </h1>
        </div>
        <p className="text-base md:text-lg text-text-muted max-w-2xl">
          Perjalanan profesional, magang, dan kegiatan nyata di mana saya menerapkan keahlian untuk memecahkan masalah.
        </p>
      </div>

      {/* ===== DYNAMIC ===== */}
      <Suspense fallback={<ExperiencesSkeleton />}>
        <ExperiencesContent />
      </Suspense>
    </main>
  );
}

// ============================================================
// SKELETON
// ============================================================
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
  await connection();
  const supabase = await createClient();

  const { data: experiences } = await supabase
    .from("experiences")
    .select("type, title, description, image_url, start_year, end_year, created_at")
    .order("start_year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const expList = experiences || [];

  if (expList.length === 0) {
    return (
      <>
        <div className="py-20 text-center border-t border-border/60">
          <p className="text-text-muted italic">
            Belum ada pengalaman yang ditambahkan.
          </p>
        </div>
        <ExperiencesFooter count={0} />
      </>
    );
  }

  return (
    <>
      <div className="divide-y divide-border/60">
        {expList.map((exp, i) => {
          const yearRange = formatYearRange(exp.start_year, exp.end_year);

          return (
            <article
              key={i}
              className="group py-10 md:py-14 first:pt-0"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">

                {/* ===== KONTEN (KIRI) — 7 kolom ===== */}
                <div className="md:col-span-7 space-y-4">

                  {/* Meta bar: nomor · garis · tahun · badge */}
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
                    {exp.title}
                  </h2>

                  {/* Deskripsi full */}
                  <p className="text-sm md:text-base text-text-muted/80 leading-relaxed whitespace-pre-line">
                    {exp.description ||
                      "Tidak ada deskripsi yang ditambahkan untuk pengalaman ini."}
                  </p>
                </div>

                {/* ===== GAMBAR (KANAN) — 5 kolom, aspect 4:3 ===== */}
                <div className="md:col-span-5 flex-shrink-0 self-start w-full">
                  {exp.image_url ? (
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl ring-1 ring-black/5 bg-surface">
                      <img
                        src={exp.image_url}
                        alt={exp.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full rounded-xl bg-surface ring-1 ring-black/5 flex items-center justify-center text-text-muted/30">
                      <span className="text-xs font-mono">NO IMAGE</span>
                    </div>
                  )}
                </div>

              </div>
            </article>
          );
        })}
      </div>

      <ExperiencesFooter count={expList.length} />
    </>
  );
}

// ============================================================
// FOOTER
// ============================================================
function ExperiencesFooter({ count }) {
  return (
    <div className="mt-20 pt-8 border-t border-border/60 flex justify-between items-center">
      <span className="text-xs font-mono text-text-muted/60">
        {count} EXPERIENCES RECORDED
      </span>
      <a
        href="/"
        className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
      >
        Back to Home
        <FaArrowLeft className="w-3 h-3 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </div>
  );
}