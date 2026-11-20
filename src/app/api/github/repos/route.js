import { NextResponse } from 'next/server';

/**
 * GET /api/github/repos
 * Mengambil daftar repository dari akun GitHub Anda.
 * Endpoint ini bersifat PRIVATE (Server-side), token tidak akan bocor ke browser.
 */
export async function GET() {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  // 1. Validasi Environment Variables
  if (!username || !token) {
    return NextResponse.json(
      { error: 'Konfigurasi GitHub belum lengkap. Cek file .env.local' },
      { status: 500 }
    );
  }

  try {
    // 2. Fetch data dari GitHub API
    // Kita ambil 100 repo terbaru yang di-update, dan skip fork (karya orang lain)
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=owner`,
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
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'Gagal mengambil data dari GitHub', details: errorData.message },
        { status: response.status }
      );
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
    return NextResponse.json({
      success: true,
      count: filteredRepos.length,
      data: filteredRepos,
    });

  } catch (error) {
    console.error('[GitHub API Route Error]:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}