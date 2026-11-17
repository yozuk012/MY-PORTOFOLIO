// src/app/(admin)/admin/components/Form.jsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  FaTimes,
  FaPlus,
  FaUpload,
  FaImage,
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
} from "react-icons/fa";

// ============================================
// 1. FORM WRAPPER
// ============================================
export function Form({ children, onSubmit, className = "", isLoading = false }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
}

// ============================================
// 2. FORM FIELD
// ============================================
export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  error,
  options = [],
  rows = 4,
  helpText,
  dirty = false,
  className = "",
}) {
  const baseInputStyles =
    "w-full px-4 py-2.5 bg-surface/40 border rounded-lg text-text-main placeholder-text-muted/40 text-sm font-mono focus:outline-none focus:border-accent focus:bg-surface/60 transition-colors";
  const borderStyles = error ? "border-red-500/50" : "border-border/40";

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className={`${baseInputStyles} ${borderStyles} resize-none font-sans`}
          />
        );
      case "select":
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`${baseInputStyles} ${borderStyles} cursor-pointer`}
          >
            <option value="">-- Pilih {label} --</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      case "number":
      case "email":
      case "url":
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`${baseInputStyles} ${borderStyles}`}
          />
        );
      case "toggle":
        return (
          <label className="inline-flex items-center cursor-pointer">
            <div className="relative">
              <input
                id={name}
                name={name}
                type="checkbox"
                checked={value}
                onChange={onChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface border border-border/60 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-text-muted peer-checked:after:bg-background after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-accent transition-colors duration-300"></div>
            </div>
            <span className="ml-3 text-xs font-mono uppercase tracking-widest text-text-muted">
              {value ? "Aktif" : "Tidak Aktif"}
            </span>
          </label>
        );
      default:
        return (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`${baseInputStyles} ${borderStyles}`}
          />
        );
    }
  };

  return (
    <div className={className}>
      {type !== "toggle" && (
        <label
          htmlFor={name}
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2"
        >
          <span>
            {label}
            {required && <span className="text-accent ml-0.5">*</span>}
          </span>
          {dirty && (
            <span className="text-[9px] font-mono uppercase tracking-widest text-accent bg-accent/10 border border-accent/30 px-1.5 py-0.5 rounded">
              Modified
            </span>
          )}
        </label>
      )}
      {renderInput()}
      {helpText && !error && (
        <p className="mt-1.5 text-[11px] font-mono text-text-muted/60">{helpText}</p>
      )}
      {error && <p className="mt-1.5 text-[11px] font-mono text-red-400">⚠ {error}</p>}
    </div>
  );
}

// ============================================
// 3. DYNAMIC ARRAY INPUT
// ============================================
export function DynamicArrayInput({
  label,
  name,
  value = [],
  onChange,
  placeholder = "Tambah item...",
  maxItems,
  helpText,
  dirty = false,
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim() && (!maxItems || value.length < maxItems)) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemove = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-text-muted">
          <span>{label}</span>
          {maxItems && (
            <span className="text-text-muted/50">
              {value.length}/{maxItems}
            </span>
          )}
          {dirty && (
            <span className="text-[9px] font-mono uppercase tracking-widest text-accent bg-accent/10 border border-accent/30 px-1.5 py-0.5 rounded">
              Modified
            </span>
          )}
        </label>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={maxItems && value.length >= maxItems}
          className="flex-1 px-4 py-2 bg-surface/40 border border-border/40 rounded-lg text-text-main placeholder-text-muted/40 text-sm font-mono focus:outline-none focus:border-accent focus:bg-surface/60 transition-colors disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={maxItems && value.length >= maxItems}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-accent text-accent text-xs font-mono uppercase tracking-widest rounded-lg hover:bg-accent hover:text-background transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent"
        >
          <FaPlus className="w-3 h-3" />
          Tambah
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface border border-border/40 rounded-lg text-xs font-mono text-text-main"
            >
              {item}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-text-muted hover:text-red-400 transition-colors"
                aria-label={`Hapus ${item}`}
              >
                <FaTimes className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {helpText && (
        <p className="mt-1.5 text-[11px] font-mono text-text-muted/60">{helpText}</p>
      )}
    </div>
  );
}

// ============================================
// 4. DYNAMIC SOCIAL LINKS — dengan ikon platform
// ============================================
export const PLATFORMS = [
  { value: "github", label: "GitHub", icon: FaGithub },
  { value: "linkedin", label: "LinkedIn", icon: FaLinkedin },
  { value: "instagram", label: "Instagram", icon: FaInstagram },
  { value: "twitter", label: "Twitter/X", icon: FaTwitter },
  { value: "facebook", label: "Facebook", icon: FaFacebook },
  { value: "youtube", label: "YouTube", icon: FaYoutube },
  { value: "dribbble", label: "Dribbble", icon: FaDribbble },
  { value: "behance", label: "Behance", icon: FaBehance },
  { value: "website", label: "Website", icon: FaGlobe },
  { value: "email", label: "Email", icon: FaEnvelope },
  { value: "other", label: "Lainnya", icon: FaLink },
];

export function DynamicSocialLinks({ label, value = [], onChange, maxItems = 3, dirty = false }) {
  const handleAdd = () => {
    if (value.length < maxItems) {
      onChange([...value, { platform: "", url: "" }]);
    }
  };

  const handleChange = (index, field, val) => {
    const newArray = [...value];
    newArray[index] = { ...newArray[index], [field]: val };
    onChange(newArray);
  };

  const handleRemove = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-text-muted">
          <span>
            {label}{" "}
            <span className="text-text-muted/50">
              ({value.length}/{maxItems})
            </span>
          </span>
          {dirty && (
            <span className="text-[9px] font-mono uppercase tracking-widest text-accent bg-accent/10 border border-accent/30 px-1.5 py-0.5 rounded">
              Modified
            </span>
          )}
        </label>
        {value.length < maxItems && (
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-1 text-xs font-mono text-accent hover:opacity-80 transition-opacity"
          >
            <FaPlus className="w-2.5 h-2.5" />
            Tambah Link
          </button>
        )}
      </div>

      <div className="space-y-2">
        {value.map((link, index) => {
          const selected = PLATFORMS.find((p) => p.value === link.platform);
          const Icon = selected?.icon || FaLink;

          return (
            <div
              key={index}
              className="flex flex-wrap md:flex-nowrap gap-2 p-3 bg-surface/40 border border-border/40 rounded-lg"
            >
              {/* Ikon Platform */}
              <div
                className="w-10 h-10 flex items-center justify-center bg-surface border border-border/40 rounded-lg flex-shrink-0"
                title={selected?.label || "Belum dipilih"}
              >
                <Icon
                  className={`w-4 h-4 ${
                    selected ? "text-accent" : "text-text-muted/40"
                  }`}
                />
              </div>

              {/* Select Platform */}
              <select
                value={link.platform}
                onChange={(e) => handleChange(index, "platform", e.target.value)}
                className="w-full md:w-44 px-3 py-2 bg-surface border border-border/40 rounded-lg text-text-main text-xs font-mono focus:outline-none focus:border-accent transition-colors"
              >
                <option value="">Pilih Platform</option>
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              {/* URL Input */}
              <input
                type="text"
                value={link.url}
                onChange={(e) => handleChange(index, "url", e.target.value)}
                placeholder={
                  link.platform === "email"
                    ? "mailto:nama@email.com"
                    : "https://..."
                }
                className="flex-1 min-w-0 px-3 py-2 bg-surface border border-border/40 rounded-lg text-text-main placeholder-text-muted/40 text-xs font-mono focus:outline-none focus:border-accent transition-colors"
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="px-3 py-2 border border-border/40 rounded-lg text-text-muted hover:border-red-500/40 hover:text-red-400 transition-colors flex-shrink-0"
                aria-label="Hapus link"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {value.length === 0 && (
        <p className="text-xs font-mono text-text-muted/50 italic">
          Belum ada link sosial ditambahkan
        </p>
      )}
    </div>
  );
}

// ============================================
// 5. FILE UPLOAD — preview synced dengan value
// ============================================
export function FileUpload({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  helpText,
}) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(value || null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync preview saat value berubah dari luar (misal profile selesai diload)
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onChange(file, objectUrl);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onChange(file, objectUrl);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-text-muted mb-2">
        {label}
        {required && <span className="text-accent">*</span>}
      </label>

      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-accent bg-accent/5"
              : "border-border/40 hover:border-accent/50 bg-surface/30"
          }`}
        >
          <FaImage className="w-8 h-8 text-text-muted/40 mx-auto mb-3" />
          <p className="text-xs font-mono text-text-main mb-1">
            <span className="text-accent">Klik untuk upload</span> atau drag & drop
          </p>
          <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted/50">
            PNG · JPG · WEBP · Maks 5MB
          </p>
          <input
            ref={fileInputRef}
            id={name}
            name={name}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-border/40"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            aria-label="Hapus gambar"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 p-2 bg-background/90 backdrop-blur-sm text-text-main rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono uppercase tracking-widest px-3"
          >
            Ganti
          </button>
          <input
            ref={fileInputRef}
            id={name}
            name={name}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {helpText && !error && (
        <p className="mt-1.5 text-[11px] font-mono text-text-muted/60">{helpText}</p>
      )}
      {error && <p className="mt-1.5 text-[11px] font-mono text-red-400">⚠ {error}</p>}
    </div>
  );
}

// ============================================
// 6. FORM ACTIONS
// ============================================
export function FormActions({
  submitLabel = "Simpan",
  cancelLabel = "Batal",
  onCancel,
  isLoading = false,
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/40">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-5 py-2.5 border border-border/60 text-text-muted text-xs font-mono uppercase tracking-widest rounded-lg hover:text-text-main hover:border-accent/40 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {cancelLabel}
        </button>
      )}
      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-5 py-2.5 border border-accent text-accent text-xs font-mono uppercase tracking-widest rounded-lg hover:bg-accent hover:text-background transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent"
      >
        {isLoading ? (
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            Menyimpan...
          </>
        ) : (
          <>
            <FaUpload className="w-3 h-3" />
            {submitLabel}
          </>
        )}
      </button>
    </div>
  );
}