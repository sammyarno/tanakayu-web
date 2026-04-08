'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ROLES } from '@/constants/roles';
import { useAuth } from '@/hooks/auth/useAuth';
import { Home, LayoutDashboard, User } from 'lucide-react';

import { Footer } from './Footer';

const BottomNav = () => {
  const pathname = usePathname();
  const { role } = useAuth();

  const navItems: {
    label: string;
    href: string;
    icon: React.ElementType;
    isActive: (path: string) => boolean;
  }[] = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: (path: string) => path === '/',
    },
  ];

  if (pathname !== '/verify-member') {
    navItems.push({
      label: 'Profile',
      href: '/member/profile',
      icon: User,
      isActive: (path: string) => path.startsWith('/member/profile'),
    });
  }

  if (role === ROLES.SUPERADMIN && pathname !== '/verify-member') {
    navItems.push({
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      isActive: (path: string) => path.startsWith('/admin'),
    });
  }

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 flex flex-col justify-center">
      <nav className="border-tanakayu-accent/20 text-tanakayu-text mx-auto w-full max-w-lg border-t bg-white backdrop-blur-md">
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item, index) => {
            const active = item.isActive(pathname);
            const Icon = item.icon;
            const isLast = index === navItems.length - 1;

            return (
              <div key={item.href} className="flex w-full items-center">
                <Link
                  href={item.href}
                  scroll={false}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`group hover:text-tanakayu-card relative flex w-full flex-col items-center justify-center py-2 transition-all duration-300 ease-in-out ${
                    active ? 'text-tanakayu-card' : 'text-gray-400'
                  }`}
                >
                  {/* Active Indicator Background */}
                  <span
                    className={`absolute top-1 h-8 w-16 rounded-full transition-all duration-300 ${
                      active ? 'bg-tanakayu-accent/20 scale-100 opacity-100' : 'scale-0 opacity-0'
                    }`}
                  />

                  {/* Icon with bounce/scale effect on active */}
                  <div
                    className={`relative z-10 transition-transform duration-300 ${
                      active ? '-translate-y-1 scale-110' : 'group-hover:-translate-y-0.5'
                    }`}
                  >
                    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                  </div>

                  {/* Label always visible */}
                  <span className="text-[10px] font-medium transition-all duration-300">{item.label}</span>
                </Link>

                {/* Vertical Divider */}
                {!isLast && <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700" />}
              </div>
            );
          })}
        </div>
      </nav>
      <Footer />
    </div>
  );
};

export default BottomNav;
