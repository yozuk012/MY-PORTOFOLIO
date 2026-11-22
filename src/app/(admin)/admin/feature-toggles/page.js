// src/app/(admin)/admin/feature-toggles/page.js
"use client";

import { useFeatureToggles } from "@/hooks/admin/useFeatureToggles";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import { 
  FaSpinner, 
  FaCheck, 
  FaExclamationTriangle, 
  FaToggleOn, 
  FaToggleOff,
  FaHome,
  FaFileAlt,
  FaTools 
} from "react-icons/fa";

// Helper: Format feature_key jadi Title Case (contoh: section_profile -> Section Profile)
const formatFeatureKey = (key) => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function FeatureTogglesPage() {
  const { 
    toggles, 
    loading, 
    saving, 
    error, 
    successMessage, 
    toggleFeature 
  } = useFeatureToggles();

  // Grouping data untuk UI yang lebih rapi
  const globalToggles = toggles.filter((t) => t.feature_key.startsWith("global_"));
  const sections = toggles.filter((t) => t.feature_key.startsWith("section_"));
  const pages = toggles.filter((t) => t.feature_key.startsWith("page_"));

  // ============================================
  // COMPONENT: Toggle List Group
  // ============================================
  const ToggleGroup = ({ title, icon: Icon, items, isWarning = false }) => (
    <div className={`bg-surface/30 border rounded-xl overflow-hidden ${isWarning ? "border-yellow-500/30" : "border-border/40"}`}>
      {/* Header Group */}
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${isWarning ? "border-yellow-500/30 bg-yellow-500/5" : "border-border/40 bg-surface/20"}`}>
        <Icon className={`w-4 h-4 flex-shrink-0 ${isWarning ? "text-yellow-400" : "text-accent"}`} />
        <div>
          <h2 className={`text-base font-semibold tracking-tight ${isWarning ? "text-yellow-400" : "text-text-main"}`}>
            {title}
          </h2>
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60 mt-0.5">
            {items.length} fitur terdaftar
          </p>
        </div>
      </div>

      {/* List Items */}
      <div className="divide-y divide-border/40">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs font-mono text-text-muted/50 italic">
              Tidak ada fitur dalam kategori ini.
            </p>
          </div>
        ) : (
          items.map((item) => {
            // Khusus global_maintenance, gunakan variant danger saat aktif agar lebih mencolok
            const isGlobalMaintenance = item.feature_key === "global_maintenance";
            const btnVariant = (isGlobalMaintenance && item.is_enabled) ? "danger" : (item.is_enabled ? "primary" : "secondary");
            const btnClass = (isGlobalMaintenance && item.is_enabled) 
              ? "!border-red-500/40 !text-red-400 hover:!bg-red-500/10" 
              : (item.is_enabled ? "!border-green-500/40 !text-green-400 hover:!bg-green-500/10" : "");

            return (
              <div 
                key={item.feature_key} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-surface/40 transition-colors"
              >
                {/* Info Fitur */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-main tracking-tight">
                    {formatFeatureKey(item.feature_key)}
                  </p>
                  <p className="text-[11px] font-mono text-text-muted/70 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Status & Tombol Toggle */}
                <div className="flex items-center gap-3 flex-shrink-0 sm:pl-4">
                  <span 
                    className={`hidden sm:inline-flex text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border ${
                      item.is_enabled 
                        ? (isGlobalMaintenance ? "text-red-400 bg-red-500/10 border-red-500/30" : "text-green-400 bg-green-500/10 border-green-500/30")
                        : "text-text-muted bg-surface border-border/40"
                    }`}
                  >
                    {item.is_enabled ? "Aktif" : "Nonaktif"}
                  </span>
                  
                  <Button
                    variant={btnVariant}
                    size="sm"
                    leftIcon={item.is_enabled ? FaToggleOn : FaToggleOff}
                    onClick={() => toggleFeature(item.feature_key, item.is_enabled)}
                    disabled={saving}
                    className={btnClass}
                  >
                    {item.is_enabled ? "Matikan" : "Aktifkan"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // ============================================
  // RENDER: LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="w-6 h-6 animate-spin text-accent" />
          <p className="text-xs font-mono uppercase tracking-widest text-text-muted">
            Memuat konfigurasi fitur...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN UI
  // ============================================
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* ===== Header ===== */}
      <div>
        <BackButton />
        <div className="mb-6 mt-4">
          <div className="flex items-baseline gap-4 mb-3">
            <span className="text-xs font-mono text-accent tracking-widest">
              08
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
              Feature Toggles
            </h1>
          </div>
          <p className="text-sm md:text-base text-text-muted max-w-2xl">
            Aktifkan atau nonaktifkan section homepage, halaman publik, atau mode maintenance secara real-time tanpa perlu deploy ulang.
          </p>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent" />
      </div>

      {/* ===== Alert Messages ===== */}
      {successMessage && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2.5">
          <FaCheck className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-mono text-green-400 flex-1">
            {successMessage}
          </p>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2.5">
          <FaExclamationTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-mono text-red-400 font-medium">
              Terjadi kesalahan
            </p>
            <p className="text-[11px] font-mono text-red-400/70 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* ===== Info Box ===== */}
      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-start gap-2.5 mb-2">
          <FaCheck className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-xs font-mono uppercase tracking-widest text-accent font-medium">
            Cara Kerja
          </p>
        </div>
        <ul className="space-y-1.5 text-[11px] font-mono text-text-muted/80 ml-6">
          <li>
            Klik tombol <strong className="text-text-main">Matikan/Aktifkan</strong> untuk mengubah status fitur.
          </li>
          <li>
            Perubahan akan langsung berdampak di halaman publik (tanpa cache delay).
          </li>
          <li>
            Gunakan <strong className="text-text-main">System & Global</strong> (Maintenance Mode) jika database produksi kosong atau sedang ada perbaikan kritis.
          </li>
        </ul>
      </div>

      {/* ===== Toggle Groups ===== */}
      <div className="space-y-6">
        {globalToggles.length > 0 && (
          <ToggleGroup 
            title="System & Global" 
            icon={FaTools} 
            items={globalToggles}
            isWarning={globalToggles.some(t => t.is_enabled)} // Highlight jika ada yang aktif (misal: maintenance)
          />
        )}
        
        <ToggleGroup 
          title="Homepage Sections" 
          icon={FaHome} 
          items={sections} 
        />
        
        <ToggleGroup 
          title="Public Pages" 
          icon={FaFileAlt} 
          items={pages} 
        />
      </div>

    </div>
  );
}