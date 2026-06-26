'use client';

import { Sparkles, TrendingUp, Trophy, AlertTriangle, Fuel, Clock } from 'lucide-react';
import React from 'react';
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
    borderColor: 'hover:border-[#10B981]/30'
  },
  info: {
    icon: Sparkles,
    iconColor: 'text-[#3B82F6]',
    bgColor: 'bg-[#3B82F6]/10',
    borderColor: 'hover:border-[#3B82F6]/30'
  },
  success: {
    icon: Trophy,
    iconColor: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
    borderColor: 'hover:border-[#F59E0B]/30'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
    borderColor: 'hover:border-[#EF4444]/30'
  },
  fuel: {
    icon: Fuel,
    iconColor: 'text-[#F97316]',
    bgColor: 'bg-[#F97316]/10',
    borderColor: 'hover:border-[#F97316]/30'
  },
  hourly: {
    icon: Clock,
    iconColor: 'text-[#8B5CF6]',
    bgColor: 'bg-[#8B5CF6]/10',
    borderColor: 'hover:border-[#8B5CF6]/30'
  }
};

export function InsightsSection({ insights, hasData }: InsightsSectionProps) {
  return (
    <section className="bg-card border border-border rounded-[20px] p-4 shadow-premium card-premium space-y-3.5 animate-fade-in-up">
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
        <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4 hide-scrollbar">
          {insights.map((insight, index) => {
            const theme = INSIGHT_THEMES[insight.type] || INSIGHT_THEMES.info;
            const IconComponent = theme.icon;
            
            return (
              <div 
                key={index} 
                className={`flex-shrink-0 w-36 bg-card-secondary/50 border border-border/50 rounded-2xl p-3 flex flex-col justify-between h-28 hover:bg-card-secondary/80 ${theme.borderColor} transition-all active:scale-[0.98] cursor-pointer`}
              >
                {/* Header do Card */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider truncate mr-1">
                    {insight.title}
                  </span>
                  <div className={`w-5 h-5 rounded-md ${theme.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent size={12} className={theme.iconColor} />
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="mt-2 space-y-0.5">
                  <p className="text-[13px] font-black text-foreground tracking-tight leading-none font-heading line-clamp-2">
                    {insight.value}
                  </p>
                  <p className="text-[9px] font-extrabold text-muted leading-tight line-clamp-2">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
