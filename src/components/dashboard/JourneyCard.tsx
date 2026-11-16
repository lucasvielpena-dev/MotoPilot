'use client';

import { PlayCircle, Square } from 'lucide-react';
import type { Journey } from '@/hooks/useJourneys';

interface JourneyCardProps {
  activeJourney: Journey | null;
  elapsedTime: string;
  liveDistance: number;
  avgHourlyEarnings: number;
  deliveriesCount: number;
  isTransitioning: boolean;
  onStartJourney: () => Promise<unknown>;
  onFinishJourney: () => Promise<unknown>;
}

export function JourneyCard({
  activeJourney,
  elapsedTime,
  liveDistance,
  avgHourlyEarnings,
  deliveriesCount,
  isTransitioning,
  onStartJourney,
  onFinishJourney
}: JourneyCardProps) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${activeJourney ? 'bg-emerald-500' : 'bg-muted'}`} />
          <span className="text-sm font-semibold text-foreground">
            {activeJourney ? 'Jornada ativa' : 'Jornada'}
          </span>
        </div>
        <span className={`text-xs font-medium ${activeJourney ? 'text-emerald-500' : 'text-muted'}`}>
          {activeJourney ? 'Em andamento' : 'Parada'}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <span className="text-xs text-muted block">Tempo</span>
          <span className="text-base font-semibold text-foreground font-heading block mt-1">
            {activeJourney ? elapsedTime : '00:00'}
          </span>
        </div>
        <div className="text-center">
          <span className="text-xs text-muted block">Km</span>
          <span className="text-base font-semibold text-foreground font-heading block mt-1">
            {activeJourney ? liveDistance.toFixed(1).replace('.', ',') : '0,0'}
          </span>
        </div>
        <div className="text-center">
          <span className="text-xs text-muted block">R$/h</span>
          <span className="text-base font-semibold text-foreground font-heading block mt-1">
            {activeJourney ? avgHourlyEarnings.toFixed(0) : '0'}
          </span>
        </div>
        <div className="text-center">
          <span className="text-xs text-muted block">Ent.</span>
          <span className="text-base font-semibold text-foreground font-heading block mt-1">
            {activeJourney ? deliveriesCount : '0'}
          </span>
        </div>
      </div>

      {/* Botão */}
      {activeJourney ? (
        <button
          onClick={onFinishJourney}
          disabled={isTransitioning}
          className="w-full bg-red-500 text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Square size={16} fill="currentColor" />
          {isTransitioning ? 'Encerrando...' : 'Encerrar jornada'}
        </button>
      ) : (
        <button
          onClick={onStartJourney}
          disabled={isTransitioning}
          className="w-full bg-primary text-black font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <PlayCircle size={18} />
          {isTransitioning ? 'Iniciando...' : 'Iniciar jornada'}
        </button>
      )}
    </section>
  );
}