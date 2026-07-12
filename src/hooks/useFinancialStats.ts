'use client';

import { useMemo } from 'react';
import type { Entry } from './useEntries';

export interface PlatformStat {
  id: string;
  name: string;
  total: number;
  count: number;
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

export function useFinancialStats(entries: Entry[]) {
  return useMemo(() => {
    // 1. Ganhos e Gastos Gerais
    const gainsList = entries.filter((e) => e.type === 'gain');
    const expensesList = entries.filter((e) => e.type === 'expense');

    const totalGains = gainsList.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = expensesList.reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalGains - totalExpenses;

    // 2. Combustível
    const fuelExpenses = expensesList
      .filter((e) => {
        const d = (e.description || '').toLowerCase();
        return d.includes('combustível') || d.includes('gasolina') || d.includes('abastecer');
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    const fuelPercentage = totalGains > 0 ? (fuelExpenses / totalGains) * 100 : 0;

    // 3. Filtros Temporais (Hoje, Semana, Mês)
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

    // Ontem
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

    // 4. Plataforma mais lucrativa
    const platformTotals: Record<string, { total: number; count: number }> = {};
    const platformKnown = ['ifood', 'aiqfome', 'uber', '99', 'indrive', 'lalamove', 'shopee', 'loggi'];

    gainsList.forEach((e) => {
      const desc = (e.description || '').toLowerCase();
      const matched = platformKnown.find((p) => desc.includes(p));
      if (matched) {
        if (!platformTotals[matched]) {
          platformTotals[matched] = { total: 0, count: 0 };
        }
        platformTotals[matched].total += e.amount;
        platformTotals[matched].count += 1;
      }
    });

    const platformStats: PlatformStat[] = Object.entries(platformTotals)
      .map(([id, data]) => ({
        id,
        name: PLATFORM_NAMES[id] || id,
        ...data
      }))
      .sort((a, b) => b.total - a.total);

    const topPlatform = platformStats.length > 0 ? platformStats[0] : null;

    return {
      totalGains,
      totalExpenses,
      netProfit,
      fuelExpenses,
      fuelPercentage,
      // Temporais
      todayGains,
      todayExpenses,
      todayNetProfit,
      yesterdayGains,
      yesterdayNetProfit,
      weekGains,
      weekExpenses,
      weekNetProfit,
      monthGains,
      monthExpenses,
      monthNetProfit,
      platformStats,
      topPlatform,
      hasData: entries.length > 0
    };
  }, [entries]);
}
