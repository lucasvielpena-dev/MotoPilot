'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bike, 
  X, 
  CircleUserRound, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';
import { useGoals } from '@/hooks/useGoals';
import { supabase } from '@/lib/supabase/client';

// Componentes do Dashboard
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfitCard } from '@/components/dashboard/ProfitCard';
import { JourneyCard } from '@/components/dashboard/JourneyCard';
import { InsightsSection } from '@/components/dashboard/InsightsSection';

// Hook de cálculos centralizados
import { useFinancialStats } from '@/hooks/useFinancialStats';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Custom hooks
  const { 
    activeJourney, 
    liveDistance, 
    startJourney, 
    finishJourney, 
    historicalJourneys, 
    fetchHistoricalJourneys 
  } = useJourneys();
  
  const { entries, fetchRecentEntries } = useEntries();
  const { dailyGoal, weeklyGoal, monthlyGoal, fetchGoal } = useGoals();
  
  // States do Dashboard
  const [elapsedTime, setElapsedTime] = useState('0h 0m');
  const [showAmount, setShowAmount] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Inicializa visualização do montante salvo
  useEffect(() => {
    const saved = localStorage.getItem('motopilot_show_amount') !== 'false';
    setShowAmount(saved);
  }, []);

  const toggleShowAmount = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !showAmount;
    setShowAmount(next);
    localStorage.setItem('motopilot_show_amount', String(next));
  }, [showAmount]);

  // Carrega dados iniciais
  useEffect(() => {
    if (user) {
      fetchRecentEntries(50);
      fetchGoal();
      fetchHistoricalJourneys();
    }
  }, [user, fetchRecentEntries, fetchGoal, fetchHistoricalJourneys]);

  // Cronômetro do tempo online
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJourney) {
      const startDate = new Date(activeJourney.started_at);

      interval = setInterval(() => {
        const start = startDate.getTime();
        const now = Date.now();
        const diff = now - start;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setElapsedTime(`${h}h ${m}m`);
      }, 1000);
    } else {
      setElapsedTime('0h 0m');
    }
    return () => clearInterval(interval);
  }, [activeJourney]);

  // Consome as estatísticas centralizadas
  const stats = useFinancialStats(entries, historicalJourneys || [], activeJourney, dailyGoal);

  // Lida com início de jornada com transição suave
  const handleStartJourney = useCallback(async () => {
    setIsTransitioning(true);
    await startJourney();
    setIsTransitioning(false);
  }, [startJourney]);

  // Lida com finalização de jornada redirecionando ao resumo detalhado
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="space-y-4 pb-28 pt-1 animate-fade-in-up">
      {/* Header Refatorado */}
      <DashboardHeader onOpenMenu={() => setIsMenuOpen(true)} />

      {/* 1. Controle de Jornada — Ação Principal */}
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

      {/* 3. Insights Inteligentes */}
      <InsightsSection
        insights={stats.insights}
        hasData={stats.hasData}
      />

      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />
          
          <div className="relative w-72 max-w-xs bg-card border-r border-border h-full shadow-2xl flex flex-col p-6 space-y-6 animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div className="flex items-center space-x-2">
                <Bike size={22} strokeWidth={3} className="text-primary-muted" />
                <span className="text-[16px] font-extrabold text-foreground font-heading">Menu MotoPilot</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-muted hover:text-foreground cursor-pointer"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between py-4">
              <div className="space-y-1">
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/perfil'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-muted rounded-xl hover:bg-card-secondary hover:text-foreground transition-colors text-left cursor-pointer"
                >
                  <CircleUserRound size={20} strokeWidth={3} className="text-foreground/60" />
                  <span>Meu Perfil</span>
                </button>
                
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/relatorios'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-muted rounded-xl hover:bg-card-secondary hover:text-foreground transition-colors text-left cursor-pointer"
                >
                  <Settings size={20} strokeWidth={3} className="text-foreground/60" />
                  <span>Configurações</span>
                </button>
              </div>

              <button 
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-red-500/60 rounded-xl hover:bg-red-500/10 hover:text-red-500/80 transition-colors text-left cursor-pointer border border-red-500/10 bg-red-500/5"
              >
                <LogOut size={20} strokeWidth={3} />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
