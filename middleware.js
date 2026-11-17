// middleware.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // 1. Buat response default untuk melanjutkan request
  let supabaseResponse = NextResponse.next({
    request,
  })

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
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Refresh session user (SANGAT PENTING agar cookie tidak expired di Next.js App Router)
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Logika Proteksi Route
  const pathname = request.nextUrl.pathname

  // A. Jika mencoba akses /admin (atau turunannya) dan TIDAK login -> redirect ke /auth
  if (pathname.startsWith('/admin') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    // Simpan halaman yang dituju agar setelah login bisa kembali ke sana
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // B. Jika SUDAH login dan mencoba akses /auth -> redirect ke /admin (dashboard)
  if (pathname.startsWith('/auth') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  // 5. Kembalikan response (dengan cookie yang sudah di-refresh jika perlu)
  return supabaseResponse
}

// 6. Konfigurasi matcher: Jalankan middleware untuk semua route KECUALI file statis
export const config = {
  matcher: [
    /*
     * Match semua request paths kecuali yang dimulai dengan:
     * - _next/static (file statis Next.js)
     * - _next/image (file optimasi gambar)
     * - favicon.ico
     * - file publik seperti .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}