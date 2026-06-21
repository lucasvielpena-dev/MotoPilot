'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Eye,
  EyeOff,
  Clock,
  Map,
  ShoppingBag,
  TrendingUp,
  Square,
  Play,
  Calendar,
  AlertTriangle,
  CircleDollarSign
} from 'lucide-react';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';

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
  const [showAmount, setShowAmount] = useState(true);

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

  const activeEntries = entries.filter(e => e.journey_id === activeJourney?.id);
  const activeGains = activeEntries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const activeExpenses = activeEntries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const activeNetProfit = activeGains - activeExpenses;
  const activeDeliveriesCount = activeEntries.filter(e => e.type === 'gain').length;

  const totalCompletedHours = historicalJourneys.reduce((acc, curr) => acc + curr.duration_minutes, 0) / 60;
  const totalCompletedDistance = historicalJourneys.reduce((acc, curr) => acc + curr.distance_km, 0);

  const formatJourneyDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
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
        /* JORNADA ATIVA */
        <div className="space-y-6">
          <header className="flex justify-between items-center bg-card px-2 py-3 border-b border-border -mx-4">
            <div className="flex items-center space-x-3 pl-4">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-muted opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-success-muted"></span>
              </span>
              <div>
                <h1 className="text-[16px] font-extrabold text-foreground font-heading">Jornada ativa</h1>
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

          {(trackerError || journeyError) && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-[20px] flex items-start space-x-3 mx-1">
              <AlertTriangle size={22} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-500 font-medium">{trackerError || journeyError}</p>
            </div>
          )}

          <section className="relative w-full rounded-[32px] overflow-hidden border border-border shadow-premium bg-card">
            <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-md border border-border rounded-full px-3 py-1.5 shadow-sm flex items-center space-x-2 z-[400] text-[11px] font-bold">
              <span className={`w-2 h-2 rounded-full ${accuracyColor} ${gpsStatus === 'active' ? 'animate-pulse' : ''}`}></span>
              <span className="text-foreground">{accuracyLabel} {gpsAccuracy !== null ? `(${gpsAccuracy}m)` : ''}</span>
            </div>
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md border border-border rounded-full px-3 py-1.5 shadow-sm flex items-center space-x-1.5 z-[400] text-[11px] font-bold text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-success-muted"></span>
              <span>Atualizado agora</span>
            </div>
            <div className="w-full h-[360px] relative">
              <MiniMap isTracking={isTracking} className="h-full w-full" />
            </div>
          </section>

          <section className="relative z-10 -mt-14 mx-4 bg-card border border-border shadow-premium rounded-[28px] p-5">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Odômetro</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-foreground tracking-tight font-heading">
                    {liveDistance.toFixed(1).replace('.', ',')}
                  </span>
                  <span className="text-sm font-bold text-muted">km</span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Velocidade</span>
                <div className="flex items-baseline justify-end space-x-1">
                  <span className="text-3xl font-black text-primary tracking-tight font-heading">
                    {speed !== null ? speed : '0'}
                  </span>
                  <span className="text-sm font-bold text-muted">km/h</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border my-4"></div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1">
                <div className="flex justify-center mb-0.5">
                  <Clock size={16} className="text-indigo-500/60" />
                </div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Tempo</span>
                <span className="text-[14px] font-extrabold text-foreground block mt-0.5 font-heading">{elapsedTime.slice(0, 5)}h</span>
              </div>
              <div className="space-y-1 border-l border-border">
                <div className="flex justify-center mb-0.5">
                  <CircleDollarSign size={16} className="text-success-muted" />
                </div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Ganhos</span>
                <span className="text-[14px] font-extrabold text-success-muted block mt-0.5 font-heading">
                  {showAmount ? `R$ ${activeGains.toFixed(2).replace('.', ',')}` : 'R$ •••'}
                </span>
              </div>
              <div className="space-y-1 border-l border-border">
                <div className="flex justify-center mb-0.5">
                  <TrendingUp size={16} className="text-primary-muted" />
                </div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Gastos</span>
                <span className="text-[14px] font-extrabold text-primary-muted block mt-0.5 font-heading">
                  {showAmount ? `R$ ${activeExpenses.toFixed(2).replace('.', ',')}` : 'R$ •••'}
                </span>
              </div>
            </div>
          </section>

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
              className="w-full py-4 bg-primary-muted text-white font-extrabold text-[15px] rounded-[24px] flex items-center justify-center space-x-2 shadow-lg hover:bg-primary/80 transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50"
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
        /* HISTÓRICO - TIMELINE */
        <div className="space-y-6">
          <header className="flex justify-between items-center bg-card px-2 py-3 border-b border-border -mx-4">
            <div className="w-10 h-10" />
            <h1 className="text-[18px] font-extrabold text-foreground font-heading">Jornadas</h1>
            <div className="w-10 h-10" />
          </header>

          {/* Stats gerais */}
          <section className="bg-card border border-border rounded-[32px] p-5 shadow-premium flex justify-between items-center text-center">
            <div className="flex-1">
              <span className="text-[10px] font-bold text-muted block uppercase">Lucro total</span>
              <span className="text-[16px] font-extrabold text-success-muted mt-0.5 block font-heading">R$ {(totalCompletedHours > 0 ? entries.filter(e => e.type === 'gain' && e.journey_id).reduce((a, c) => a + c.amount, 0) - entries.filter(e => e.type === 'expense' && e.journey_id).reduce((a, c) => a + c.amount, 0) : 0).toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="border-l border-border h-8"></div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-muted block uppercase">Tempo total</span>
              <span className="text-[16px] font-extrabold text-foreground mt-0.5 block font-heading">{Math.floor(totalCompletedHours)}h {Math.round((totalCompletedHours % 1) * 60)}m</span>
            </div>
            <div className="border-l border-border h-8"></div>
            <div className="flex-1">
              <span className="text-[10px] font-bold text-muted block uppercase">Km total</span>
              <span className="text-[16px] font-extrabold text-foreground mt-0.5 block font-heading">{totalCompletedDistance.toFixed(0).replace('.', ',')} km</span>
            </div>
          </section>

          {/* Timeline */}
          <section className="space-y-0">
            {historicalJourneys.length === 0 ? (
              <div className="bg-card border border-border rounded-3xl p-8 text-center">
                <p className="text-[14px] text-muted font-bold">Nenhuma jornada registrada.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Linha vertical da timeline */}
                <div className="absolute left-[18px] top-0 bottom-0 w-[2px] bg-border"></div>
                
                <div className="space-y-1">
                  {historicalJourneys.map((journey, index) => {
                    const stats = getJourneyStats(journey.id);
                    const isLast = index === historicalJourneys.length - 1;
                    return (
                      <div key={journey.id} className="relative flex items-start pl-10">
                        {/* Ponto da timeline */}
                        <div className={`absolute left-[12px] top-5 w-[14px] h-[14px] rounded-full border-[3px] border-card z-10 ${
                          stats.profit > 0 ? 'bg-success-muted' : 'bg-primary-muted'
                        }`}></div>
                        
                        {/* Conteúdo do cartão */}
                        <div className={`flex-1 ${isLast ? '' : 'mb-2'}`}>
                          <div className="bg-card border border-border rounded-[20px] p-4 shadow-sm hover:shadow-md transition-all">
                            {/* Cabeçalho: Data + Lucro */}
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="text-[14px] font-extrabold text-foreground block font-heading">
                                  {formatJourneyDate(journey.started_at)}
                                </span>
                                <span className="text-[11px] font-semibold text-muted mt-0.5 block">
                                  {formatJourneyTimeRange(journey.started_at, journey.ended_at)}
                                </span>
                              </div>
                              <span className="text-[16px] font-extrabold text-success-muted font-heading">
                                R$ {stats.profit.toFixed(2).replace('.', ',')}
                              </span>
                            </div>

                            {/* Métricas inline */}
                            <div className="flex items-center gap-4 text-[11px] font-bold text-muted">
                              <div className="flex items-center space-x-1.5">
                                <Clock size={13} className="text-indigo-500/60" />
                                <span>{Math.floor(journey.duration_minutes / 60)}h {journey.duration_minutes % 60}m</span>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <Map size={13} className="text-rose-500/60" />
                                <span>{journey.distance_km.toFixed(1).replace('.', ',')} km</span>
                              </div>
                              <div className="flex items-center space-x-1.5">
                                <ShoppingBag size={13} className="text-success-muted" />
                                <span>{stats.deliveries} entregas</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
