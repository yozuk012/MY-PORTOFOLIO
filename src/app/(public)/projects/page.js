// src/app/(public)/projects/page.js
import { Suspense } from "react";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/server";
import PublicPageGate from "../home/components/PublicPageGate";
import { FaArrowLeft, FaExternalLinkAlt, FaCode } from "react-icons/fa";

// Import dictionary lokal
import idDict from "@/lib/dictionaries/id.json";
import enDict from "@/lib/dictionaries/en.json";

// Helper dictionary
const getDict = (lang) => (lang === "en" ? enDict : idDict);

// Fallback bilingual: jika EN kosong, pakai ID
const getBilingual = (lang, idVal, enVal) =>
  lang === "en" ? enVal || idVal : idVal;

export const metadata = {
  title: "Projects | Achmad Aldino",
  description:
    "Karya dan proyek terpilih yang mencerminkan pendekatan saya dalam pengembangan web.",
};

// ============================================================
// STATIC SHELL
// ============================================================
export default function ProjectsPage() {
  return (
    <PublicPageGate featureKey="page_projects">
      <ProjectsPageContent />
    </PublicPageGate>
  );
}

function ProjectsPageContent() {
  return (
    <main className="min-h-screen px-5 md:px-0 max-w-5xl mx-auto py-20 md:py-28">
      {/* HEADER — perlu cookies, dibungkus Suspense */}
      <Suspense fallback={<HeaderSkeleton />}>
        <PageHeader />
      </Suspense>

      {/* CONTENT — fetch data, dibungkus Suspense */}
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsContent />
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
        {t("projects.backToHome")}
      </a>

      <div className="flex items-baseline gap-4 mb-3">
        <span className="text-xs font-mono text-accent tracking-widest">
          05
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-text-main tracking-tighter">
          {t("projects.allProjects")}
        </h1>
      </div>
      <p className="text-base md:text-lg text-text-muted max-w-2xl">
        {t("projects.allProjectsDesc")}
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
        <div className="h-12 md:h-16 w-56 md:w-72 rounded bg-surface" />
      </div>
      <div className="h-4 w-full max-w-2xl rounded bg-surface" />
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <>
      <div className="divide-y divide-border/60">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="py-10 md:py-12 first:pt-0 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
              {/* Gambar skeleton (kiri) */}
              <div className="md:col-span-5">
                <div className="aspect-[4/3] w-full rounded-xl bg-surface" />
              </div>
              {/* Konten skeleton (kanan) */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-6 rounded bg-surface" />
                  <div className="h-4 w-16 rounded bg-surface" />
                </div>
                <div className="h-8 w-3/4 rounded bg-surface" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-surface" />
                  <div className="h-3 w-5/6 rounded bg-surface" />
                  <div className="h-3 w-2/3 rounded bg-surface" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-6 w-14 rounded bg-surface" />
                  <div className="h-6 w-14 rounded bg-surface" />
                  <div className="h-6 w-14 rounded bg-surface" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-16 pt-8 border-t border-border/60 flex justify-between items-center">
        <div className="h-3 w-32 rounded bg-surface animate-pulse" />
        <div className="h-3 w-28 rounded bg-surface animate-pulse" />
      </div>
    </>
  );
}

// ============================================================
// DYNAMIC CONTENT
// ============================================================
async function ProjectsContent() {
  // 🔑 Wajib: render per-request
  await connection();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";
  const t = (path) =>
    path.split(".").reduce((o, i) => o?.[i], getDict(lang)) || path;

  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "title, title_en, description, description_en, image_url, demo_url, tech_tags, status, created_at"
    )
    .order("created_at", { ascending: false });

  const projectList = projects || [];

  // Helper: label status bilingual
  const formatStatus = (status) => {
    const key = status?.toLowerCase();
    if (!key) return t("projects.statuses.draft");
    const fallback = key.toUpperCase();
    const translated = t(`projects.statuses.${key}`);
    return translated !== `projects.statuses.${key}` ? translated : fallback;
  };

  if (projectList.length === 0) {
    return (
      <>
        <div className="py-20 text-center border-t border-border/60">
          <p className="text-text-muted italic">{t("projects.empty")}</p>
        </div>
        <ProjectsFooter count={0} t={t} />
      </>
    );
  }

  return (
    <>
      <div className="divide-y divide-border/60">
        {projectList.map((project, i) => {
          const displayTitle = getBilingual(
            lang,
            project.title,
            project.title_en
          );
          const displayDesc = getBilingual(
            lang,
            project.description,
            project.description_en
          );

          return (
            <article key={i} className="group py-10 md:py-12 first:pt-0">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start">
                {/* ===== GAMBAR (KIRI) — 5 kolom ===== */}
                <div className="md:col-span-5 flex-shrink-0 w-full">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl ring-1 ring-black/5 bg-surface">
                    {project.image_url ? (
                      <>
                        <img
                          src={project.image_url}
                          alt={displayTitle}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                        {/* Overlay hover jika ada demo_url */}
                        {project.demo_url && (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-text-main/0 group-hover:bg-text-main/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            <span className="px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium text-text-main flex items-center gap-1.5 shadow-lg">
                              <FaExternalLinkAlt className="w-2.5 h-2.5" />{" "}
                              {t("projects.liveDemo")}
                            </span>
                          </a>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-text-muted/30 gap-2">
                        <FaCode className="w-8 h-8" />
                        <span className="text-[10px] font-mono">
                          {t("projects.noPreview")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ===== KONTEN (KANAN) — 7 kolom ===== */}
                <div className="md:col-span-7 flex flex-col min-w-0">
                  {/* Meta bar: nomor · garis · status */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="text-xs font-mono text-accent tracking-widest">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="h-px w-6 bg-border/60" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60 border border-border/50 px-2 py-0.5 rounded group-hover:border-accent/30 group-hover:text-accent transition-colors duration-300">
                      {formatStatus(project.status)}
                    </span>
                  </div>

                  {/* Judul */}
                  <h2 className="text-2xl md:text-3xl font-bold text-text-main tracking-tight group-hover:text-accent transition-colors duration-300 leading-snug mb-3">
                    {displayTitle}
                  </h2>

                  {/* Deskripsi */}
                  <p className="text-sm md:text-base text-text-muted/80 leading-relaxed whitespace-pre-line mb-5">
                    {displayDesc || t("projects.noDescription")}
                  </p>

                  {/* Footer: Tech tags + Demo link */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-auto">
                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.tech_tags?.length > 0 ? (
                        project.tech_tags.map((tag, j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 bg-surface border border-border/50 rounded text-[11px] font-mono text-text-muted"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] font-mono text-text-muted/40 italic">
                          {t("projects.noTags")}
                        </span>
                      )}
                    </div>

                    {/* Demo link */}
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-accent transition-colors"
                      >
                        {t("projects.visitSite")}
                        <FaExternalLinkAlt className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <ProjectsFooter count={projectList.length} t={t} />
    </>
  );
}

// ============================================================
// FOOTER
// ============================================================
function ProjectsFooter({ count, t }) {
  return (
    <div className="mt-16 pt-8 border-t border-border/60 flex justify-between items-center">
      <span className="text-xs font-mono text-text-muted/60">
        {count} {t("projects.showcased")}
      </span>
      <a
        href="/"
        className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
      >
        {t("projects.backToHome")}
        <FaArrowLeft className="w-3 h-3 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
      </a>
    </div>
  );
}