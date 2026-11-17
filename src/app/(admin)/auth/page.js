// src/app/(admin)/auth/page.js
"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/admin/useAuth";
import { FaArrowLeft, FaLock, FaEnvelope } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="w-full">

      {/* ===== Back link ===== */}
      <a
        href="/"
        className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors mb-10"
      >
        <FaArrowLeft className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to Home
      </a>

      {/* ===== Header ===== */}
      <div className="mb-8">
        <div className="flex items-baseline gap-4 mb-3">
          <span className="text-xs font-mono text-accent tracking-widest">
            01
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
            Admin Login
          </h1>
        </div>
        <p className="text-sm text-text-muted">
          Masuk untuk mengelola portofolio.
        </p>
      </div>

      {/* ===== Divider gradient ===== */}
      <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mb-8" />

      {/* ===== Form ===== */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2"
          >
            <FaEnvelope className="w-2.5 h-2.5 text-accent" />
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-0 py-2 bg-transparent border-0 border-b border-border/60 text-text-main placeholder-text-muted/40 font-mono text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2"
          >
            <FaLock className="w-2.5 h-2.5 text-accent" />
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-0 py-2 bg-transparent border-0 border-b border-border/60 text-text-main placeholder-text-muted/40 font-mono text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-accent text-accent text-sm font-medium font-mono uppercase tracking-widest rounded-lg hover:bg-accent hover:text-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-3.5 w-3.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Memproses
            </>
          ) : (
            <>
              <FaLock className="w-3 h-3" />
              Masuk
            </>
          )}
        </button>
      </form>

      {/* ===== Footer divider ===== */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent mt-10 mb-4" />
      <p className="text-center text-[10px] font-mono uppercase tracking-widest text-text-muted/50">
        Restricted Access
      </p>
    </div>
  );
}