'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';
import { useGoals } from '@/hooks/useGoals';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfitCard } from '@/components/dashboard/ProfitCard';
import { JourneyCard } from '@/components/dashboard/JourneyCard';
import { Fuel } from 'lucide-react';

import { useFinancialStats } from '@/hooks/useFinancialStats';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { 
    activeJourney, liveDistance, startJourney, finishJourney, 
    historicalJourneys, fetchHistoricalJourneys 
  } = useJourneys();
  
  const { entries, fetchRecentEntries } = useEntries();
  const { dailyGoal, fetchGoal } = useGoals();
  
  const [elapsedTime, setElapsedTime] = useState('0h 0m');
  const [showAmount, setShowAmount] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      fetchRecentEntries(50);
      fetchGoal();
      fetchHistoricalJourneys();
    }
  }, [user, fetchRecentEntries, fetchGoal, fetchHistoricalJourneys]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJourney) {
      const startDate = new Date(activeJourney.started_at);
      interval = setInterval(() => {
        const diff = Date.now() - startDate.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setElapsedTime(`${h}h ${m}m`);
      }, 1000);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedTime('0h 0m');
    }
    return () => clearInterval(interval);
  }, [activeJourney]);

  const stats = useFinancialStats(entries, historicalJourneys || [], activeJourney, dailyGoal);

  const handleStartJourney = useCallback(async () => {
    setIsTransitioning(true);
    await startJourney();
    setIsTransitioning(false);
  }, [startJourney]);

  const handleFinishJourney = useCallback(async () => {
    setIsTransitioning(true);
    const res = await finishJourney();
    setIsTransitioning(false);
    if (res && res.data) {
      router.push(`/jornada/resumo?id=${res.data.id}`);
    } else {
      router.push('/');
    }
  }, [finishJourney, router]);

  return (
    <div className="space-y-2.5 pb-28 pt-1 px-4 animate-fade-in-up">
      <DashboardHeader />

      {/* 1. Jornada */}
      <JourneyCard
        activeJourney={activeJourney}
        elapsedTime={elapsedTime}
        liveDistance={liveDistance}
        avgHourlyEarnings={stats.avgHourlyEarnings}
        deliveriesCount={stats.todayDeliveries}
        isTransitioning={isTransitioning}
        onStartJourney={handleStartJourney}
        onFinishJourney={handleFinishJourney}
      />

      {/* 2. Lucro do Dia */}
      <ProfitCard
        netProfit={stats.todayNetProfit}
        totalGains={stats.todayGains}
        totalExpenses={stats.todayExpenses}
        deliveriesCount={stats.todayDeliveries}
        dailyGoal={dailyGoal}
        showAmount={showAmount}
        onToggleShowAmount={toggleShowAmount}
        hasActiveJourney={!!activeJourney}
      />

      {/* 3. Resumo Financeiro */}
      <section className="bg-card border border-border rounded-[20px] shadow-premium card-premium p-3.5 space-y-2.5 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-extrabold text-foreground uppercase tracking-wider">Resumo Financeiro</span>
          <span className="text-[10px] text-muted font-bold">Histórico Acumulado</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-card-secondary/50 rounded-xl p-2 text-center border border-border/40">
            <span className="text-[8px] font-extrabold text-muted block uppercase tracking-wider">Ganhos Brutos</span>
            <span className="text-[13px] font-black text-[#10B981] block font-heading mt-0.5">
              {showAmount ? `R$ ${stats.totalGains.toFixed(0)}` : 'R$ ••••'}
            </span>
          </div>
          <div className="bg-card-secondary/50 rounded-xl p-2 text-center border border-border/40">
            <span className="text-[8px] font-extrabold text-muted block uppercase tracking-wider">Despesas</span>
            <span className="text-[13px] font-black text-red-500 block font-heading mt-0.5">
              {showAmount ? `R$ ${stats.totalExpenses.toFixed(0)}` : 'R$ ••••'}
            </span>
          </div>
          <div className="bg-card-secondary/50 rounded-xl p-2 text-center border border-border/40">
            <span className="text-[8px] font-extrabold text-muted block uppercase tracking-wider">Lucro Líquido</span>
            <span className={`text-[13px] font-black block font-heading mt-0.5 ${stats.netProfit >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
              {showAmount ? `R$ ${stats.netProfit.toFixed(0)}` : 'R$ ••••'}
            </span>
          </div>
        </div>

        <div className="bg-card-secondary/30 rounded-xl p-2 flex items-center justify-between border border-border/20 text-[11px] font-bold">
          <div className="flex items-center space-x-1.5 text-muted">
            <Fuel size={12} />
            <span>Combustível</span>
          </div>
          <div className="text-right">
            <span className="text-foreground font-black">R$ {stats.fuelExpenses.toFixed(0)}</span>
            <span className="text-muted/75 font-semibold text-[9.5px] ml-1">({stats.fuelPercentage.toFixed(1).replace('.', ',')}% do faturamento)</span>
          </div>
        </div>
      </section>

      {/* 4. Últimos Lançamentos */}
      <section className="bg-card border border-border rounded-[20px] shadow-premium card-premium p-3.5 space-y-2 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-extrabold text-foreground uppercase tracking-wider">Últimos Lançamentos</span>
          <button 
            onClick={() => router.push('/lancamentos')}
            className="text-[10px] text-primary font-black uppercase hover:underline"
          >
            Ver todos
          </button>
        </div>

        <div className="space-y-1.5">
          {entries.length === 0 ? (
            <div className="text-center py-4 text-muted text-[11px] font-bold">
              Nenhum lançamento registrado.
            </div>
          ) : (
            entries.slice(0, 3).map((entry) => {
              const date = new Date(entry.date);
              const timeString = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const isGain = entry.type === 'gain';

              return (
                <div key={entry.id} className="flex items-center justify-between bg-card-secondary/40 border border-border/30 rounded-xl p-2 hover:bg-card-secondary/60 transition-colors">
                  <div className="flex items-center space-x-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isGain ? 'bg-[#10B981]' : 'bg-red-500'}`} />
                    <div>
                      <span className="text-[12px] font-extrabold text-foreground block capitalize leading-tight">
                        {entry.description || (isGain ? 'Ganho' : 'Despesa')}
                      </span>
                      <span className="text-[9px] text-muted font-semibold block leading-none mt-0.5">
                        {timeString}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[12px] font-black font-heading ${isGain ? 'text-[#10B981]' : 'text-red-500'}`}>
                    {isGain ? '+' : '-'} R$ {entry.amount.toFixed(2).replace('.', ',')}
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
