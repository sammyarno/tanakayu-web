'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';

import Image from 'next/image';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useUserAuthStore } from '@/store/userAuthStore';
import { Cpu, Nfc } from 'lucide-react';

interface CardVisualProps extends React.HTMLAttributes<HTMLDivElement> {
  large?: boolean;
}

export const MembershipCard = () => {
  const { userInfo } = useUserAuthStore();
  const username = userInfo?.fullName || userInfo?.username || 'Member';
  const userId = userInfo?.id || '00000000';

  // Card UI Component to be reused in trigger and content
  const CardVisual = ({ className = '', large = false, ...props }: CardVisualProps) => {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
      // Fallback Component
      return (
        <div
          className={`relative cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white shadow-xl transition-transform duration-300 ${
            large ? 'h-64 w-96' : 'h-72 w-full'
          } ${className}`}
          {...props}
        >
          {/* Decorative background elements for fallback */}
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
          <div className="bg-tanakayu-accent/10 absolute -bottom-12 -left-12 h-40 w-40 rounded-full blur-3xl" />

          <div className="relative flex h-full flex-col justify-between p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-tanakayu-accent font-serif text-xl font-bold tracking-wider">TANAKAYU</h2>
                <p className="text-[0.6rem] tracking-[0.2em] text-neutral-400 uppercase">Membership</p>
              </div>
              <Nfc className="h-8 w-8 text-white/20" />
            </div>

            {/* Chip */}
            <div className="my-2">
              <div className="flex items-center gap-2">
                <div className="relative h-9 w-12 rounded bg-yellow-100/10 backdrop-blur-sm">
                  <Cpu className="absolute inset-0 h-full w-full p-1.5 text-yellow-200/50" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-[0.6rem] text-neutral-400 uppercase">Member Name</p>
                <p className="font-mono text-lg font-medium tracking-wider text-amber-100/90">{username}</p>
              </div>
              {large && (
                <div className="text-right">
                  <p className="text-[0.6rem] text-neutral-400 uppercase">ID</p>
                  <p className="font-mono text-sm text-white/50">
                    {userInfo?.id?.slice(0, 8).toUpperCase() || '00000000'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Image Component
    return (
      <div
        className={`relative cursor-pointer overflow-hidden rounded-xl bg-neutral-900 shadow-xl transition-transform duration-300 ${
          large ? 'h-64 w-96' : 'h-76 w-full'
        } ${className}`}
        {...props}
      >
        <Image
          src="/assets/member-card.jpeg"
          alt="Membership Card Background"
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          priority
        />

        {/* Content Overlay */}
        <div className="relative z-10 flex h-full flex-col justify-end p-6 pb-14">
          <p className="ms-1 font-sans text-xl font-bold tracking-wider text-amber-100/90 uppercase drop-shadow-md">
            {username}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <CardVisual />
      </DialogTrigger>
      <DialogContent className="flex max-w-sm flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          <QRCode value={userId} size={200} />
          <div className="space-y-1 text-center">
            <p className="font-mono text-xl font-bold tracking-wider">{username}</p>
            <p className="text-muted-foreground text-xs tracking-widest uppercase">Scan to Verify</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
