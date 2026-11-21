// src/app/(admin)/admin/page.js
"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/admin/useAuth";
import {
  FaUserCircle,
  FaCode,
  FaGraduationCap,
  FaBriefcase,
  FaProjectDiagram,
  FaAddressBook,
  FaSignOutAlt,
  FaArrowRight,
  FaEye,
  FaToggleOn,
  FaToggleOff,
  FaLayerGroup,
  FaBookOpen,
} from "react-icons/fa";
import { useProfile } from "@/hooks/admin/useProfile";

export default function AdminDashboard() {
  const { signOut, loading, error } = useAuth();
  const {
    profile,
    updating: updatingAvailability,
    error: profileError,
    successMessage,
    updateAvailability,
  } = useProfile();

  const menuItems = [
    {
      title: "Profile",
      desc: "Update foto, bio, role, dan social links utama.",
      href: "/admin/profile",
      icon: FaUserCircle,
    },
    {
      title: "Skills",
      desc: "Kelola daftar keahlian teknis dan skor kemahiran.",
      href: "/admin/skills",
      icon: FaCode,
    },
    {
      title: "Education",
      desc: "Tambah atau edit riwayat pendidikan formal.",
      href: "/admin/education",
      icon: FaGraduationCap,
    },
    {
      title: "Experiences",
      desc: "Kelola pengalaman PKL, magang, dan kegiatan.",
      href: "/admin/experiences",
      icon: FaBriefcase,
    },
    {
      title: "Projects",
      desc: "Showcase portofolio proyek, status, dan tech stack.",
      href: "/admin/projects",
      icon: FaProjectDiagram,
    },
    {
      title: "Contacts",
      desc: "Update email, nomor telepon, dan lokasi.",
      href: "/admin/contacts",
      icon: FaAddressBook,
    },

    {
      title: "Spectrum Song",
      desc: "Kelola lagu Spectrum Song yang ditampilkan di portofolio.",
      href: "/admin/spectrum",
      icon: FaCode,
    },

    {
      title: "Notes",
      desc: "Kelola catatan publik yang ditampilkan di portofolio.",
      href: "/admin/notes",
      icon: FaBookOpen,

    },
    {
      title: "Homepage Order",
      desc: "Atur urutan dan visibilitas item di halaman utama.",
      href: "/admin/homepage-order",
      icon: FaLayerGroup,
    },
  ];

  const handleLogout = async () => {
    const confirmed = window.confirm(
      "Yakin ingin logout? Session akan dihapus dari perangkat ini."
    );
    if (confirmed) await signOut();
  };

  const handleAvailabilityChange = async () => {
    await updateAvailability(!profile?.is_active);
  };

  return (
    <div className="min-h-screen bg-background px-5 md:px-8 lg:px-10 py-10 md:py-14">
      <div className="max-w-6xl mx-auto">

        {/* ============================================ */}
        {/* HEADER                                        */}
        {/* ============================================ */}
        <header className="mb-10">
          {/* Portfolio preview + Logout (top row) */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
            >
              <FaEye className="w-3.5 h-3.5" />
              Preview Portfolio
            </Link>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="group inline-flex items-center gap-2 px-3.5 py-2 border border-border/60 rounded-lg text-sm font-medium text-text-muted hover:border-accent/40 hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <FaSignOutAlt className="w-3.5 h-3.5" />
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>

          {/* Title row */}
          <div className="flex items-baseline gap-4 mb-3">
            <span className="text-xs font-mono text-accent tracking-widest">
              00
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-text-main tracking-tighter">
              Dashboard
            </h1>
          </div>
          <p className="text-sm md:text-base text-text-muted max-w-xl">
            Pusat kendali konten portofolio. Pilih modul untuk mulai mengelola.
          </p>

          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border/40 bg-surface/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
                Availability Status
              </p>
              <p className="mt-1 text-sm text-text-main">
                {profile?.is_active ? "Available for work" : "Not available for work"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAvailabilityChange}
              disabled={!profile || updatingAvailability}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/60 px-3.5 py-2 text-sm font-medium text-text-muted transition-all hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
              aria-pressed={Boolean(profile?.is_active)}
            >
              {profile?.is_active ? (
                <FaToggleOn className="h-5 w-5 text-accent" />
              ) : (
                <FaToggleOff className="h-5 w-5" />
              )}
              {updatingAvailability
                ? "Updating..."
                : profile?.is_active
                  ? "Set Offline"
                  : "Set Available"}
            </button>
          </div>

          {(profileError || successMessage) && (
            <p
              className={`mt-3 text-xs font-mono ${profileError ? "text-red-400" : "text-green-400"}`}
            >
              {profileError || successMessage}
            </p>
          )}

          {(error || profileError) && !profileError && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-mono">
              ⚠ {error}
            </div>
          )}
        </header>

        {/* Divider gradient */}
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mb-10" />

        {/* ============================================ */}
        {/* GRID MENU                                     */}
        {/* ============================================ */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const num = String(index + 1).padStart(2, "0");

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col p-6 bg-surface/40 border border-border/40 rounded-xl transition-all duration-300 hover:border-accent/40 hover:bg-surface/60 hover:-translate-y-0.5"
              >
                {/* Header: nomor + ikon */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-mono text-accent tracking-widest">
                    {num}
                  </span>
                  <Icon className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors duration-300" />
                </div>

                {/* Judul */}
                <h2 className="text-lg font-semibold text-text-main group-hover:text-accent transition-colors duration-300 mb-1.5">
                  {item.title}
                </h2>

                {/* Deskripsi */}
                <p className="text-sm text-text-muted/80 leading-relaxed line-clamp-2 mb-5">
                  {item.desc}
                </p>

                {/* Footer: label + arrow */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60">
                    Open Module
                  </span>
                  <FaArrowRight className="w-3 h-3 text-text-muted/40 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </Link>
            );
          })}
        </main>

        {/* ============================================ */}
        {/* FOOTER                                        */}
        {/* ============================================ */}
        <footer className="mt-14 pt-6 border-t border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted/50">
            Portfolio CMS · v1.0
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted/50">
            Built with Next.js & Supabase
          </p>
        </footer>
      </div>
    </div>
  );
}