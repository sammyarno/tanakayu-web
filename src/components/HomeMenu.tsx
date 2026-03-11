'use client';

import Link from 'next/link';

import { ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/auth/useAuth';
import { Megaphone, PhoneCall, ReceiptText, ShieldCheck } from 'lucide-react';

const PUBLIC_MENU_ITEMS = [
  {
    href: '/post',
    icon: Megaphone,
    iconBaseColor: 'bg-orange-50',
    iconColor: 'text-orange-500',
    alt: 'Pengumuman & Acara',
    title: 'Pengumuman & Acara',
  },
];

const AUTH_MENU_ITEMS = [
  {
    href: '/transaction-report',
    icon: ReceiptText,
    iconBaseColor: 'bg-green-50',
    iconColor: 'text-green-500',
    alt: 'Laporan Transaksi',
    title: 'Laporan Transaksi',
  },
];

const MERCHANT_MENU_ITEMS = [
  {
    href: '/verify-member',
    icon: ShieldCheck,
    iconBaseColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    alt: 'Verifikasi Keanggotaan',
    title: 'Verifikasi Keanggotaan',
  },
];

const HomeMenu = () => {
  const { role } = useAuth();

  const displayItems =
    role === ROLES.MERCHANT
      ? MERCHANT_MENU_ITEMS
      : [...PUBLIC_MENU_ITEMS, ...(role ? AUTH_MENU_ITEMS : [])];

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
      {role !== ROLES.MERCHANT && (
        <Link
          href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE}`}
          className="flex flex-col items-center justify-start rounded-xl border bg-white p-2 text-center shadow-sm transition-shadow hover:shadow-md md:p-3"
        >
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <PhoneCall className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-xs leading-tight font-semibold text-slate-800 md:text-sm">Call Helpdesk</h2>
        </Link>
      )}
    </section>
  );
};

export default HomeMenu;
