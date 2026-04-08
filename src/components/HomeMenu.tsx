'use client';

import Link from 'next/link';

import { ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/auth/useAuth';
import { Megaphone, Phone, PhoneCall, ReceiptText, ShieldCheck, Users } from 'lucide-react';

const PUBLIC_MENU_ITEMS = [
  {
    href: '/post',
    icon: Megaphone,
    iconBaseColor: 'bg-orange-50',
    iconColor: 'text-orange-500',
    alt: 'Announcements & Events',
    title: 'Announcements & Events',
  },
];

const TRANSACTION_REPORT_ITEM = {
  href: '/transaction-report',
  icon: ReceiptText,
  iconBaseColor: 'bg-green-50',
  iconColor: 'text-green-500',
  alt: 'Transaction Report',
  title: 'Transaction Report',
};

const VERIFY_MEMBER_ITEM = {
  href: '/verify-member',
  icon: ShieldCheck,
  iconBaseColor: 'bg-blue-50',
  iconColor: 'text-blue-500',
  alt: 'Membership Verification',
  title: 'Membership Verification',
};

const ADMIN_MENU_ITEMS = [
  {
    href: '/members',
    icon: Users,
    iconBaseColor: 'bg-blue-50',
    iconColor: 'text-blue-500',
    alt: 'Members',
    title: 'Members',
  },
  {
    href: '/permitted-phones',
    icon: Phone,
    iconBaseColor: 'bg-purple-50',
    iconColor: 'text-purple-500',
    alt: 'Permitted Phones',
    title: 'Permitted Phones',
  },
];

const HomeMenu = () => {
  const { role } = useAuth();

  const authItems = role
    ? [
        ...(role !== ROLES.MERCHANT ? [TRANSACTION_REPORT_ITEM] : []),
        VERIFY_MEMBER_ITEM,
        ...(role === ROLES.SUPERADMIN ? ADMIN_MENU_ITEMS : []),
      ]
    : [];

  const displayItems = [...PUBLIC_MENU_ITEMS, ...authItems];

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
