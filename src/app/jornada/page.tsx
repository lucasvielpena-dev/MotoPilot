'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Menu,
  Eye,
  EyeOff,
  Clock,
  Map,
  ShoppingBag,
  TrendingUp,
  ChevronRight,
  Square,
  Play,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  LineChart
} from 'lucide-react';
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
    speed,
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

  // GPS Accuracy styling helper
  let accuracyLabel = "Buscando GPS...";
  let accuracyColor = "bg-amber-500";
  if (gpsStatus === 'active' && gpsAccuracy !== null) {
    if (gpsAccuracy <= 15) {
      accuracyLabel = "GPS Alta Precisão";
      accuracyColor = "bg-emerald-500";
    } else if (gpsAccuracy <= 40) {
      accuracyLabel = "GPS Média Precisão";
      accuracyColor = "bg-amber-500";
    } else {
      accuracyLabel = "GPS Baixa Precisão";
      accuracyColor = "bg-red-500";
    }
  } else if (gpsStatus === 'inactive') {
    accuracyLabel = "GPS Inativo";
    accuracyColor = "bg-neutral-500";
  }

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
          <header className="flex justify-between items-center bg-card px-2 py-3 border-b border-border -mx-4">
            <div className="flex items-center space-x-3 pl-4">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#19A85B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#19A85B]"></span>
              </span>
              <div>
                <h1 className="text-[16px] font-extrabold text-foreground">Jornada ativa</h1>
                <p className="text-[12px] text-muted mt-0.5">Iniciada às {activeStartTime}</p>
              </div>
            </div>
            
            <div className="flex items-center pr-4">
              <button 
                onClick={toggleShowAmount}
                className="w-9 h-9 rounded-full bg-card-secondary hover:bg-card-secondary/80 flex items-center justify-center border border-border transition-transform active:scale-95 cursor-pointer"
              >
                {showAmount ? <Eye size={18} className="text-foreground" /> : <EyeOff size={18} className="text-foreground" />}
              </button>
            </div>
          </header>

          {/* Erros e Alertas */}
          {(trackerError || journeyError) && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-[20px] flex items-start space-x-3 mx-1">
              <AlertTriangle size={22} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-500 font-medium">{trackerError || journeyError}</p>
            </div>
          )}

          {/* Rota em tempo real com mapa maior */}
          <section className="relative w-full rounded-[32px] overflow-hidden border border-border shadow-premium bg-card">
            {/* GPS Status Indicator Overlay */}
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-md border border-border rounded-full px-3 py-1.5 shadow-sm flex items-center space-x-2 z-[400] text-[11px] font-bold">
              <span className={`w-2 h-2 rounded-full ${accuracyColor} ${gpsStatus === 'active' ? 'animate-pulse' : ''}`}></span>
              <span className="text-foreground">{accuracyLabel} {gpsAccuracy !== null ? `(${gpsAccuracy}m)` : ''}</span>
            </div>

            {/* Connection Status Overlay */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md border border-border rounded-full px-3 py-1.5 shadow-sm flex items-center space-x-1.5 z-[400] text-[11px] font-bold text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Atualizado agora</span>
            </div>

            <div className="w-full h-[360px] relative">
              <MiniMap isTracking={isTracking} className="h-full w-full" />
            </div>
          </section>

          {/* Floating Details Overlay Card with negative margin */}
          <section className="relative z-10 -mt-14 mx-4 bg-card border border-border shadow-premium rounded-[28px] p-5">
            {/* Uber Driver Style Odometer & Speed */}
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Odômetro</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-foreground tracking-tight">
                    {liveDistance.toFixed(1).replace('.', ',')}
                  </span>
                  <span className="text-sm font-bold text-muted">km</span>
                </div>
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Velocidade</span>
                <div className="flex items-baseline justify-end space-x-1">
                  <span className="text-3xl font-black text-primary tracking-tight">
                    {speed !== null ? speed : '0'}
                  </span>
                  <span className="text-sm font-bold text-muted">km/h</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border my-4"></div>

            {/* Grid of secondary statistics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Tempo Online */}
              <div className="space-y-1">
                <div className="flex justify-center mb-0.5">
                  <Clock size={16} className="text-[#3B82F6]" />
                </div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Tempo</span>
                <span className="text-[14px] font-extrabold text-foreground block mt-0.5">{elapsedTime.slice(0, 5)}h</span>
              </div>

              {/* Faturamento */}
              <div className="space-y-1 border-l border-border">
                <div className="flex justify-center mb-0.5">
                  <ShoppingBag size={16} className="text-[#10B981]" />
                </div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Ganhos</span>
                <span className="text-[14px] font-extrabold text-[#10B981] block mt-0.5">
                  {showAmount ? `R$ ${activeGains.toFixed(2).replace('.', ',')}` : 'R$ •••'}
                </span>
              </div>

              {/* Gastos */}
              <div className="space-y-1 border-l border-border">
                <div className="flex justify-center mb-0.5">
                  <TrendingUp size={16} className="text-[#EA1D2C]" />
                </div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Gastos</span>
                <span className="text-[14px] font-extrabold text-[#EA1D2C] block mt-0.5">
                  {showAmount ? `R$ ${activeExpenses.toFixed(2).replace('.', ',')}` : 'R$ •••'}
                </span>
              </div>
            </div>
          </section>

          {/* Action button - Finalizar Jornada */}
          <div className="px-4 pt-2">
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
              className="w-full py-4 bg-primary text-white font-extrabold text-[15px] rounded-[24px] flex items-center justify-center space-x-2 shadow-lg hover:bg-primary/95 transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50"
            >
              {isFinishing ? (
                <span>Salvando jornada...</span>
              ) : (
                <>
                  <Square size={16} fill="white" className="mr-1" />
                  <span>Finalizar Jornada</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* SCREEN 3: HISTÓRICO */
        <div className="space-y-6">
          {/* Header do Histórico */}
          <header className="flex justify-between items-center bg-card px-2 py-3 border-b border-border -mx-4">
            <div className="w-10 h-10" />
            <h1 className="text-[18px] font-extrabold text-foreground">Histórico</h1>
            <button className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer">
              <Calendar size={24} strokeWidth={2.5} />
            </button>
          </header>

          {/* Tabs */}
          <div className="flex bg-card-secondary/80 p-1 rounded-2xl border border-border">
            <button 
              onClick={() => setActiveTab('jornadas')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'jornadas' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
              Jornadas
            </button>
            <button 
              onClick={() => setActiveTab('resumo')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'resumo' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
              Resumo
            </button>
          </div>

          {activeTab === 'jornadas' ? (
            <>
              {/* Seletor de período */}
              <div className="flex justify-center">
                <div className="bg-card border border-border rounded-2xl px-4 py-2 text-[13px] font-bold text-foreground flex items-center space-x-2 cursor-pointer shadow-sm hover:bg-card-secondary">
                  <span>19/05/2025 - 25/05/2025</span>
                  <Calendar size={16} className="text-muted" />
                </div>
              </div>

              {/* Stats card row */}
              <section className="bg-card border border-border rounded-[32px] p-5 shadow-premium flex justify-between items-center text-center">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-muted block uppercase">Lucro líquido</span>
                  <span className="text-[16px] font-extrabold text-[#19A85B] mt-0.5 block">R$ {totalCompletedProfit.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="border-l border-border h-8"></div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-muted block uppercase">Tempo online</span>
                  <span className="text-[16px] font-extrabold text-foreground mt-0.5 block">{Math.floor(totalCompletedHours)}h {Math.round((totalCompletedHours % 1) * 60)}m</span>
                </div>
                <div className="border-l border-border h-8"></div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-muted block uppercase">Km rodados</span>
                  <span className="text-[16px] font-extrabold text-foreground mt-0.5 block">{totalCompletedDistance.toFixed(1).replace('.', ',')} km</span>
                </div>
              </section>

              {/* List of past journeys */}
              <section className="space-y-3">
                {historicalJourneys.length === 0 ? (
                  <div className="bg-card border border-border rounded-3xl p-8 text-center">
                    <p className="text-[14px] text-muted">Nenhuma jornada registrada.</p>
                  </div>
                ) : (
                  historicalJourneys.map((journey) => {
                    const stats = getJourneyStats(journey.id);
                    return (
                      <div 
                        key={journey.id}
                        onClick={() => router.push(`/jornada/detalhes?id=${journey.id}`)}
                        className="bg-card border border-border hover:border-[#EA1D2C]/20 hover:shadow-[0_8px_24px_rgba(234,29,44,0.03)] rounded-[28px] p-5 shadow-premium flex flex-col space-y-4 cursor-pointer transition-all active:scale-[0.99]"
                      >
                        {/* Top row */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[15px] font-extrabold text-foreground block">
                              {formatJourneyDate(journey.started_at)}
                            </span>
                            <span className="text-[12px] font-semibold text-muted mt-0.5 block">
                              {formatJourneyTimeRange(journey.started_at, journey.ended_at)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[16px] font-extrabold text-[#19A85B]">
                              R$ {stats.profit.toFixed(2).replace('.', ',')}
                            </span>
                            <ChevronRight size={16} strokeWidth={2.5} className="text-muted" />
                          </div>
                        </div>

                        {/* Bottom metrics */}
                        <div className="border-t border-border pt-3 flex justify-between items-center text-[12px] font-bold text-muted">
                          <div className="flex items-center space-x-1">
                            <Clock size={15} />
                            <span>{Math.floor(journey.duration_minutes / 60)}h {journey.duration_minutes % 60}m</span>
                          </div>
                          <span>|</span>
                          <div className="flex items-center space-x-1">
                            <Map size={15} />
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
            <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-3">
              <p className="text-[14px] font-bold text-foreground">Resumo financeiro detalhado</p>
              <p className="text-[12px] text-muted">Para ver os gráficos de faturamento diário e mensal detalhados, acesse a aba de Relatórios no painel.</p>
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
