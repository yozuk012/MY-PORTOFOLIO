// src/app/(public)/home/components/Section4Experiences.jsx
import { connection } from "next/server";
import { createClient } from "@/lib/server";
import { FaArrowRight } from "react-icons/fa";

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

export default async function Section4Experiences() {
  await connection();
  const supabase = await createClient();

  // ✅ FIX: filter show_on_home + order by home_order
  const { data: experiences } = await supabase
    .from("experiences")
    .select("type, title, description, image_url, start_year, end_year, created_at")
    .eq("show_on_home", true)                     // ← filter
    .order("home_order", { ascending: true })     // ← urut admin
    .order("created_at", { ascending: false });   // ← tie-breaker

  const expList = experiences || [];

  return (
    <section
      id="experiences"
      className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24"
    >
      <div className="flex items-baseline gap-4 mb-3">
        <span className="text-xs font-mono text-accent tracking-widest">04</span>
        <h2 className="text-3xl md:text-5xl font-bold text-text-main tracking-tighter">
          Experiences
        </h2>
      </div>
      <p className="text-sm md:text-base text-text-muted mb-12 max-w-xl">
        Perjalanan profesional, magang, dan kegiatan nyata di mana saya menerapkan keahlian untuk memecahkan masalah.
      </p>

      <div className="space-y-0">
        {expList.length > 0 ? (
          expList.map((exp, i) => {
            const yearRange = formatYearRange(exp.start_year, exp.end_year);

            return (
              <div
                key={i}
                className="group py-7 md:py-9 border-b border-border/60 hover:border-accent/40 transition-colors duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
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

                  <div className="md:col-span-6 flex-1 space-y-2.5">
                    <h3 className="text-lg md:text-xl font-semibold text-text-main group-hover:text-accent transition-colors duration-300 leading-snug">
                      {exp.title}
                    </h3>
                    {exp.description && (
                      <p className="text-sm text-text-muted/80 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>

                  {exp.image_url && (
                    <div className="md:col-span-4 flex-shrink-0 self-start w-full">
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg ring-1 ring-black/5 bg-surface">
                        <img
                          src={exp.image_url}
                          alt={exp.title}
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
            Belum ada data pengalaman yang ditambahkan.
          </p>
        )}
      </div>

      <div className="mt-10 flex justify-end">
        <a
          href="/experiences"
          className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
        >
          View all experiences
          <FaArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}