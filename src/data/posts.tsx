import type { CategoryDisplay } from '@/types';
import { Droplet, Users, Zap } from 'lucide-react';

export const categoryDisplayMap: Record<string, CategoryDisplay> = {
  lingkungan: {
    icon: <Droplet className="size-5 text-blue-500" />,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  komunitas: {
    icon: <Users className="text-tanakayu-moss size-5" />,
    bgColor: 'bg-tanakayu-sage/25',
    textColor: 'text-tanakayu-moss',
  },
  listrik: {
    icon: <Zap className="size-5 text-yellow-500" />,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
};
