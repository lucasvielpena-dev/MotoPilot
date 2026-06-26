'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Clock, 
  Route, 
  Package, 
  Fuel, 
  Target 
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[14px] text-muted font-bold">Carregando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28 pt-2 animate-fade-in-up">
      {/* Header */}
      <header className="flex justify-between items-center bg-card px-2 py-3 border-b border-border -mx-4">
        <button 
          onClick={() => router.push('/')}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="text-[16px] font-extrabold text-foreground font-heading">Central Financeira</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Caixa Resumo do Lucro Total Acumulado */}
      <section className="bg-card border border-border rounded-[24px] p-5 shadow-premium text-center space-y-2">
        <span className="text-[11px] font-black text-muted uppercase tracking-wider block">LUCRO LÍQUIDO ACUMULADO</span>
        <div className={`text-[34px] font-black tracking-tight font-heading ${stats.netProfit >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
          R$ {stats.netProfit.toFixed(2).replace('.', ',')}
        </div>
        <div className="flex justify-center space-x-4 text-[11px] font-bold text-muted pt-2 border-t border-border/60">
          <span className="flex items-center space-x-1"><TrendingUp size={12} className="text-[#1DB96B]" /> <span>Faturamento: <strong>R$ {stats.totalGains.toFixed(0)}</strong></span></span>
          <span>·</span>
          <span className="flex items-center space-x-1"><TrendingDown size={12} className="text-red-500" /> <span>Gastos: <strong>R$ {stats.totalExpenses.toFixed(0)}</strong></span></span>
        </div>
      </section>

      {/* 2. Grid de Lucros Períodos */}
      <section className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-2xl p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] font-bold text-muted uppercase">Hoje</span>
          <span className={`text-[14px] font-black mt-1 font-heading ${stats.todayNetProfit >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
            R$ {stats.todayNetProfit.toFixed(0)}
          </span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] font-bold text-muted uppercase">Esta Semana</span>
          <span className={`text-[14px] font-black mt-1 font-heading ${stats.weekNetProfit >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
            R$ {stats.weekNetProfit.toFixed(0)}
          </span>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 flex flex-col justify-between shadow-sm">
          <span className="text-[9px] font-bold text-muted uppercase">Este Mês</span>
          <span className={`text-[14px] font-black mt-1 font-heading ${stats.monthNetProfit >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
            R$ {stats.monthNetProfit.toFixed(0)}
          </span>
        </div>
      </section>

      {/* 3. Indicadores Operacionais */}
      <h3 className="text-[11px] font-extrabold text-muted uppercase px-1 tracking-wider mt-4">Indicadores Operacionais</h3>
      <section className="grid grid-cols-2 gap-3">
        {/* Média por Hora */}
        <div className="bg-card border border-border rounded-[20px] p-4 flex items-center space-x-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-card-secondary flex items-center justify-center text-muted">
            <Clock size={18} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Média por Hora</span>
            <span className="text-[14px] font-black text-foreground font-heading">R$ {stats.avgHourlyEarnings.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* Lucro por Km */}
        <div className="bg-card border border-border rounded-[20px] p-4 flex items-center space-x-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-card-secondary flex items-center justify-center text-muted">
            <Route size={18} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Lucro por Km</span>
            <span className="text-[14px] font-black text-foreground font-heading">R$ {stats.profitPerKm.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>

        {/* Total Entregas */}
        <div className="bg-card border border-border rounded-[20px] p-4 flex items-center space-x-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-card-secondary flex items-center justify-center text-muted">
            <Package size={18} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Entregas Realizadas</span>
            <span className="text-[14px] font-black text-foreground font-heading">{stats.deliveriesCount}</span>
          </div>
        </div>

        {/* Km Rodados */}
        <div className="bg-card border border-border rounded-[20px] p-4 flex items-center space-x-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-card-secondary flex items-center justify-center text-muted">
            <Route size={18} />
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Km Rodados</span>
            <span className="text-[14px] font-black text-foreground font-heading">{stats.totalDistance.toFixed(0)} km</span>
          </div>
        </div>
      </section>

      {/* 4. Combustível */}
      <h3 className="text-[11px] font-extrabold text-muted uppercase px-1 tracking-wider mt-4">Custos de Combustível</h3>
      <section className="bg-card border border-border rounded-[20px] p-4 space-y-2.5 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 text-muted">
            <Fuel size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Despesa de Combustível</span>
          </div>
          <span className="text-[14px] font-black text-foreground font-heading">{stats.fuelPercentage.toFixed(0)}% do gasto</span>
        </div>
        
        <div className="w-full bg-card-secondary h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${stats.fuelPercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-bold text-muted">
          <span>R$ {stats.fuelExpenses.toFixed(2).replace('.', ',')} em combustível</span>
          <span>R$ {stats.totalExpenses.toFixed(2).replace('.', ',')} gastos totais</span>
        </div>
      </section>

      {/* 5. Evolução de Metas */}
      <h3 className="text-[11px] font-extrabold text-muted uppercase px-1 tracking-wider mt-4">Evolução de Metas</h3>
      <section className="bg-card border border-border rounded-[20px] p-4 space-y-3.5 shadow-sm">
        {/* Diária */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-foreground">
            <span>Meta Diária de Hoje</span>
            <span>{goalRatio.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-card-secondary h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${goalRatio}%` }}
            />
          </div>
        </div>

        {/* Semanal */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-foreground">
            <span>Meta Semanal</span>
            <span>{weeklyGoalRatio.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-card-secondary h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${weeklyGoalRatio}%` }}
            />
          </div>
        </div>

        {/* Mensal */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-bold text-foreground">
            <span>Meta Mensal</span>
            <span>{monthlyGoalRatio.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-card-secondary h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${monthlyGoalRatio}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
