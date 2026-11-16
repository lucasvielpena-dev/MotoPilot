  'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Square } from 'lucide-react';
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
        setElapsedTime(`\( {h}: \){m}:${s}`);
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
    <div className="space-y-4 pb-28 pt-4 px-4">
      {activeJourney ? (
        <>
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-semibold">Jornada ativa</span>
            </div>
            <span className="text-xs text-muted">Início {activeStartTime}</span>
          </header>

          {(trackerError || journeyError) && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm text-red-500">
              {trackerError || journeyError}
            </div>
          )}

          <section className="rounded-2xl overflow-hidden border border-border bg-card">
            <div className="h-[260px]">
              <MiniMap isTracking={isTracking} className="h-full w-full" />
            </div>
          </section>

          <section className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <span className="text-xs text-muted block">Distância</span>
              <span className="text-xl font-semibold font-heading block mt-1">
                {liveDistance.toFixed(1).replace('.', ',')}
              </span>
              <span className="text-xs text-muted">km</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <span className="text-xs text-muted block">Velocidade</span>
              <span className="text-xl font-semibold font-heading block mt-1">
                {speed ?? 0}
              </span>
              <span className="text-xs text-muted">km/h</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <span className="text-xs text-muted block">Tempo</span>
              <span className="text-xl font-semibold font-heading block mt-1">
                {elapsedTime.slice(0, 5)}
              </span>
              <span className="text-xs text-muted">h</span>
            </div>
          </section>

          <button
            onClick={async () => {
              setIsFinishing(true);
              setJourneyError(null);
              const result = await finishJourney();
              setIsFinishing(false);
              if (result?.data) router.push(`/jornada/resumo?id=${result.data.id}`);
              else router.push('/');
            }}
            disabled={isFinishing}
            className="w-full py-4 bg-red-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Square size={16} fill="white" />
            {isFinishing ? 'Salvando...' : 'Finalizar jornada'}
          </button>
        </>
      ) : (
        <>
          <header className="text-center">
            <h1 className="text-base font-semibold">Jornadas</h1>
          </header>

          <section className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <span className="text-xs text-muted block">Km total</span>
              <span className="text-lg font-semibold font-heading block mt-1">
                {totalCompletedDistance.toFixed(0)}
              </span>
              <span className="text-xs text-muted">km</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <span className="text-xs text-muted block">Tempo</span>
              <span className="text-lg font-semibold font-heading block mt-1">
                {Math.floor(totalCompletedHours)}h
              </span>
              <span className="text-xs text-muted">total</span>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <span className="text-xs text-muted block">Jornadas</span>
              <span className="text-lg font-semibold font-heading block mt-1">
                {historicalJourneys.length}
              </span>
              <span className="text-xs text-muted">feitas</span>
            </div>
          </section>

          <section className="space-y-2">
            {historicalJourneys.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center text-sm text-muted">
                Nenhuma jornada registrada.
              </div>
            ) : (
              historicalJourneys.map((journey) => (
                <button
                  key={journey.id}
                  onClick={() => router.push(`/jornada/detalhes?id=${journey.id}`)}
                  className="w-full bg-card border border-border rounded-2xl p-4 text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium block">
                        {formatJourneyDate(journey.started_at)}
                      </span>
                      <span className="text-xs text-muted block mt-0.5">
                        {formatJourneyTimeRange(journey.started_at, journey.ended_at)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-primary font-heading block">
                        {journey.distance_km.toFixed(1).replace('.', ',')}
                      </span>
                      <span className="text-xs text-muted">km</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
