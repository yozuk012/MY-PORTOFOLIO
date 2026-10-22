import { useState } from 'react';

// Konstanta untuk kredensial sementara (Hardcoded)
// Nanti ini akan diganti dengan pemanggilan ke database PostgreSQL Raspberry Pi Anda
const MOCK_CREDENTIALS = {
  email: 'test@gmail.com',
  password: '12345678',
};

export function useLogin() {
  // State management khusus untuk logika login
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  /**
   * Fungsi untuk memproses login
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<boolean>} Mengembalikan true jika berhasil, false jika gagal
   */
  const login = async (email, password) => {
    // 1. Reset state setiap kali fungsi dipanggil
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // 2. Validasi dasar (Separation of Concerns: Validasi ada di sini, bukan di UI)
      if (!email || !password) {
        throw new Error('Email dan password tidak boleh kosong.');
      }

      // 3. Simulasi network delay (seolah-olah sedang request ke Raspberry Pi)
      // Ini membuat UX lebih realistis (loading state terlihat)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // 4. Logika Autentikasi (Hardcoded untuk sementara)
      if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
        // Simpan token/session palsu di localStorage (Nanti diganti dengan cookies/JWT asli)
        localStorage.setItem('portfolio_admin_session', 'mock-token-xyz-123');
        localStorage.setItem('portfolio_admin_email', email);
        
        setIsSuccess(true);
        return true;
      } else {
        throw new Error('Email atau password salah. Silakan coba lagi.');
      }
    } catch (err) {
      // Tangkap error dan simpan ke state agar bisa ditampilkan di UI
      setError(err.message);
      return false;
    } finally {
      // Pastikan loading state selalu mati, baik sukses maupun gagal
      setIsLoading(false);
    }
  };

  // Fungsi tambahan untuk reset state error (berguna saat user mulai mengetik ulang)
  const clearError = () => {
    setError(null);
  };

  // Kembalikan hanya apa yang dibutuhkan oleh komponen UI
  return {
    login,
    isLoading,
    error,
    isSuccess,
    clearError,
  };
}