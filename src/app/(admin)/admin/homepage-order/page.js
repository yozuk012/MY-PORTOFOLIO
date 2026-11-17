// src/app/(admin)/admin/homepage-order/page.js
"use client";

import { useHomeOrder } from "@/hooks/admin/useHomeOrder";
import Button from "../components/Button";
import BackButton from "../components/BackButton";
import {
  FaCode,
  FaBriefcase,
  FaProjectDiagram,
  FaArrowUp,
  FaArrowDown,
  FaSave,
  FaUndo,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCheck,
  FaExclamationTriangle,
  FaLightbulb,
} from "react-icons/fa";

function OrderableRow({
  table,
  item,
  index,
  isFirst,
  isLast,
  moveItem,
  updateOrder,
  toggleVisibility,
}) {
  return (
      <div
        className={`flex items-center gap-2.5 py-2.5 px-3 rounded-lg transition-colors ${
          item.show_on_home
            ? "bg-accent/[0.03] border border-accent/20"
            : "bg-surface/30 border border-border/40 opacity-60"
        }`}
      >
        {/* Nomor Urut */}
        <span className="text-[10px] font-mono text-text-muted/60 tracking-widest w-6 flex-shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Tombol Pindah Atas/Bawah */}
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => moveItem(table, item.id, "up")}
            disabled={isFirst}
            className="p-1 text-text-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Pindahkan ke atas"
          >
            <FaArrowUp className="w-2.5 h-2.5" />
          </button>
          <button
            type="button"
            onClick={() => moveItem(table, item.id, "down")}
            disabled={isLast}
            className="p-1 text-text-muted hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Pindahkan ke bawah"
          >
            <FaArrowDown className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Nama & Meta Item */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-main truncate">
            {item.name || item.title}
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60 truncate mt-0.5">
            {item.type
              ? `Type: ${item.type}`
              : item.status
              ? `Status: ${item.status}`
              : `Score: ${item.score}/10`}
          </p>
        </div>

        {/* Input Urutan */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <label className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60 hidden sm:block">
            Order
          </label>
          <input
            type="number"
            value={item.home_order}
            onChange={(e) => updateOrder(table, item.id, e.target.value)}
            className="w-16 px-2 py-1.5 bg-surface/40 border border-border/40 rounded text-xs font-mono text-text-main text-center focus:outline-none focus:border-accent transition-colors"
            min="0"
            title="Semakin kecil, semakin atas"
          />
        </div>

        {/* Toggle Visibility */}
        <button
          type="button"
          onClick={() => toggleVisibility(table, item.id)}
          className={`p-2 rounded-lg transition-all flex-shrink-0 ${
            item.show_on_home
              ? "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20"
              : "bg-surface border border-border/40 text-text-muted/40 hover:text-text-muted hover:border-border/60"
          }`}
          title={item.show_on_home ? "Sembunyikan dari home" : "Tampilkan di home"}
        >
          {item.show_on_home ? (
            <FaEye className="w-3.5 h-3.5" />
          ) : (
            <FaEyeSlash className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  table,
  items,
  moveItem,
  updateOrder,
  toggleVisibility,
}) {
  const visibleCount = items.filter((i) => i.show_on_home).length;

  return (
      <div className="bg-surface/30 border border-border/40 rounded-xl overflow-hidden">
        {/* Header Section */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-accent flex-shrink-0" />
            <div>
              <h2 className="text-base font-semibold text-text-main tracking-tight">
                {title}
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted/60 mt-0.5">
                {visibleCount} / {items.length} ditampilkan
              </p>
            </div>
          </div>
        </div>

        {/* List Items */}
        <div className="p-3 space-y-2">
          {items.length === 0 ? (
            <p className="text-xs font-mono text-text-muted/50 italic py-8 text-center">
              Belum ada data.
            </p>
          ) : (
            items.map((item, index) => (
              <OrderableRow
                key={item.id}
                table={table}
                item={item}
                index={index}
                isFirst={index === 0}
                isLast={index === items.length - 1}
                moveItem={moveItem}
                updateOrder={updateOrder}
                toggleVisibility={toggleVisibility}
              />
            ))
          )}
        </div>
      </div>
  );
}

export default function HomepageOrderPage() {
  const {
    data,
    loading,
    saving,
    error,
    successMessage,
    pendingChangesCount,
    toggleVisibility,
    updateOrder,
    moveItem,
    saveChanges,
    resetChanges,
    clearMessages,
  } = useHomeOrder();

  // ============================================
  // RENDER: LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="w-6 h-6 animate-spin text-accent" />
          <p className="text-xs font-mono uppercase tracking-widest text-text-muted">
            Memuat pengaturan...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: MAIN UI
  // ============================================
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ===== Header ===== */}
      <div>
        <BackButton />
        <div className="mb-6">
          <div className="flex items-baseline gap-4 mb-3">
            <span className="text-xs font-mono text-accent tracking-widest">
              07
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
              Homepage Order
            </h1>
          </div>
          <p className="text-sm md:text-base text-text-muted max-w-2xl">
            Atur urutan dan visibilitas item yang tampil di halaman utama portofolio.
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
          <button
            onClick={clearMessages}
            className="text-green-400/60 hover:text-green-400 transition-colors"
          >
            ✕
          </button>
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
          <button
            onClick={clearMessages}
            className="text-red-400/60 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===== Info Box ===== */}
      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-start gap-2.5 mb-2">
          <FaLightbulb className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-xs font-mono uppercase tracking-widest text-accent font-medium">
            Cara Penggunaan
          </p>
        </div>
        <ul className="space-y-1.5 text-[11px] font-mono text-text-muted/80 ml-6">
          <li>
            Klik ikon{" "}
            <FaEye className="inline w-3 h-3 text-accent mx-0.5" /> untuk
            menampilkan / menyembunyikan item di halaman utama.
          </li>
          <li>
            Gunakan tombol panah{" "}
            <FaArrowUp className="inline w-2.5 h-2.5 mx-0.5" />{" "}
            <FaArrowDown className="inline w-2.5 h-2.5 mx-0.5" /> atau ubah
            angka urutan untuk mengatur posisi.
          </li>
          <li>
            Semakin kecil angka urutan, semakin atas posisinya. Perubahan baru
            tersimpan saat klik{" "}
            <strong className="text-text-main">Save Changes</strong>.
          </li>
        </ul>
      </div>

      {/* ===== 3 Section Cards ===== */}
      <div className="space-y-5">
        <SectionCard
          title="Skills"
          icon={FaCode}
          table="skills"
          items={data.skills}
          moveItem={moveItem}
          updateOrder={updateOrder}
          toggleVisibility={toggleVisibility}
        />

        <SectionCard
          title="Experiences"
          icon={FaBriefcase}
          table="experiences"
          items={data.experiences}
          moveItem={moveItem}
          updateOrder={updateOrder}
          toggleVisibility={toggleVisibility}
        />

        <SectionCard
          title="Projects"
          icon={FaProjectDiagram}
          table="projects"
          items={data.projects}
          moveItem={moveItem}
          updateOrder={updateOrder}
          toggleVisibility={toggleVisibility}
        />
      </div>

      {/* ===== Footer Actions (Sticky) ===== */}
      <div className="sticky bottom-6 bg-background/90 backdrop-blur-lg border border-border/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={FaUndo}
            onClick={resetChanges}
            disabled={pendingChangesCount === 0 || saving}
          >
            Reset
          </Button>
          {pendingChangesCount > 0 && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
              <span className="text-accent font-semibold">
                {pendingChangesCount}
              </span>{" "}
              perubahan belum disimpan
            </span>
          )}
        </div>

        <Button
          variant="primary"
          leftIcon={FaSave}
          onClick={saveChanges}
          disabled={pendingChangesCount === 0 || saving}
          isLoading={saving}
        >
          {saving ? "Menyimpan..." : `Save Changes (${pendingChangesCount})`}
        </Button>
      </div>
    </div>
  );
}