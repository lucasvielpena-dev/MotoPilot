'use client';

import { Eye, EyeOff, Trophy, TriangleAlert } from 'lucide-react';
import React from 'react';

interface ProfitCardProps {
  netProfit: number;
  totalGains: number;
  totalExpenses: number;
  deliveriesCount: number;
  dailyGoal: number;
  showAmount: boolean;
  onToggleShowAmount: (e: React.MouseEvent) => void;
  hasActiveJourney: boolean;
}

export function ProfitCard({
  netProfit,
  totalGains,
  totalExpenses,
  deliveriesCount,
  dailyGoal,
  showAmount,
  onToggleShowAmount,
  hasActiveJourney
}: ProfitCardProps) {
  
  const isGoalMet = netProfit >= dailyGoal && dailyGoal > 0;
  const goalPercentage = dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100) : 0;
  const remaining = dailyGoal - netProfit;

  // ESTADO C: Meta atingida
  if (hasActiveJourney && isGoalMet) {
    return (
      <section 
        className="rounded-[20px] p-3 relative overflow-hidden flex flex-col space-y-2 shadow-premium text-white animate-fade-in-up"
        style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}
      >
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black tracking-wider uppercase opacity-90 flex items-center bg-white/20 px-2 py-0.5 rounded-full border border-white/10">
            <Trophy size={10} className="fill-white mr-1" />
            <span>Meta Concluída</span>
          </span>
          <button 
            onClick={onToggleShowAmount}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95 cursor-pointer"
          >
            {showAmount ? <Eye size={12} className="text-white" /> : <EyeOff size={12} className="text-white" />}
          </button>
        </div>

        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-[9px] font-extrabold tracking-wide opacity-80 block uppercase">Lucro Líquido</span>
            <div className="text-[26px] font-black tracking-tight leading-none font-heading select-none mt-0.5">
              {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
            </div>
          </div>
          <div className="text-right text-[10px] font-bold text-white/90">
            <span>Meta 100%</span>
            <span className="block text-[11px] font-black">R$ {netProfit.toFixed(0)} / R$ {dailyGoal.toFixed(0)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-1.5 border-t border-white/15 text-white/95 text-[11px]">
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[8px] font-bold uppercase">Ganhos</span>
            <span className="font-extrabold">{showAmount ? `R$ ${totalGains.toFixed(0)}` : 'R$ ••••'}</span>
          </div>
          <div className="h-4 border-l border-white/20 mx-1.5" />
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[8px] font-bold uppercase">Gastos</span>
            <span className="font-extrabold">{showAmount ? `R$ ${totalExpenses.toFixed(0)}` : 'R$ ••••'}</span>
          </div>
          <div className="h-4 border-l border-white/20 mx-1.5" />
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[8px] font-bold uppercase">Entregas</span>
            <span className="font-extrabold">{deliveriesCount}</span>
          </div>
        </div>

        <div className="w-full bg-white/25 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full w-full transition-all duration-1000" />
        </div>
      </section>
    );
  }

  // ESTADO B: Jornada ativa (progresso)
  if (hasActiveJourney) {
    return (
      <section 
        className="rounded-[20px] p-3 relative overflow-hidden flex flex-col space-y-2 shadow-premium text-white animate-fade-in-up"
        style={{ background: 'linear-gradient(135deg, #1db96b 0%, #158f52 100%)' }}
      >
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black tracking-wider uppercase opacity-90 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Lucro do Dia</span>
          </span>
          <button 
            onClick={onToggleShowAmount}
            className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95 cursor-pointer"
          >
            {showAmount ? <Eye size={12} className="text-white" /> : <EyeOff size={12} className="text-white" />}
          </button>
        </div>

        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-[9px] font-extrabold tracking-wide opacity-80 block uppercase">Lucro Líquido</span>
            <div className="text-[26px] font-black tracking-tight leading-none font-heading select-none mt-0.5">
              {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
            </div>
          </div>
          <div className="text-right text-[10px] font-bold text-white/90">
            <span>Meta {goalPercentage.toFixed(0)}%</span>
            <span className="block text-[11px] font-black">R$ {netProfit.toFixed(0)} / R$ {dailyGoal.toFixed(0)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-1.5 border-t border-white/15 text-white/95 text-[11px]">
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[8px] font-bold uppercase">Ganhos</span>
            <span className="font-extrabold">{showAmount ? `R$ ${totalGains.toFixed(0)}` : 'R$ ••••'}</span>
          </div>
          <div className="h-4 border-l border-white/20 mx-1.5" />
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[8px] font-bold uppercase">Gastos</span>
            <span className="font-extrabold">{showAmount ? `R$ ${totalExpenses.toFixed(0)}` : 'R$ ••••'}</span>
          </div>
          <div className="h-4 border-l border-white/20 mx-1.5" />
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[8px] font-bold uppercase">Entregas</span>
            <span className="font-extrabold">{deliveriesCount}</span>
          </div>
        </div>

        <div className="w-full bg-white/25 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${goalPercentage}%` }}
          />
        </div>

        {remaining > 0 && (
          <div className="text-[9px] font-extrabold opacity-95 flex items-center space-x-1.5 bg-white/10 p-1.5 rounded-lg leading-tight">
            <TriangleAlert size={11} className="text-white flex-shrink-0 animate-pulse" />
            <span>Faltam R$ {remaining.toFixed(0)} para a meta.</span>
          </div>
        )}
      </section>
    );
  }

  // ESTADO A: Sem jornada
  return (
    <section 
      className="rounded-[20px] p-3 relative overflow-hidden flex flex-col space-y-2 shadow-premium text-white animate-fade-in-up"
      style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black tracking-wider uppercase opacity-90">Lucro do Dia</span>
        <button 
          onClick={onToggleShowAmount}
          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95 cursor-pointer"
        >
          {showAmount ? <Eye size={12} className="text-white" /> : <EyeOff size={12} className="text-white" />}
        </button>
      </div>

      <div className="flex justify-between items-baseline">
        <div>
          <span className="text-[9px] font-extrabold tracking-wide opacity-80 block uppercase">Lucro Líquido</span>
          <div className="text-[26px] font-black tracking-tight leading-none font-heading select-none mt-0.5">
            {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
          </div>
        </div>
        <div className="text-right text-[10px] font-bold text-white/90">
          <span>Meta {goalPercentage.toFixed(0)}%</span>
          <span className="block text-[11px] font-black">R$ {netProfit.toFixed(0)} / R$ {dailyGoal.toFixed(0)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-1.5 border-t border-white/15 text-white/95 text-[11px]">
        <div className="text-left flex-1">
          <span className="opacity-75 block text-[8px] font-bold uppercase">Ganhos</span>
          <span className="font-extrabold">{showAmount ? `R$ ${totalGains.toFixed(0)}` : 'R$ ••••'}</span>
        </div>
        <div className="h-4 border-l border-white/20 mx-1.5" />
        <div className="text-left flex-1">
          <span className="opacity-75 block text-[8px] font-bold uppercase">Gastos</span>
          <span className="font-extrabold">{showAmount ? `R$ ${totalExpenses.toFixed(0)}` : 'R$ ••••'}</span>
        </div>
        <div className="h-4 border-l border-white/20 mx-1.5" />
        <div className="text-left flex-1">
          <span className="opacity-75 block text-[8px] font-bold uppercase">Entregas</span>
          <span className="font-extrabold">{deliveriesCount}</span>
        </div>
      </div>

      {dailyGoal > 0 && (
        <div className="w-full bg-white/25 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${goalPercentage}%` }}
          />
        </div>
      )}
    </section>
  );
}
