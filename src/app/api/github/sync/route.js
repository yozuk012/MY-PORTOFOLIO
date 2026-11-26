import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

function syncResponse(body, status = 200) {
	return NextResponse.json(body, {
		status,
		headers: { 'Cache-Control': 'private, no-store' },
	});
}

export async function GET(request) {
	const supabase = await createClient();
	const { data: { user }, error } = await supabase.auth.getUser();

	if (error || !user) {
		return syncResponse({ error: 'Sesi admin tidak aktif. Silakan login kembali.' }, 401);
	}

	const repo = request.nextUrl.searchParams.get('repo')?.trim();
	const repoParts = repo?.split('/');
	if (
		repoParts?.length !== 2 ||
		repoParts.some((part) => !/^[A-Za-z0-9_.-]+$/.test(part) || part === '.' || part === '..')
	) {
		return syncResponse({ error: 'Nama repository GitHub tidak valid. Gunakan format owner/repository.' }, 400);
	}

	const token = process.env.GITHUB_TOKEN?.trim();
	if (!token) {
		return syncResponse({ error: 'Konfigurasi GitHub belum lengkap. Cek GITHUB_TOKEN di environment deployment.' }, 500);
	}

	try {
		const response = await fetch(
			`https://api.github.com/repos/${encodeURIComponent(repoParts[0])}/${encodeURIComponent(repoParts[1])}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: 'application/vnd.github+json',
					'X-GitHub-Api-Version': '2022-11-28',
					'User-Agent': 'AchmadAldino-Portfolio-App',
				},
				cache: 'no-store',
			}
		);

		if (!response.ok) {
			if (response.status === 404) {
				return syncResponse({ error: 'Repository GitHub tidak ditemukan atau tidak dapat diakses.' }, 502);
			}
			if (response.status === 401 || response.status === 403) {
				return syncResponse({ error: 'GitHub menolak akses. Periksa masa berlaku dan izin GITHUB_TOKEN.' }, 502);
			}
			if (response.status === 429 || response.headers.get('x-ratelimit-remaining') === '0') {
				return syncResponse({ error: 'Batas permintaan GitHub tercapai. Coba lagi nanti.' }, 429);
			}
			return syncResponse({ error: 'GitHub gagal memuat data repository. Coba lagi nanti.' }, 502);
		}

		const repository = await response.json();
		return syncResponse({
			success: true,
			data: {
				stargazers_count: repository.stargazers_count,
				topics: repository.topics || [],
				language: repository.language,
			},
		});
	} catch {
		console.error('[GitHub sync] Gagal mengambil atau membaca respons GitHub API');
		return syncResponse({ error: 'Tidak dapat memuat data dari GitHub. Coba lagi nanti.' }, 502);
	}
}
