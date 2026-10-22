import { localPool, dbClient, isLocal } from '@/config/database';

export default async function TestConnectionPage() {
  let statusMessage = "";
  let data = [];

  try {
    if (isLocal) {
      // Query menggunakan PostgreSQL lokal (Driver `pg`)
      const client = await localPool.connect();
      const result = await client.query('SELECT * FROM public.profile;');
      data = result.rows;
      client.release();
      statusMessage = "Berhasil terhubung ke PostgreSQL Lokal (Docker)!";
    } else {
      // Query menggunakan Supabase Client
      const { data: profileData, error } = await dbClient.from('profile').select('*');
      if (error) throw error;
      data = profileData;
      statusMessage = "Berhasil terhubung ke Supabase (Production)!";
    }
  } catch (err) {
    statusMessage = `Gagal terhubung: ${err.message}`;
  }

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Uji Koneksi Database Dinamis</h1>
      <p className="mb-4 p-3 bg-gray-100 rounded">Status: <b>{statusMessage}</b></p>
      
      <div className="bg-white p-4 border rounded shadow">
        <h2 className="font-semibold mb-2">Data Profile:</h2>
        <pre className="text-xs bg-gray-50 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </main>
  );
}