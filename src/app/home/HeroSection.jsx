import { localPool } from '@/config/database';
import Link from 'next/link';

// Helper sederhana untuk merender ikon sosial media secara dinamis berdasarkan nama platform
function SocialIcon({ platform }) {
  const name = platform.toLowerCase();
  // Anda bisa mengganti ini dengan icon dari lucide-react atau heroicons nanti
  const icons = {
    github: '🐙',
    linkedin: '💼',
    instagram: '📸',
    twitter: '🐦',
    facebook: '📘',
    youtube: '📺',
    default: '🔗',
  };
  
  const icon = icons[name] || icons.default;
  
  return (
    <span className="mr-2 text-lg" aria-hidden="true">
      {icon}
    </span>
  );
}

export default async function HeroSection() {
  // 1. Ambil data dari database (Server-side)
  const res = await localPool.query('SELECT * FROM public.profile LIMIT 1');
  const profile = res.rows[0];

  // 2. Fallback jika data belum diisi dari admin
  if (!profile) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-6 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-800">Profil Belum Diatur</h2>
          <p className="mt-2 text-neutral-600">Silakan login ke halaman admin untuk mengisi data Hero Section.</p>
        </div>
      </section>
    );
  }

  const { full_name, role, bio, avatar_url, skills, social_links, status } = profile;
  
  // Pastikan skills dan social_links adalah array yang valid
  const displaySkills = Array.isArray(skills) ? skills.filter(s => s) : [];
  const displaySocials = Array.isArray(social_links) ? social_links : [];

  // Badge status dinamis
  const statusConfig = {
    available: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Available for Hire' },
    busy: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Busy / Working on Projects' },
    unavailable: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Not Available' },
  };
  const currentStatus = statusConfig[status] || statusConfig.available;

  return (
    <section className="relative px-6 py-20 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        
        {/* Avatar */}
        {avatar_url && (
          <div className="mb-8 flex justify-center">
            <img
              src={avatar_url}
              alt={`Foto profil ${full_name}`}
              className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg sm:h-40 sm:w-40"
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="mb-6 flex justify-center">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${currentStatus.color}`}>
            <span className="mr-1.5 h-2 w-2 rounded-full bg-current opacity-75"></span>
            {currentStatus.label}
          </span>
        </div>

        {/* Nama & Role */}
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
          {full_name}
        </h1>
        <p className="mt-4 text-xl font-medium text-neutral-600">
          {role}
        </p>

        {/* Bio */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
          {bio}
        </p>

        {/* 3 Skills Utama */}
        {displaySkills.length > 0 && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {displaySkills.map((skill, index) => (
              <span 
                key={index} 
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Social Links (Dinamis) */}
        {displaySocials.length > 0 && (
          <div className="mt-10 flex justify-center gap-6">
            {displaySocials.map((social, index) => (
              <Link
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                <SocialIcon platform={social.platform} />
                {social.platform}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}