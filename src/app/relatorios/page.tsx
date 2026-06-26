'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, TrendingUp, Clock, Fuel, Trophy, Target
} from 'lucide-react';
import { useEntries } from '@/hooks/useEntries';
import { useJourneys } from '@/hooks/useJourneys';
import { useGoals } from '@/hooks/useGoals';
import { BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PlatformLogo = ({ id, className = 'w-6 h-6' }: { id: string; className?: string }) => {
  switch (id) {
    case 'ifood':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#EA1D2C" />
          <g transform="translate(3.6, 3.6) scale(0.7)">
            <path d="M8.428 1.67c-4.65 0-7.184 4.149-7.184 6.998 0 2.294 2.2 3.299 4.25 3.299l-.006-.006c4.244 0 7.184-3.854 7.184-6.998 0-2.29-2.175-3.293-4.244-3.293zm11.328 0c-4.65 0-7.184 4.149-7.184 6.998 0 2.294 2.2 3.299 4.25 3.299l-.006-.006C21.061 11.96 24 8.107 24 4.963c0-2.29-2.18-3.293-4.244-3.293z" fill="white" />
          </g>
        </svg>
      );
    case 'aiqfome':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#FF0066" />
          <path d="M12 7.5c-1.8 0-3.3 1.3-3.6 3-.1 0-.2-.1-.4-.1-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5h8c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5c-.2 0-.3 0-.4.1-.3-1.7-1.8-3-3.6-3z" fill="white" />
          <circle cx="10" cy="12.5" r="0.8" fill="#FF0066" />
          <circle cx="14" cy="12.5" r="0.8" fill="#FF0066" />
          <path d="M11 14c.3.3.7.3 1 0" stroke="#FF0066" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
      );
    case 'uber':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="black" />
          <g transform="translate(3.6, 3.6) scale(0.7)">
            <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101.826 0 1.562-.316 2.094-.87v.736H6.27V7.97H5.082v4.888c0 1.257-.85 2.106-1.947 2.106-1.11 0-1.946-.827-1.946-2.106V7.971H0zm7.44 0v7.925h1.13v-.725c.521.532 1.257.86 2.06.86a3.006 3.006 0 0 0 3.034-3.01 3.01 3.01 0 0 0-3.033-3.024 2.86 2.86 0 0 0-2.049.861V7.971H7.439zm9.869 2.038c-1.687 0-2.965 1.37-2.965 3 0 1.72 1.334 3.01 3.066 3.01 1.053 0 1.913-.463 2.49-1.233l-.826-.611c-.43.577-.996.847-1.664.847-.973 0-1.753-.7-1.912-1.64h4.697v-.373c0-1.72-1.222-3-2.886-3zm6.295.068c-.634 0-1.098.294-1.381.758v-.713h-1.131v5.774h1.142V12.61c0-.894.544-1.47 1.291-1.47H24v-1.065h-.396zm-6.319.928c.85 0 1.564.588 1.756 1.47H15.52c.203-.882.916-1.47 1.765-1.47zm-6.732.012c1.086 0 1.98.883 1.98 2.004a1.993 1.993 0 0 1-1.98 2.001A1.989 1.989 0 0 1 8.56 13.02a1.99 1.99 0 0 1 1.992-2.004z" fill="white" />
          </g>
        </svg>
      );
    case '99':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#FFB300" />
          <g transform="translate(6, 6) skewX(-10)">
            <path d="M5.5 5.5a2.2 2.2 0 1 1-2.2-2.2A2.2 2.2 0 0 1 5.5 5.5zm-.9 0a1.3 1.3 0 1 0-1.3 1.3A1.3 1.3 0 0 0 4.6 5.5zm.9 0c0 1.8-1.2 4-3 5l-.4-.6c1.4-.9 2.2-2.4 2.2-4.4z" fill="black" />
            <path d="M10.5 5.5a2.2 2.2 0 1 1-2.2-2.2A2.2 2.2 0 0 1 10.5 5.5zm-.9 0a1.3 1.3 0 1 0-1.3 1.3A1.3 1.3 0 0 0 9.6 5.5zm.9 0c0 1.8-1.2 4-3 5l-.4-.6c1.4-.9 2.2-2.4 2.2-4.4z" fill="black" />
          </g>
        </svg>
      );
    case 'indrive':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <circle cx="12" cy="12" r="10" fill="#00E676" />
          <g transform="translate(7.2, 7)">
            <rect x="1" y="4" width="1.6" height="6" rx="0.4" fill="black" />
            <circle cx="1.8" cy="1.8" r="0.9" fill="black" />
            <rect x="4" y="4" width="1.6" height="6" rx="0.4" fill="black" />
            <path d="M4.5 4.8c.8-1 2.2-1 3 0v5.2" stroke="black" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <rect x="6.9" y="5.5" width="1.6" height="4.5" rx="0.4" fill="black" />
          </g>
        </svg>
      );
    case 'lalamove':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#FF6600" />
          <path d="M8 8h2v5h4v2H8V8z" fill="white" />
          <path d="M11 9.5h3.5M11.5 11.5h4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'shopee':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#EE4D2D" />
          <g transform="translate(3.6, 3.6) scale(0.7)">
            <path d="M15.9414 17.9633c.229-1.879-.981-3.077-4.1758-4.0969-1.548-.528-2.277-1.22-2.26-2.1719.065-1.056 1.048-1.825 2.352-1.85a5.2898 5.2898 0 0 1 2.8838.89c.116.072.197.06.263-.039.09-.145.315-.494.39-.62.051-.081.061-.187-.068-.281-.185-.1369-.704-.4149-.983-.5319a6.4697 6.4697 0 0 0-2.5118-.514c-1.909.008-3.4129 1.215-3.5389 2.826-.082 1.1629.494 2.1078 1.73 2.8278.262.152 1.6799.716 2.2438.892 1.774.552 2.695 1.5419 2.478 2.6969-.197 1.047-1.299 1.7239-2.818 1.7439-1.2039-.046-2.2878-.537-3.1278-1.19l-.141-.11c-.104-.08-.218-.075-.287.03-.05.077-.376.547-.458.67-.077.108-.035.168.045.234.35.293.817.613 1.134.775a6.7097 6.7097 0 0 0 2.8289.727 4.9048 4.9048 0 0 0 2.0759-.354c1.095-.465 1.8029-1.394 1.9449-2.554zM11.9986 1.4009c-2.068 0-3.7539 1.95-3.8329 4.3899h7.6657c-.08-2.44-1.765-4.3899-3.8328-4.3899zm7.8516 22.5981-.08.001-15.7843-.002c-1.074-.04-1.863-.91-1.971-1.991l-.01-.195L1.298 6.2858a.459.459 0 0 1 .45-.494h4.9748C6.8448 2.568 9.1607 0 11.9996 0c2.8388 0 5.1537 2.5689 5.2757 5.7898h4.9678a.459.459 0 0 1 .458.483l-.773 15.5883-.007.131c-.094 1.094-.979 1.9769-2.0709 2.0059z" fill="white" />
          </g>
        </svg>
      );
    case 'loggi':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <circle cx="12" cy="12" r="10" fill="#00B0FF" />
          <path d="M12 7 L16 9.3 L12 11.6 L8 9.3 Z" fill="white" fillOpacity="0.9" />
          <path d="M8 9.3 L12 11.6 L12 16.2 L8 13.9 Z" fill="white" fillOpacity="0.6" />
          <path d="M12 11.6 L16 9.3 L16 13.9 L12 16.2 Z" fill="white" fillOpacity="0.75" />
        </svg>
      );
    default:
      return null;
  }
};

const PLATFORM_NAMES: Record<string, string> = {
  ifood: 'iFood', aiqfome: 'Aiqfome', uber: 'Uber', '99': '99',
  indrive: 'inDrive', lalamove: 'Lalamove', shopee: 'Shopee', loggi: 'Loggi'
};

export default function Relatorios() {
  const router = useRouter();
  const { entries, fetchRecentEntries } = useEntries();
  const { activeJourney, historicalJourneys, fetchHistoricalJourneys } = useJourneys();
  const { dailyGoal, weeklyGoal, monthlyGoal, fetchGoal } = useGoals();

  useEffect(() => {
    fetchRecentEntries(500);
    fetchHistoricalJourneys();
    fetchGoal();
  }, [fetchRecentEntries, fetchHistoricalJourneys, fetchGoal]);

  const totalGains = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalGains - totalExpenses;
  const totalHours = historicalJourneys.reduce((acc, curr) => acc + curr.duration_minutes, 0) / 60;
  const activeJourneyHours = activeJourney ? (Date.now() - new Date(activeJourney.started_at).getTime()) / 3600000 : 0;
  const totalHoursWithActive = totalHours + activeJourneyHours;
  const completedDistance = historicalJourneys.reduce((acc, curr) => acc + curr.distance_km, 0);
  const manualKm = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + (curr.km_total || 0), 0);
  const totalDistance = completedDistance > 0 ? completedDistance : manualKm;
  const totalRides = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + (curr.rides_count || 1), 0);

  const earningsPerHour = totalHoursWithActive > 0 ? totalGains / totalHoursWithActive : 0;
  const earningsPerKm = totalDistance > 0 ? totalGains / totalDistance : 0;
  const profitPerKm = totalDistance > 0 ? netProfit / totalDistance : 0;

  const fuelExpenses = entries.filter(e => e.type === 'expense').filter(e => {
    const d = (e.description || '').toLowerCase();
    return d.includes('combustível') || d.includes('gasolina') || d.includes('abastecer');
  }).reduce((acc, curr) => acc + curr.amount, 0);
  const fuelPercentage = totalExpenses > 0 ? (fuelExpenses / totalExpenses) * 100 : 0;

  const platformStats = useMemo(() => {
    const platformKnown = ['ifood', 'aiqfome', 'uber', '99', 'indrive', 'lalamove', 'shopee', 'loggi'];
    const stats: Record<string, { total: number; count: number; rides: number; km: number }> = {};
    entries.filter(e => e.type === 'gain').forEach(e => {
      const desc = (e.description || '').toLowerCase();
      const matched = platformKnown.find(p => desc.includes(p));
      if (matched) {
        if (!stats[matched]) stats[matched] = { total: 0, count: 0, rides: 0, km: 0 };
        stats[matched].total += e.amount;
        stats[matched].count += 1;
        stats[matched].rides += e.rides_count || 0;
        stats[matched].km += e.km_total || 0;
      }
    });
    return Object.entries(stats)
      .map(([id, data]) => ({ id, ...data, avgPerRide: data.rides > 0 ? data.total / data.rides : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [entries]);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const weekGains = entries.filter(e => new Date(e.date) >= sevenDaysAgo && e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const weekExpenses = entries.filter(e => new Date(e.date) >= sevenDaysAgo && e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const weekNetProfit = weekGains - weekExpenses;
  const monthGains = entries.filter(e => new Date(e.date) >= thirtyDaysAgo && e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const monthExpenses = entries.filter(e => new Date(e.date) >= thirtyDaysAgo && e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const monthNetProfit = monthGains - monthExpenses;

  const getDailyChartData = () => {
    const dataMap: { [key: string]: number } = {};
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dataMap[d.getDate().toString()] = 0;
    }
    entries.forEach(e => {
      const label = new Date(e.date).getDate().toString();
      if (label in dataMap) {
        dataMap[label] += e.type === 'gain' ? e.amount : -e.amount;
      }
    });
    return Object.keys(dataMap).map(day => ({
      name: day,
      value: dataMap[day]
    }));
  };

  const chartData = getDailyChartData();

  const goalRatio = dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100) : 0;
  const weekGoalRatio = weeklyGoal > 0 ? Math.min((weekNetProfit / weeklyGoal) * 100, 100) : 0;
  const monthGoalRatio = monthlyGoal > 0 ? Math.min((monthNetProfit / monthlyGoal) * 100, 100) : 0;

  return (
    <div className="space-y-3 pb-28 pt-2 px-4 animate-fade-in-up">
      {/* Header */}
      <header className="flex items-center space-x-3 py-2">
        <button 
          onClick={() => router.push('/')}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="text-[16px] font-extrabold text-foreground font-heading">Relatórios</h1>
      </header>

      {/* Lucro líquido */}
      <section className="bg-card border border-border rounded-[20px] p-5 shadow-premium text-center space-y-1">
        <span className="text-[10px] font-black text-muted uppercase tracking-wider block">Lucro Líquido Total</span>
        <div className="text-[28px] font-extrabold text-[#19A85B] tracking-tight font-heading">
          R$ {netProfit.toFixed(2).replace('.', ',')}
        </div>
      </section>

      {/* Grid 2x2 */}
      <section className="grid grid-cols-2 gap-2">
        <div className="bg-card border border-border rounded-[20px] p-3.5 shadow-sm">
          <p className="text-[9px] font-bold text-muted uppercase">Faturamento</p>
          <p className="text-[14px] font-extrabold text-foreground mt-1 font-heading">R$ {totalGains.toFixed(0)}</p>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3.5 shadow-sm">
          <p className="text-[9px] font-bold text-muted uppercase">Gastos</p>
          <p className="text-[14px] font-extrabold text-foreground mt-1 font-heading">R$ {totalExpenses.toFixed(0)}</p>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3.5 shadow-sm">
          <p className="text-[9px] font-bold text-muted uppercase">Tempo online</p>
          <p className="text-[14px] font-extrabold text-foreground mt-1 font-heading">{Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}m</p>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3.5 shadow-sm">
          <p className="text-[9px] font-bold text-muted uppercase">Km rodados</p>
          <p className="text-[14px] font-extrabold text-foreground mt-1 font-heading">{totalDistance.toFixed(0)} km</p>
        </div>
      </section>

      {/* Indicadores */}
      <section className="grid grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-[20px] p-3 text-center shadow-sm">
          <Clock size={12} className="text-muted mx-auto mb-1" />
          <p className="text-[8px] font-extrabold text-muted uppercase tracking-wider">Ganho/hora</p>
          <p className="text-[13px] font-black text-foreground mt-0.5 font-heading">R$ {earningsPerHour.toFixed(2).replace('.', ',')}</p>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3 text-center shadow-sm">
          <TrendingUp size={12} className="text-muted mx-auto mb-1" />
          <p className="text-[8px] font-extrabold text-muted uppercase tracking-wider">Ganho/km</p>
          <p className="text-[13px] font-black text-foreground mt-0.5 font-heading">R$ {earningsPerKm.toFixed(2).replace('.', ',')}</p>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3 text-center shadow-sm">
          <Fuel size={12} className="text-muted mx-auto mb-1" />
          <p className="text-[8px] font-extrabold text-muted uppercase tracking-wider">Lucro/km</p>
          <p className="text-[13px] font-black text-foreground mt-0.5 font-heading">R$ {profitPerKm.toFixed(2).replace('.', ',')}</p>
        </div>
      </section>

      {/* Combustível */}
      <section className="bg-card border border-border rounded-[20px] p-4 space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Fuel size={12} className="text-muted" />
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">Combustível</span>
          </div>
          <span className="text-[13px] font-black text-foreground font-heading">{fuelPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-card-secondary h-2 rounded-full overflow-hidden border border-border/40">
          <div 
            className="h-full rounded-full transition-all duration-700"
            style={{ 
              width: `${Math.min(fuelPercentage, 100)}%`,
              backgroundColor: fuelPercentage > 50 ? '#EF4444' : fuelPercentage > 30 ? '#F59E0B' : '#10B981'
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-bold text-muted">
          <span>R$ {fuelExpenses.toFixed(0)} combustível</span>
          <span>R$ {totalExpenses.toFixed(0)} total</span>
        </div>
      </section>

      {/* Gráfico */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-sm space-y-3">
        <h3 className="text-[13px] font-bold text-foreground">Lucro por dia</h3>
        <div className="h-44 w-full">
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
                  borderRadius: '12px', 
                  color: 'var(--text-color)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
                formatter={(value: any) => [`R$ ${Number(value).toFixed(2).replace('.', ',')}`, '']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={14}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#19A85B" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Ranking */}
      {platformStats.length > 0 && (
        <section className="bg-card border border-border rounded-[20px] p-4 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Trophy size={14} className="text-muted" />
            <h3 className="text-[13px] font-bold text-foreground">Ranking por Plataforma</h3>
          </div>
          <div className="space-y-2">
            {platformStats.map((platform, index) => {
              const maxTotal = platformStats[0]?.total || 1;
              const barWidth = (platform.total / maxTotal) * 100;
              return (
                <div key={platform.id} className="bg-card-secondary/50 border border-border/60 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[11px] font-extrabold text-muted w-4">{index + 1}º</span>
                      <PlatformLogo id={platform.id} className="w-7 h-7" />
                      <span className="text-[13px] font-black text-foreground">{PLATFORM_NAMES[platform.id]}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[14px] font-black text-[#10B981] font-heading">R$ {platform.total.toFixed(0)}</span>
                      <span className="text-[9px] text-muted block">{platform.count} lançamentos</span>
                    </div>
                  </div>
                  <div className="w-full bg-card h-1.5 rounded-full overflow-hidden mt-2">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${barWidth}%`, backgroundColor: index === 0 ? '#10B981' : index === 1 ? '#22C55E' : '#71717A' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Metas */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Target size={14} className="text-muted" />
          <h3 className="text-[13px] font-bold text-foreground">Metas</h3>
        </div>
        {[
          { label: 'Diária', ratio: goalRatio, value: netProfit, goal: dailyGoal },
          { label: 'Semanal', ratio: weekGoalRatio, value: weekNetProfit, goal: weeklyGoal },
          { label: 'Mensal', ratio: monthGoalRatio, value: monthNetProfit, goal: monthlyGoal },
        ].map((g) => (
          <div key={g.label} className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-foreground items-center">
              <span>{g.label}</span>
              <span>{g.ratio.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-card-secondary h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${g.ratio}%`,
                  backgroundColor: g.ratio >= 100 ? '#10B981' : g.ratio >= 70 ? '#22C55E' : g.ratio >= 40 ? '#F59E0B' : '#EF4444'
                }}
              />
            </div>
            <div className="text-[9px] text-muted font-semibold">R$ {g.value.toFixed(0)} / R$ {g.goal.toFixed(0)}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
