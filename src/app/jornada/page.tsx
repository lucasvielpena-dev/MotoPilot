'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Clock, Route, Square, MapPin, Zap } from 'lucide-react';
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
    ? gpsAccuracy <= 15 ? 'Alta' : gpsAccuracy <= 40 ? 'Média' : 'Baixa'
    : 'Inativo';
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

  const gpsLabel = `${accuracyLabel}${gpsAccuracy !== null ? ` · ${gpsAccuracy}m` : ''}`;

  return (
    <div className="space-y-3 pb-28 pt-2 px-4 animate-fade-in-up">
      {activeJourney ? (
        <>
          {/* Header Ativo */}
          <header className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[13px] font-extrabold text-foreground font-heading">Corrida ativa</span>
            </div>
            <span className="text-[11px] font-bold text-muted">Início {activeStartTime}</span>
          </header>

          {(trackerError || journeyError) && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-[16px]">
              <p className="text-[12px] text-red-500 font-medium">{trackerError || journeyError}</p>
            </div>
          )}

          {/* Mapa */}
          <section className="relative w-full rounded-[20px] overflow-hidden border border-border shadow-premium bg-card">
            <div className="absolute top-3 left-3 z-[400] flex items-center space-x-1.5 bg-card/90 backdrop-blur-md border border-border rounded-full px-2.5 py-1 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full ${accuracyColor}`}></span>
              <span className="text-[10px] font-bold text-foreground">{gpsLabel}</span>
            </div>
            <div className="w-full h-[280px] relative">
              <MiniMap isTracking={isTracking} className="h-full w-full" />
            </div>
          </section>

          {/* Stats - 3 colunas limpas */}
          <section className="grid grid-cols-3 gap-2">
            <div className="bg-card border border-border rounded-[20px] p-3.5 shadow-sm text-center">
              <MapPin size={14} className="text-primary mx-auto mb-1" />
              <span className="text-[9px] font-bold text-muted uppercase block">Distância</span>
              <span className="text-[17px] font-black text-foreground font-heading block mt-0.5">
                {liveDistance.toFixed(1).replace('.', ',')}
              </span>
              <span className="text-[9px] font-bold text-muted">km</span>
            </div>
            <div className="bg-card border border-border rounded-[20px] p-3.5 shadow-sm text-center">
              <Zap size={14} className="text-primary mx-auto mb-1" />
              <span className="text-[9px] font-bold text-muted uppercase block">Velocidade</span>
              <span className="text-[17px] font-black text-foreground font-heading block mt-0.5">
                {speed !== null ? speed : '0'}
              </span>
              <span className="text-[9px] font-bold text-muted">km/h</span>
            </div>
            <div className="bg-card border border-border rounded-[20px] p-3.5 shadow-sm text-center">
              <Clock size={14} className="text-primary mx-auto mb-1" />
              <span className="text-[9px] font-bold text-muted uppercase block">Tempo</span>
              <span className="text-[17px] font-black text-foreground font-heading block mt-0.5">
                {elapsedTime.slice(0, 5)}
              </span>
              <span className="text-[9px] font-bold text-muted">h</span>
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
            className="w-full py-3.5 bg-[#EA1D2C] text-white font-extrabold text-[14px] rounded-[20px] flex items-center justify-center shadow-lg hover:bg-[#EA1D2C]/80 transition-all active:scale-[0.97] cursor-pointer disabled:opacity-50"
          >
            {isFinishing ? (
              <span>Salvando...</span>
            ) : (
              <div className="flex items-center space-x-2">
                <Square size={16} fill="white" />
                <span>Finalizar Corrida</span>
              </div>
            )}
          </button>
        </>
      ) : (
        <>
          {/* Header Inativo */}
          <header className="flex items-center justify-center py-2">
            <h1 className="text-[16px] font-extrabold text-foreground font-heading">Corridas</h1>
          </header>

          {/* Stats Gerais */}
          <section className="grid grid-cols-3 gap-2">
            <div className="bg-card border border-border rounded-[20px] p-3.5 shadow-sm text-center">
              <span className="text-[9px] font-bold text-muted uppercase block">Km Total</span>
              <span className="text-[16px] font-black text-foreground font-heading block mt-0.5">
                {totalCompletedDistance.toFixed(0)}
              </span>
              <span className="text-[9px] font-bold text-muted">km</span>
            </div>
            <div className="bg-card border border-border rounded-[20px] p-3.5 shadow-sm text-center">
              <span className="text-[9px] font-bold text-muted uppercase block">Tempo</span>
              <span className="text-[16px] font-black text-foreground font-heading block mt-0.5">
                {Math.floor(totalCompletedHours)}h{Math.round((totalCompletedHours % 1) * 60) > 0 ? ` ${Math.round((totalCompletedHours % 1) * 60)}m` : ''}
              </span>
              <span className="text-[9px] font-bold text-muted">total</span>
            </div>
            <div className="bg-card border border-border rounded-[20px] p-3.5 shadow-sm text-center">
              <span className="text-[9px] font-bold text-muted uppercase block">Corridas</span>
              <span className="text-[16px] font-black text-foreground font-heading block mt-0.5">
                {historicalJourneys.length}
              </span>
              <span className="text-[9px] font-bold text-muted">feitas</span>
            </div>
          </section>

          {/* Lista de Corridas */}
          <section>
            {historicalJourneys.length === 0 ? (
              <div className="bg-card border border-border rounded-[20px] p-8 text-center">
                <Route size={28} className="text-muted mx-auto mb-2 opacity-50" />
                <p className="text-[13px] text-muted font-bold">Nenhuma corrida registrada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {historicalJourneys.map((journey) => (
                  <button
                    key={journey.id}
                    onClick={() => router.push(`/jornada/detalhes?id=${journey.id}`)}
                    className="w-full bg-card border border-border rounded-[20px] p-3.5 shadow-sm text-left active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-[13px] font-extrabold text-foreground font-heading block">
                          {formatJourneyDate(journey.started_at)}
                        </span>
                        <span className="text-[11px] font-semibold text-muted block mt-0.5">
                          {formatJourneyTimeRange(journey.started_at, journey.ended_at)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[16px] font-black text-primary font-heading block">
                          {journey.distance_km.toFixed(1).replace('.', ',')}
                        </span>
                        <span className="text-[10px] font-bold text-muted">km</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-2 pt-2 border-t border-border/60 text-[10px] font-bold text-muted">
                      <div className="flex items-center space-x-1">
                        <Clock size={11} />
                        <span>{Math.floor(journey.duration_minutes / 60)}h {journey.duration_minutes % 60}m</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
