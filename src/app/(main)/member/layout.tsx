import BottomNav from '@/components/BottomNav';

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="flex flex-col justify-between pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}
