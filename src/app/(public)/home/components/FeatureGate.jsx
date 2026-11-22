// src/components/FeatureGate.jsx
import { Suspense } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/server";

/**
 * Internal: evaluasi fitur di request time.
 * Tidak diekspos langsung — selalu dibungkus <Suspense>.
 */
async function FeatureGateResolver({ featureKey, children, fallback }) {
  // ⬇️ KRUSIAL: memberi tahu Next.js bahwa komponen ini
  // HARUS dijalankan di request time. Ini mencegah `Date.now()`
  // (dari createClient / Supabase SSR) dievaluasi saat prerender.
  await connection();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feature_toggles")
    .select("is_enabled")
    .eq("feature_key", featureKey)
    .single();

  // Error (mis. key tidak ditemukan) ATAU nonaktif → tampilkan fallback
  if (error || !data?.is_enabled) {
    // if (error) {
    //   console.warn(`[FeatureGate] Error fetching ${featureKey}:`, error.message);
    // }
    return fallback;
  }

  return children;
}

/**
 * FeatureGate Component
 * Membungkus konten dan hanya merendernya jika fitur diaktifkan di database.
 *
 * @param {string} featureKey - Kunci fitur (misal: 'section_skills', 'page_projects')
 * @param {React.ReactNode} children - Konten yang akan dirender jika aktif
 * @param {React.ReactNode} fallback - Konten alternatif jika nonaktif (default: null/hidden)
 * @param {React.ReactNode} loadingFallback - Konten sementara saat pengecekan fitur (default: null)
 */
export default function FeatureGate({
  featureKey,
  children,
  fallback = null,
  loadingFallback = null,
}) {
  return (
    <Suspense fallback={loadingFallback}>
      <FeatureGateResolver
        featureKey={featureKey}
        fallback={fallback}
      >
        {children}
      </FeatureGateResolver>
    </Suspense>
  );
}