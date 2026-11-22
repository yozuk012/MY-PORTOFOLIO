// src/app/(public)/page.js
import { Suspense } from "react";
import FeatureGate from "./home/components/FeatureGate";

import Section1Profile from "./home/components/Section1Profile";
import Section2Skills from "./home/components/Section2Skills";
import Section3Education from "./home/components/Section3Education";
import Section4Experiences from "./home/components/Section4Experiences";
import Section5Projects from "./home/components/Section5Projects";
import Section6Notes from "./home/components/Section6Notes";

// Dimatikan sementara: halaman ini butuh data dinamis (feature flags + Date.now via FeatureGate)
export const instant = false;

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ============================================ */}
      {/* SECTION 1: PROFILE                           */}
      {/* ============================================ */}
      <FeatureGate featureKey="section_profile">
        <Suspense
          fallback={
            <section className="px-5 md:px-0 max-w-4xl mx-auto pt-28 pb-16 md:pb-20 animate-pulse">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-2 w-2 rounded-full bg-surface" />
                <div className="h-3 w-32 rounded bg-surface" />
              </div>
              <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10 mb-8">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-surface flex-shrink-0 self-center md:self-end" />
                <div className="flex-1 space-y-3">
                  <div className="h-16 md:h-24 w-full rounded-lg bg-surface" />
                  <div className="h-5 w-40 rounded bg-surface" />
                </div>
              </div>
              <div className="h-px w-full bg-surface mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <div className="h-3 w-16 rounded bg-surface" />
                    <div className="h-4 w-40 rounded bg-surface" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-20 rounded bg-surface" />
                    <div className="h-4 w-24 rounded bg-surface" />
                    <div className="h-4 w-24 rounded bg-surface" />
                    <div className="h-4 w-24 rounded bg-surface" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 rounded bg-surface" />
                    <div className="h-4 w-20 rounded bg-surface" />
                    <div className="h-4 w-20 rounded bg-surface" />
                    <div className="h-4 w-20 rounded bg-surface" />
                    <div className="h-4 w-24 rounded bg-surface" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="h-4 w-full rounded bg-surface" />
                  <div className="h-4 w-5/6 rounded bg-surface" />
                  <div className="h-4 w-2/3 rounded bg-surface" />
                </div>
              </div>
            </section>
          }
        >
          <Section1Profile />
        </Suspense>
      </FeatureGate>

      {/* ============================================ */}
      {/* SECTION 2: SKILLS                            */}
      {/* ============================================ */}
      <FeatureGate featureKey="section_skills">
        <Suspense
          fallback={
            <section className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24 animate-pulse">
              <div className="flex items-baseline gap-4 mb-3">
                <div className="h-3 w-8 rounded bg-surface" />
                <div className="h-10 md:h-14 w-40 md:w-56 rounded bg-surface" />
              </div>
              <div className="h-4 w-3/4 md:w-1/2 rounded bg-surface mb-12" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-10">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="py-4 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-5 w-24 rounded bg-surface" />
                      <div className="h-4 w-10 rounded bg-surface" />
                    </div>
                    <div className="h-px w-full bg-surface" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end mb-16">
                <div className="h-4 w-28 rounded bg-surface" />
              </div>
              <div className="py-4 border-y border-surface space-y-4">
                <div className="h-4 w-full rounded bg-surface" />
                <div className="h-4 w-5/6 rounded bg-surface" />
              </div>
            </section>
          }
        >
          <Section2Skills />
        </Suspense>
      </FeatureGate>

      {/* ============================================ */}
      {/* SECTION 3: EDUCATION                         */}
      {/* ============================================ */}
      <FeatureGate featureKey="section_education">
        <Suspense
          fallback={
            <section className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24 animate-pulse">
              <div className="flex items-baseline gap-4 mb-3">
                <div className="h-3 w-8 rounded bg-surface" />
                <div className="h-10 md:h-14 w-40 md:w-56 rounded bg-surface" />
              </div>
              <div className="h-4 w-3/4 md:w-1/2 rounded bg-surface mb-12" />
              <div className="space-y-0">
                {[1, 2].map((i) => (
                  <div key={i} className="py-6 md:py-8 border-b border-surface">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                      <div className="md:col-span-3">
                        <div className="h-4 w-20 rounded bg-surface" />
                      </div>
                      <div className="md:col-span-9 space-y-3">
                        <div className="h-6 w-3/4 rounded bg-surface" />
                        <div className="h-4 w-1/3 rounded bg-surface" />
                        <div className="h-4 w-full rounded bg-surface" />
                        <div className="h-4 w-5/6 rounded bg-surface" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          }
        >
          <Section3Education />
        </Suspense>
      </FeatureGate>

      {/* ============================================ */}
      {/* SECTION 4: EXPERIENCES                       */}
      {/* ============================================ */}
      <FeatureGate featureKey="section_experiences">
        <Suspense
          fallback={
            <section className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24 animate-pulse">
              <div className="flex items-baseline gap-4 mb-3">
                <div className="h-3 w-8 rounded bg-surface" />
                <div className="h-10 md:h-14 w-48 md:w-64 rounded bg-surface" />
              </div>
              <div className="h-4 w-3/4 md:w-1/2 rounded bg-surface mb-12" />
              <div className="space-y-0">
                {[1, 2].map((i) => (
                  <div key={i} className="py-6 md:py-8 border-b border-surface">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
                      <div className="md:col-span-3 space-y-3">
                        <div className="h-4 w-12 rounded bg-surface" />
                        <div className="h-5 w-20 rounded bg-surface" />
                      </div>
                      <div className="md:col-span-9 flex flex-col md:flex-row gap-4 md:gap-6">
                        <div className="flex-1 space-y-3">
                          <div className="h-6 w-3/4 rounded bg-surface" />
                          <div className="h-4 w-full rounded bg-surface" />
                          <div className="h-4 w-5/6 rounded bg-surface" />
                        </div>
                        <div className="hidden md:block w-32 h-20 rounded-lg bg-surface flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          }
        >
          <Section4Experiences />
        </Suspense>
      </FeatureGate>

      {/* ============================================ */}
      {/* SECTION 5: PROJECTS                          */}
      {/* ============================================ */}
      <FeatureGate featureKey="section_projects">
        <Suspense
          fallback={
            <section className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24 animate-pulse">
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-4">
                  <div className="h-3 w-8 rounded bg-surface" />
                  <div className="h-10 md:h-14 w-40 md:w-56 rounded bg-surface" />
                </div>
                <div className="hidden md:block h-4 w-20 rounded bg-surface" />
              </div>
              <div className="h-4 w-3/4 md:w-1/2 rounded bg-surface mb-12" />
              <div className="space-y-12 md:space-y-16">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="block">
                    <div className="aspect-video w-full rounded-xl bg-surface mb-6" />
                    <div className="flex items-baseline gap-4 mb-3">
                      <div className="h-3 w-6 rounded bg-surface" />
                      <div className="h-8 w-2/3 rounded bg-surface" />
                    </div>
                    <div className="h-4 w-full rounded bg-surface mb-2" />
                    <div className="h-4 w-5/6 rounded bg-surface mb-4" />
                    <div className="flex gap-2">
                      <div className="h-5 w-16 rounded bg-surface" />
                      <div className="h-5 w-20 rounded bg-surface" />
                      <div className="h-5 w-14 rounded bg-surface" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          }
        >
          <Section5Projects />
        </Suspense>
      </FeatureGate>

      {/* ============================================ */}
      {/* SECTION 6: NOTES                             */}
      {/* ============================================ */}
      <FeatureGate featureKey="section_notes">
        <Suspense
          fallback={
            <section className="px-5 md:px-0 max-w-4xl mx-auto py-16 md:py-24 animate-pulse">
              <div className="flex items-baseline justify-between mb-3">
                <div className="flex items-baseline gap-4">
                  <div className="h-3 w-8 rounded bg-surface" />
                  <div className="h-10 md:h-14 w-64 rounded bg-surface" />
                </div>
                <div className="hidden md:block h-4 w-28 rounded bg-surface" />
              </div>
              <div className="h-4 w-3/4 md:w-1/2 rounded bg-surface mb-10" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-border/40 rounded-lg p-5 md:p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3">
                        <div className="h-4 w-20 rounded bg-surface" />
                        <div className="h-4 w-28 rounded bg-surface" />
                      </div>
                      <div className="h-3 w-3 rounded bg-surface" />
                    </div>
                    <div className="h-6 w-3/4 rounded bg-surface" />
                    <div className="h-4 w-full rounded bg-surface" />
                    <div className="h-4 w-5/6 rounded bg-surface" />
                    <div className="flex gap-2 pt-1">
                      <div className="h-5 w-16 rounded bg-surface" />
                      <div className="h-5 w-20 rounded bg-surface" />
                      <div className="h-5 w-14 rounded bg-surface" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          }
        >
          <Section6Notes />
        </Suspense>
      </FeatureGate>

      {/* ============================================ */}
      {/* FOOTER MINIMALIS                             */}
      {/* ============================================ */}
      <footer className="px-5 md:px-0 max-w-4xl mx-auto py-12 border-t border-border/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-muted">
          <p className="font-mono text-xs">
            © 2026 Achmad Aldino. Crafted with Next.js &amp; Supabase.
          </p>
          <a
            href="/contacts"
            className="inline-flex items-center gap-2 hover:text-accent transition-colors font-medium"
          >
            Get in touch →
          </a>
        </div>
        <div className="h-10 md:h-0"></div>
      </footer>
    </div>
  );
}