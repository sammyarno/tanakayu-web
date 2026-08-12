import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

const PageHeader = ({ icon: Icon, title, description }: PageHeaderProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-tanakayu-highlight/15 flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
        <Icon className="text-tanakayu-highlight h-5 w-5" />
      </div>
      <div>
        <h2 className="text-tanakayu-text font-sans text-2xl font-bold">{title}</h2>
        {description && <p className="text-tanakayu-text text-sm">{description}</p>}
      </div>
    </div>
  );
};

export default PageHeader;
