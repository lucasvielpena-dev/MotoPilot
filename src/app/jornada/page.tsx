'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  List,
  CalendarBlank,
  Eye,
  EyeSlash,
  Clock,
  MapTrifold,
  ShoppingBag,
  TrendUp,
  CaretRight,
  Stop,
  Play,
  ArrowLeft,
  Calendar,
  Warning,
  ChartLine
} from '@phosphor-icons/react';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';

// O mapa usa a window global, então no Next.js precisamos carregar dinamicamente sem SSR.
const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

export default function Jornada() {
  const router = useRouter();
  const { 
    activeJourney, 
    historicalJourneys, 
    loading, 
    startJourney, 
    finishJourney, 
    fetchHistoricalJourneys, 
    liveDistance, 
    isTracking, 
    gpsAccuracy, 
    gpsStatus, 
    trackerError 
  } = useJourneys();

  const { entries, fetchRecentEntries } = useEntries();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [durationHours, setDurationHours] = useState(0);
  const [activeStartTime, setActiveStartTime] = useState('--:--');
  const [isFinishing, setIsFinishing] = useState(false);
  const [journeyError, setJourneyError] = useState<string | null>(null);
  
  // Custom interface states
  const [showAmount, setShowAmount] = useState(true);
  const [activeTab, setActiveTab] = useState<'jornadas' | 'resumo'>('jornadas');

  useEffect(() => {
    const saved = localStorage.getItem('motopilot_show_amount') !== 'false';
    setShowAmount(saved);
  }, []);

  const toggleShowAmount = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !showAmount;
    setShowAmount(next);
    localStorage.setItem('motopilot_show_amount', String(next));
  };

  useEffect(() => {
    fetchHistoricalJourneys();
    fetchRecentEntries(500);
  }, [fetchHistoricalJourneys, fetchRecentEntries]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJourney) {
      const startDate = new Date(activeJourney.started_at);
      setActiveStartTime(startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      interval = setInterval(() => {
        const start = startDate.getTime();
        const now = new Date().getTime();
        const diff = now - start;
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setDurationHours(diff / 3600000);
        setElapsedTime(`${h}:${m}:${s}`);
      }, 1000);
    } else {
      setElapsedTime('00:00:00');
      setDurationHours(0);
      setActiveStartTime('--:--');
    }
    return () => clearInterval(interval);
  }, [activeJourney]);

  if (loading) return null;

  // Estatísticas específicas da jornada ativa
  const activeEntries = entries.filter(e => e.journey_id === activeJourney?.id);
  const activeGains = activeEntries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const activeExpenses = activeEntries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const activeNetProfit = activeGains - activeExpenses;
  const activeDeliveriesCount = activeEntries.filter(e => e.type === 'gain').length;
  const activeAvgGanhosPerHr = durationHours > 0 ? activeGains / durationHours : 0;

  // Estatísticas gerais do histórico
  const totalCompletedGains = entries.filter(e => e.type === 'gain' && e.journey_id).reduce((acc, curr) => acc + curr.amount, 0);
  const totalCompletedExpenses = entries.filter(e => e.type === 'expense' && e.journey_id).reduce((acc, curr) => acc + curr.amount, 0);
  const totalCompletedProfit = totalCompletedGains - totalCompletedExpenses;
  const totalCompletedHours = historicalJourneys.reduce((acc, curr) => acc + curr.duration_minutes, 0) / 60;
  const totalCompletedDistance = historicalJourneys.reduce((acc, curr) => acc + curr.distance_km, 0);

  // Formata data do histórico (Ex: Sex, 23 de maio)
  const formatJourneyDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return `${weekdays[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
  };

  const formatJourneyTimeRange = (startedAt: string, endedAt: string | null) => {
    const start = new Date(startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!endedAt) return start;
    const end = new Date(endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${start} às ${end}`;
  };

  const getJourneyStats = (journeyId: string) => {
    const jEntries = entries.filter(e => e.journey_id === journeyId);
    const gains = jEntries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = jEntries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const profit = gains - expenses;
    const deliveries = jEntries.filter(e => e.type === 'gain').length;
    return { gains, expenses, profit, deliveries };
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {activeJourney ? (
        /* SCREEN 2: JORNADA ATIVA */
        <div className="space-y-6">
          {/* Header da Jornada ativa */}
          <header className="flex justify-between items-center bg-white px-2 py-3 border-b border-neutral-100/50 -mx-4">
            <div className="flex items-center space-x-3">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#19A85B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#19A85B]"></span>
              </span>
              <div>
                <h1 className="text-[16px] font-extrabold text-neutral-800">Jornada ativa</h1>
                <p className="text-[12px] text-neutral-400 mt-0.5">Iniciada às {activeStartTime}</p>
              </div>
            </div>
            
            <button
              onClick={async () => {
                setIsFinishing(true);
                setJourneyError(null);
                const result = await finishJourney();
                setIsFinishing(false);
                if ('error' in result) {
                  setJourneyError(result.error?.message || 'Erro ao encerrar.');
                  return;
                }
                router.push('/');
              }}
              disabled={isFinishing}
              className="px-4 py-2 text-[13px] font-extrabold text-[#EA1D2C] border border-[#EA1D2C]/20 hover:bg-[#EA1D2C]/5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {isFinishing ? 'Salvando...' : 'Encerrar'}
            </button>
          </header>

          {/* Erros e Alertas */}
          {(trackerError || journeyError) && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-[20px] flex items-start space-x-3">
              <Warning size={22} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-500 font-medium">{trackerError || journeyError}</p>
            </div>
          )}

          {/* Red card banner */}
          <section className="delivery-hero rounded-[32px] p-6 relative overflow-hidden flex flex-col justify-between min-h-[170px] shadow-lg">
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold uppercase tracking-wide opacity-90 text-white/90">Lucro líquido</span>
              <button 
                onClick={toggleShowAmount}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95 cursor-pointer"
              >
                {showAmount ? <Eye size={18} className="text-white" /> : <EyeSlash size={18} className="text-white" />}
              </button>
            </div>

            <div className="my-2">
              <span className="text-[38px] leading-none font-extrabold tracking-tight select-none">
                {showAmount ? `R$ ${activeNetProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
              </span>
            </div>

            <div className="flex justify-start items-center space-x-6 pt-3 border-t border-white/10 text-white/95 text-[14px]">
              <div>
                <span className="opacity-80 block text-[10px] uppercase font-semibold">Faturamento</span>
                <span className="font-extrabold">R$ {activeGains.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="border-l border-white/10 h-8"></div>
              <div>
                <span className="opacity-80 block text-[10px] uppercase font-semibold">Gastos</span>
                <span className="font-extrabold">R$ {activeExpenses.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </section>

          {/* Grid de status (2x2) */}
          <section className="grid grid-cols-2 gap-4">
            {/* Tempo Online */}
            <div className="bg-white border border-neutral-100/80 rounded-[28px] p-4 flex flex-col justify-between min-h-[110px] shadow-[0_4px_16px_rgba(17,17,17,0.01)]">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center mb-2">
                <Clock size={18} weight="fill" className="text-indigo-500 animate-pulse" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-neutral-400">Tempo online</p>
                <p className="text-[18px] font-extrabold text-neutral-800 mt-0.5">{elapsedTime.slice(0, 5)}h</p>
              </div>
            </div>

            {/* Km Rodados */}
            <div className="bg-white border border-neutral-100/80 rounded-[28px] p-4 flex flex-col justify-between min-h-[110px] shadow-[0_4px_16px_rgba(17,17,17,0.01)]">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center mb-2">
                <MapTrifold size={18} weight="fill" className="text-rose-500" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-neutral-400">Km rodados</p>
                <p className="text-[18px] font-extrabold text-neutral-800 mt-0.5">{liveDistance.toFixed(1).replace('.', ',')} km</p>
              </div>
            </div>

            {/* Entregas */}
            <div className="bg-white border border-neutral-100/80 rounded-[28px] p-4 flex flex-col justify-between min-h-[110px] shadow-[0_4px_16px_rgba(17,17,17,0.01)]">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center mb-2">
                <ShoppingBag size={18} weight="fill" className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-neutral-400">Entregas</p>
                <p className="text-[18px] font-extrabold text-neutral-800 mt-0.5">{activeDeliveriesCount}</p>
              </div>
            </div>

            {/* Média de ganhos/h */}
            <div className="bg-white border border-neutral-100/80 rounded-[28px] p-4 flex flex-col justify-between min-h-[110px] shadow-[0_4px_16px_rgba(17,17,17,0.01)]">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center mb-2">
                <TrendUp size={18} weight="fill" className="text-amber-500" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-neutral-400">Média ganhos/h</p>
                <p className="text-[18px] font-extrabold text-neutral-800 mt-0.5">R$ {activeAvgGanhosPerHr.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
          </section>

          {/* Map display */}
          <section className="bg-white border border-neutral-100/80 rounded-[32px] p-4 shadow-[0_4px_20px_rgba(17,17,17,0.015)] relative">
            <h3 className="text-[14px] font-bold text-neutral-800 flex items-center space-x-2 mb-3">
              <MapTrifold size={18} className="text-neutral-400" />
              <span>Rota em tempo real</span>
            </h3>
            
            <div className="w-full relative overflow-hidden rounded-[24px]">
              <MiniMap isTracking={isTracking} />
              
              {/* Odômetro overlay no rodapé do mapa */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-neutral-100 shadow-lg flex items-center justify-between z-[400] transition-all">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-neutral-400 block uppercase">Odômetro</span>
                  <span className="text-[20px] font-extrabold text-neutral-800">{liveDistance.toFixed(1).replace('.', ',')} km</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#EA1D2C]/10 flex items-center justify-center">
                  <ChartLine size={20} className="text-[#EA1D2C]" />
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* SCREEN 3: HISTÓRICO */
        <div className="space-y-6">
          {/* Header do Histórico */}
          <header className="flex justify-between items-center bg-white px-2 py-3 border-b border-neutral-100/50 -mx-4">
            <button className="w-10 h-10 flex items-center justify-center text-neutral-800 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer">
              <List size={24} weight="bold" />
            </button>
            <h1 className="text-[18px] font-extrabold text-neutral-800">Histórico</h1>
            <button className="w-10 h-10 flex items-center justify-center text-neutral-800 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer">
              <CalendarBlank size={24} weight="bold" />
            </button>
          </header>

          {/* Tabs */}
          <div className="flex bg-neutral-100/80 p-1 rounded-2xl border border-neutral-200/40">
            <button 
              onClick={() => setActiveTab('jornadas')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'jornadas' ? 'bg-white text-neutral-900 border border-neutral-200/30 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Jornadas
            </button>
            <button 
              onClick={() => setActiveTab('resumo')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'resumo' ? 'bg-white text-neutral-900 border border-neutral-200/30 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Resumo
            </button>
          </div>

          {activeTab === 'jornadas' ? (
            <>
              {/* Seletor de período */}
              <div className="flex justify-center">
                <div className="bg-white border border-neutral-150 rounded-2xl px-4 py-2 text-[13px] font-bold text-neutral-700 flex items-center space-x-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:bg-neutral-50">
                  <span>19/05/2025 - 25/05/2025</span>
                  <Calendar size={16} className="text-neutral-400" />
                </div>
              </div>

              {/* Stats card row */}
              <section className="bg-white border border-neutral-100/80 rounded-[32px] p-5 shadow-[0_4px_16px_rgba(17,17,17,0.015)] flex justify-between items-center text-center">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-neutral-400 block uppercase">Lucro líquido</span>
                  <span className="text-[16px] font-extrabold text-[#19A85B] mt-0.5 block">R$ {totalCompletedProfit.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="border-l border-neutral-100 h-8"></div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-neutral-400 block uppercase">Tempo online</span>
                  <span className="text-[16px] font-extrabold text-neutral-800 mt-0.5 block">{Math.floor(totalCompletedHours)}h {Math.round((totalCompletedHours % 1) * 60)}m</span>
                </div>
                <div className="border-l border-neutral-100 h-8"></div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-neutral-400 block uppercase">Km rodados</span>
                  <span className="text-[16px] font-extrabold text-neutral-800 mt-0.5 block">{totalCompletedDistance.toFixed(1).replace('.', ',')} km</span>
                </div>
              </section>

              {/* List of past journeys */}
              <section className="space-y-3">
                {historicalJourneys.length === 0 ? (
                  <div className="bg-white border border-neutral-100/85 rounded-3xl p-8 text-center">
                    <p className="text-[14px] text-neutral-400">Nenhuma jornada registrada.</p>
                  </div>
                ) : (
                  historicalJourneys.map((journey) => {
                    const stats = getJourneyStats(journey.id);
                    return (
                      <div 
                        key={journey.id}
                        onClick={() => router.push(`/jornada/detalhes?id=${journey.id}`)}
                        className="bg-white border border-neutral-100/80 hover:border-[#EA1D2C]/20 hover:shadow-[0_8px_24px_rgba(234,29,44,0.03)] rounded-[28px] p-5 shadow-[0_4px_16px_rgba(17,17,17,0.01)] flex flex-col space-y-4 cursor-pointer transition-all active:scale-[0.99]"
                      >
                        {/* Top row */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[15px] font-extrabold text-neutral-800 block">
                              {formatJourneyDate(journey.started_at)}
                            </span>
                            <span className="text-[12px] font-semibold text-neutral-400 mt-0.5 block">
                              {formatJourneyTimeRange(journey.started_at, journey.ended_at)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[16px] font-extrabold text-[#19A85B]">
                              R$ {stats.profit.toFixed(2).replace('.', ',')}
                            </span>
                            <CaretRight size={16} weight="bold" className="text-neutral-400" />
                          </div>
                        </div>

                        {/* Bottom metrics */}
                        <div className="border-t border-neutral-50/80 pt-3 flex justify-between items-center text-[12px] font-bold text-neutral-400">
                          <div className="flex items-center space-x-1">
                            <Clock size={15} />
                            <span>{Math.floor(journey.duration_minutes / 60)}h {journey.duration_minutes % 60}m</span>
                          </div>
                          <span>|</span>
                          <div className="flex items-center space-x-1">
                            <MapTrifold size={15} />
                            <span>{journey.distance_km.toFixed(1).replace('.', ',')} km</span>
                          </div>
                          <span>|</span>
                          <div className="flex items-center space-x-1">
                            <ShoppingBag size={15} />
                            <span>{stats.deliveries} entregas</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            </>
          ) : (
            /* Resumo Tab view */
            <div className="bg-white border border-neutral-100/85 rounded-3xl p-8 text-center space-y-3">
              <p className="text-[14px] font-bold text-neutral-700">Resumo financeiro detalhado</p>
              <p className="text-[12px] text-neutral-400">Para ver os gráficos de faturamento diário e mensal detalhados, acesse a aba de Relatórios no painel.</p>
              <button 
                onClick={() => router.push('/relatorios')}
                className="mt-2 bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-bold px-5 py-3 rounded-2xl text-[13px] active:scale-95 transition-all cursor-pointer"
              >
                Abrir Relatórios
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
