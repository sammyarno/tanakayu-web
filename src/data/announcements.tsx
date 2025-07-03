import type { Announcement, Category } from '@/types';
import { Droplet, Users, Zap } from 'lucide-react';

export const announcements: Announcement[] = [
  {
    id: 1,
    title: 'Pemadaman Listrik Sementara',
    content:
      'Pihak PLN akan melakukan pemeliharaan jaringan pada hari Rabu, 10 Juli 2025 pukul 09.00–15.00 WIB. Diharapkan warga dapat bersiap-siap.',
    categories: ['Listrik'],
    createdAt: new Date(),
    createdBy: 'Sodjo Hadipranoto',
  },
  {
    id: 2,
    title: 'Pembersihan Saluran Air Blok C',
    content:
      'Mohon kerja sama warga Blok C karena akan ada pembersihan saluran air hari Jumat, 12 Juli 2025 pukul 08.00 pagi.',
    categories: ['Lingkungan'],
    createdAt: new Date(),
    createdBy: 'Yessi Liem',
  },
  {
    id: 3,
    title: 'Undangan Rapat Warga RT 03',
    content:
      'Rapat bulanan akan dilaksanakan Sabtu, 13 Juli 2025 pukul 19.00 WIB di Balai Warga Tanakayu. Dimohon kehadirannya.',
    categories: ['Komunitas'],
    createdAt: new Date(),
    createdBy: 'Yessi Liem',
  },
  {
    id: 4,
    title: 'Koordinasi Pembersihan dan Pemadaman di Blok D',
    content:
      'Akan dilakukan pemadaman listrik sekaligus pembersihan saluran air di Blok D pada Minggu, 14 Juli 2025 pukul 08.00–14.00 WIB. Diharapkan warga Blok D dapat bersiap dan berpartisipasi.',
    categories: ['Listrik', 'Lingkungan'],
    createdAt: new Date(),
    createdBy: 'Yessi Liem',
  },
];

export const categories: Category[] = [
  {
    label: 'Semua',
    value: '',
    icon: undefined,
    bgColor: undefined,
    textColor: undefined,
  },
  {
    label: 'Listrik',
    value: 'Listrik',
    icon: <Zap className="size-5 text-yellow-500" />,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  {
    label: 'Lingkungan',
    value: 'Lingkungan',
    icon: <Droplet className="size-5 text-blue-500" />,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  {
    label: 'Komunitas',
    value: 'Komunitas',
    icon: <Users className="size-5 text-green-500" />,
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
];
