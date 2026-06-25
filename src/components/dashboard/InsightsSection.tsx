'use client';

import { Sparkles, ArrowUpRight } from 'lucide-react';
import React from 'react';

interface InsightsSectionProps {
  insights: string[];
  hasData: boolean;
}

export function InsightsSection({ insights, hasData }: InsightsSectionProps) {
  return (
    <section className="bg-card border border-border rounded-[20px] p-3.5 shadow-premium card-premium space-y-3.5 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Sparkles size={14} className="text-[#F59E0B] fill-[#F59E0B]/10" />
        <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider">Insights Inteligentes</span>
      </div>

      {!hasData || insights.length === 0 ? (
        <div className="text-center py-4 space-y-1">
          <p className="text-[12px] text-muted font-bold">Aguardando mais lançamentos...</p>
          <p className="text-[10px] text-muted/80">Registre suas corridas e jornadas para obter insights automáticos.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className="bg-card-secondary/60 border border-border/50 rounded-xl p-3 flex items-start space-x-2.5 hover:border-primary/20 transition-all hover:scale-[1.01]"
            >
              <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ArrowUpRight size={12} className="text-primary" />
              </div>
              <p className="text-[12px] font-bold text-foreground leading-snug">
                {insight}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
