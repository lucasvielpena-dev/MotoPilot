'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Clock, Route, Package, Fuel
} from 'lucide-react';
import { useEntries } from '@/hooks/useEntries';
import { useJourneys } from '@/hooks/useJourneys';
import { useGoals } from '@/hooks/useGoals';
import { useFinancialStats } from '@/hooks/useFinancialStats';

export default function CentralFinanceira() {
  const router = useRouter();
  const { entries, fetchRecentEntries, loading: entriesLoading } = useEntries();
  const { historicalJourneys, fetchHistoricalJourneys } = useJourneys();
  const { dailyGoal, weeklyGoal, monthlyGoal, fetchGoal } = useGoals();

  useEffect(() => {
    fetchRecentEntries(500);
    fetchHistoricalJourneys();
    fetchGoal();
  }, [fetchRecentEntries, fetchHistoricalJourneys, fetchGoal]);

  const stats = useFinancialStats(entries, historicalJourneys || [], null, dailyGoal);

  const goalRatio = dailyGoal > 0 ? Math.min((stats.todayNetProfit / dailyGoal) * 100, 100) : 0;
  const weeklyGoalRatio = weeklyGoal > 0 ? Math.min((stats.weekNetProfit / weeklyGoal) * 100, 100) : 0;
  const monthlyGoalRatio = monthlyGoal > 0 ? Math.min((stats.monthNetProfit / monthlyGoal) * 100, 100) : 0;

  if (entriesLoading && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-28 pt-2 px-4 animate-fade-in-up">
      {/* Header */}
      <header className="flex items-center space-x-3 py-2">
        <button 
          onClick={() => router.push('/')}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="text-[16px] font-extrabold text-foreground font-heading">Central Financeira</h1>
      </header>

      {/* Lucro Acumulado */}
      <section className="bg-card border border-border rounded-[20px] p-5 shadow-premium text-center space-y-2">
        <span className="text-[10px] font-black text-muted uppercase tracking-wider block">Lucro Líquido Acumulado</span>
        <div className={`text-[32px] font-black tracking-tight font-heading ${stats.netProfit >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
          R$ {stats.netProfit.toFixed(2).replace('.', ',')}
        </div>
        <div className="flex justify-center space-x-4 text-[11px] font-bold text-muted pt-2 border-t border-border/60">
          <span className="flex items-center space-x-1">
            <TrendingUp size={12} className="text-[#1DB96B]" />
            <span>R$ {stats.totalGains.toFixed(0)} ganhos</span>
          </span>
          <span>·</span>
          <span className="flex items-center space-x-1">
            <TrendingDown size={12} className="text-red-500" />
            <span>R$ {stats.totalExpenses.toFixed(0)} gastos</span>
          </span>
        </div>
      </section>

      {/* Lucros por período */}
      <section className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-[20px] p-3 text-center shadow-sm">
          <span className="text-[9px] font-bold text-muted uppercase block">Hoje</span>
          <span className={`text-[14px] font-black mt-1 block font-heading ${stats.todayNetProfit >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
            R$ {stats.todayNetProfit.toFixed(0)}
          </span>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3 text-center shadow-sm">
          <span className="text-[9px] font-bold text-muted uppercase block">Semana</span>
          <span className={`text-[14px] font-black mt-1 block font-heading ${stats.weekNetProfit >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
            R$ {stats.weekNetProfit.toFixed(0)}
          </span>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3 text-center shadow-sm">
          <span className="text-[9px] font-bold text-muted uppercase block">Mês</span>
          <span className={`text-[14px] font-black mt-1 block font-heading ${stats.monthNetProfit >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
            R$ {stats.monthNetProfit.toFixed(0)}
          </span>
        </div>
      </section>

      {/* Indicadores */}
      <section className="grid grid-cols-2 gap-2">
        <div className="bg-card border border-border rounded-[20px] p-3.5 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-card-secondary flex items-center justify-center text-muted">
            <Clock size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted uppercase block">Média/Hora</span>
            <span className="text-[14px] font-black text-foreground font-heading">R$ {stats.avgHourlyEarnings.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3.5 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-card-secondary flex items-center justify-center text-muted">
            <Route size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted uppercase block">Lucro/Km</span>
            <span className="text-[14px] font-black text-foreground font-heading">R$ {stats.profitPerKm.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3.5 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-card-secondary flex items-center justify-center text-muted">
            <Package size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted uppercase block">Entregas</span>
            <span className="text-[14px] font-black text-foreground font-heading">{stats.deliveriesCount}</span>
          </div>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3.5 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-card-secondary flex items-center justify-center text-muted">
            <Route size={18} />
          </div>
          <div>
            <span className="text-[9px] font-bold text-muted uppercase block">Km Rodados</span>
            <span className="text-[14px] font-black text-foreground font-heading">{stats.totalDistance.toFixed(0)} km</span>
          </div>
        </div>
      </section>

      {/* Combustível */}
      <section className="bg-card border border-border rounded-[20px] p-4 space-y-2.5 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-muted">
            <Fuel size={14} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Combustível</span>
          </div>
          <span className="text-[13px] font-black text-foreground font-heading">{stats.fuelPercentage.toFixed(1).replace('.', ',')}% do faturamento</span>
        </div>
        <div className="w-full bg-card-secondary h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${stats.fuelPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-muted">
          <span>R$ {stats.fuelExpenses.toFixed(2).replace('.', ',')} combustível</span>
          <span>R$ {stats.totalGains.toFixed(2).replace('.', ',')} faturamento bruto</span>
        </div>
      </section>

      {/* Metas */}
      <section className="bg-card border border-border rounded-[20px] p-4 space-y-3 shadow-sm">
        <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">Metas</span>
        {[
          { label: 'Diária', ratio: goalRatio, color: 'bg-emerald-500' },
          { label: 'Semanal', ratio: weeklyGoalRatio, color: 'bg-blue-500' },
          { label: 'Mensal', ratio: monthlyGoalRatio, color: 'bg-purple-500' },
        ].map((goal) => (
          <div key={goal.label} className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-foreground">
              <span>{goal.label}</span>
              <span>{goal.ratio.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-card-secondary h-1.5 rounded-full overflow-hidden">
              <div className={`h-full ${goal.color} rounded-full transition-all duration-500`} style={{ width: `${goal.ratio}%` }} />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
