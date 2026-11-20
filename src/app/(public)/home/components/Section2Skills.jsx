// src/app/(public)/home/components/Section2Skills.jsx
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/server";
import { FaArrowRight } from "react-icons/fa";

// Import dictionary lokal
import idDict from "@/lib/dictionaries/id.json";
import enDict from "@/lib/dictionaries/en.json";

// Helper untuk mengambil nilai dari dictionary
const getDict = (lang) => (lang === "en" ? enDict : idDict);

// Fallback helper: jika bahasa EN tapi data EN kosong, pakai data ID
const getBilingual = (lang, idVal, enVal) =>
  lang === "en" ? enVal || idVal : idVal;

export default async function Section2Skills() {
  // 🔑 Wajib: pastikan render per-request (hindari error Date.now() saat prerender)
  await connection();

  // 1. Baca preferensi bahasa dari Cookie (default 'id')
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";

  // Helper fungsi translate untuk teks statis
  const t = (path) =>
    path.split(".").reduce((o, i) => o?.[i], getDict(lang)) || path;

  const supabase = await createClient();

  // 2. Fetch skills termasuk kolom name_en
  const { data: skills } = await supabase
    .from("skills")
    .select("name, name_en, score")
    .eq("show_on_home", true) // ← filter
    .order("home_order", { ascending: true }) // ← urut admin
    .order("score", { ascending: false }) // ← tie-breaker
    .limit(8);

  // 3. Fetch semua skills untuk marquee (termasuk name_en)
  const { data: allSkills } = await supabase
    .from("skills")
    .select("name, name_en")
    .eq("show_on_home", true) // ← filter
    .order("home_order", { ascending: true })
    .order("name", { ascending: true });

  const skillList = skills || [];

  // Map marquee skills dengan fallback bilingual
  const marqueeSkills = (allSkills || []).map((s) =>
    getBilingual(lang, s.name, s.name_en)
  );

  return (
    <section
      id="skills"
      className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24"
    >
      <div className="flex items-baseline gap-4 mb-3">
        <span className="text-xs font-mono text-accent tracking-widest">02</span>
        <h2 className="text-3xl md:text-5xl font-bold text-text-main tracking-tighter">
          {t("sections.skills")}
        </h2>
      </div>

      <p className="text-sm md:text-base text-text-muted mb-12 max-w-xl">
        {t("sections.skillsDesc")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
        {skillList.map((skill, i) => (
          <div
            key={i}
            className="group py-4 border-b border-border/60 hover:border-accent/40 transition-colors duration-300"
          >
            <div className="flex items-baseline justify-between mb-2.5">
              <span className="text-base md:text-lg font-medium text-text-main">
                {/* 🆕 Gunakan getBilingual untuk nama skill */}
                {getBilingual(lang, skill.name, skill.name_en)}
              </span>
              <span className="text-xs font-mono text-text-muted group-hover:text-accent transition-colors">
                {skill.score}/10
              </span>
            </div>
            <div className="h-px w-full bg-border/60 overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-700 ease-out"
                style={{ width: `${(skill.score / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <a
          href="/skills"
          className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
        >
          {t("cta.viewAllSkills")}
          <FaArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>

      {marqueeSkills.length > 0 && (
        <div className="mt-16 py-4 border-y border-border/60 overflow-hidden select-none">
          <div className="flex w-max marquee-track">
            {[...marqueeSkills, ...marqueeSkills].map((name, i) => (
              <span
                key={i}
                className="mx-6 text-sm font-mono uppercase tracking-widest text-text-muted/50 whitespace-nowrap"
              >
                {name}
                <span className="ml-12 text-accent/40">◆</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}