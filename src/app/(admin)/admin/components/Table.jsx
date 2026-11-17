// src/app/(admin)/admin/components/Table.jsx
"use client";

import React from "react";
import { FaEdit, FaTrash, FaEye, FaInbox } from "react-icons/fa";

// ============================================
// 1. TABLE WRAPPER
// ============================================
export function Table({ children, className = "" }) {
  return (
    <div
      className={`w-full overflow-x-auto rounded-lg border border-border/40 ${className}`}
    >
      <table className="w-full text-left">{children}</table>
    </div>
  );
}

// ============================================
// 2. TABLE HEADER
// ============================================
export function TableHeader({ columns }) {
  return (
    <thead className="bg-surface/30 border-b border-border/40">
      <tr>
        {columns.map((col, index) => (
          <th
            key={index}
            className={`px-6 py-3.5 text-[10px] font-mono font-medium uppercase tracking-widest text-text-muted ${
              col.className || ""
            }`}
            style={{ width: col.width || "auto" }}
          >
            {col.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

// ============================================
// 3. TABLE BODY
// ============================================
export function TableBody({ children }) {
  return (
    <tbody className="divide-y divide-border/30">{children}</tbody>
  );
}

// ============================================
// 4. TABLE ROW
// ============================================
export function TableRow({ children, className = "" }) {
  return (
    <tr
      className={`hover:bg-surface/30 transition-colors duration-200 ${className}`}
    >
      {children}
    </tr>
  );
}

// ============================================
// 5. TABLE CELL
// ============================================
export function TableCell({ children, className = "" }) {
  return (
    <td className={`px-6 py-4 text-sm text-text-main ${className}`}>
      {children}
    </td>
  );
}

// ============================================
// 6. TABLE ACTIONS
// ============================================
export function TableActions({ onEdit, onDelete, onView, isLoading = false }) {
  return (
    <div className="flex items-center gap-1.5">
      {onView && (
        <button
          type="button"
          onClick={onView}
          disabled={isLoading}
          className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Lihat detail"
          title="Lihat Detail"
        >
          <FaEye className="w-3.5 h-3.5" />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={isLoading}
          className="p-2 text-text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Edit"
          title="Edit"
        >
          <FaEdit className="w-3.5 h-3.5" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={isLoading}
          className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Hapus"
          title="Hapus"
        >
          <FaTrash className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ============================================
// 7. EMPTY STATE
// ============================================
export function EmptyState({ message = "Belum ada data", icon: Icon = FaInbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="p-4 rounded-2xl bg-surface/40 border border-border/40 mb-4">
        <Icon className="w-10 h-10 text-text-muted/40" />
      </div>
      <p className="text-sm font-medium text-text-main mb-1.5">{message}</p>
      <p className="text-[11px] font-mono uppercase tracking-widest text-text-muted/50">
        Data yang ditambahkan akan muncul di sini
      </p>
    </div>
  );
}

// ============================================
// 8. LOADING STATE
// ============================================
export function LoadingState({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {/* Header skeleton */}
      <div className="flex gap-4 pb-3 border-b border-border/30">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3 bg-surface rounded flex-1"></div>
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-8 bg-surface rounded flex-1"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// 9. BADGE
// ============================================
export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-surface text-text-muted border border-border/40",
    success: "bg-green-500/10 text-green-400 border border-green-500/30",
    warning: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    danger: "bg-red-500/10 text-red-400 border border-red-500/30",
    info: "bg-accent/10 text-accent border border-accent/30",
    purple: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// ============================================
// 10. IMAGE PREVIEW
// ============================================
export function ImagePreview({ src, alt = "Preview", size = "sm" }) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  if (!src) {
    return (
      <div
        className={`${sizes[size]} bg-surface border border-border/40 rounded-lg flex items-center justify-center`}
      >
        <span className="text-[8px] font-mono uppercase tracking-widest text-text-muted/40">
          No Image
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizes[size]} object-cover rounded-lg border border-border/40`}
    />
  );
}

// ============================================
// 11. TAGS LIST
// ============================================
export function TagsList({ tags = [], maxVisible = 3 }) {
  if (!tags || tags.length === 0) {
    return (
      <span className="text-text-muted/40 text-[10px] font-mono italic">
        Tidak ada tags
      </span>
    );
  }

  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-0.5 bg-surface border border-border/40 rounded text-[10px] font-mono text-text-muted"
        >
          {tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 bg-surface border border-border/40 rounded text-[10px] font-mono text-text-muted/60">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

// ============================================
// 12. TABLE PAGINATION
// ============================================
export function TablePagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = "",
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex items-center justify-between px-6 py-4 bg-surface/30 border-t border-border/40 ${className}`}
    >
      <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">
        Halaman{" "}
        <span className="text-text-main">{currentPage}</span> dari{" "}
        <span className="text-text-main">{totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 border border-border/60 text-text-muted text-xs font-mono uppercase tracking-widest rounded-lg hover:border-accent/40 hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Sebelumnya
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 border border-border/60 text-text-muted text-xs font-mono uppercase tracking-widest rounded-lg hover:border-accent/40 hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}