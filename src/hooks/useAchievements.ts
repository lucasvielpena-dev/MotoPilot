'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import type { Entry } from './useEntries';
import type { Journey } from './useJourneys';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 to 100
  targetVal: string;
}

export function useAchievements(entries: Entry[], historicalJourneys: Journey[], netProfitToday: number, dailyGoal: number) {
  const [unlockedIds, setUnlockedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('motopilot_unlocked_achievements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  const unlockAchievement = useCallback((id: string, list: Achievement[]) => {
    setUnlockedIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('motopilot_unlocked_achievements', JSON.stringify(updated));
      
      // Encontra a conquista recém-desbloqueada para animação
      const ach = list.find(a => a.id === id);
      if (ach) {
        setNewlyUnlocked({ ...ach, unlocked: true });
      }
      return updated;
    });
  }, []);

  const achievementsList = useMemo(() => {
    const list: Achievement[] = [];
    
    // 1. Primeira Meta Diária Concluída
    const goalCompleted = netProfitToday >= dailyGoal && dailyGoal > 0;
    list.push({
      id: 'first_goal',
      title: 'Primeira de Muitas',
      description: 'Conclua sua primeira meta diária.',
      icon: '🏆',
      unlocked: unlockedIds.includes('first_goal') || goalCompleted,
      progress: goalCompleted ? 100 : Math.min(100, Math.round((netProfitToday / (dailyGoal || 1)) * 100)),
      targetVal: `R$ ${netProfitToday.toFixed(0)} / R$ ${dailyGoal.toFixed(0)}`
    });

    // 2. 100 Entregas
    const totalRides = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + (curr.rides_count || 1), 0);
    list.push({
      id: 'deliveries_100',
      title: 'Entregador de Elite',
      description: 'Realize 100 entregas no total.',
      icon: '📦',
      unlocked: unlockedIds.includes('deliveries_100') || totalRides >= 100,
      progress: Math.min(100, Math.round((totalRides / 100) * 100)),
      targetVal: `${totalRides} / 100 ent`
    });

    // 3. 1.000 Km Rodados
    const totalKm = historicalJourneys.reduce((acc, curr) => acc + (curr.distance_km || 0), 0);
    list.push({
      id: 'km_1000',
      title: 'Viajante das Ruas',
      description: 'Alcance 1.000 km rodados nas jornadas.',
      icon: '🏍️',
      unlocked: unlockedIds.includes('km_1000') || totalKm >= 1000,
      progress: Math.min(100, Math.round((totalKm / 1000) * 100)),
      targetVal: `${totalKm.toFixed(0)} / 1.000 km`
    });

    // 4. Maior Lucro Diário
    const dailyProfits: Record<string, number> = {};
    entries.forEach(e => {
      const dateStr = new Date(e.date).toISOString().split('T')[0];
      const amount = e.type === 'gain' ? e.amount : -e.amount;
      dailyProfits[dateStr] = (dailyProfits[dateStr] || 0) + amount;
    });
    const maxProfit = Object.values(dailyProfits).reduce((max, val) => Math.max(max, val), 0);
    const dayOfGold = maxProfit >= 300;
    list.push({
      id: 'gold_day',
      title: 'Dia de Ouro',
      description: 'Fature mais de R$ 300,00 líquidos em um único dia.',
      icon: '💰',
      unlocked: unlockedIds.includes('gold_day') || dayOfGold,
      progress: Math.min(100, Math.round((maxProfit / 300) * 100)),
      targetVal: `R$ ${maxProfit.toFixed(0)} / R$ 300`
    });

    // 5. Sequência de dias trabalhando
    const workedDays = new Set(
      entries.map(e => new Date(e.date).toISOString().split('T')[0])
    );
    // Calcular a maior sequência consecutiva
    let maxStreak = 0;
    if (workedDays.size > 0) {
      const sortedDates = Array.from(workedDays).map(d => new Date(d).getTime()).sort();
      let currentStreak = 1;
      maxStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const diffDays = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
        if (diffDays <= 1.1) { // Aceitar diferença de até 1 dia e pouco por causa de timezone
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 1;
        }
      }
    }
    const streakUnlocked = maxStreak >= 5;
    list.push({
      id: 'streak_5',
      title: 'Sem Parar',
      description: 'Registre lançamentos por 5 dias seguidos.',
      icon: '🔥',
      unlocked: unlockedIds.includes('streak_5') || streakUnlocked,
      progress: Math.min(100, Math.round((maxStreak / 5) * 100)),
      targetVal: `${maxStreak} / 5 dias`
    });

    // 6. Plataforma de Ouro (Mestre das Plataformas)
    const platformKnown = ['ifood', 'aiqfome', 'uber', '99', 'indrive', 'lalamove', 'shopee', 'loggi'];
    const platformsUsed = new Set<string>();
    entries.filter(e => e.type === 'gain').forEach(e => {
      const desc = (e.description || '').toLowerCase();
      const matched = platformKnown.find(p => desc.includes(p));
      if (matched) platformsUsed.add(matched);
    });
    const platformCount = platformsUsed.size;
    const platformsUnlocked = platformCount >= 3;
    list.push({
      id: 'multi_platform',
      title: 'Mestre das Plataformas',
      description: 'Fature em pelo menos 3 plataformas de entregas.',
      icon: '🌟',
      unlocked: unlockedIds.includes('multi_platform') || platformsUnlocked,
      progress: Math.min(100, Math.round((platformCount / 3) * 100)),
      targetVal: `${platformCount} / 3 plat`
    });

    // 7. Primeiro Abastecimento
    const hasFuelExpense = entries.some(e => {
      if (e.type !== 'expense') return false;
      const d = (e.description || '').toLowerCase();
      return d.includes('combustível') || d.includes('gasolina') || d.includes('abastecer');
    });
    list.push({
      id: 'fuel_first',
      title: 'Tanque Cheio',
      description: 'Registre o primeiro gasto com combustível.',
      icon: '⛽',
      unlocked: unlockedIds.includes('fuel_first') || hasFuelExpense,
      progress: hasFuelExpense ? 100 : 0,
      targetVal: hasFuelExpense ? 'Concluído' : 'Não iniciado'
    });

    return list;
  }, [entries, historicalJourneys, netProfitToday, dailyGoal, unlockedIds]);

  // Checa e ativa novas conquistas que foram desbloqueadas
  useEffect(() => {
    achievementsList.forEach((ach) => {
      if (ach.unlocked && !unlockedIds.includes(ach.id)) {
        unlockAchievement(ach.id, achievementsList);
      }
    });
  }, [achievementsList, unlockedIds, unlockAchievement]);

  const clearNewUnlockedAlert = () => {
    setNewlyUnlocked(null);
  };

  return {
    achievements: achievementsList,
    totalUnlocked: achievementsList.filter(a => a.unlocked).length,
    totalCount: achievementsList.length,
    newlyUnlocked,
    clearNewUnlockedAlert
  };
}
