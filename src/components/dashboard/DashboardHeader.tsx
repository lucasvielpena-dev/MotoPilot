'use client';

import { Bike, Eye, EyeOff, Plus, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  showAmount: boolean;
  onToggleShowAmount: (e: React.MouseEvent) => void;
  onAddClick: () => void;
  onLogoutClick: () => void;
}

export function DashboardHeader({
  showAmount,
  onToggleShowAmount,
  onAddClick,
  onLogoutClick
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between py-2 border-b border-border/40 mb-1">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2 select-none">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Bike size={18} strokeWidth={2.5} className="text-primary animate-pulse" />
        </div>
        <span className="text-[15px] font-black tracking-tight text-foreground font-heading">MotoPilot</span>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-1.5">
        {/* Toggle Amount View */}
        <button
          onClick={onToggleShowAmount}
          className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground hover:bg-card-secondary rounded-lg transition-colors cursor-pointer"
          title={showAmount ? 'Ocultar Valores' : 'Mostrar Valores'}
        >
          {showAmount ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>

        {/* Add Entry Button */}
        <button
          onClick={onAddClick}
          className="flex items-center space-x-1 bg-primary hover:bg-primary/95 text-white font-extrabold px-2.5 py-1.5 rounded-lg text-[11px] transition-all active:scale-[0.97] shadow-sm cursor-pointer"
          title="Novo Lançamento"
        >
          <Plus size={12} strokeWidth={3} />
          <span>Lançar</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogoutClick}
          className="w-8 h-8 flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"
          title="Sair"
        >
          <LogOut size={14} strokeWidth={2.5} />
        </button>
      </div>
    </header>
  );
}
