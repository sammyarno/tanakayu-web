import type { NewsEvent } from '@/types';

export const newsEvents: NewsEvent[] = [
  {
    id: 1,
    type: 'news',
    title: 'Perbaikan Lampu Jalan Blok B',
    content:
      '6 titik lampu jalan yang sebelumnya mati telah diperbaiki. Kini area lebih terang dan aman untuk dilalui malam hari.',
    createdAt: new Date(),
    createdBy: 'Sodjo Hadipranoto',
    comments: [],
  },
  {
    id: 2,
    type: 'news',
    title: 'Pembukaan Taman Bermain Anak',
    content:
      'Taman bermain di Blok A resmi dibuka dengan fasilitas ayunan, perosotan, dan gazebo. Yuk ajak si kecil bermain!',
    createdAt: new Date(),
    createdBy: 'Sodjo Hadipranoto',
    comments: [{ id: 1, createdBy: 'Ayu', createdAt: new Date(), comment: 'Anak saya senang banget main di sini!' }],
  },
  {
    id: 3,
    type: 'news',
    title: 'Penambahan CCTV di Pintu Masuk',
    content: 'Demi meningkatkan keamanan, telah dipasang CCTV tambahan di dua titik akses utama cluster.',
    createdAt: new Date(),
    createdBy: 'Sodjo Hadipranoto',
    comments: [],
  },
  // Acara
  {
    id: 4,
    type: 'event',
    title: 'Senam Pagi Mingguan',
    content: 'Yuk ikuti senam bersama setiap Minggu pagi pukul 07.00 WIB di Lapangan Blok C. Terbuka untuk semua usia!',
    createdAt: new Date(),
    createdBy: 'Sodjo Hadipranoto',
    comments: [
      { id: 1, createdBy: 'Rina', createdAt: new Date(), comment: 'Wah seru! Saya pasti ikut minggu ini.' },
      { id: 2, createdBy: 'Pak Dedi', createdAt: new Date(), comment: 'Semoga cuaca mendukung ya.' },
    ],
  },
  {
    id: 5,
    type: 'event',
    title: 'Bazar Kuliner Tanakayu',
    content:
      'Ajak keluarga untuk hadir di Bazar Kuliner Tanakayu, Sabtu, 13 Juli 2025 mulai pukul 16.00 di area parkir utama.',
    createdAt: new Date(),
    createdBy: 'Sodjo Hadipranoto',
    comments: [{ id: 1, createdBy: 'Maya', createdAt: new Date(), comment: 'Ada tenant makanan Korea gak ya? 😋' }],
  },
  {
    id: 6,
    type: 'event',
    title: 'Rapat Koordinasi RT 05',
    content:
      'Rapat bulanan warga RT 05 akan dilaksanakan pada Jumat malam pukul 19.30 di rumah Pak Ketua RT. Mohon kehadiran semua warga.',
    createdAt: new Date(),
    createdBy: 'Sodjo Hadipranoto',
    comments: [],
  },
];
