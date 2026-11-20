// src/app/(public)/home/components/Section3Education.jsx
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/server";

// Import dictionary lokal
import idDict from "@/lib/dictionaries/id.json";
import enDict from "@/lib/dictionaries/en.json";

// Helper dictionary
const getDict = (lang) => (lang === "en" ? enDict : idDict);

// Fallback bilingual: jika EN kosong, pakai ID
const getBilingual = (lang, idVal, enVal) =>
  lang === "en" ? enVal || idVal : idVal;

export default async function Section3Education() {
  // 🔑 Wajib: render per-request (hindari error Date.now())
  await connection();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";
  const t = (path) =>
    path.split(".").reduce((o, i) => o?.[i], getDict(lang)) || path;

  const supabase = await createClient();

  // Ambil data edukasi, urutkan dari tahun terbaru
  const { data: educations } = await supabase
    .from("educations")
    .select(
      "institution, institution_en, degree, degree_en, start_year, end_year, description, description_en"
    )
    .order("start_year", { ascending: false });

  const eduList = educations || [];

  return (
    <section
      id="education"
      className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24"
    >
      {/* ===== Eyebrow + Judul ===== */}
      <div className="flex items-baseline gap-4 mb-3">
        <span className="text-xs font-mono text-accent tracking-widest">
          03
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-text-main tracking-tighter">
          {t("sections.education")}
        </h2>
      </div>
      <p className="text-sm md:text-base text-text-muted mb-12 max-w-xl">
        {t("sections.educationDesc")}
      </p>

      {/* ===== Daftar Edukasi ===== */}
      <div className="space-y-0">
        {eduList.length > 0 ? (
          eduList.map((edu, i) => (
            <div
              key={i}
              className="group py-6 md:py-8 border-b border-border/60 hover:border-accent/40 transition-colors duration-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                {/* Kolom Kiri: Tahun (Monospace) */}
                <div className="md:col-span-3 flex items-start">
                  <span className="text-sm font-mono text-text-muted whitespace-nowrap">
                    {edu.start_year} —{" "}
                    {edu.end_year || t("education.present")}
                  </span>
                </div>

                {/* Kolom Kanan: Detail Institusi */}
                <div className="md:col-span-9 space-y-2">
                  <h3 className="text-lg md:text-xl font-semibold text-text-main group-hover:text-accent transition-colors duration-300">
                    {getBilingual(lang, edu.institution, edu.institution_en)}
                  </h3>
                  <p className="text-sm font-medium text-accent/80">
                    {getBilingual(lang, edu.degree, edu.degree_en)}
                  </p>

                  {/* Deskripsi (Opsional) */}
                  {getBilingual(lang, edu.description, edu.description_en) && (
                    <p className="text-sm text-text-muted/80 leading-relaxed max-w-2xl pt-1">
                      {getBilingual(lang, edu.description, edu.description_en)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-muted py-8 italic">
            {t("education.empty")}
          </p>
        )}
      </div>
    </section>
  );
}