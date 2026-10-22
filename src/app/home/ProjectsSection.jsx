export default async function ProjectsSection() {
  // Nanti: Fetch dari tabel public.projects WHERE is_published = true ORDER BY order_index ASC
  return (
    <section className="bg-neutral-100 py-16 px-6">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8">Proyek Unggulan</h2>
        <p className="text-neutral-600">Komponen Projects Section sedang dalam pengembangan.</p>
      </div>
    </section>
  );
}