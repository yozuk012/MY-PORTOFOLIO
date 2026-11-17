// src/app/(admin)/admin/contacts/page.js
"use client";

import { useState, useEffect } from "react";
import { useContacts } from "@/hooks/admin/useContacts";

// Import Komponen Universal
import { Form, FormField, FormActions } from "../components/Form";
import BackButton from "../components/BackButton";

// Import Ikon
import { FaAddressCard, FaSpinner } from "react-icons/fa";

export default function ManageContactsPage() {
  const {
    contact,
    loading,
    updating,
    error,
    successMessage,
    updateContact,
    clearMessages,
  } = useContacts();

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    location: "",
  });

  // Sinkronisasi data kontak → form
  useEffect(() => {
    if (contact) {
      setFormData({
        email: contact.email || "",
        phone: contact.phone || "",
        whatsapp: contact.whatsapp || "",
        address: contact.address || "",
        location: contact.location || "",
      });
    }
  }, [contact]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    clearMessages();
    await updateContact(formData);
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="w-6 h-6 animate-spin text-accent" />
          <p className="text-xs font-mono uppercase tracking-widest text-text-muted">
            Memuat data kontak...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN UI
  // ============================================
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ===== Header Halaman ===== */}
      <div>
        <BackButton />
        <div className="mb-6">
          <div className="flex items-baseline gap-4 mb-3">
            <span className="text-xs font-mono text-accent tracking-widest">
              06
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tighter">
              Manage Contacts
            </h1>
          </div>
          <p className="text-sm md:text-base text-text-muted max-w-2xl">
            Kelola informasi kontak yang akan ditampilkan di halaman depan portofolio.
          </p>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent" />
      </div>

      {/* ===== Alert Messages ===== */}
      {successMessage && (
        <div className="p-3.5 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2.5">
          <span className="text-green-400 text-sm">✓</span>
          <p className="text-xs font-mono text-green-400">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2.5">
          <span className="text-red-400 text-sm">⚠</span>
          <p className="text-xs font-mono text-red-400">{error}</p>
        </div>
      )}

      {/* ============================================ */}
      {/* FORM KONTAK                                   */}
      {/* ============================================ */}
      <div className="bg-surface/30 border border-border/40 rounded-xl p-6 sm:p-8">
        <Form onSubmit={handleSubmit} isLoading={updating} className="space-y-6">

          {/* Baris 1: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Alamat Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="achmad@example.com"
              required
            />

            <FormField
              label="Nomor Telepon"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+62 812-3456-7890"
            />
          </div>

          {/* Baris 2: WhatsApp & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nomor WhatsApp"
              name="whatsapp"
              type="text"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="+62 812-3456-7890"
              helpText="Nomor ini bisa digunakan untuk link WhatsApp API."
            />

            <FormField
              label="Lokasi / Kota"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Jakarta, Indonesia"
            />
          </div>

          {/* Alamat Lengkap */}
          <FormField
            label="Alamat Lengkap"
            name="address"
            type="textarea"
            value={formData.address}
            onChange={handleChange}
            placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan..."
            rows={3}
          />

          <FormActions
            submitLabel={contact ? "Perbarui Kontak" : "Simpan Kontak"}
            isLoading={updating}
          />
        </Form>
      </div>
    </div>
  );
}