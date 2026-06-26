'use client';

import { PlayCircle, Square, Clock, Route, TrendingUp, Package } from 'lucide-react';
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
    <section className="bg-card border border-border rounded-[20px] shadow-premium card-premium animate-fade-in-up">
      <div className="p-3.5 space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${activeJourney ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
            <span className="text-[12px] font-extrabold text-foreground uppercase tracking-wide">
              {activeJourney ? 'Jornada Ativa' : 'Jornada'}
            </span>
          </div>
          <span className={`text-[11px] font-bold ${activeJourney ? 'text-emerald-500' : 'text-muted'}`}>
            {activeJourney ? 'Em andamento' : 'Parada'}
          </span>
        </div>

        {/* Stats Grid — sempre visível */}
        <div className="grid grid-cols-4 gap-1.5">
          <div className="bg-card-secondary/50 rounded-xl p-2.5 text-center border border-border/40">
            <Clock size={14} className="text-muted mx-auto mb-1" />
            <span className="text-[8px] font-bold text-muted block uppercase tracking-wider">Tempo</span>
            <span className="text-[13px] font-black text-foreground block font-heading">
              {activeJourney ? elapsedTime : '00:00'}
            </span>
          </div>
          <div className="bg-card-secondary/50 rounded-xl p-2.5 text-center border border-border/40">
            <Route size={14} className="text-muted mx-auto mb-1" />
            <span className="text-[8px] font-bold text-muted block uppercase tracking-wider">Km</span>
            <span className="text-[13px] font-black text-foreground block font-heading">
              {activeJourney ? liveDistance.toFixed(1).replace('.', ',') : '0,0'}
            </span>
          </div>
          <div className="bg-card-secondary/50 rounded-xl p-2.5 text-center border border-border/40">
            <TrendingUp size={14} className="text-muted mx-auto mb-1" />
            <span className="text-[8px] font-bold text-muted block uppercase tracking-wider">R$/h</span>
            <span className="text-[13px] font-black text-foreground block font-heading">
              {activeJourney ? avgHourlyEarnings.toFixed(0) : '0'}
            </span>
          </div>
          <div className="bg-card-secondary/50 rounded-xl p-2.5 text-center border border-border/40">
            <Package size={14} className="text-muted mx-auto mb-1" />
            <span className="text-[8px] font-bold text-muted block uppercase tracking-wider">Ent.</span>
            <span className="text-[13px] font-black text-foreground block font-heading">
              {activeJourney ? deliveriesCount : '0'}
            </span>
          </div>
        </div>

        {/* Botão */}
        {activeJourney ? (
          <button
            onClick={onFinishJourney}
            disabled={isTransitioning}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-3 rounded-2xl transition-all active:scale-[0.98] text-[13px] flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Square size={16} fill="currentColor" />
            <span>{isTransitioning ? 'Encerrando...' : 'Encerrar Jornada'}</span>
          </button>
        ) : (
          <button
            onClick={onStartJourney}
            disabled={isTransitioning}
            className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3 rounded-2xl transition-all active:scale-[0.98] text-[14px] flex items-center justify-center space-x-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            <PlayCircle size={22} fill="currentColor" />
            <span>{isTransitioning ? 'Iniciando...' : 'Iniciar Jornada'}</span>
          </button>
        )}
      </div>
    </section>
  );
}
