'use client';

import { useState, useEffect } from 'react';
import { ChartBar, TrendUp, TrendDown } from '@phosphor-icons/react';
import { useEntries } from '@/hooks/useEntries';
import { BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Relatorios() {
  const { entries, fetchRecentEntries } = useEntries();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    // Para simplificar no MVP, buscamos os 100 últimos lançamentos
    fetchRecentEntries(100);
  }, [fetchRecentEntries]);

  // Filtragem local baseada no período (simulação simples)
  const now = new Date();
  const filteredEntries = entries.filter(e => {
    const d = new Date(e.date);
    if (period === 'week') {
      return (now.getTime() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000;
    } else if (period === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else {
      return d.getFullYear() === now.getFullYear();
    }
  });

  const totalGains = filteredEntries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = filteredEntries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalGains - totalExpenses;
  const isPositive = netProfit >= 0;

  const chartData = [
    { name: 'Ganhos', value: totalGains, fill: '#3DDB61' },
    { name: 'Despesas', value: totalExpenses, fill: '#EF4444' }
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="mb-6">
        <h1 className="text-[20px] font-semibold tracking-tight text-[var(--color-foreground)]">Relatórios</h1>
        <p className="text-[14px] text-[var(--color-muted)] mt-1">Desempenho financeiro</p>
      </header>

      {/* Tabs / Filtros */}
      <div className="flex bg-[var(--color-card)] p-1.5 rounded-[20px] border border-[var(--color-border)]">
        <button onClick={() => setPeriod('week')} className={`flex-1 py-3 text-[14px] font-medium rounded-[14px] transition-colors ${period === 'week' ? 'bg-[var(--color-card-secondary)] text-[var(--color-foreground)] shadow-sm border border-[var(--color-border)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}>Semana</button>
        <button onClick={() => setPeriod('month')} className={`flex-1 py-3 text-[14px] font-medium rounded-[14px] transition-colors ${period === 'month' ? 'bg-[var(--color-card-secondary)] text-[var(--color-foreground)] shadow-sm border border-[var(--color-border)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}>Mês</button>
        <button onClick={() => setPeriod('year')} className={`flex-1 py-3 text-[14px] font-medium rounded-[14px] transition-colors ${period === 'year' ? 'bg-[var(--color-card-secondary)] text-[var(--color-foreground)] shadow-sm border border-[var(--color-border)]' : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'}`}>Ano</button>
      </div>

      {/* Resumo Principal */}
      <section className="card-premium rounded-3xl p-6 relative overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <div className="p-3 bg-[var(--color-primary)]/10 rounded-2xl">
            <ChartBar size={24} className="text-[var(--color-primary)]" />
          </div>
          {/* Badge Comparativo (Mockado para o MVP) */}
          <span className={`flex items-center text-[12px] font-semibold px-3 py-1.5 rounded-full ${isPositive ? 'text-[#3DDB61] bg-[#3DDB61]/10' : 'text-red-500 bg-red-500/10'}`}>
            {isPositive ? <TrendUp size={16} className="mr-1.5" /> : <TrendDown size={16} className="mr-1.5" />}
            {isPositive ? '+12%' : '-5%'} vs anterior
          </span>
        </div>
        
        <p className="text-[16px] font-medium text-[var(--color-muted)] mb-2">Lucro Líquido</p>
        <div className="text-[42px] leading-none font-bold tracking-tight text-[var(--color-foreground)]">
          R$ {netProfit.toFixed(2).replace('.', ',')}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Gráfico Recharts */}
        <section className="md:col-span-2 card-premium rounded-3xl p-6 animate-fade-in-up delay-75">
          <h2 className="text-[16px] font-semibold text-[var(--color-foreground)] mb-6">Receitas x Despesas</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--chart-cursor-fill)' }} 
                  contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '16px', color: 'var(--color-foreground)' }} 
                  formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, '']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Detalhamento */}
        <section className="md:col-span-1 space-y-4">
          <h2 className="text-[20px] font-semibold text-[var(--color-foreground)] px-1">Detalhamento ({period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'})</h2>
          
          <div className="card-premium rounded-3xl p-6 space-y-6 animate-fade-in-up delay-150">
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
              <span className="text-[14px] text-[var(--color-muted)]">Faturamento (Ganhos)</span>
              <span className="text-[15px] font-semibold text-[#22C55E]">R$ {totalGains.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
              <span className="text-[14px] text-[var(--color-muted)]">Total de Despesas</span>
              <span className="text-[15px] font-semibold text-red-500">- R$ {totalExpenses.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-[var(--color-muted)]">Qtd. de Lançamentos</span>
              <span className="text-[15px] font-semibold text-[var(--color-foreground)]">{filteredEntries.length}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
