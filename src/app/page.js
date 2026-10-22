import HeroSection from './home/HeroSection';
import SkillsSection from './home/SkillsSection';
import ExperienceSection from './home/ExperienceSection';
import ProjectsSection from './home/ProjectsSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* 1. Hero Section: Kesan pertama, profil, dan status */}
      <HeroSection />
      
      {/* 2. Skills Section: Menampilkan keahlian (bisa marquee atau grid) */}
      <SkillsSection />
      
      {/* 3. Experience Section: Riwayat pekerjaan, magang, freelance */}
      <ExperienceSection />
      
      {/* 4. Projects Section: Proyek unggulan yang dipublikasikan */}
      <ProjectsSection />
      
      {/* Nanti bisa ditambahkan: <EducationSection /> dan <ContactSection /> */}
    </main>
  );
}