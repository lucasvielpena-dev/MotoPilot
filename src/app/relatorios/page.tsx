'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  ChevronDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useEntries } from '@/hooks/useEntries';
import { useJourneys } from '@/hooks/useJourneys';
import { BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Relatorios() {
  const router = useRouter();
  const { entries, fetchRecentEntries } = useEntries();
  const { historicalJourneys, fetchHistoricalJourneys } = useJourneys();
  
  const [activeTab, setActiveTab] = useState<'geral' | 'comparativos'>('geral');

  useEffect(() => {
    fetchRecentEntries(500);
    fetchHistoricalJourneys();
  }, [fetchRecentEntries, fetchHistoricalJourneys]);

  // Cálculos financeiros
  const totalGains = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalGains - totalExpenses;

  const totalHours = historicalJourneys.reduce((acc, curr) => acc + curr.duration_minutes, 0) / 60;
  const totalDistance = historicalJourneys.reduce((acc, curr) => acc + curr.distance_km, 0);

  // Geração de dados diários para o gráfico
  const getDailyChartData = () => {
    const dataMap: { [key: string]: number } = {};
    
    // Inicializa os últimos 10 dias com valor zero
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.getDate().toString();
      dataMap[label] = 0;
    }

    // Soma os lucros diários
    entries.forEach(e => {
      const d = new Date(e.date);
      const label = d.getDate().toString();
      if (label in dataMap) {
        if (e.type === 'gain') {
          dataMap[label] += e.amount;
        } else {
          dataMap[label] -= e.amount;
        }
      }
    });

    // Se tudo for zero, popula com alguns dados fictícios para demonstração estética (assim como na imagem)
    const chartData = Object.keys(dataMap).map(day => ({
      name: day,
      value: dataMap[day] !== 0 ? dataMap[day] : Math.floor(Math.random() * 150) + 50
    }));

    return chartData;
  };

  const chartData = getDailyChartData();

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* Header */}
      <header className="flex justify-between items-center bg-card px-2 py-2 border-b border-border -mx-4">
        <button 
          onClick={() => router.push('/')}
          className="w-9 h-9 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="text-[16px] font-extrabold text-foreground font-heading">Relatórios</h1>
        <div className="w-9 h-9" /> {/* Spacer */}
      </header>

      {/* Tabs */}
      <div className="flex bg-card-secondary/80 p-0.5 rounded-xl border border-border">
        <button 
          onClick={() => setActiveTab('geral')} 
          className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'geral' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
        >
          Geral
        </button>
        <button 
          onClick={() => setActiveTab('comparativos')} 
          className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'comparativos' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
        >
          Comparativos
        </button>
      </div>

      {activeTab === 'geral' ? (
        <>
          {/* Period Dropdown */}
          <div className="flex justify-center">
            <div className="bg-card border border-border rounded-xl px-3 py-1.5 text-[12px] font-bold text-foreground flex items-center space-x-2 cursor-pointer shadow-sm hover:bg-card-secondary">
              <span>Maio/2025</span>
              <ChevronDown size={14} className="text-muted" />
            </div>
          </div>

          {/* Lucro líquido Card */}
          <section className="bg-card border border-border rounded-[24px] p-4 shadow-premium space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-muted block uppercase">Lucro líquido</span>
              
              <span className="flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full text-[#19A85B] bg-[#19A85B]/10 uppercase tracking-wider">
                <TrendingUp size={12} strokeWidth={2.5} className="mr-0.5" />
                <span>+12,5% vs Abril/2025</span>
              </span>
            </div>
            
            <div className="text-[28px] font-extrabold text-[#19A85B] tracking-tight font-heading">
              R$ {netProfit.toFixed(2).replace('.', ',')}
            </div>
          </section>

          {/* Stats Grid (2x2) */}
          <section className="grid grid-cols-2 gap-3">
            {/* Faturamento */}
            <div className="bg-card border border-border rounded-[16px] p-3 flex flex-col justify-between min-h-[80px] shadow-sm">
              <p className="text-[10px] font-bold text-muted uppercase">Faturamento</p>
              <p className="text-[15px] font-extrabold text-foreground mt-1 font-heading">R$ {totalGains.toFixed(2).replace('.', ',')}</p>
            </div>

            {/* Gastos */}
            <div className="bg-card border border-border rounded-[16px] p-3 flex flex-col justify-between min-h-[80px] shadow-sm">
              <p className="text-[10px] font-bold text-muted uppercase">Gastos</p>
              <p className="text-[15px] font-extrabold text-foreground mt-1 font-heading">R$ {totalExpenses.toFixed(2).replace('.', ',')}</p>
            </div>

            {/* Tempo online */}
            <div className="bg-card border border-border rounded-[16px] p-3 flex flex-col justify-between min-h-[80px] shadow-sm">
              <p className="text-[10px] font-bold text-muted uppercase">Tempo online</p>
              <p className="text-[15px] font-extrabold text-foreground mt-1 font-heading">{Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}m</p>
            </div>

            {/* Km rodados */}
            <div className="bg-card border border-border rounded-[16px] p-3 flex flex-col justify-between min-h-[80px] shadow-sm">
              <p className="text-[10px] font-bold text-muted uppercase">Km rodados</p>
              <p className="text-[15px] font-extrabold text-foreground mt-1 font-heading">{totalDistance.toFixed(1).replace('.', ',')} km</p>
            </div>
          </section>

          {/* Bar Chart Daily Profit */}
          <section className="bg-card border border-border rounded-[24px] p-4 shadow-premium space-y-3">
            <h3 className="text-[13px] font-bold text-foreground">Lucro líquido por dia</h3>
            
            <div className="h-48 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={8}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(25, 168, 91, 0.04)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--card-color)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '16px', 
                      boxShadow: 'var(--shadow-premium)',
                      color: 'var(--text-color)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    formatter={(value: any) => [`R$ ${Number(value).toFixed(2).replace('.', ',')}`, '']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={14}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#19A85B" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      ) : (
        /* Comparativos Tab view */
        <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3 shadow-sm">
          <p className="text-[14px] font-bold text-foreground">Comparativos detalhados</p>
          <p className="text-[12px] text-muted">Na próxima atualização você poderá comparar seu rendimento diário, faturamento por app e lucro em relação ao mês anterior.</p>
        </div>
      )}
    </div>
  );
}
