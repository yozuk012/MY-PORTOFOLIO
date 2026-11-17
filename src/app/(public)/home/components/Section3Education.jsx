// src/app/(public)/home/components/Section3Education.jsx
import { connection } from "next/server";
import { createClient } from "@/lib/server";

export default async function Section3Education() {
  await connection();
  const supabase = await createClient();

  // Ambil data edukasi, urutkan dari tahun terbaru
  const { data: educations } = await supabase
    .from("educations")
    .select("institution, degree, start_year, end_year, description")
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
          Education
        </h2>
      </div>
      <p className="text-sm md:text-base text-text-muted mb-12 max-w-xl">
        Riwayat pendidikan formal dan akademik yang membentuk fondasi keahlian dan pola pikir saya.
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
                    {edu.start_year} — {edu.end_year || "Sekarang"}
                  </span>
                </div>

                {/* Kolom Kanan: Detail Institusi */}
                <div className="md:col-span-9 space-y-2">
                  <h3 className="text-lg md:text-xl font-semibold text-text-main group-hover:text-accent transition-colors duration-300">
                    {edu.institution}
                  </h3>
                  <p className="text-sm font-medium text-accent/80">
                    {edu.degree}
                  </p>
                  
                  {/* Deskripsi (Opsional) */}
                  {edu.description && (
                    <p className="text-sm text-text-muted/80 leading-relaxed max-w-2xl pt-1">
                      {edu.description}
                    </p>
                  )}
                </div>

              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-muted py-8 italic">
            Belum ada data pendidikan yang ditambahkan.
          </p>
        )}
      </div>
    </section>
  );
}