'use client';

import { Eye, EyeOff, Trophy, Sparkles, AlertCircle } from 'lucide-react';
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

  // Renderizar de acordo com o estado
  if (!hasActiveJourney) {
    // ESTADO A: Antes da jornada começar (Incentivo)
    return (
      <section 
        className="rounded-[24px] p-4.5 relative overflow-hidden flex flex-col justify-between space-y-3.5 shadow-premium text-white border-0 animate-fade-in-up duration-300"
        style={{ 
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
        }}
      >
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-black tracking-wider uppercase opacity-90 flex items-center space-x-1">
            <Sparkles size={12} className="text-white fill-white animate-spin" style={{ animationDuration: '4s' }} />
            <span>Dia de Trabalho</span>
          </span>
          <button 
            onClick={onToggleShowAmount}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95 cursor-pointer"
          >
            {showAmount ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white" />}
          </button>
        </div>

        <div className="space-y-1">
          <span className="text-[12px] font-bold opacity-80">Pronto para rodar hoje?</span>
          <h2 className="text-[20px] font-black tracking-tight leading-tight font-heading">
            Sua meta diária é de <span className="underline decoration-white/40">R$ {dailyGoal.toFixed(0)}</span>
          </h2>
        </div>

        <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-[11px] leading-relaxed font-medium">
          🏍️ Inicie a jornada abaixo para ativar o rastreamento por GPS e registrar suas entregas com métricas em tempo real!
        </div>

        {/* Resumo rápido se já houver lançamentos no dia sem jornada ativa */}
        {netProfit > 0 && (
          <div className="flex justify-between items-center pt-2 border-t border-white/10 text-white/90 text-[11px] font-bold">
            <span>Hoje: R$ {showAmount ? netProfit.toFixed(2).replace('.', ',') : '••••'}</span>
            <span>{deliveriesCount} entregas</span>
          </div>
        )}
      </section>
    );
  }

  if (isGoalMet) {
    // ESTADO C: Meta atingida (Conquista)
    return (
      <section 
        className="rounded-[24px] p-4.5 relative overflow-hidden flex flex-col justify-between space-y-3.5 shadow-premium text-white border-0 animate-fade-in-up duration-300"
        style={{ 
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
        }}
      >
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-black tracking-wider uppercase opacity-90 flex items-center space-x-1 bg-white/20 px-2 py-0.5 rounded-full border border-white/10">
            <Trophy size={11} className="fill-white mr-1" />
            <span>Meta de Hoje Concluída</span>
          </span>
          <button 
            onClick={onToggleShowAmount}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95 cursor-pointer"
          >
            {showAmount ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white" />}
          </button>
        </div>

        <div className="space-y-0.5">
          <span className="text-[12px] font-extrabold tracking-wide opacity-80 block uppercase">LUCRO LÍQUIDO</span>
          <div className="text-[34px] font-black tracking-tight leading-none font-heading select-none transition-all duration-300">
            {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
          </div>
        </div>

        {/* Métricas do dia */}
        <div className="flex justify-between items-center pt-2 border-t border-white/15 text-white/95">
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[10px] font-bold uppercase tracking-wide">Ganhos</span>
            <span className="text-[14px] font-black leading-tight">
              {showAmount ? `R$ ${totalGains.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
            </span>
          </div>
          <div className="h-6 border-l border-white/20 mx-2" />
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[10px] font-bold uppercase tracking-wide">Gastos</span>
            <span className="text-[14px] font-black leading-tight">
              {showAmount ? `R$ ${totalExpenses.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
            </span>
          </div>
          <div className="h-6 border-l border-white/20 mx-2" />
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[10px] font-bold uppercase tracking-wide">Entregas</span>
            <span className="text-[14px] font-black leading-tight">
              {deliveriesCount} ({deliveriesCount > 0 ? `R$ ${(totalGains / deliveriesCount).toFixed(2).replace('.', ',')}` : 'R$ 0,00'}/ent)
            </span>
          </div>
        </div>

        {/* Progresso e Mensagem */}
        <div className="space-y-1.5 pt-2 border-t border-white/15 text-[11px] font-bold">
          <div className="flex justify-between items-center text-white/95">
            <span>Meta Diária • 100%</span>
            <span>R$ {netProfit.toFixed(0)} / R$ {dailyGoal.toFixed(0)}</span>
          </div>
          <div className="w-full bg-white/25 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full w-full transition-all duration-1000 ease-out" />
          </div>
          <div className="flex items-center space-x-1.5 bg-white/15 p-2 rounded-lg text-white mt-1">
            <Trophy size={14} className="fill-white flex-shrink-0 animate-bounce" />
            <span className="text-[10px] font-extrabold tracking-tight">Excelente trabalho! Meta diária concluída com sucesso! 🏍️🏆</span>
          </div>
        </div>
      </section>
    );
  }

  // ESTADO B: Durante a jornada (Progresso ativo)
  return (
    <section 
      className="rounded-[24px] p-4.5 relative overflow-hidden flex flex-col justify-between space-y-3.5 shadow-premium text-white border-0 animate-fade-in-up duration-300"
      style={{ 
        background: 'linear-gradient(135deg, #1db96b 0%, #158f52 100%)'
      }}
    >
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-black tracking-wider uppercase opacity-90 flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Jornada em Andamento</span>
        </span>
        <button 
          onClick={onToggleShowAmount}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95 cursor-pointer"
        >
          {showAmount ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white" />}
        </button>
      </div>

      <div className="space-y-0.5">
        <span className="text-[12px] font-extrabold tracking-wide opacity-80 block uppercase">LUCRO LÍQUIDO</span>
        <div className="text-[34px] font-black tracking-tight leading-none font-heading select-none transition-all duration-300">
          {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
        </div>
      </div>

      {/* Ganhos / Gastos / Entregas */}
      <div className="flex justify-between items-center pt-2 border-t border-white/15 text-white/95">
        <div className="text-left flex-1">
          <span className="opacity-75 block text-[10px] font-bold uppercase tracking-wide">Ganhos</span>
          <span className="text-[14px] font-black leading-tight">
            {showAmount ? `R$ ${totalGains.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
          </span>
        </div>
        <div className="h-6 border-l border-white/20 mx-2" />
        <div className="text-left flex-1">
          <span className="opacity-75 block text-[10px] font-bold uppercase tracking-wide">Gastos</span>
          <span className="text-[14px] font-black leading-tight">
            {showAmount ? `R$ ${totalExpenses.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
          </span>
        </div>
        <div className="h-6 border-l border-white/20 mx-2" />
        <div className="text-left flex-1">
          <span className="opacity-75 block text-[10px] font-bold uppercase tracking-wide">Entregas</span>
          <span className="text-[14px] font-black leading-tight">
            {deliveriesCount} ({deliveriesCount > 0 ? `R$ ${(totalGains / deliveriesCount).toFixed(2).replace('.', ',')}` : 'R$ 0,00'}/ent)
          </span>
        </div>
      </div>

      {/* Progresso da Meta */}
      <div className="space-y-1.5 pt-2 border-t border-white/15 text-[11px] font-bold">
        <div className="flex justify-between items-center text-white/95">
          <span>Meta Diária • {goalPercentage.toFixed(0)}%</span>
          <span>R$ {netProfit.toFixed(0)} / R$ {dailyGoal.toFixed(0)}</span>
        </div>
        <div className="w-full bg-white/25 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${goalPercentage}%` }}
          />
        </div>
        <div className="text-[10px] font-extrabold opacity-90 flex items-center space-x-1.5 mt-1 bg-white/10 p-2 rounded-lg">
          <AlertCircle size={14} className="text-white flex-shrink-0 animate-pulse" />
          <span>Faltam R$ {remaining.toFixed(0)} para atingir sua meta.</span>
        </div>
      </div>
    </section>
  );
}
