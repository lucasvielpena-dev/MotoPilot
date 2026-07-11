'use client';

import { useMemo } from 'react';
import type { Entry } from './useEntries';
import type { Journey } from './useJourneys';

export type TimeSlot = 'Manhã' | 'Tarde' | 'Noite' | 'Madrugada';

export interface InsightCardData {
  title: string;
  value: string;
  description: string;
  type: 'growth' | 'info' | 'success' | 'warning' | 'fuel';
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
    const fuelPercentage = totalGains > 0 ? (fuelExpenses / totalGains) * 100 : 0;

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

    // 8. Turno Ideal baseado nas jornadas de histórico
    interface ShiftStats {
      totalGains: number;
      totalExpenses: number;
      totalNetProfit: number;
      totalRides: number;
      totalHours: number;
      journeyCount: number;
    }

    const shiftStats: Record<TimeSlot, ShiftStats> = {
      'Manhã': { totalGains: 0, totalExpenses: 0, totalNetProfit: 0, totalRides: 0, totalHours: 0, journeyCount: 0 },
      'Tarde': { totalGains: 0, totalExpenses: 0, totalNetProfit: 0, totalRides: 0, totalHours: 0, journeyCount: 0 },
      'Noite': { totalGains: 0, totalExpenses: 0, totalNetProfit: 0, totalRides: 0, totalHours: 0, journeyCount: 0 },
      'Madrugada': { totalGains: 0, totalExpenses: 0, totalNetProfit: 0, totalRides: 0, totalHours: 0, journeyCount: 0 }
    };

    historicalJourneys.forEach((j) => {
      if (!j.started_at) return;
      const hour = new Date(j.started_at).getHours();
      let slot: TimeSlot;
      if (hour >= 6 && hour < 12) {
        slot = 'Manhã';
      } else if (hour >= 12 && hour < 18) {
        slot = 'Tarde';
      } else if (hour >= 18 && hour < 24) {
        slot = 'Noite';
      } else {
        slot = 'Madrugada';
      }

      const jGains = entries.filter(e => e.journey_id === j.id && e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
      const jExpenses = entries.filter(e => e.journey_id === j.id && e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
      const jNet = jGains - jExpenses;
      const jRides = entries.filter(e => e.journey_id === j.id && e.type === 'gain').reduce((acc, curr) => acc + (curr.rides_count || 1), 0);
      const jHours = (j.duration_minutes || 0) / 60;

      shiftStats[slot].totalGains += jGains;
      shiftStats[slot].totalExpenses += jExpenses;
      shiftStats[slot].totalNetProfit += jNet;
      shiftStats[slot].totalRides += jRides;
      shiftStats[slot].totalHours += jHours;
      shiftStats[slot].journeyCount += 1;
    });

    let bestSlotLabel: TimeSlot | null = null;
    let maxAvgNetProfit = -Infinity;

    Object.entries(shiftStats).forEach(([key, stats]) => {
      const label = key as TimeSlot;
      if (stats.journeyCount > 0) {
        const avgNet = stats.totalNetProfit / stats.journeyCount;
        if (avgNet > maxAvgNetProfit) {
          maxAvgNetProfit = avgNet;
          bestSlotLabel = label;
        }
      }
    });

    const turnoIdeal = bestSlotLabel || 'Aguardando dados para calcular.';
    const turnoIdealStats = bestSlotLabel ? {
      label: bestSlotLabel,
      totalGains: shiftStats[bestSlotLabel as TimeSlot].totalGains,
      netProfit: shiftStats[bestSlotLabel as TimeSlot].totalNetProfit,
      ridesCount: shiftStats[bestSlotLabel as TimeSlot].totalRides,
      avgHourlyRate: shiftStats[bestSlotLabel as TimeSlot].totalHours > 0 ? shiftStats[bestSlotLabel as TimeSlot].totalGains / shiftStats[bestSlotLabel as TimeSlot].totalHours : 0
    } : null;

    const bestSlot = bestSlotLabel ? {
      label: bestSlotLabel,
      avg: maxAvgNetProfit,
      total: shiftStats[bestSlotLabel as TimeSlot].totalGains
    } : null;

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

      // Turno Ideal
      if (bestSlotLabel) {
        insightsList.push({
          title: 'Turno Ideal',
          value: bestSlotLabel,
          description: 'Melhor lucro líquido médio',
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
      turnoIdeal,
      turnoIdealStats,
      shiftStats,
      // Insights
      insights: insightsList,
      hasData: entries.length > 0
    };
  }, [entries, historicalJourneys, activeJourney, dailyGoal]);
}
