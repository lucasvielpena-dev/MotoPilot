'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEntries } from '@/hooks/useEntries';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useFinancialStats } from '@/hooks/useFinancialStats';
import { useGoals } from '@/hooks/useGoals';
import { Fuel, TrendingUp, TrendingDown, ArrowRight, Target, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { entries, fetchRecentEntries } = useEntries();
  const { dailyGoal, weeklyGoal, monthlyGoal, fetchGoal, updateGoal, updateGoalDirect } = useGoals();
  
  const [showAmount, setShowAmount] = useState(true);
  const [activeTab, setActiveTab] = useState<'hoje' | 'semana' | 'mes'>('hoje');

  // Goals Modal States
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newGoalValue, setNewGoalValue] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

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
      fetchGoal();
    }
  }, [user, fetchRecentEntries, fetchGoal]);

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

  // Goals completion calculations
  const dailyProgress = dailyGoal > 0 ? Math.min((stats.todayNetProfit / dailyGoal) * 100, 100) : 0;
  const weeklyProgress = weeklyGoal > 0 ? Math.min((stats.weekNetProfit / weeklyGoal) * 100, 100) : 0;
  const monthlyProgress = monthlyGoal > 0 ? Math.min((stats.monthNetProfit / monthlyGoal) * 100, 100) : 0;

  // Open goal adjustment modal
  const openGoalModal = (type: 'daily' | 'weekly' | 'monthly', currentVal: number) => {
    setSelectedGoalType(type);
    setNewGoalValue(String(currentVal));
    setIsGoalModalOpen(true);
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newGoalValue);
    if (isNaN(val) || val <= 0) return;

    setSavingGoal(true);
    if (selectedGoalType === 'daily') {
      await updateGoal(val);
    } else {
      await updateGoalDirect(selectedGoalType, val);
    }
    setSavingGoal(false);
    setIsGoalModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-28 pt-1 px-4 w-full max-w-md mx-auto animate-fade-in-up">
      <DashboardHeader 
        showAmount={showAmount} 
        onToggleShowAmount={toggleShowAmount} 
        onAddClick={handleAddClick} 
        onLogoutClick={handleLogout} 
      />

      {/* Resumo Financeiro com Tabs */}
      <section className="bg-card border border-border rounded-[24px] shadow-premium card-premium p-4.5 space-y-4">
        {/* Tab Selector */}
        <div className="flex bg-card-secondary/80 p-0.5 rounded-xl border border-border">
          {(['hoje', 'semana', 'mes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer capitalize ${
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
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-card-secondary/40 rounded-xl p-3 text-center border border-border/20">
            <span className="text-[10px] font-extrabold text-muted block uppercase tracking-wider mb-1 flex items-center justify-center space-x-1">
              <TrendingUp size={11} className="text-[#10B981]" />
              <span>Ganhos</span>
            </span>
            <span className="text-base font-black text-[#10B981] block font-heading">
              {showAmount ? `R$ ${currentPeriod.gains.toFixed(0)}` : 'R$ •••'}
            </span>
          </div>
          <div className="bg-card-secondary/40 rounded-xl p-3 text-center border border-border/20">
            <span className="text-[10px] font-extrabold text-muted block uppercase tracking-wider mb-1 flex items-center justify-center space-x-1">
              <TrendingDown size={11} className="text-[#EF4444]" />
              <span>Gastos</span>
            </span>
            <span className="text-base font-black text-[#EF4444] block font-heading">
              {showAmount ? `R$ ${currentPeriod.expenses.toFixed(0)}` : 'R$ •••'}
            </span>
          </div>
          <div className="bg-card-secondary/40 rounded-xl p-3 text-center border border-border/20">
            <span className="text-[10px] font-extrabold text-muted block uppercase tracking-wider mb-1">Saldo</span>
            <span className={`text-base font-black block font-heading ${currentPeriod.net >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
              {showAmount ? `R$ ${currentPeriod.net.toFixed(0)}` : 'R$ •••'}
            </span>
          </div>
        </div>

        {/* Indicador de Saúde Financeira Horizontal Integrado */}
        {currentPeriod.gains > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/30">
            <div className="flex justify-between items-center text-[10px] font-extrabold text-muted uppercase tracking-wider">
              <span>Comprometimento de Gastos</span>
              <span className="text-foreground">{expenseRatio.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-card-secondary h-2.5 rounded-full overflow-hidden border border-border/40">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${healthColor}`}
                style={{ width: `${Math.min(expenseRatio, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Fuel Expense details */}
        {stats.fuelExpenses > 0 && (
          <div className="bg-card-secondary/30 rounded-xl px-3 py-2 flex items-center justify-between border border-border/20 text-xs font-semibold text-muted">
            <div className="flex items-center space-x-1.5">
              <Fuel size={13} />
              <span>Combustível acumulado</span>
            </div>
            <div>
              <span className="text-foreground font-black">R$ {stats.fuelExpenses.toFixed(0)}</span>
              <span className="text-muted/75 text-[10px] ml-1">({stats.fuelPercentage.toFixed(0)}%)</span>
            </div>
          </div>
        )}
      </section>

      {/* Seção de Metas Financeiras (Lucro Líquido) */}
      <section className="bg-card border border-border rounded-[24px] shadow-premium card-premium p-4.5 space-y-3.5">
        <div className="flex items-center space-x-2 border-b border-border/30 pb-2">
          <Target size={16} className="text-primary" />
          <span className="text-[12px] font-extrabold text-foreground uppercase tracking-wider">Metas Financeiras (Saldo)</span>
        </div>

        <div className="space-y-3">
          {/* Meta Diária */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-foreground">Diária</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-muted">R$ {stats.todayNetProfit.toFixed(0)} / <span className="font-bold text-foreground">R$ {dailyGoal.toFixed(0)}</span></span>
                <button 
                  onClick={() => openGoalModal('daily', dailyGoal)}
                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Ajustar
                </button>
              </div>
            </div>
            <div className="w-full bg-card-secondary h-2 rounded-full overflow-hidden border border-border/40">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${dailyProgress}%` }} />
            </div>
          </div>

          {/* Meta Semanal */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-foreground">Semanal</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-muted">R$ {stats.weekNetProfit.toFixed(0)} / <span className="font-bold text-foreground">R$ {weeklyGoal.toFixed(0)}</span></span>
                <button 
                  onClick={() => openGoalModal('weekly', weeklyGoal)}
                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Ajustar
                </button>
              </div>
            </div>
            <div className="w-full bg-card-secondary h-2 rounded-full overflow-hidden border border-border/40">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${weeklyProgress}%` }} />
            </div>
          </div>

          {/* Meta Mensal */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-foreground">Mensal</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-muted">R$ {stats.monthNetProfit.toFixed(0)} / <span className="font-bold text-foreground">R$ {monthlyGoal.toFixed(0)}</span></span>
                <button 
                  onClick={() => openGoalModal('monthly', monthlyGoal)}
                  className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                >
                  Ajustar
                </button>
              </div>
            </div>
            <div className="w-full bg-card-secondary h-2 rounded-full overflow-hidden border border-border/40">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${monthlyProgress}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Lançamentos Recentes */}
      <section className="bg-card border border-border rounded-[24px] shadow-premium card-premium p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-extrabold text-foreground uppercase tracking-wider">Lançamentos Recentes</span>
          <button 
            onClick={() => router.push('/lancamentos')}
            className="text-[11px] text-primary font-black uppercase flex items-center space-x-1 hover:underline cursor-pointer"
          >
            <span>Ver tudo</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-6 text-muted text-xs font-bold">
              Nenhum lançamento registrado.
            </div>
          ) : (
            entries.slice(0, 3).map((entry) => {
              const dateObj = new Date(entry.date);
              const timeString = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const dateString = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const isGain = entry.type === 'gain';

              return (
                <div key={entry.id} className="flex items-center justify-between bg-card-secondary/40 border border-border/20 rounded-xl px-3.5 py-2.5 hover:bg-card-secondary/60 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className={`w-2 h-2 rounded-full ${isGain ? 'bg-[#10B981]' : 'bg-red-500'}`} />
                    <div>
                      <span className="text-[13px] font-extrabold text-foreground block capitalize leading-tight">
                        {entry.description || (isGain ? 'Ganho' : 'Despesa')}
                      </span>
                      <span className="text-[10px] text-muted font-semibold block leading-none mt-1">
                        {dateString} às {timeString}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[13px] font-black font-heading ${isGain ? 'text-[#10B981]' : 'text-red-500'}`}>
                    {isGain ? '+' : '-'} R$ {entry.amount.toFixed(0)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Meta Edit Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl p-5 space-y-4 animate-fade-in-up">
            <div className="text-center space-y-1">
              <h3 className="text-[16px] font-extrabold text-foreground font-heading uppercase tracking-wide">
                {selectedGoalType === 'daily' ? 'Ajustar Meta Diária' : selectedGoalType === 'weekly' ? 'Ajustar Meta Semanal' : 'Ajustar Meta Mensal'}
              </h3>
              <p className="text-xs text-muted font-semibold">Defina o saldo líquido ideal a ser acumulado.</p>
            </div>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div className="relative">
                <input 
                  type="number" 
                  step="0.01" 
                  required 
                  value={newGoalValue} 
                  onChange={e => setNewGoalValue(e.target.value)}
                  className="w-full py-3 px-4 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-lg font-black text-foreground text-center" 
                  placeholder="0,00" 
                  autoFocus 
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-3 bg-card-secondary hover:bg-card-secondary/80 text-foreground font-bold rounded-2xl border border-border active:scale-[0.98] transition-all text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingGoal}
                  className="flex-1 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl active:scale-[0.98] transition-all text-xs cursor-pointer shadow-sm flex items-center justify-center space-x-1 disabled:opacity-50"
                >
                  {savingGoal ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Check size={14} />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
