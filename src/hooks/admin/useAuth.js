// src/hooks/admin/useAuth.js
"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Memoize supabase client agar tidak dibuat ulang tiap render
  const supabase = useMemo(() => createClient(), []);

  // ============================================
  // SIGN IN
  // ============================================
  const signIn = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push("/admin");
        router.refresh();
      } catch (err) {
        setError(err.message || "Terjadi kesalahan saat login");
      } finally {
        setLoading(false);
      }
    },
    [supabase, router]
  );

  // ============================================
  // SIGN OUT — hapus session dari perangkat
  // ============================================
  const signOut = useCallback(
    async ({ scope = "global", redirectTo = "/auth" } = {}) => {
      setLoading(true);
      setError(null);

      try {
        // 1. Revoke token & hapus session dari device lewat Supabase
        //    - scope "global"  → revoke semua refresh token (semua device) — default & aman
        //    - scope "local"   → hanya device ini
        //    - scope "others"  → semua device lain, kecuali yang sekarang
        const { error: signOutError } = await supabase.auth.signOut({ scope });
        if (signOutError) throw signOutError;

        // 2. Cleanup manual: hapus semua key Supabase di localStorage & sessionStorage
        //    (jaga-jaga jika ada sisa token / cache sesi)
        if (typeof window !== "undefined") {
          const isSupabaseKey = (key) =>
            key.startsWith("sb-") ||
            key.includes("supabase") ||
            key.startsWith("supabase.auth");

          Object.keys(localStorage).forEach((key) => {
            if (isSupabaseKey(key)) localStorage.removeItem(key);
          });

          Object.keys(sessionStorage).forEach((key) => {
            if (isSupabaseKey(key)) sessionStorage.removeItem(key);
          });
        }

        // 3. Redirect ke halaman login & refresh agar middleware membaca state kosong
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        console.error("Error saat logout:", err);
        setError(err.message || "Gagal logout");
      } finally {
        setLoading(false);
      }
    },
    [supabase, router]
  );

  return { signIn, signOut, loading, error };
}