// src/app/(public)/skills/page.js
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/server";
import { FaArrowLeft } from "react-icons/fa";

export const metadata = {
  title: "Skills | Achmad Aldino",
  description: "Daftar lengkap keahlian teknis dan tingkat kemahiran saya.",
};

// ============================================================
// STATIC SHELL — dirender sekali saat build (prerenderable)
// ============================================================
export default function SkillsPage() {
  return (
    <main className="min-h-screen px-5 md:px-0 max-w-5xl mx-auto py-20 md:py-28">
      {/* ===== HEADER (statis) ===== */}
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
            02
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-text-main tracking-tighter">
            All Skills
          </h1>
        </div>
        <p className="text-base md:text-lg text-text-muted max-w-2xl">
          Daftar lengkap keahlian teknis yang saya gunakan sehari-hari, diurutkan berdasarkan tingkat kemahiran (skor 1-10).
        </p>
      </div>

      {/* ===== DYNAMIC (dibungkus Suspense, di-stream saat request) ===== */}
      <Suspense fallback={<SkillsSkeleton />}>
        <SkillsContent />
      </Suspense>
    </main>
  );
}

// ============================================================
// FALLBACK SKELETON — muncul saat data sedang di-fetch
// ============================================================
function SkillsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-6 md:p-8 bg-background border border-border/60 rounded-xl"
          >
            <div className="flex items-baseline justify-between mb-4">
              <div className="h-5 w-28 rounded bg-surface" />
              <div className="h-4 w-10 rounded bg-surface" />
            </div>
            <div className="h-px w-full bg-surface mb-5" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-surface" />
              <div className="h-3 w-5/6 rounded bg-surface" />
              <div className="h-3 w-2/3 rounded bg-surface" />
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
// DYNAMIC CONTENT — fetch data + render grid + footer
// ============================================================
async function SkillsContent() {
  // ✅ connection() sekarang aman karena berada di dalam <Suspense>
  await connection();
  const supabase = await createClient();

  const { data: skills } = await supabase
    .from("skills")
    .select("name, score, description")
    .order("score", { ascending: false })
    .order("name", { ascending: true });

  const skillList = skills || [];

  // Empty state
  if (skillList.length === 0) {
    return (
      <>
        <div className="py-20 text-center">
          <p className="text-text-muted italic">
            Belum ada skill yang ditambahkan.
          </p>
        </div>
        <SkillsFooter count={0} />
      </>
    );
  }

  return (
    <>
      {/* ===== GRID CARD SKILLS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillList.map((skill, i) => (
          <article
            key={i}
            className="group p-6 md:p-8 bg-background border border-border/60 rounded-xl hover:border-accent/40 transition-all duration-300 flex flex-col"
          >
            {/* Header Card: Nama & Skor */}
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-main group-hover:text-accent transition-colors duration-300">
                {skill.name}
              </h2>
              <span className="text-sm font-mono font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                {skill.score}/10
              </span>
            </div>

            {/* Bar Progres */}
            <div className="h-px w-full bg-border/60 overflow-hidden mb-5">
              <div
                className="h-full bg-accent transition-all duration-700 ease-out"
                style={{ width: `${(skill.score / 10) * 100}%` }}
              />
            </div>

            {/* Deskripsi */}
            <p className="text-sm text-text-muted leading-relaxed flex-1">
              {skill.description ||
                "Tidak ada deskripsi yang ditambahkan untuk skill ini."}
            </p>
          </article>
        ))}
      </div>

      <SkillsFooter count={skillList.length} />
    </>
  );
}

// ============================================================
// FOOTER — dijadikan komponen agar count tetap tersinkron
// ============================================================
function SkillsFooter({ count }) {
  return (
    <div className="mt-20 pt-8 border-t border-border/60 flex justify-between items-center">
      <span className="text-xs font-mono text-text-muted/60">
        {count} SKILLS REGISTERED
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