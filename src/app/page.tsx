'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEntries } from '@/hooks/useEntries';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useFinancialStats } from '@/hooks/useFinancialStats';
import { Fuel, TrendingUp, TrendingDown, ArrowRight, Eye, EyeOff, PlusCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
      fetchRecentEntries(50);
    }
  }, [user, fetchRecentEntries]);

  const stats = useFinancialStats(entries);

  // Period stats mapping
  const currentPeriod = {
    hoje: { gains: stats.todayGains, expenses: stats.todayExpenses, net: stats.todayNetProfit, label: 'Hoje' },
    semana: { gains: stats.weekGains, expenses: stats.weekExpenses, net: stats.weekNetProfit, label: 'Esta Semana' },
    mes: { gains: stats.monthGains, expenses: stats.monthExpenses, net: stats.monthNetProfit, label: 'Este Mês' }
  }[activeTab];

  // Recharts Chart Data
  const chartData = [
    { name: 'Ganhos', value: currentPeriod.gains, color: '#10B981' },
    { name: 'Gastos', value: currentPeriod.expenses, color: '#EF4444' }
  ];

  return (
    <div className="space-y-3 pb-28 pt-1 px-4 animate-fade-in-up">
      <DashboardHeader />

      {/* Resumo Financeiro com Tabs */}
      <section className="bg-card border border-border rounded-[20px] shadow-premium card-premium p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-extrabold text-foreground uppercase tracking-wider">Fluxo de Caixa</span>
          <button 
            onClick={toggleShowAmount}
            className="p-1.5 text-muted hover:text-foreground rounded-xl transition-colors cursor-pointer"
          >
            {showAmount ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

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
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-card-secondary/40 rounded-xl p-3 text-center border border-border/20">
            <span className="text-[8px] font-extrabold text-muted block uppercase tracking-wider mb-1 flex items-center justify-center space-x-1">
              <TrendingUp size={9} className="text-[#10B981]" />
              <span>Ganhos</span>
            </span>
            <span className="text-[14px] font-black text-[#10B981] block font-heading">
              {showAmount ? `R$ ${currentPeriod.gains.toFixed(0)}` : 'R$ ••••'}
            </span>
          </div>
          <div className="bg-card-secondary/40 rounded-xl p-3 text-center border border-border/20">
            <span className="text-[8px] font-extrabold text-muted block uppercase tracking-wider mb-1 flex items-center justify-center space-x-1">
              <TrendingDown size={9} className="text-[#EF4444]" />
              <span>Gastos</span>
            </span>
            <span className="text-[14px] font-black text-[#EF4444] block font-heading">
              {showAmount ? `R$ ${currentPeriod.expenses.toFixed(0)}` : 'R$ ••••'}
            </span>
          </div>
          <div className="bg-card-secondary/40 rounded-xl p-3 text-center border border-border/20">
            <span className="text-[8px] font-extrabold text-muted block uppercase tracking-wider mb-1">Saldo</span>
            <span className={`text-[14px] font-black block font-heading ${currentPeriod.net >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>
              {showAmount ? `R$ ${currentPeriod.net.toFixed(0)}` : 'R$ ••••'}
            </span>
          </div>
        </div>

        {/* Fuel Expense details */}
        {stats.fuelExpenses > 0 && (
          <div className="bg-card-secondary/30 rounded-xl p-2.5 flex items-center justify-between border border-border/20 text-[11px] font-bold">
            <div className="flex items-center space-x-1.5 text-muted">
              <Fuel size={12} />
              <span>Combustível acumulado</span>
            </div>
            <div className="text-right">
              <span className="text-foreground font-black">R$ {stats.fuelExpenses.toFixed(0)}</span>
              <span className="text-muted/75 font-semibold text-[9px] ml-1">({stats.fuelPercentage.toFixed(0)}% do bruto)</span>
            </div>
          </div>
        )}
      </section>

      {/* Gráfico Comparativo */}
      {(currentPeriod.gains > 0 || currentPeriod.expenses > 0) && (
        <section className="bg-card border border-border rounded-[20px] shadow-premium card-premium p-4 space-y-3">
          <span className="text-[12px] font-extrabold text-foreground uppercase tracking-wider block">Ganhos x Gastos ({currentPeriod.label})</span>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']}
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={14}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Últimos Lançamentos */}
      <section className="bg-card border border-border rounded-[20px] shadow-premium card-premium p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-extrabold text-foreground uppercase tracking-wider">Últimos Lançamentos</span>
          <button 
            onClick={() => router.push('/lancamentos')}
            className="text-[11px] text-primary font-black uppercase flex items-center space-x-1 hover:underline cursor-pointer"
          >
            <span>Ver todos</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center py-6 text-muted text-[11px] font-bold">
              Nenhum lançamento registrado.
            </div>
          ) : (
            entries.slice(0, 5).map((entry) => {
              const dateObj = new Date(entry.date);
              const timeString = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const dateString = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              const isGain = entry.type === 'gain';

              return (
                <div key={entry.id} className="flex items-center justify-between bg-card-secondary/40 border border-border/30 rounded-xl p-3 hover:bg-card-secondary/60 transition-colors">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-2 h-2 rounded-full ${isGain ? 'bg-[#10B981]' : 'bg-red-500'}`} />
                    <div>
                      <span className="text-[12px] font-extrabold text-foreground block capitalize leading-tight">
                        {entry.description || (isGain ? 'Ganho' : 'Despesa')}
                      </span>
                      <span className="text-[9px] text-muted font-semibold block leading-none mt-1">
                        {dateString} às {timeString}
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

      {/* Botão de Atalho para Novo Lançamento */}
      <div className="pt-2">
        <button
          onClick={() => router.push('/lancamentos?new=true')}
          className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3.5 rounded-[20px] transition-all active:scale-[0.98] text-[14px] flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
        >
          <PlusCircle size={16} />
          <span>Novo Lançamento</span>
        </button>
      </div>
    </div>
  );
}
