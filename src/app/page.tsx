const Home = () => {
  return (
    <main className="max-w-sm mx-auto py-8 px-2 flex flex-col gap-6">
      {/* banner */}
      <section id="bannner" className="rounded-lg bg-tanakayu-dark/85 text-tanakayu-accent p-5 text-center">
        <p className="text-5xl font-bold font-serif text-tanakayu-highlight tracking-widest">TANAKAYU</p>
        <p className="text-lg font-sub-serif tracking-wider">From The Origin</p>
      </section>

      {/* section menu */}
      <section id="menu" className="flex flex-col gap-4">
        <div className="bg-white border border-tanakayu-accent hover:shadow-lg cursor-pointer p-3">
          <h2 className="text-lg font-semibold mb-1">📰 Berita & Acara</h2>
          <p className="text-sm">Lihat acara yang akan datang dan kabar terbaru dari komunitas.</p>
        </div>
        <div className="bg-white border border-tanakayu-accent hover:shadow-lg cursor-pointer p-3">
          <h2 className="text-lg font-semibold mb-1">📢 Pengumuman</h2>
          <p className="text-sm">Informasi penting seperti pemadaman listrik, perbaikan, dll.</p>
        </div>
        <div className="bg-white border border-tanakayu-accent hover:shadow-lg cursor-pointer p-3">
          <h2 className="text-lg font-semibold mb-1">👥 Tim & Kontak</h2>
          <p className="text-sm">Kenali pengurus lingkungan dan cara menghubungi mereka.</p>
        </div>
      </section>

      {/* events */}
      <section className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-xl font-bold mb-3">📅 Acara Terdekat</h2>
        <div className="flex flex-col gap-2">
          <div className="mb-4">
            <h3 className="text-base font-semibold">Senam Pagi Mingguan</h3>
            <p className="text-sm">Minggu, 7 Juli 2025 – 07.00 WIB di Lapangan Blok C</p>
          </div>
          <button className="bg-tanakayu-highlight text-white font-semibold w-full py-1">
            Lihat Semua Acara
          </button>
        </div>
      </section>

      {/* footer */}
      <footer className="bg-tanakayu-dark text-white rounded-xl shadow-sm p-2 text-center">
        <p className="text-xs">Copyright © {new Date().getFullYear()} Tanakayu. All Rights Reserved.</p>
      </footer>
    </main>
  );
}

export default Home;
