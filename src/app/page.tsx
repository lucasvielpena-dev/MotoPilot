'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEntries } from '@/hooks/useEntries';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useFinancialStats } from '@/hooks/useFinancialStats';
import { Fuel, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { entries, fetchRecentEntries } = useEntries();
  
  const [showAmount, setShowAmount] = useState(true);
  const [activeTab, setActiveTab] = useState<'hoje' | 'semana' | 'mes'>('hoje');

  useEffect(() => {
    const saved = localStorage.getItem('motopilot_show_amount') !== 'false';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowAmount(saved);
  }, []);

  const toggleShowAmount = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !showAmount;
    setShowAmount(next);
    localStorage.setItem('motopilot_show_amount', String(next));
  }, [showAmount]);

  useEffect(() => {
    if (user) {
      fetchRecentEntries(30);
    }
  }, [user, fetchRecentEntries]);

  const stats = useFinancialStats(entries);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/login');
  }, [router]);

  const handleAddClick = useCallback(() => {
    router.push('/lancamentos?new=true');
  }, [router]);

  // Period stats mapping
  const currentPeriod = {
    hoje: { gains: stats.todayGains, expenses: stats.todayExpenses, net: stats.todayNetProfit, label: 'Hoje' },
    semana: { gains: stats.weekGains, expenses: stats.weekExpenses, net: stats.weekNetProfit, label: 'Semana' },
    mes: { gains: stats.monthGains, expenses: stats.monthExpenses, net: stats.monthNetProfit, label: 'Mês' }
  }[activeTab];

  // Financial health ratio: expenses / gains
  const expenseRatio = currentPeriod.gains > 0 ? (currentPeriod.expenses / currentPeriod.gains) * 100 : 0;
  const healthColor = expenseRatio > 75 ? 'bg-red-500' : expenseRatio > 40 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-3 pb-24 pt-1 px-4 max-w-md mx-auto animate-fade-in-up">
      <DashboardHeader 
        showAmount={showAmount} 
        onToggleShowAmount={toggleShowAmount} 
        onAddClick={handleAddClick} 
        onLogoutClick={handleLogout} 
      />

      {/* Resumo Financeiro com Tabs */}
      <section className="bg-card border border-border rounded-[20px] shadow-premium card-premium p-3.5 space-y-3.5">
        {/* Tab Selector */}
        <div className="flex bg-card-secondary/80 p-0.5 rounded-xl border border-border">
          {(['hoje', 'semana', 'mes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer capitalize ${
                activeTab === tab 
                  ? 'bg-card text-foreground border border-border shadow-sm' 
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {tab === 'hoje' ? 'Hoje' : tab === 'semana' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>

        {/* Totais Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card-secondary/40 rounded-xl p-2.5 text-center border border-border/20">
            <span className="text-[8px] font-extrabold text-muted block uppercase tracking-wider mb-0.5 flex items-center justify-center space-x-1">
              <TrendingUp size={9} className="text-[#10B981]" />
              <span>Ganhos</span>
            </span>
            <span className="text-[13px] font-black text-[#10B981] block font-heading">
              {showAmount ? `R$ ${currentPeriod.gains.toFixed(0)}` : 'R$ ••'}
            </span>
          </div>
          <div className="bg-card-secondary/40 rounded-xl p-2.5 text-center border border-border/20">
            <span className="text-[8px] font-extrabold text-muted block uppercase tracking-wider mb-0.5 flex items-center justify-center space-x-1">
              <TrendingDown size={9} className="text-[#EF4444]" />
              <span>Gastos</span>
            </span>
            <span className="text-[13px] font-black text-[#EF4444] block font-heading">
              {showAmount ? `R$ ${currentPeriod.expenses.toFixed(0)}` : 'R$ ••'}
            </span>
          </div>
          <div className="bg-card-secondary/40 rounded-xl p-2.5 text-center border border-border/20">
            <span className="text-[8px] font-extrabold text-muted block uppercase tracking-wider mb-0.5">Saldo</span>
            <span className={`text-[13px] font-black block font-heading ${currentPeriod.net >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
              {showAmount ? `R$ ${currentPeriod.net.toFixed(0)}` : 'R$ ••'}
            </span>
          </div>
        </div>

        {/* Indicador de Saúde Financeira Horizontal Integrado */}
        {currentPeriod.gains > 0 && (
          <div className="space-y-1 pt-1.5 border-t border-border/30">
            <div className="flex justify-between items-center text-[9px] font-extrabold text-muted uppercase tracking-wider">
              <span>Eficiência Financeira</span>
              <span className="text-foreground">{expenseRatio.toFixed(0)}% comprometido</span>
            </div>
            <div className="w-full bg-card-secondary/80 h-2 rounded-full overflow-hidden border border-border/40">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${healthColor}`}
                style={{ width: `${Math.min(expenseRatio, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Fuel Expense details */}
        {stats.fuelExpenses > 0 && (
          <div className="bg-card-secondary/25 rounded-lg px-2.5 py-1.5 flex items-center justify-between border border-border/20 text-[10px] font-bold text-muted">
            <div className="flex items-center space-x-1">
              <Fuel size={11} />
              <span>Combustível acumulado</span>
            </div>
            <div>
              <span className="text-foreground font-black">R$ {stats.fuelExpenses.toFixed(0)}</span>
              <span className="text-muted/75 text-[9px] ml-1">({stats.fuelPercentage.toFixed(0)}% do total)</span>
            </div>
          </div>
        )}
      </section>

      {/* Últimos Lançamentos (Máximo de 3 para economizar espaço de tela) */}
      <section className="bg-card border border-border rounded-[20px] shadow-premium card-premium p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-extrabold text-foreground uppercase tracking-wider">Lançamentos Recentes</span>
          <button 
            onClick={() => router.push('/lancamentos')}
            className="text-[10px] text-primary font-black uppercase flex items-center space-x-1 hover:underline cursor-pointer"
          >
            <span>Ver tudo</span>
            <ArrowRight size={11} />
          </button>
        </div>

        <div className="space-y-1.5">
          {entries.length === 0 ? (
            <div className="text-center py-4 text-muted text-[10px] font-bold">
              Nenhum lançamento registrado.
            </div>
          ) : (
            entries.slice(0, 3).map((entry) => {
              const dateObj = new Date(entry.date);
              const timeString = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const dateString = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const isGain = entry.type === 'gain';

              return (
                <div key={entry.id} className="flex items-center justify-between bg-card-secondary/40 border border-border/20 rounded-xl px-3 py-2 hover:bg-card-secondary/60 transition-colors">
                  <div className="flex items-center space-x-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isGain ? 'bg-[#10B981]' : 'bg-red-500'}`} />
                    <div>
                      <span className="text-[11.5px] font-extrabold text-foreground block capitalize leading-tight">
                        {entry.description || (isGain ? 'Ganho' : 'Despesa')}
                      </span>
                      <span className="text-[8.5px] text-muted font-semibold block leading-none mt-0.5">
                        {dateString} às {timeString}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-black font-heading ${isGain ? 'text-[#10B981]' : 'text-red-500'}`}>
                    {isGain ? '+' : '-'} R$ {entry.amount.toFixed(0)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
