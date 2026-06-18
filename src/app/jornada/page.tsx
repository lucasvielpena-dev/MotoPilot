'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { MapPin, Clock, Stop, Play, WifiHigh, Warning, MapTrifold } from '@phosphor-icons/react';
import { useJourneys } from '@/hooks/useJourneys';
import { useGoals } from '@/hooks/useGoals';

// O mapa usa a window global, então no Next.js precisamos carregar dinamicamente sem SSR.
const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

export default function Jornada() {
  const router = useRouter();
  const { activeJourney, historicalJourneys, loading, startJourney, finishJourney, fetchHistoricalJourneys, liveDistance, isTracking, gpsAccuracy, gpsStatus, trackerError } = useJourneys();
  const { dailyGoal } = useGoals();
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [durationHours, setDurationHours] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    fetchHistoricalJourneys();
  }, [fetchHistoricalJourneys]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJourney) {
      interval = setInterval(() => {
        const start = new Date(activeJourney.started_at).getTime();
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
    }
    return () => clearInterval(interval);
  }, [activeJourney]);

  if (loading) return null;

  // Cálculo de estimativa simples para fins de visualização (ex: R$ 1.20 por KM)
  const estimatedGains = liveDistance * 1.20;

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="mb-6">
        <h1 className="text-[20px] font-semibold tracking-tight text-[var(--color-foreground)]">
          {activeJourney ? 'Jornada Ativa' : 'Iniciar Jornada'}
        </h1>
        {activeJourney && (
          <p className="text-[14px] text-[var(--color-muted)] mt-1">
            Iniciada às {new Date(activeJourney.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </header>

      {/* Alerta de GPS */}
      {trackerError && (
        <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl flex items-start space-x-3 shadow-sm">
          <Warning size={24} className="text-red-500 flex-shrink-0" />
          <p className="text-[14px] text-red-500">{trackerError}</p>
        </div>
      )}

      {/* Status da Jornada */}
      <section className={`card-premium rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden animate-fade-in-up ${activeJourney ? 'border-[var(--color-primary)]/40' : ''}`}>
        <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center ${activeJourney ? 'border-[var(--color-primary)] shadow-[0_0_20px_rgba(61,219,97,0.2)]' : 'border-[var(--color-border)]'}`}>
          <Clock size={48} weight="fill" className={`${activeJourney ? 'text-[var(--color-primary)] animate-pulse' : 'text-[var(--color-muted)]'}`} />
        </div>
        <div className="text-center z-10">
          <div className="text-[48px] leading-none font-bold tracking-tight text-[var(--color-foreground)] tabular-nums">{elapsedTime}</div>
          <p className="text-[16px] font-medium text-[var(--color-muted)] mt-2">Tempo Online</p>
        </div>
      </section>

      {activeJourney ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <section className="card-premium rounded-3xl p-6 space-y-6 relative animate-fade-in-up delay-75">
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center space-x-3">
                  <WifiHigh size={24} weight="bold" className={`${isTracking ? 'text-[#3DDB61]' : 'text-[var(--color-muted)]'}`} />
                  <span className="text-[16px] font-medium text-[var(--color-foreground)]">
                    {isTracking ? 'Sinal Estável' : 'Buscando satélites...'}
                  </span>
                </div>
                {isTracking && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DDB61] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3DDB61]"></span>
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[14px] font-medium text-[var(--color-muted)] mb-2 uppercase tracking-wider">Odômetro</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-[32px] leading-none font-bold tracking-tight text-[var(--color-foreground)]">{liveDistance.toFixed(1).replace('.', ',')}</span>
                    <span className="text-[16px] font-semibold text-[var(--color-muted)]">km</span>
                  </div>
                  {/* Indicador de GPS */}
                  <div className="flex items-center space-x-2 mt-3">
                    <span className={`flex h-2 w-2 relative ${
                      gpsStatus === 'active' ? '' : gpsStatus === 'acquiring' ? '' : ''
                    }`}>
                      {gpsStatus === 'active' && (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3DDB61] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3DDB61]"></span>
                        </>
                      )}
                      {gpsStatus === 'acquiring' && (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400 animate-pulse"></span>
                      )}
                      {gpsStatus === 'inactive' && (
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                      )}
                    </span>
                    <span className="text-[12px] text-[var(--color-muted)]">
                      GPS: {gpsStatus === 'active' ? 'ativo' : gpsStatus === 'acquiring' ? 'buscando...' : 'inativo'}
                      {gpsStatus === 'active' && gpsAccuracy && ` | Precisão: ${gpsAccuracy}m`}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-[14px] font-medium text-[var(--color-muted)] mb-2 uppercase tracking-wider">Estimado</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-[32px] leading-none font-bold tracking-tight text-[var(--color-primary)]">R$ {estimatedGains.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </section>

            <button 
              onClick={async () => {
                setIsFinishing(true);
                await finishJourney();
                setIsFinishing(false);
                router.push('/');
              }}
              disabled={isFinishing}
              className="w-full bg-[var(--color-card-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] font-bold py-5 rounded-3xl flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] disabled:opacity-50 text-[20px]"
            >
              <Stop size={24} weight="fill" />
              <span>{isFinishing ? 'Calculando...' : 'Encerrar Jornada'}</span>
            </button>
          </div>

          {/* Mapa Embutido na Direita */}
          <section className="card-premium rounded-3xl p-6 space-y-4 animate-fade-in-up delay-150">
            <h3 className="text-[16px] font-semibold text-[var(--color-foreground)] flex items-center space-x-2">
              <MapTrifold size={20} className="text-[var(--color-muted)]" />
              <span>Visualização do GPS</span>
            </h3>
            <div className="w-full">
               <MiniMap isTracking={isTracking} />
            </div>
          </section>
        </div>
      ) : (
        <section className="space-y-6 pt-2">
          <button 
            onClick={async () => {
              await startJourney();
            }}
            className="w-full bg-[var(--color-primary)] text-[#000000] hover:brightness-110 font-bold py-5 rounded-3xl flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] text-[20px]"
          >
            <Play size={24} weight="fill" />
            <span>Iniciar Jornada</span>
          </button>

          {/* Histórico Recente */}
          <div className="pt-6">
            <h2 className="text-[18px] font-semibold text-[var(--color-foreground)] mb-4">Histórico Recente</h2>
            <div className="space-y-3">
              {historicalJourneys.length === 0 ? (
                <div className="card-premium rounded-3xl p-6 text-center">
                  <p className="text-[14px] text-[var(--color-muted)]">Nenhum histórico disponível.</p>
                </div>
              ) : (
                historicalJourneys.map((journey, index) => (
                  <div 
                    key={journey.id} 
                    className="flex justify-between items-center card-premium p-5 rounded-2xl animate-fade-in-up"
                    style={{ animationDelay: `${100 + index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[var(--color-card-secondary)] rounded-2xl flex flex-col items-center justify-center leading-none">
                        <span className="text-[10px] font-medium text-[var(--color-muted)] uppercase">{new Date(journey.started_at).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                        <span className="text-[18px] font-bold text-[var(--color-foreground)]">{new Date(journey.started_at).getDate()}</span>
                      </div>
                      <div>
                        <p className="text-[16px] font-medium text-[var(--color-foreground)]">{new Date(journey.started_at).toLocaleDateString()}</p>
                        <p className="text-[14px] text-[var(--color-muted)]">{Math.floor(journey.duration_minutes / 60)}h {journey.duration_minutes % 60}m</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[16px] font-bold text-[var(--color-foreground)]">{journey.distance_km.toFixed(1)} km</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}


