'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/hooks/useLogin'; // Sesuaikan path jika perlu

export default function AuthPage() {
  const router = useRouter();
  
  // 1. Panggil Hook (Mengambil logika & state)
  const { login, isLoading, error, isSuccess, clearError } = useLogin();

  // 2. State khusus UI (hanya untuk menampung nilai input form)
  const [formData, setFormData] = useState({ email: '', password: '' });

  // 3. Efek untuk redirect jika login sukses
  useEffect(() => {
    if (isSuccess) {
      router.push('/admin'); // Redirect ke dashboard admin
    }
  }, [isSuccess, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Serahkan proses validasi dan autentikasi sepenuhnya ke hook
    await login(formData.email, formData.password);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) clearError(); // Hapus error saat user mulai mengetik ulang
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-900">Admin Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tampilkan Error dari Hook jika ada */}
          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="test@gmail.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="12345678"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}