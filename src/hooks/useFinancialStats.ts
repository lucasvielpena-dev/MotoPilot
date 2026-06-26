'use client';

import { useMemo } from 'react';
import type { Entry } from './useEntries';
import type { Journey } from './useJourneys';

export type TimeSlot = 'Manhã' | 'Almoço' | 'Tarde' | 'Noite' | 'Madrugada';

export interface InsightCardData {
  title: string;
  value: string;
  description: string;
  type: 'growth' | 'info' | 'success' | 'warning' | 'fuel' | 'hourly';
}

export interface PlatformStat {
  id: string;
  name: string;
  total: number;
  count: number;
  rides: number;
  km: number;
  avg: number;
  avgPerRide: number;
  avgPerKm: number;
}

const PLATFORM_NAMES: Record<string, string> = {
  ifood: 'iFood',
  aiqfome: 'Aiqfome',
  uber: 'Uber',
  '99': '99',
  indrive: 'inDrive',
  lalamove: 'Lalamove',
  shopee: 'Shopee',
  loggi: 'Loggi'
};


const TIME_SLOTS = [
  { label: 'Manhã' as TimeSlot, range: [6, 12] },
  { label: 'Almoço' as TimeSlot, range: [12, 14] },
  { label: 'Tarde' as TimeSlot, range: [14, 18] },
  { label: 'Noite' as TimeSlot, range: [18, 23] },
  { label: 'Madrugada' as TimeSlot, range: [23, 6] }
];

export function useFinancialStats(
  entries: Entry[],
  historicalJourneys: Journey[],
  activeJourney: Journey | null,
  dailyGoal = 250
) {
  return useMemo(() => {
    // 1. Ganhos e Gastos Gerais
    const gainsList = entries.filter((e) => e.type === 'gain');
    const expensesList = entries.filter((e) => e.type === 'expense');

    const totalGains = gainsList.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expensesList.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalGains - totalExpenses;
    const deliveriesCount = gainsList.reduce((acc, curr) => acc + (curr.rides_count || 1), 0);

    // 2. Distâncias e Tempos
    const completedDistance = (historicalJourneys || []).reduce((acc, curr) => acc + (curr.distance_km || 0), 0);
    const completedDurationMinutes = (historicalJourneys || []).reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);
    
    // Mapeamento de km_total inseridos manualmente nas corridas (se houver)
    const manualKm = gainsList.reduce((acc, curr) => acc + (curr.km_total || 0), 0);
    const totalDistance = completedDistance > 0 ? completedDistance : manualKm;

    // Tempo total de jornada (incluindo ativa se houver)
    const totalCompletedHours = completedDurationMinutes / 60;
    const activeJourneyHours = activeJourney
      // eslint-disable-next-line react-hooks/purity
      ? (Date.now() - new Date(activeJourney.started_at).getTime()) / 3600000
      : 0;
    const totalHours = totalCompletedHours + activeJourneyHours;

    // 3. Médias e Indicadores
    const avgHourlyEarnings = totalHours > 0 ? totalGains / totalHours : 0;
    const avgEarningsPerKm = totalDistance > 0 ? totalGains / totalDistance : 0;
    const profitPerKm = totalDistance > 0 ? netProfit / totalDistance : 0;

    // 4. Combustível
    const fuelExpenses = expensesList
      .filter((e) => {
        const d = (e.description || '').toLowerCase();
        return d.includes('combustível') || d.includes('gasolina') || d.includes('abastecer');
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    const fuelPercentage = totalExpenses > 0 ? (fuelExpenses / totalExpenses) * 100 : 0;

    // 5. Filtros Temporais (Hoje, Semana, Mês)
    const now = new Date();
    
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Hoje
    const todayEntries = entries.filter((e) => new Date(e.date) >= startOfToday);
    const todayGains = todayEntries.filter((e) => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
    const todayExpenses = todayEntries.filter((e) => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const todayNetProfit = todayGains - todayExpenses;
    const todayDeliveries = todayEntries.filter((e) => e.type === 'gain').reduce((acc, curr) => acc + (curr.rides_count || 1), 0);

    // Ontem (para insights comparativos)
    const yesterdayEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d >= startOfYesterday && d < startOfToday;
    });
    const yesterdayGains = yesterdayEntries.filter((e) => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
    const yesterdayExpenses = yesterdayEntries.filter((e) => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const yesterdayNetProfit = yesterdayGains - yesterdayExpenses;

    // Semana
    const weekEntries = entries.filter((e) => new Date(e.date) >= sevenDaysAgo);
    const weekGains = weekEntries.filter((e) => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
    const weekExpenses = weekEntries.filter((e) => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const weekNetProfit = weekGains - weekExpenses;

    // Mês
    const monthEntries = entries.filter((e) => new Date(e.date) >= thirtyDaysAgo);
    const monthGains = monthEntries.filter((e) => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
    const monthExpenses = monthEntries.filter((e) => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const monthNetProfit = monthGains - monthExpenses;

    // 6. Plataforma mais lucrativa
    const platformTotals: Record<string, { total: number; count: number; rides: number; km: number }> = {};
    const platformKnown = ['ifood', 'aiqfome', 'uber', '99', 'indrive', 'lalamove', 'shopee', 'loggi'];

    gainsList.forEach((e) => {
      const desc = (e.description || '').toLowerCase();
      const matched = platformKnown.find((p) => desc.includes(p));
      if (matched) {
        if (!platformTotals[matched]) {
          platformTotals[matched] = { total: 0, count: 0, rides: 0, km: 0 };
        }
        platformTotals[matched].total += e.amount;
        platformTotals[matched].count += 1;
        platformTotals[matched].rides += e.rides_count || 1;
        platformTotals[matched].km += e.km_total || 0;
      }
    });

    const platformStats: PlatformStat[] = Object.entries(platformTotals)
      .map(([id, data]) => ({
        id,
        name: PLATFORM_NAMES[id] || id,
        ...data,
        avg: data.count > 0 ? data.total / data.count : 0,
        avgPerRide: data.rides > 0 ? data.total / data.rides : 0,
        avgPerKm: data.km > 0 ? data.total / data.km : 0
      }))
      .sort((a, b) => b.total - a.total);

    const topPlatform = platformStats.length > 0 ? platformStats[0] : null;

    // Plataforma mais lucrativa HOJE especificamente
    const todayPlatformTotals: Record<string, number> = {};
    todayEntries.filter((e) => e.type === 'gain').forEach((e) => {
      const desc = (e.description || '').toLowerCase();
      const matched = platformKnown.find((p) => desc.includes(p));
      if (matched) {
        todayPlatformTotals[matched] = (todayPlatformTotals[matched] || 0) + e.amount;
      }
    });
    const todayPlatformEntries = Object.entries(todayPlatformTotals).sort((a, b) => b[1] - a[1]);
    const todayTopPlatform = todayPlatformEntries.length > 0 ? todayPlatformEntries[0] : null;

    // 7. Melhor dia da semana
    const weekdayTotals: Record<number, number> = {};
    const weekdayCount: Record<number, number> = {};
    gainsList.forEach((e) => {
      const day = new Date(e.date).getDay();
      weekdayTotals[day] = (weekdayTotals[day] || 0) + e.amount;
      weekdayCount[day] = (weekdayCount[day] || 0) + 1;
    });

    const bestWeekday = Object.entries(weekdayTotals).reduce<{ day: number; avg: number; total: number } | null>(
      (best, [dayStr, total]) => {
        const day = Number(dayStr);
        const count = weekdayCount[day] || 1;
        const avg = total / count;
        if (!best || avg > best.avg) return { day, avg, total };
        return best;
      },
      null
    );

    // 8. Melhor horário
    const slotTotals: Record<TimeSlot, number> = {
      Manhã: 0,
      Almoço: 0,
      Tarde: 0,
      Noite: 0,
      Madrugada: 0
    };
    const slotCount: Record<TimeSlot, number> = {
      Manhã: 0,
      Almoço: 0,
      Tarde: 0,
      Noite: 0,
      Madrugada: 0
    };

    gainsList.forEach((e) => {
      const hour = new Date(e.date).getHours();
      let slotLabel: TimeSlot = 'Madrugada';
      for (const slot of TIME_SLOTS) {
        if (slot.label === 'Madrugada') {
          if (hour >= 23 || hour < 6) {
            slotLabel = 'Madrugada';
            break;
          }
        } else {
          if (hour >= slot.range[0] && hour < slot.range[1]) {
            slotLabel = slot.label;
            break;
          }
        }
      }
      slotTotals[slotLabel] += e.amount;
      slotCount[slotLabel] += 1;
    });

    const bestSlot = Object.entries(slotTotals).reduce<{ label: TimeSlot; avg: number; total: number } | null>(
      (best, [labelStr, total]) => {
        const label = labelStr as TimeSlot;
        const count = slotCount[label] || 1;
        const avg = total / count;
        if (!best || avg > best.avg) return { label, avg, total };
        return best;
      },
      null
    );

    // 9. Geração de Insights Inteligentes
    const insightsList: InsightCardData[] = [];
    if (entries.length > 0) {
      // Diferença de ontem para hoje
      if (todayGains > 0 && yesterdayGains > 0) {
        const pctDiff = ((todayGains - yesterdayGains) / yesterdayGains) * 100;
        if (pctDiff > 0) {
          insightsList.push({
            title: 'Faturamento',
            value: `+${pctDiff.toFixed(0)}%`,
            description: 'Mais que ontem',
            type: 'growth'
          });
        } else if (pctDiff < 0) {
          insightsList.push({
            title: 'Faturamento',
            value: `-${Math.abs(pctDiff).toFixed(0)}%`,
            description: 'Menos que ontem',
            type: 'warning'
          });
        }
      }

      // Melhor horário
      if (bestSlot && bestSlot.total > 0) {
        insightsList.push({
          title: 'Turno Ideal',
          value: bestSlot.label,
          description: 'Melhor média horária',
          type: 'info'
        });
      }

      // Plataforma mais lucrativa hoje vs geral
      if (todayTopPlatform) {
        insightsList.push({
          title: 'Melhor App',
          value: PLATFORM_NAMES[todayTopPlatform[0]] || todayTopPlatform[0],
          description: 'Líder de ganhos hoje',
          type: 'success'
        });
      } else if (topPlatform) {
        insightsList.push({
          title: 'Melhor App',
          value: topPlatform.name,
          description: 'Líder de ganhos histórico',
          type: 'success'
        });
      }

      // Custo do combustível recuperado
      if (todayGains > fuelExpenses && fuelExpenses > 0) {
        insightsList.push({
          title: 'Combustível',
          value: 'Recuperado',
          description: 'Custos pagos hoje',
          type: 'fuel'
        });
      }

      // Percentual de combustível sobre gastos
      if (fuelPercentage > 0) {
        insightsList.push({
          title: 'Combustível',
          value: `${fuelPercentage.toFixed(0)}%`,
          description: 'Das despesas totais',
          type: 'fuel'
        });
      }

      // Progresso da meta diária
      if (todayNetProfit < dailyGoal) {
        const remaining = dailyGoal - todayNetProfit;
        insightsList.push({
          title: 'Meta Diária',
          value: `Faltam R$ ${remaining.toFixed(0)}`,
          description: 'Para atingir a meta',
          type: 'warning'
        });
      } else {
        insightsList.push({
          title: 'Meta Diária',
          value: 'Concluída!',
          description: 'Excelente trabalho hoje! 🎉',
          type: 'success'
        });
      }

      // Média por km ou por hora excelente
      if (avgHourlyEarnings > 30) {
        insightsList.push({
          title: 'Ganhos/Hora',
          value: `R$ ${avgHourlyEarnings.toFixed(0)}/h`,
          description: 'Desempenho excelente',
          type: 'hourly'
        });
      }
    }

    return {
      totalGains,
      totalExpenses,
      netProfit,
      deliveriesCount,
      totalCompletedHours,
      totalHours,
      avgHourlyEarnings,
      avgEarningsPerKm,
      profitPerKm,
      fuelExpenses,
      fuelPercentage,
      totalDistance,
      // Temporais
      todayGains,
      todayExpenses,
      todayNetProfit,
      todayDeliveries,
      yesterdayGains,
      yesterdayNetProfit,
      weekGains,
      weekExpenses,
      weekNetProfit,
      monthGains,
      monthExpenses,
      monthNetProfit,
      // Rankings e Horários
      platformStats,
      topPlatform,
      bestWeekday,
      bestSlot,
      // Insights
      insights: insightsList,
      hasData: entries.length > 0
    };
  }, [entries, historicalJourneys, activeJourney, dailyGoal]);
}
