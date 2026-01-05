'use client';

import QRCode from 'react-qr-code';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useUserAuthStore } from '@/store/userAuthStore';
import { Cpu, Nfc } from 'lucide-react';

export const MembershipCard = () => {
  const { userInfo } = useUserAuthStore();
  const username = userInfo?.full_name || userInfo?.username || 'Member';
  const userId = userInfo?.id || '00000000';

  // Card UI Component to be reused in trigger and content
  const CardVisual = ({ className = '', large = false }: { className?: string; large?: boolean }) => (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white shadow-xl transition-transform duration-300 ${
        large ? 'h-64 w-96' : 'h-48 w-full hover:scale-105'
      } ${className}`}
    >
      {/* Decorative background elements */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
      <div className="bg-tanakayu-accent/10 absolute -bottom-12 -left-12 h-40 w-40 rounded-full blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-tanakayu-accent font-serif text-xl font-bold tracking-wider">TANAKAYU</h2>
            <p className="text-[0.6rem] tracking-[0.2em] text-emerald-200 uppercase">Membership</p>
          </div>
          <Nfc className="h-8 w-8 text-white/50" />
        </div>

        {/* Chip */}
        <div className="my-2">
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-12 rounded bg-yellow-100/20 backdrop-blur-sm">
              <Cpu className="absolute inset-0 h-full w-full p-1.5 text-yellow-200/80" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-[0.6rem] text-emerald-300 uppercase">Member Name</p>
            <p className="font-mono text-lg font-medium tracking-wider shadow-black drop-shadow-md">{username}</p>
          </div>
          {large && (
            <div className="text-right">
              <p className="text-[0.6rem] text-emerald-300 uppercase">ID</p>
              <p className="font-mono text-sm text-white/80">{userInfo?.id?.slice(0, 8).toUpperCase() || '00000000'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          <CardVisual />
        </div>
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
