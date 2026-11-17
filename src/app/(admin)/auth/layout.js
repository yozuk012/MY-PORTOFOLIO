// src/app/(admin)/auth/layout.js
export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-5 py-16 overflow-hidden">
      {/* ===== Dekorasi subtle (glow accent) ===== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/5 blur-3xl"
      />

      {/* ===== Grid pattern halus (opsional, bisa dihapus) ===== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ===== Konten ===== */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}