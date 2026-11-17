// src/app/(public)/home/components/Section5Projects.jsx
import { connection } from "next/server";
import { createClient } from "@/lib/server";
import { FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";

export default async function Section5Projects() {
  await connection();
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("title, description, image_url, demo_url, tech_tags, status")
    .eq("show_on_home", true)
    .in("status", ["active", "done", "progress"])
    .order("home_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching public projects:", error);
  }

  const projectList = projects || [];

  return (
    <section
      id="projects"
      className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24"
    >
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-4">
          <span className="text-xs font-mono text-accent tracking-widest">05</span>
          <h2 className="text-3xl md:text-5xl font-bold text-text-main tracking-tighter">
            Projects
          </h2>
        </div>
        <a
          href="/projects"
          className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
        >
          View all
          <FaArrowRight className="w-3 h-3" />
        </a>
      </div>
      <p className="text-sm md:text-base text-text-muted mb-10 max-w-xl">
        Karya terpilih yang mencerminkan pendekatan saya dalam memecahkan masalah melalui kode dan desain.
      </p>

      {projectList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {projectList.map((project, i) => {
            // ✅ Jika total item ganjil, jadikan item PERTAMA sebagai Full Width
            const isFeatured = projectList.length % 2 !== 0 && i === 0;

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
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted/30">
                      <span className="text-xs font-mono">No Preview</span>
                    </div>
                  )}

                  {project.demo_url && (
                    <div className="absolute inset-0 bg-text-main/0 group-hover:bg-text-main/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium text-text-main flex items-center gap-1.5 shadow-lg">
                        <FaExternalLinkAlt className="w-2.5 h-2.5" /> Demo
                      </span>
                    </div>
                  )}
                </a>

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono text-accent tracking-widest">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60">
                    {project.status}
                  </span>
                </div>

                {/* Judul: Sedikit lebih besar jika Featured */}
                <h3 className={`font-bold text-text-main tracking-tight mb-1.5 group-hover:text-accent transition-colors duration-300 ${
                  isFeatured ? "text-xl md:text-2xl" : "text-lg md:text-xl"
                }`}>
                  {project.title}
                </h3>

                <p className="text-sm text-text-muted/80 leading-relaxed mb-3 line-clamp-2">
                  {project.description}
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
          Belum ada proyek yang dipublikasikan.
        </p>
      )}

      <div className="mt-10 md:hidden flex justify-end">
        <a
          href="/projects"
          className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
        >
          View all projects
          <FaArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}