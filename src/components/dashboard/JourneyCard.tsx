'use client';

import { PlayCircle, Square } from 'lucide-react';
import React from 'react';

interface JourneyCardProps {
  activeJourney: any;
  elapsedTime: string;
  liveDistance: number;
  avgHourlyEarnings: number;
  deliveriesCount: number;
  isTransitioning: boolean;
  onStartJourney: () => Promise<any>;
  onFinishJourney: () => Promise<any>;
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
    <section className="bg-card border border-border rounded-[20px] p-3.5 shadow-premium card-premium space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">Controle de Jornada</span>
        {activeJourney ? (
          <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Em andamento</span>
          </span>
        ) : (
          <span className="flex items-center space-x-1 text-[10px] font-bold text-muted uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-muted" />
            <span>Parada</span>
          </span>
        )}
      </div>

      {/* Botão de Controle */}
      {activeJourney ? (
        <button
          onClick={onFinishJourney}
          disabled={isTransitioning}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-3.5 rounded-xl transition-all active:scale-[0.98] text-[14px] flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Square size={14} fill="currentColor" className="mr-1" />
          <span>{isTransitioning ? 'Encerrando...' : 'Encerrar Jornada'}</span>
        </button>
      ) : (
        <button
          onClick={onStartJourney}
          disabled={isTransitioning}
          className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3.5 rounded-xl transition-all active:scale-[0.98] text-[14px] flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
        >
          <PlayCircle size={14} fill="currentColor" className="mr-1" />
          <span>{isTransitioning ? 'Iniciando...' : 'Iniciar Jornada'}</span>
        </button>
      )}

      {/* Grid de Metricas */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-border/80 pt-3">
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Tempo online</span>
          <span className="text-[16px] font-extrabold text-foreground mt-0.5 font-heading">
            {activeJourney ? elapsedTime : '0h 0m'}
          </span>
        </div>
        
        <div className="border-l border-border pl-4 flex flex-col text-left">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Km rodados</span>
          <span className="text-[16px] font-extrabold text-foreground mt-0.5 font-heading">
            {activeJourney ? `${liveDistance.toFixed(1).replace('.', ',')} km` : '0,0 km'}
          </span>
        </div>

        <div className="flex flex-col text-left border-t border-border/85 pt-2.5">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Média/hora</span>
          <span className="text-[16px] font-extrabold text-foreground mt-0.5 font-heading">
            R$ {avgHourlyEarnings.toFixed(2).replace('.', ',')}
          </span>
        </div>
        
        <div className="border-l border-border pl-4 flex flex-col text-left border-t border-border/85 pt-2.5">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Entregas</span>
          <span className="text-[16px] font-extrabold text-foreground mt-0.5 font-heading">
            {deliveriesCount}
          </span>
        </div>
      </div>
    </section>
  );
}
