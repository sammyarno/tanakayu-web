'use client';

import Link from 'next/link';

import PageContent from '@/components/PageContent';
import { ADMIN_ROLES, ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/auth/useAuth';
import { Megaphone, ReceiptText } from 'lucide-react';

const SUPERADMIN_MENU_ITEMS = [
  {
    href: '/admin/post',
    icon: Megaphone,
    iconBaseColor: 'bg-orange-50',
    iconColor: 'text-orange-500',
    title: 'Pengumuman & Acara',
  },
];

const SHARED_MENU_ITEMS = [
  {
    href: '/admin/transaction-report',
    icon: ReceiptText,
    iconBaseColor: 'bg-green-50',
    iconColor: 'text-green-500',
    title: 'Laporan Transaksi',
  },
];

const Dashboard = () => {
  const { role } = useAuth();

  const menuItems = role === ROLES.SUPERADMIN
    ? [...SUPERADMIN_MENU_ITEMS, ...SHARED_MENU_ITEMS]
    : SHARED_MENU_ITEMS;

  return (
    <PageContent allowedRoles={ADMIN_ROLES}>
      <section className="grid grid-cols-4 gap-2 md:grid-cols-5 md:gap-4">
        {menuItems.map(item => {
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
      </section>
    </PageContent>
  );
};

export default Dashboard;
