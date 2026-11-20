// src/app/(public)/home/components/Section1Profile.jsx
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/server";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaYoutube,
  FaDribbble,
  FaBehance,
  FaGlobe,
  FaEnvelope,
  FaLink,
  FaMapMarkerAlt,
  FaUser,
  FaArrowRight,
  FaDownload, // 🆕 BARU: Ikon untuk Download CV
} from "react-icons/fa";

// Import dictionary lokal
import idDict from "@/lib/dictionaries/id.json";
import enDict from "@/lib/dictionaries/en.json";

// Helper dictionary
const getDict = (lang) => (lang === "en" ? enDict : idDict);

// Fallback bilingual: jika EN kosong, pakai ID
const getBilingual = (lang, idVal, enVal) =>
  lang === "en" ? enVal || idVal : idVal;

export default async function Section1Profile() {
  // 🔑 Wajib: pastikan render per-request (hindari error Date.now() saat prerender)
  await connection();

  // 1. Baca preferensi bahasa dari cookie (default 'id')
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";

  // Helper translate untuk teks statis
  const t = (path) =>
    path.split(".").reduce((o, i) => o?.[i], getDict(lang)) || path;

  const supabase = await createClient();

  // 2. Fetch data termasuk kolom cv_url 🆕 BARU
  let profile = null;
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select(
      "full_name, full_name_en, bio, bio_en, role, role_en, top_skills, social_links, is_active, photo_url, cv_url"
    )
    .limit(1)
    .single();
    
  if (!profileError || profileError.code === "PGRST116") profile = profileData;

  const { data: topScoredSkills } = await supabase
    .from("skills")
    .select("name, name_en, score")
    .order("score", { ascending: false })
    .limit(3);

  const featuredSkills =
    profile?.top_skills?.length > 0
      ? profile.top_skills.slice(0, 3)
      : (topScoredSkills || []).map((s) =>
          getBilingual(lang, s.name, s.name_en)
        );

  // ============================================
  // ICON MAP
  // ============================================
  const getIcon = (platform) => {
    const key = platform?.toLowerCase();
    const icons = {
      github: <FaGithub className="w-3.5 h-3.5" />,
      linkedin: <FaLinkedin className="w-3.5 h-3.5" />,
      instagram: <FaInstagram className="w-3.5 h-3.5" />,
      twitter: <FaTwitter className="w-3.5 h-3.5" />,
      facebook: <FaFacebook className="w-3.5 h-3.5" />,
      youtube: <FaYoutube className="w-3.5 h-3.5" />,
      dribbble: <FaDribbble className="w-3.5 h-3.5" />,
      behance: <FaBehance className="w-3.5 h-3.5" />,
      website: <FaGlobe className="w-3.5 h-3.5" />,
      email: <FaEnvelope className="w-3.5 h-3.5" />,
      other: <FaLink className="w-3.5 h-3.5" />,
    };
    return icons[key] || <FaLink className="w-3.5 h-3.5" />;
  };

  // ============================================
  // LABEL MAP (Dinamis berdasarkan bahasa)
  // ============================================
  const getLabel = (platform) => {
    const key = platform?.toLowerCase();
    const labels = {
      github: "GitHub",
      linkedin: "LinkedIn",
      instagram: "Instagram",
      twitter: "Twitter/X",
      facebook: "Facebook",
      youtube: "YouTube",
      dribbble: "Dribbble",
      behance: "Behance",
      website: "Website",
      email: "Email",
      other: lang === "en" ? "Other" : "Lainnya",
    };
    return labels[key] || platform || "Link";
  };

  // ============================================
  // FORMAT URL (hindari relative path)
  // ============================================
  const formatUrl = (platform, url) => {
    const normalizedUrl = url?.trim();
    if (!normalizedUrl) return "#";
    const key = platform?.trim().toLowerCase();

    if (key === "email") {
      const email = normalizedUrl.replace(/^mailto:/i, "");
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        email
      )}`;
    }

    return /^https?:\/\//i.test(normalizedUrl)
      ? normalizedUrl
      : `https://${normalizedUrl}`;
  };

  // ============================================
  // RESOLVE DATA BILINGUAL
  // ============================================
  const displayName = getBilingual(
    lang,
    profile?.full_name,
    profile?.full_name_en
  );
  const displayRole = getBilingual(lang, profile?.role, profile?.role_en);
  const displayBio = getBilingual(lang, profile?.bio, profile?.bio_en);

  return (
    <section
      id="profile"
      className="px-5 md:px-0 max-w-4xl mx-auto pt-28 pb-16 md:pb-20"
    >
      {/* ===== Baris atas: status kecil ===== */}
      <div className="flex items-center gap-2 mb-6">
        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
          {profile?.is_active ? t("badge.availableForWork") : "Offline"}
        </span>
      </div>

      {/* ===== Baris: FOTO (kiri) + NAMA & ROLE (kanan) ===== */}
      <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10 mb-8">
        <div className="flex-shrink-0 self-center md:self-end">
          {profile?.photo_url ? (
            <img
              src={profile.photo_url}
              alt={displayName || "Profile"}
              className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover grayscale hover:grayscale-0 transition duration-500"
            />
          ) : (
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-surface flex items-center justify-center text-text-muted">
              <FaUser className="w-12 h-12 opacity-40" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-text-main tracking-tighter leading-[0.95]">
            {displayName || "Achmad Aldino"}
          </h1>
          <p className="mt-3 text-lg md:text-2xl font-mono text-accent">
            {displayRole || "Web Developer"}
          </p>
        </div>
      </div>

      {/* ===== Garis tipis pemisah ===== */}
      <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent mb-8" />

      {/* ===== Grid bawah: META (kiri) + BIO & CTA (kanan) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
        {/* Kolom kiri: Meta */}
        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1.5">
              {t("labels.location")}
            </p>
            <p className="inline-flex items-center gap-2 text-sm text-text-main font-mono">
              <FaMapMarkerAlt className="w-3.5 h-3.5 text-accent" />
              Banyuwangi, Indonesia
            </p>
          </div>

          {featuredSkills.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
                {t("labels.topSkills")}
              </p>
              <ul className="space-y-1">
                {featuredSkills.map((skill, i) => (
                  <li
                    key={i}
                    className="text-sm text-text-main font-mono flex items-center gap-2"
                  >
                    <span className="text-accent">▸</span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-3">
            {t("labels.connect")}
          </p>

          <ul className="space-y-2">
            {/* 1. Social Links */}
            {profile?.social_links?.map((link, i) => (
              <li key={i}>
                <a
                  href={formatUrl(link.platform, link.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
                >
                  {getIcon(link.platform)}
                  <span>{getLabel(link.platform)}</span>
                </a>
              </li>
            ))}

            {/* 2. Download CV (muncul hanya jika cv_url ada) */}
            {profile?.cv_url && (
              <li>
                <a
                  href={profile.cv_url}
                  download
                  className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors group"
                >
                  <FaDownload className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-200" />
                  <span className="group-hover:underline decoration-accent/50 underline-offset-4">
                    {lang === "en" ? "Download CV" : "Unduh CV"}
                  </span>
                </a>
              </li>
            )}

            {/* Fallback jika belum ada social link maupun CV */}
            {!profile?.social_links?.length && !profile?.cv_url && (
              <li>
                <a
                  href="mailto:achmad@example.com"
                  className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-accent transition-colors"
                >
                  <FaEnvelope className="w-3.5 h-3.5" /> Email
                </a>
              </li>
            )}
          </ul>
        </div>
        </div>

        {/* Kolom kanan: Bio & CTA Link */}
        <div className="md:col-span-2">
          <p className="text-base md:text-lg text-text-muted leading-relaxed text-balance max-w-2xl">
            {displayBio ||
              (lang === "en"
                ? "Web Developer focused on building modern, responsive, and accessible websites."
                : "Web Developer yang fokus pada website modern, responsif, dan aksesibel.")}
          </p>

          <a
            href="/contacts"
            className="group mt-8 inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-accent transition-opacity hover:opacity-80"
          >
            <span className="h-px w-8 bg-accent/50 transition-all duration-300 group-hover:w-12 group-hover:bg-accent" />
            {t("hero.getInTouch")}
            <FaArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}