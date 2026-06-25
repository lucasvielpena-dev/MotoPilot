'use client';

import { CalendarDays, TrendingUp } from 'lucide-react';
import React from 'react';

interface ComparativeCardProps {
  weekNetProfit: number;
  weeklyGoal: number;
  monthNetProfit: number;
  monthlyGoal: number;
  showAmount: boolean;
}

export function ComparativeCard({
  weekNetProfit,
  weeklyGoal,
  monthNetProfit,
  monthlyGoal,
  showAmount
}: ComparativeCardProps) {
  const weekRatio = weeklyGoal > 0 ? Math.min((weekNetProfit / weeklyGoal) * 100, 100).toFixed(0) : 0;
  const monthRatio = monthlyGoal > 0 ? Math.min((monthNetProfit / monthlyGoal) * 100, 100).toFixed(0) : 0;

  return (
    <section className="bg-card border border-border rounded-[20px] p-3.5 space-y-3 animate-fade-in-up">
      <div className="flex items-center space-x-2">
        <TrendingUp size={14} className="text-muted" />
        <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Comparativo Semanal</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">Esta semana</span>
          <span className={`text-[15px] font-black font-heading ${weekNetProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {showAmount ? `R$ ${weekNetProfit.toFixed(0)}` : 'R$ ••••'}
          </span>
          <span className="text-[9px] text-muted block">
            {weekNetProfit > 0 ? `${weekRatio}% da meta` : 'Sem faturamento'}
          </span>
        </div>
        <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">Mês inteiro</span>
          <span className={`text-[15px] font-black font-heading ${monthNetProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {showAmount ? `R$ ${monthNetProfit.toFixed(0)}` : 'R$ ••••'}
          </span>
          <span className="text-[9px] text-muted block">
            {monthNetProfit > 0 ? `${monthRatio}% da meta` : 'Sem faturamento'}
          </span>
        </div>
      </div>
    </section>
  );
}
