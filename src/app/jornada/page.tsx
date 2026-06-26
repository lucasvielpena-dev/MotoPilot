'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Clock, Route, Square } from 'lucide-react';
import { useJourneys } from '@/hooks/useJourneys';

const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

export default function Jornada() {
  const router = useRouter();
  const { 
    activeJourney, historicalJourneys, loading, finishJourney, 
    fetchHistoricalJourneys, liveDistance, isTracking, gpsAccuracy, gpsStatus, speed, trackerError 
  } = useJourneys();

  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [activeStartTime, setActiveStartTime] = useState('--:--');
  const [isFinishing, setIsFinishing] = useState(false);
  const [journeyError, setJourneyError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistoricalJourneys();
  }, [fetchHistoricalJourneys]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJourney) {
      const startDate = new Date(activeJourney.started_at);
      setActiveStartTime(startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      interval = setInterval(() => {
        const diff = Date.now() - startDate.getTime();
        const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        setElapsedTime(`${h}:${m}:${s}`);
      }, 1000);
    } else {
      setElapsedTime('00:00:00');
      setActiveStartTime('--:--');
    }
    return () => clearInterval(interval);
  }, [activeJourney]);

  if (loading) return null;

  const accuracyLabel = gpsStatus === 'active' && gpsAccuracy !== null
    ? gpsAccuracy <= 15 ? 'GPS Alta' : gpsAccuracy <= 40 ? 'GPS Média' : 'GPS Baixa'
    : 'GPS Inativo';
  const accuracyColor = gpsStatus === 'active' && gpsAccuracy !== null
    ? gpsAccuracy <= 15 ? 'bg-emerald-500' : gpsAccuracy <= 40 ? 'bg-amber-500' : 'bg-red-500'
    : 'bg-neutral-500';

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

  return (
    <div className="space-y-3 pb-28 pt-2 px-4 animate-fade-in-up">
      {activeJourney ? (
        <>
          {/* Header Ativo */}
          <header className="flex items-center justify-center py-2">
            <div className="flex items-center space-x-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <h1 className="text-[14px] font-extrabold text-foreground font-heading">Corrida ativa</h1>
                <p className="text-[10px] text-muted text-center">Iniciada às {activeStartTime}</p>
              </div>
            </div>
          </header>

          {(trackerError || journeyError) && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-[16px]">
              <p className="text-[12px] text-red-500 font-medium">{trackerError || journeyError}</p>
            </div>
          )}

          {/* Mapa */}
          <section className="relative w-full rounded-[20px] overflow-hidden border border-border shadow-premium bg-card">
            <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-md border border-border rounded-full px-2.5 py-1 shadow-sm flex items-center space-x-1.5 z-[400] text-[10px] font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${accuracyColor}`}></span>
              <span className="text-foreground">{accuracyLabel} {gpsAccuracy !== null ? `(${gpsAccuracy}m)` : ''}</span>
            </div>
            <div className="w-full h-[280px] relative">
              <MiniMap isTracking={isTracking} className="h-full w-full" />
            </div>
          </section>

          {/* Stats da Corrida */}
          <section className="bg-card border border-border rounded-[20px] p-4 shadow-premium">
            {/* Distância + Velocidade */}
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Distância</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-foreground tracking-tight font-heading">{liveDistance.toFixed(1).replace('.', ',')}</span>
                  <span className="text-xs font-bold text-muted">km</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Velocidade</span>
                <div className="flex items-baseline justify-end space-x-1">
                  <span className="text-2xl font-black text-primary tracking-tight font-heading">{speed !== null ? speed : '0'}</span>
                  <span className="text-xs font-bold text-muted">km/h</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border my-3"></div>

            {/* Tempo */}
            <div className="text-center">
              <Clock size={16} className="text-muted mx-auto mb-1" />
              <span className="text-[9px] font-bold text-muted uppercase block">Tempo</span>
              <span className="text-[15px] font-extrabold text-foreground font-heading">{elapsedTime.slice(0, 5)}h</span>
            </div>
          </section>

          {/* Botão Finalizar */}
          <button
            onClick={async () => {
              setIsFinishing(true);
              setJourneyError(null);
              const result = await finishJourney();
              setIsFinishing(false);
              if (result && result.data) router.push(`/jornada/resumo?id=${result.data.id}`);
              else router.push('/');
            }}
            disabled={isFinishing}
            className="w-full py-3.5 bg-primary-muted text-white font-extrabold text-[14px] rounded-[20px] flex items-center justify-center space-x-2 shadow-lg hover:bg-primary/80 transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50"
          >
            {isFinishing ? <span>Salvando...</span> : (
              <><Square size={16} fill="white" className="mr-1" /><span>Finalizar Corrida</span></>
            )}
          </button>
        </>
      ) : (
        <>
          {/* Header Histórico */}
          <header className="flex items-center justify-center py-2">
            <h1 className="text-[16px] font-extrabold text-foreground font-heading">Corridas</h1>
          </header>

          {/* Stats Gerais */}
          <section className="bg-card border border-border rounded-[20px] p-3.5 shadow-premium flex justify-between items-center text-center">
            <div className="flex-1">
              <span className="text-[9px] font-bold text-muted block uppercase">Km Total</span>
              <span className="text-[14px] font-extrabold text-foreground mt-0.5 block font-heading">{totalCompletedDistance.toFixed(0)} km</span>
            </div>
            <div className="border-l border-border h-6"></div>
            <div className="flex-1">
              <span className="text-[9px] font-bold text-muted block uppercase">Tempo</span>
              <span className="text-[14px] font-extrabold text-foreground mt-0.5 block font-heading">{Math.floor(totalCompletedHours)}h {Math.round((totalCompletedHours % 1) * 60)}m</span>
            </div>
            <div className="border-l border-border h-6"></div>
            <div className="flex-1">
              <span className="text-[9px] font-bold text-muted block uppercase">Corridas</span>
              <span className="text-[14px] font-extrabold text-foreground mt-0.5 block font-heading">{historicalJourneys.length}</span>
            </div>
          </section>

          {/* Timeline */}
          <section>
            {historicalJourneys.length === 0 ? (
              <div className="bg-card border border-border rounded-[20px] p-6 text-center">
                <p className="text-[13px] text-muted font-bold">Nenhuma corrida registrada.</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[18px] top-0 bottom-0 w-[2px] bg-border"></div>
                <div className="space-y-1">
                  {historicalJourneys.map((journey, index) => {
                    const isLast = index === historicalJourneys.length - 1;
                    return (
                      <div key={journey.id} className="relative flex items-start pl-10">
                        <div className="absolute left-[12px] top-4 w-[14px] h-[14px] rounded-full border-[3px] border-card z-10 bg-emerald-500"></div>
                        <div className={`flex-1 ${isLast ? '' : 'mb-1.5'}`}>
                          <div className="bg-card border border-border rounded-[16px] p-3 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-[13px] font-extrabold text-foreground block font-heading">{formatJourneyDate(journey.started_at)}</span>
                                <span className="text-[10px] font-semibold text-muted mt-0.5 block">{formatJourneyTimeRange(journey.started_at, journey.ended_at)}</span>
                              </div>
                              <span className="text-[14px] font-extrabold text-foreground font-heading">{journey.distance_km.toFixed(1).replace('.', ',')} km</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-muted">
                              <div className="flex items-center space-x-1">
                                <Clock size={12} />
                                <span>{Math.floor(journey.duration_minutes / 60)}h {journey.duration_minutes % 60}m</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Route size={12} />
                                <span>{journey.distance_km.toFixed(1).replace('.', ',')} km</span>
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
        </>
      )}
    </div>
  );
}
