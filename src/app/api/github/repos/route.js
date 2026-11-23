import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

function reposResponse(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return reposResponse({ error: 'Sesi admin tidak aktif. Silakan login kembali.' }, 401);
  }

  const username = process.env.GITHUB_USERNAME?.trim();
  const token = process.env.GITHUB_TOKEN?.trim();

  // 1. Validasi Environment Variables
  if (!username || !token) {
    return reposResponse(
      { error: 'Konfigurasi GitHub belum lengkap. Cek GITHUB_USERNAME dan GITHUB_TOKEN di environment deployment.' },
      500
    );
  }

  try {
    // 2. Fetch data dari GitHub API
    // Kita ambil 100 repo terbaru yang di-update, dan skip fork (karya orang lain)
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&type=owner`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'AchmadAldino-Portfolio-App', // GitHub mewajibkan User-Agent
        },
        // Cache data di server Next.js selama 1 jam (3600 detik)
        // Ini menghemat Rate Limit GitHub API (5000 request/jam)
        next: { revalidate: 3600 }, 
      }
    );

    // 3. Handle Error dari GitHub
    if (!response.ok) {
      console.error('[GitHub repos] GitHub API mengembalikan status', response.status);

      if (response.status === 429 || response.headers.get('x-ratelimit-remaining') === '0') {
        return reposResponse({ error: 'Batas permintaan GitHub tercapai. Coba lagi nanti.' }, 429);
      }
      if (response.status === 401 || response.status === 403) {
        return reposResponse({ error: 'GitHub menolak akses. Periksa masa berlaku dan izin GITHUB_TOKEN.' }, 502);
      }
      if (response.status === 404) {
        return reposResponse({ error: 'Akun GitHub tidak ditemukan atau tidak dapat diakses. Periksa GITHUB_USERNAME dan izin token.' }, 502);
      }
      return reposResponse({ error: 'GitHub gagal memuat repository. Coba lagi nanti.' }, 502);
    }

    const allRepos = await response.json();

    // 4. Filter & Format Data (Hanya ambil yang bukan Fork & bukan Archived)
    const filteredRepos = allRepos
      .filter((repo) => !repo.fork && !repo.archived)
      .map((repo) => ({
        id: repo.id,
        full_name: repo.full_name, // Format: "yozuk012/nama-repo"
        name: repo.name,
        description: repo.description || 'Tidak ada deskripsi.',
        html_url: repo.html_url,
        homepage: repo.homepage || '', // Link demo/live jika ada di GitHub
        language: repo.language,
        topics: repo.topics || [], // Tags yang Anda buat di GitHub
        stargazers_count: repo.stargazers_count,
        updated_at: repo.updated_at,
        private: repo.private,
      }));

    // 5. Kirim Response ke Frontend
    return reposResponse({
      success: true,
      count: filteredRepos.length,
      data: filteredRepos,
    });

  } catch {
    console.error('[GitHub repos] Gagal mengambil atau membaca respons GitHub API');
    return reposResponse({ error: 'Tidak dapat memuat data dari GitHub. Coba lagi nanti.' }, 502);
  }
}