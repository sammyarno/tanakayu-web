import Image from 'next/image';
import Link from 'next/link';

const Banner = () => (
  <Link href="/">
    <section
      id="bannner"
      className="bg-tanakayu-dark text-tanakayu-accent border-tanakayu-highlight border-4 bg-[url('/leaf.png')] bg-cover bg-center p-2 text-center"
    >
      <p className="text-tanakayu-highlight font-serif text-xl font-bold tracking-widest uppercase">Paguyuban Warga</p>
      <div className="relative mb-4 h-16 w-full">
        <Image src="/tanakayu.png" alt="tanakayu" fill objectFit="contain" />
      </div>
      <p className="font-serif tracking-wider uppercase">Nomor AHU 0004548.AH.01.07.Tahun 2025</p>
    </section>
  </Link>
);

export default Banner;
