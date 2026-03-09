'use client';

import Link from 'next/link';

import { useAuth } from '@/hooks/auth/useAuth';
import { Banknote, Megaphone, PhoneCall, ReceiptText } from 'lucide-react';

const MENU_ITEMS = [
  {
    href: '/post',
    icon: Megaphone,
    iconBaseColor: 'bg-orange-50',
    iconColor: 'text-orange-500',
    alt: 'Pengumuman & Acara',
    title: 'Pengumuman & Acara',
  },
  {
    href: '/transaction-report',
    icon: ReceiptText,
    iconBaseColor: 'bg-green-50',
    iconColor: 'text-green-500',
    alt: 'Laporan Transaksi',
    title: 'Laporan Transaksi',
  },
];

const ADMIN_MENU_ITEMS = [
  {
    href: '/expenditure-report',
    icon: Banknote,
    iconBaseColor: 'bg-purple-50',
    iconColor: 'text-purple-500',
    alt: 'Laporan Keuangan',
    title: 'Laporan Keuangan',
  },
];

const HomeMenu = () => {
  const { role } = useAuth();

  const displayItems = role === 'SUPERADMIN' || role === 'ADMINISTRATOR' ? [...MENU_ITEMS, ...ADMIN_MENU_ITEMS] : MENU_ITEMS;

  return (
    <section className="grid grid-cols-4 gap-2 md:grid-cols-5 md:gap-4">
      {displayItems.map(item => {
        const IconComponent = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-start rounded-xl border bg-white p-2 text-center shadow-sm transition-shadow hover:shadow-md md:p-3"
          >
            <div className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${item.iconBaseColor}`}>
              <IconComponent className={`h-6 w-6 ${item.iconColor}`} />
            </div>
            <h2 className="text-xs leading-tight font-semibold text-slate-800 md:text-sm">{item.title}</h2>
          </Link>
        );
      })}
      <Link
        href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE}`}
        className="flex flex-col items-center justify-start rounded-xl border bg-white p-2 text-center shadow-sm transition-shadow hover:shadow-md md:p-3"
      >
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <PhoneCall className="h-6 w-6 text-red-500" />
        </div>
        <h2 className="text-xs leading-tight font-semibold text-slate-800 md:text-sm">Call Helpdesk</h2>
      </Link>
    </section>
  );
};

export default HomeMenu;
