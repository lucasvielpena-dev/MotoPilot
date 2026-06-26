'use client';

import { Bike, Menu, Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  onOpenMenu: () => void;
}

export function DashboardHeader({ onOpenMenu }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-1">
      <button 
        onClick={onOpenMenu}
        className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted hover:text-foreground active:scale-95 transition-all cursor-pointer"
        title="Abrir Menu"
      >
        <Menu size={20} strokeWidth={2.5} />
      </button>

      <div className="flex items-center space-x-2">
        <Bike size={22} strokeWidth={2.5} className="text-primary" />
        <span className="text-[17px] font-extrabold tracking-tight text-foreground font-heading">MotoPilot</span>
      </div>

      <button 
        onClick={() => router.push('/financeiro')}
        className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-primary hover:text-primary-muted active:scale-95 transition-all cursor-pointer"
        title="Central Financeira"
      >
        <Landmark size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}
