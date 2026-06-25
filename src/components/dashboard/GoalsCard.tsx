'use client';

import { Target } from 'lucide-react';
import React from 'react';

interface GoalsCardProps {
  weeklyGoal: number;
  weekNetProfit: number;
  monthlyGoal: number;
  monthNetProfit: number;
  showAmount: boolean;
}

export function GoalsCard({
  weeklyGoal,
  weekNetProfit,
  monthlyGoal,
  monthNetProfit,
  showAmount
}: GoalsCardProps) {
  const weeklyPercentage = weeklyGoal > 0 ? Math.min((weekNetProfit / weeklyGoal) * 100, 100) : 0;
  const monthlyPercentage = monthlyGoal > 0 ? Math.min((monthNetProfit / monthlyGoal) * 100, 100) : 0;

  const getBarColor = (profit: number, goal: number) => {
    if (goal <= 0) return '#71717A';
    const ratio = profit / goal;
    if (ratio >= 1) return '#10B981'; // Green
    if (ratio >= 0.7) return '#22C55E'; // Light Green
    if (ratio >= 0.4) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <section className="bg-card border border-border rounded-[20px] p-3.5 shadow-premium card-premium space-y-3 animate-fade-in-up">
      <div className="flex items-center space-x-2">
        <Target size={14} className="text-muted" />
        <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">Progresso de Metas</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Meta Semanal */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-foreground items-center">
            <span>Semanal</span>
            <span>{weeklyPercentage.toFixed(0)}%</span>
          </div>
          <div className="goal-bar w-full bg-card-secondary h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700"
              style={{ 
                width: `${weeklyPercentage}%`,
                backgroundColor: getBarColor(weekNetProfit, weeklyGoal)
              }}
            />
          </div>
          <div className="text-[10px] text-muted font-bold">
            {showAmount ? `R$ ${weekNetProfit.toFixed(0)}` : 'R$ ••••'} / R$ {weeklyGoal.toFixed(0)}
          </div>
        </div>

        {/* Meta Mensal */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-foreground items-center">
            <span>Mensal</span>
            <span>{monthlyPercentage.toFixed(0)}%</span>
          </div>
          <div className="goal-bar w-full bg-card-secondary h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700"
              style={{ 
                width: `${monthlyPercentage}%`,
                backgroundColor: getBarColor(monthNetProfit, monthlyGoal)
              }}
            />
          </div>
          <div className="text-[10px] text-muted font-bold">
            {showAmount ? `R$ ${monthNetProfit.toFixed(0)}` : 'R$ ••••'} / R$ {monthlyGoal.toFixed(0)}
          </div>
        </div>
      </div>
    </section>
  );
}
