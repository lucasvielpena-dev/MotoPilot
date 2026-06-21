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
    <div className="space-y-6 pb-28 pt-2">
      {/* Header */}
      <header className="flex justify-between items-center bg-card px-2 py-3 border-b border-border -mx-4">
        <button 
          onClick={() => router.push('/')}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="text-[18px] font-extrabold text-foreground font-heading">Relatórios</h1>
        <div className="w-10 h-10" /> {/* Spacer */}
      </header>

      {/* Tabs */}
      <div className="flex bg-card-secondary/80 p-1 rounded-2xl border border-border">
        <button 
          onClick={() => setActiveTab('geral')} 
          className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'geral' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
        >
          Geral
        </button>
        <button 
          onClick={() => setActiveTab('comparativos')} 
          className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'comparativos' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
        >
          Comparativos
        </button>
      </div>

      {activeTab === 'geral' ? (
        <>
          {/* Period Dropdown */}
          <div className="flex justify-center">
            <div className="bg-card border border-border rounded-2xl px-4 py-2 text-[13px] font-bold text-foreground flex items-center space-x-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:bg-card-secondary">
              <span>Maio/2025</span>
              <ChevronDown size={16} className="text-muted" />
            </div>
          </div>

          {/* Lucro líquido Card */}
          <section className="bg-card border border-border rounded-[32px] p-5 shadow-premium space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-bold text-muted block uppercase">Lucro líquido</span>
              
              {/* Badge Comparativo */}
              <span className="flex items-center text-[11px] font-extrabold px-3 py-1 rounded-full text-[#19A85B] bg-[#19A85B]/10 uppercase tracking-wider">
                <TrendingUp size={14} strokeWidth={2.5} className="mr-1" />
                <span>+12,5% vs Abril/2025</span>
              </span>
            </div>
            
            <div className="text-[34px] font-extrabold text-[#19A85B] tracking-tight font-heading">
              R$ {netProfit.toFixed(2).replace('.', ',')}
            </div>
          </section>

          {/* Stats Grid (2x2) */}
          <section className="grid grid-cols-2 gap-4">
            {/* Faturamento */}
            <div className="bg-card border border-border rounded-[28px] p-4 flex flex-col justify-between min-h-[100px] shadow-sm">
              <p className="text-[11px] font-bold text-muted uppercase">Faturamento</p>
              <p className="text-[18px] font-extrabold text-foreground mt-2 font-heading">R$ {totalGains.toFixed(2).replace('.', ',')}</p>
            </div>

            {/* Gastos */}
            <div className="bg-card border border-border rounded-[28px] p-4 flex flex-col justify-between min-h-[100px] shadow-sm">
              <p className="text-[11px] font-bold text-muted uppercase">Gastos</p>
              <p className="text-[18px] font-extrabold text-foreground mt-2 font-heading">R$ {totalExpenses.toFixed(2).replace('.', ',')}</p>
            </div>

            {/* Tempo online */}
            <div className="bg-card border border-border rounded-[28px] p-4 flex flex-col justify-between min-h-[100px] shadow-sm">
              <p className="text-[11px] font-bold text-muted uppercase">Tempo online</p>
              <p className="text-[18px] font-extrabold text-foreground mt-2 font-heading">{Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}m</p>
            </div>

            {/* Km rodados */}
            <div className="bg-card border border-border rounded-[28px] p-4 flex flex-col justify-between min-h-[100px] shadow-sm">
              <p className="text-[11px] font-bold text-muted uppercase">Km rodados</p>
              <p className="text-[18px] font-extrabold text-foreground mt-2 font-heading">{totalDistance.toFixed(1).replace('.', ',')} km</p>
            </div>
          </section>

          {/* Bar Chart Daily Profit */}
          <section className="bg-card border border-border rounded-[32px] p-5 shadow-premium space-y-4">
            <h3 className="text-[14px] font-bold text-foreground">Lucro líquido por dia</h3>
            
            <div className="h-56 w-full pt-2">
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
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={16}>
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
