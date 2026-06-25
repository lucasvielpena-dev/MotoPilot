'use client';

import { Motorbike, Menu, Landmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  onOpenMenu: () => void;
}

export function DashboardHeader({ onOpenMenu }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-4 px-1">
      {/* Menu Trigger */}
      <button 
        onClick={onOpenMenu}
        className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted hover:text-foreground active:scale-95 transition-all cursor-pointer"
        title="Abrir Menu"
      >
        <Menu size={18} strokeWidth={2.5} />
      </button>

      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Motorbike size={20} strokeWidth={2.5} className="text-foreground animate-pulse" />
        <span className="text-[16px] font-extrabold tracking-tight text-foreground font-heading">MotoPilot</span>
      </div>

      {/* Central Financeira Link */}
      <button 
        onClick={() => router.push('/financeiro')}
        className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-primary hover:text-primary-muted active:scale-95 transition-all cursor-pointer"
        title="Central Financeira"
      >
        <Landmark size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
