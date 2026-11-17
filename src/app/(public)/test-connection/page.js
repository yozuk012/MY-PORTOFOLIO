// src/app/(public)/test-connection/page.js
import { createClient } from "@/lib/server";

export const instant = false;

export default async function TestConnectionPage() {
  const supabase = await createClient();
  
  // Test 1: Cek koneksi dengan fetch data dari tabel profile
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .limit(1);

  // Test 2: Cek koneksi dengan fetch data dari tabel skills
  const { data: skills, error: skillsError } = await supabase
    .from("skills")
    .select("*")
    .limit(5);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">🧪 Test Koneksi Supabase</h1>

      {/* Status Koneksi */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Status Koneksi</h2>
        {profileError || skillsError ? (
          <div className="text-red-400">
            <p className="font-bold">❌ Koneksi GAGAL</p>
            {profileError && <p className="mt-2 text-sm">Profile Error: {profileError.message}</p>}
            {skillsError && <p className="mt-2 text-sm">Skills Error: {skillsError.message}</p>}
          </div>
        ) : (
          <div className="text-green-400">
            <p className="font-bold">✅ Koneksi BERHASIL</p>
            <p className="mt-2 text-sm">Supabase terhubung dengan baik!</p>
          </div>
        )}
      </div>

      {/* Data Profile */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Data Profile</h2>
        {profile && profile.length > 0 ? (
          <pre className="bg-gray-950 p-3 rounded text-sm text-green-300 overflow-x-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        ) : (
          <p className="text-yellow-400 text-sm">⚠️ Tabel profile kosong</p>
        )}
      </div>

      {/* Data Skills */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Data Skills (5 pertama)</h2>
        {skills && skills.length > 0 ? (
          <pre className="bg-gray-950 p-3 rounded text-sm text-green-300 overflow-x-auto">
            {JSON.stringify(skills, null, 2)}
          </pre>
        ) : (
          <p className="text-yellow-400 text-sm">⚠️ Tabel skills kosong</p>
        )}
      </div>
    </div>
  );
}