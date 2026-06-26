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
import { InsightsSection } from '@/components/dashboard/InsightsSection';

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
    <div className="space-y-3 pb-28 pt-2 px-4 animate-fade-in-up">
      <DashboardHeader />

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

      <InsightsSection
        insights={stats.insights}
        hasData={stats.hasData}
      />
    </div>
  );
}
