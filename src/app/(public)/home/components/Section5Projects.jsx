// src/app/(public)/home/components/Section5Projects.jsx
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/server";
import { FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";

// Import dictionary lokal
import idDict from "@/lib/dictionaries/id.json";
import enDict from "@/lib/dictionaries/en.json";

// Helper dictionary
const getDict = (lang) => (lang === "en" ? enDict : idDict);

// Fallback bilingual: jika EN kosong, pakai ID
const getBilingual = (lang, idVal, enVal) =>
  lang === "en" ? enVal || idVal : idVal;

export default async function Section5Projects() {
  // 🔑 Wajib: render per-request (hindari error Date.now())
  await connection();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";
  const t = (path) =>
    path.split(".").reduce((o, i) => o?.[i], getDict(lang)) || path;

  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      "title, title_en, description, description_en, image_url, demo_url, tech_tags, status"
    )
    .eq("show_on_home", true)
    .in("status", ["active", "done", "progress"])
    .order("home_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching public projects:", error);
  }

  const projectList = projects || [];

  // ============================================
  // HELPER: label status (bilingual via dictionary)
  // ============================================
  const formatStatus = (status) => {
    const key = status?.toLowerCase();
    if (!key) return "";
    const fallback = key.toUpperCase();
    const translated = t(`projects.statuses.${key}`);
    return translated !== `projects.statuses.${key}` ? translated : fallback;
  };

  return (
    <section
      id="projects"
      className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24"
    >
      {/* ===== Header ===== */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-4">
          <span className="text-xs font-mono text-accent tracking-widest">
            05
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-text-main tracking-tighter">
            {t("sections.projects")}
          </h2>
        </div>
        <a
          href="/projects"
          className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
        >
          {t("projects.viewAll")}
          <FaArrowRight className="w-3 h-3" />
        </a>
      </div>
      <p className="text-sm md:text-base text-text-muted mb-10 max-w-xl">
        {t("sections.projectsDesc")}
      </p>

      {/* ===== Grid Proyek ===== */}
      {projectList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {projectList.map((project, i) => {
            // ✅ Jika total item ganjil, jadikan item PERTAMA sebagai Full Width
            const isFeatured = projectList.length % 2 !== 0 && i === 0;

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
              <article
                key={i}
                className={`group ${isFeatured ? "md:col-span-2" : ""}`}
              >
                {/* Gambar: Full width pakai 16:9, Half width pakai 4:3 */}
                <a
                  href={project.demo_url || "#"}
                  target={project.demo_url ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`relative block w-full overflow-hidden rounded-lg bg-surface ring-1 ring-black/5 mb-4 ${
                    isFeatured ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3]"
                  }`}
                >
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={displayTitle}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted/30">
                      <span className="text-xs font-mono">
                        {t("projects.noPreview")}
                      </span>
                    </div>
                  )}

                  {project.demo_url && (
                    <div className="absolute inset-0 bg-text-main/0 group-hover:bg-text-main/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium text-text-main flex items-center gap-1.5 shadow-lg">
                        <FaExternalLinkAlt className="w-2.5 h-2.5" />{" "}
                        {t("projects.demo")}
                      </span>
                    </div>
                  )}
                </a>

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-accent tracking-widest">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60">
                    {formatStatus(project.status)}
                  </span>
                </div>

                {/* Judul: Sedikit lebih besar jika Featured */}
                <h3
                  className={`font-bold text-text-main tracking-tight mb-1.5 group-hover:text-accent transition-colors duration-300 ${
                    isFeatured ? "text-xl md:text-2xl" : "text-lg md:text-xl"
                  }`}
                >
                  {displayTitle}
                </h3>

                <p className="text-sm text-text-muted/80 leading-relaxed mb-3 line-clamp-2">
                  {displayDesc}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {project.tech_tags?.map((tag, j) => (
                    <span
                      key={j}
                      className="px-2 py-0.5 bg-surface rounded text-[11px] font-mono text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-text-muted py-8 italic">
          {t("projects.empty")}
        </p>
      )}

      {/* ===== CTA mobile-only ===== */}
      <div className="mt-10 md:hidden flex justify-end">
        <a
          href="/projects"
          className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
        >
          {t("cta.viewAllProjects")}
          <FaArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}