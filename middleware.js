// middleware.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// ==========================================
// KONFIGURASI HOSTNAME
// ==========================================
const ADMIN_SUBDOMAIN = 'ruang-kerja.achmadaldino.my.id'
const PUBLIC_DOMAINS = ['achmadaldino.my.id', 'www.achmadaldino.my.id']

export async function middleware(request) {
  // 1. Buat response default & ambil info request
  let supabaseResponse = NextResponse.next({ request })
  const host = request.nextUrl.hostname
  const pathname = request.nextUrl.pathname
  const isApiRoute = pathname === '/api' || pathname.startsWith('/api/')
  const url = request.nextUrl.clone()

  // Helper untuk identifikasi host
  const isLocalhost = host.startsWith('localhost')
  const isPublicHost = PUBLIC_DOMAINS.includes(host) || host.includes('.vercel.app')
  const isTargetAdminHost = host === ADMIN_SUBDOMAIN || isLocalhost

  // Sembunyikan route admin dari domain publik sebelum memproses autentikasi.
  if (isPublicHost && !isLocalhost && pathname.startsWith('/admin')) {
    return new NextResponse(null, { status: 404 })
  }

  // 2. Inisialisasi Supabase Client khusus untuk Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Refresh session user (SANGAT PENTING agar cookie tidak expired)
  const { data: { user } } = await supabase.auth.getUser()

  // ==========================================
  // 4. LOGIKA PROTEKSI AUTENTIKASI (Prioritas 1)
  // ==========================================
  
  // A. Jika mencoba akses area admin dan TIDAK login -> redirect ke /auth
  if (isTargetAdminHost && (pathname === '/' || pathname.startsWith('/admin')) && !user) {
    url.pathname = '/auth'
    url.searchParams.set('next', pathname) // Simpan tujuan agar bisa kembali setelah login
    return NextResponse.redirect(url)
  }

  // B. Jika SUDAH login dan mencoba akses /auth -> redirect ke /admin
  if (pathname.startsWith('/auth') && user) {
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  // ==========================================
  // 5. LOGIKA SUBDOMAIN & REWRITING (Prioritas 2)
  // ==========================================

  // SKENARIO 1: User mengakses dari Subdomain Admin (atau localhost)
  if (isTargetAdminHost && !isApiRoute) {
    // Jika akses root `/`, tampilkan halaman dashboard admin
    if (pathname === '/' || pathname === '') {
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }

    // Jika akses route publik (misal: /skills) di subdomain admin,
    // ubah secara internal ke /admin/skills agar yang muncul adalah versi adminnya
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/auth') && !pathname.startsWith('/404')) {
      url.pathname = `/admin${pathname}`
      return NextResponse.rewrite(url)
    }
  }

  // 6. Kembalikan response (dengan cookie yang sudah di-refresh jika perlu)
  return supabaseResponse
}

// 7. Konfigurasi matcher: Jalankan middleware untuk semua route KECUALI file statis
export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali yang dimulai dengan:
     * - _next/static (file statis Next.js)
     * - _next/image (file optimasi gambar)
     * - favicon.ico
     * - file publik seperti .svg, .png, .jpg, .jpeg, .gif, .webp, .css, .js
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
}