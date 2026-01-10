'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';

import Image from 'next/image';

import { useUserAuthStore } from '@/store/userAuthStore';
import { Cpu } from 'lucide-react';

interface MembershipCardProps {
  user?: {
    id: string;
    full_name: string;
    address?: string;
    role?: string;
  };
  className?: string;
}

export const MembershipCard = ({ user, className }: MembershipCardProps) => {
  const { userInfo } = useUserAuthStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Use props if provided (e.g., from verify page), otherwise fall back to store
  const targetUser = user || {
    id: userInfo?.id || '00000000',
    full_name: userInfo?.displayName || 'Member',
    address: userInfo?.address,
    role: userInfo?.role,
  };

  const username = targetUser.full_name;
  const userId = targetUser.id;
  const displayAddress = (targetUser.address || '').toUpperCase();

  return (
    <div
      className={`group relative h-75 w-full max-w-lg cursor-pointer [perspective:1000px] ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front Face */}
        <div className="absolute h-full w-full rounded-xl shadow-xl [backface-visibility:hidden]">
          {imageError ? (
            // Fallback Component
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-xl transition-transform duration-300">
              {/* Decorative background elements for fallback */}
              <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
              <div className="bg-tanakayu-accent/10 absolute -bottom-12 -left-12 h-40 w-40 rounded-full blur-3xl" />

              <div className="relative flex h-full flex-col justify-between p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-tanakayu-accent font-serif text-3xl font-bold tracking-wider">TANAKAYU</h2>
                    <p className="text-xs tracking-[0.2em] text-neutral-400 uppercase">Membership</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <div>
                      <p className="text-[0.6rem] text-neutral-400 uppercase">Member Name</p>
                      <p className="font-mono text-lg font-medium tracking-wider text-amber-100/90">{username}</p>
                    </div>
                    {displayAddress && (
                      <div className="pt-1">
                        <p className="text-[0.6rem] text-neutral-400 uppercase">Residence</p>
                        <p className="font-mono text-xs text-white/80">{displayAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Image Component
            <div className="relative h-full w-full overflow-hidden rounded-xl bg-neutral-900 shadow-xl transition-transform duration-300">
              <Image
                src="/assets/member-card.jpeg"
                alt="Membership Card Background"
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                priority
              />

              {/* Content Overlay */}
              <div className="relative z-10 flex h-full flex-col justify-end p-6 pb-8">
                <p className="font-sans text-lg font-bold tracking-wider text-amber-100/90 uppercase drop-shadow-md">
                  {username}
                </p>
                {displayAddress && (
                  <div className="mt-1 text-xs font-medium text-white/90 drop-shadow-md">
                    <p>{displayAddress}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Back Face */}
        <div className="absolute h-full w-full [transform:rotateY(180deg)] overflow-hidden rounded-xl bg-white shadow-xl [backface-visibility:hidden]">
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
            <QRCode value={userId} size={150} />
            <div className="space-y-1 text-center">
              <p className="font-mono text-lg font-bold tracking-wider text-neutral-900">{username}</p>
              {displayAddress && (
                <div className="text-sm">
                  <p className="font-medium text-neutral-600">{displayAddress}</p>
                </div>
              )}
              <p className="text-xs tracking-widest text-neutral-400 uppercase">Scan to Verify</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
