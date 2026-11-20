// src/app/(public)/contacts/page.js
import { Suspense } from "react";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/server";
import {
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaWhatsapp,
  FaMapMarkerAlt,
} from "react-icons/fa";

// Import dictionary lokal
import idDict from "@/lib/dictionaries/id.json";
import enDict from "@/lib/dictionaries/en.json";

// Helper dictionary
const getDict = (lang) => (lang === "en" ? enDict : idDict);

export const metadata = {
  title: "Contacts | Achmad Aldino",
  description:
    "Hubungi saya untuk kolaborasi, pertanyaan, atau sekadar menyapa.",
};

// ============================================================
// STATIC SHELL
// ============================================================
export default function ContactsPage() {
  return (
    <main className="min-h-screen px-5 md:px-0 max-w-4xl mx-auto py-20 md:py-28">
      {/* HEADER — perlu cookies, dibungkus Suspense */}
      <Suspense fallback={<HeaderSkeleton />}>
        <PageHeader />
      </Suspense>

      {/* CONTENT — fetch data, dibungkus Suspense */}
      <Suspense fallback={<ContactsSkeleton />}>
        <ContactsContent />
      </Suspense>
    </main>
  );
}

// ============================================================
// HEADER (dynamic — baca cookies + dictionary)
// ============================================================
async function PageHeader() {
  // 🔑 Wajib: render per-request
  await connection();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";
  const t = (path) =>
    path.split(".").reduce((o, i) => o?.[i], getDict(lang)) || path;
  return (
    <div className="mb-16">
      <a
        href="/"
        className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors mb-8"
      >
        <FaArrowLeft className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" />
        {t("contacts.backToHome")}
      </a>

      <div className="flex items-baseline gap-4 mb-3">
        <span className="text-xs font-mono text-accent tracking-widest">
          06
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-text-main tracking-tighter">
          {t("contacts.title")}
        </h1>
      </div>
      <p className="text-base md:text-lg text-text-muted max-w-2xl">
        {t("contacts.desc")}
      </p>
    </div>
  );
}

// ============================================================
// SKELETON FALLBACKS
// ============================================================
function HeaderSkeleton() {
  return (
    <div className="mb-16 animate-pulse">
      <div className="h-4 w-32 rounded bg-surface mb-8" />
      <div className="flex items-baseline gap-4 mb-3">
        <div className="h-3 w-8 rounded bg-surface" />
        <div className="h-12 md:h-16 w-40 md:w-56 rounded bg-surface" />
      </div>
      <div className="h-4 w-full max-w-2xl rounded bg-surface" />
    </div>
  );
}

function ContactsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-6 md:p-8 bg-surface/30 border border-border/40 rounded-xl flex flex-col gap-4"
          >
            <div className="w-12 h-12 bg-surface rounded-lg" />
            <div className="space-y-2 mt-2">
              <div className="h-3 w-16 bg-surface rounded" />
              <div className="h-5 w-3/4 bg-surface rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-20 pt-8 border-t border-border/60 flex justify-between items-center">
        <div className="h-3 w-24 bg-surface rounded animate-pulse" />
        <div className="h-3 w-28 bg-surface rounded animate-pulse" />
      </div>
    </>
  );
}

// ============================================================
// DYNAMIC CONTENT — Fetch data + render kartu
// ============================================================
async function ContactsContent() {
  // 🔑 Wajib: render per-request
  await connection();

  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "id";
  const t = (path) =>
    path.split(".").reduce((o, i) => o?.[i], getDict(lang)) || path;

  const supabase = await createClient();

  // ✅ Handle error PGRST116 (row belum ada)
  let contact = null;
  const { data, error } = await supabase
    .from("contacts")
    .select("email, phone, whatsapp, address, location")
    .limit(1)
    .single();

  if (!error || error.code === "PGRST116") {
    contact = data;
  } else {
    console.error("Error fetching contacts:", error);
  }

  // Helper: format nomor WA (08xxx → 628xxx)
  const formatWhatsApp = (num) => {
    if (!num) return "";
    const cleaned = num.replace(/[^0-9]/g, "");
    return cleaned.startsWith("0") ? `62${cleaned.slice(1)}` : cleaned;
  };

  const formatEmailUrl = (email) => {
    const normalizedEmail = email.trim().replace(/^mailto:/i, "");
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      normalizedEmail
    )}`;
  };

  return (
    <>
      {/* ===== GRID KARTU KONTAK ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Email */}
        {contact?.email && (
          <a
            href={formatEmailUrl(contact.email)}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 md:p-8 bg-surface/30 border border-border/40 rounded-xl hover:border-accent/40 hover:bg-surface/50 transition-all duration-300 flex flex-col gap-4"
          >
            <div className="p-3 bg-surface border border-border/40 group-hover:bg-accent/10 group-hover:border-accent/30 rounded-lg w-fit transition-colors">
              <FaEnvelope className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1.5">
                {t("contacts.email")}
              </h3>
              <p className="text-lg md:text-xl font-medium text-text-main group-hover:text-accent transition-colors break-all">
                {contact.email}
              </p>
            </div>
          </a>
        )}

        {/* 2. WhatsApp */}
        {contact?.whatsapp && (
          <a
            href={`https://wa.me/${formatWhatsApp(contact.whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 md:p-8 bg-surface/30 border border-border/40 rounded-xl hover:border-accent/40 hover:bg-surface/50 transition-all duration-300 flex flex-col gap-4"
          >
            <div className="p-3 bg-surface border border-border/40 group-hover:bg-accent/10 group-hover:border-accent/30 rounded-lg w-fit transition-colors">
              <FaWhatsapp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1.5">
                {t("contacts.whatsapp")}
              </h3>
              <p className="text-lg md:text-xl font-medium text-text-main group-hover:text-accent transition-colors">
                {contact.whatsapp}
              </p>
            </div>
          </a>
        )}

        {/* 3. Telepon */}
        {contact?.phone && (
          <a
            href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`}
            className="group p-6 md:p-8 bg-surface/30 border border-border/40 rounded-xl hover:border-accent/40 hover:bg-surface/50 transition-all duration-300 flex flex-col gap-4"
          >
            <div className="p-3 bg-surface border border-border/40 group-hover:bg-accent/10 group-hover:border-accent/30 rounded-lg w-fit transition-colors">
              <FaPhone className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1.5">
                {t("contacts.phone")}
              </h3>
              <p className="text-lg md:text-xl font-medium text-text-main group-hover:text-accent transition-colors">
                {contact.phone}
              </p>
            </div>
          </a>
        )}

        {/* 4. Lokasi & Alamat */}
        <div className="group p-6 md:p-8 bg-surface/30 border border-border/40 rounded-xl hover:border-accent/40 transition-all duration-300 flex flex-col gap-4">
          <div className="p-3 bg-surface border border-border/40 group-hover:bg-accent/10 group-hover:border-accent/30 rounded-lg w-fit transition-colors">
            <FaMapMarkerAlt className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-text-muted mb-1.5">
              {t("contacts.location")}
            </h3>
            <p className="text-lg md:text-xl font-medium text-text-main mb-2">
              {contact?.location || t("contacts.defaultLocation")}
            </p>
            {contact?.address && (
              <p className="text-sm text-text-muted/80 leading-relaxed whitespace-pre-line">
                {contact.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ===== FOOTER NAVIGASI ===== */}
      <div className="mt-20 pt-8 border-t border-border/60 flex justify-between items-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60">
          {t("contacts.letsConnect")}
        </span>
        <a
          href="/"
          className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
        >
          {t("contacts.backToHome")}
          <FaArrowLeft className="w-3 h-3 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      </div>
    </>
  );
}