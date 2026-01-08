import BottomNav from '@/components/BottomNav';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="flex min-h-screen flex-col justify-between pb-32">{children}</div>
      <BottomNav />
    </div>
  );
}
