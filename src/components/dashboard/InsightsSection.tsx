'use client';

import { Lightbulb, TrendingUp, TrendingDown, Trophy, TriangleAlert, Fuel } from 'lucide-react';
import React, { useRef } from 'react';
import { InsightCardData } from '@/hooks/useFinancialStats';

interface InsightsSectionProps {
  insights: InsightCardData[];
  hasData: boolean;
}

const INSIGHT_THEMES = {
  growth: {
    icon: TrendingUp,
    iconColor: 'text-[#10B981]',
    bgColor: 'bg-[#10B981]/10',
    accentColor: '#10B981',
    borderColor: 'border-[#10B981]/20'
  },
  info: {
    icon: Lightbulb,
    iconColor: 'text-[#3B82F6]',
    bgColor: 'bg-[#3B82F6]/10',
    accentColor: '#3B82F6',
    borderColor: 'border-[#3B82F6]/20'
  },
  success: {
    icon: Trophy,
    iconColor: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
    accentColor: '#F59E0B',
    borderColor: 'border-[#F59E0B]/20'
  },
  warning: {
    icon: TriangleAlert,
    iconColor: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
    accentColor: '#EF4444',
    borderColor: 'border-[#EF4444]/20'
  },
  fuel: {
    icon: Fuel,
    iconColor: 'text-[#F97316]',
    bgColor: 'bg-[#F97316]/10',
    accentColor: '#F97316',
    borderColor: 'border-[#F97316]/20'
  }
};

export function InsightsSection({ insights, hasData }: InsightsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="bg-card border border-border rounded-[20px] p-4 shadow-premium card-premium space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <Lightbulb size={18} className="text-[#F59E0B] fill-[#F59E0B]/20" />
        <span className="text-[13px] font-extrabold text-foreground uppercase tracking-wider">Insights de Hoje</span>
      </div>

      {!hasData || insights.length === 0 ? (
        <div className="text-center py-6 space-y-2">
          <Lightbulb size={28} className="text-muted/40 mx-auto" />
          <p className="text-[14px] text-muted font-bold">Aguardando mais lançamentos...</p>
          <p className="text-[12px] text-muted/70">Registre suas corridas para obter insights automáticos.</p>
        </div>
      ) : (
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth hide-scrollbar"
        >
          {insights.map((insight, index) => {
            const theme = INSIGHT_THEMES[insight.type] || INSIGHT_THEMES.info;
            const IconComponent = theme.icon;
            
            return (
              <div 
                key={index} 
                className={`flex-shrink-0 w-[calc(50%-6px)] snap-start bg-card-secondary/50 border ${theme.borderColor} rounded-[20px] p-4 flex flex-col justify-between min-h-[140px] hover:bg-card-secondary/80 transition-all active:scale-[0.98] cursor-pointer`}
              >
                {/* Ícone + Título */}
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${theme.bgColor} flex items-center justify-center`}>
                    <IconComponent size={26} className={theme.iconColor} strokeWidth={2.5} />
                  </div>
                  <span className="text-[13px] font-extrabold text-muted block leading-tight">
                    {insight.title}
                  </span>
                </div>

                {/* Valor Principal - gigante */}
                <div className="mt-3">
                  <p className="text-[24px] font-black text-foreground tracking-tight leading-none font-heading">
                    {insight.value}
                  </p>
                  <p className="text-[12px] font-bold text-muted mt-1.5 leading-tight">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginação visual */}
      {hasData && insights.length > 2 && (
        <div className="flex justify-center space-x-1.5 pt-1">
          {insights.map((_, index) => (
            <div 
              key={index} 
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === 0 ? 'bg-primary w-4' : 'bg-muted/30'
              }`} 
            />
          ))}
        </div>
      )}
    </section>
  );
}
