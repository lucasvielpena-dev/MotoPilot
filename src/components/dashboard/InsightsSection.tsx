'use client';

import { Lightbulb, TrendingUp, Trophy, TriangleAlert, Fuel } from 'lucide-react';
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
    borderColor: 'border-[#10B981]/20'
  },
  info: {
    icon: Lightbulb,
    iconColor: 'text-[#3B82F6]',
    bgColor: 'bg-[#3B82F6]/10',
    borderColor: 'border-[#3B82F6]/20'
  },
  success: {
    icon: Trophy,
    iconColor: 'text-[#F59E0B]',
    bgColor: 'bg-[#F59E0B]/10',
    borderColor: 'border-[#F59E0B]/20'
  },
  warning: {
    icon: TriangleAlert,
    iconColor: 'text-[#EF4444]',
    bgColor: 'bg-[#EF4444]/10',
    borderColor: 'border-[#EF4444]/20'
  },
  fuel: {
    icon: Fuel,
    iconColor: 'text-[#F97316]',
    bgColor: 'bg-[#F97316]/10',
    borderColor: 'border-[#F97316]/20'
  }
};

export function InsightsSection({ insights, hasData }: InsightsSectionProps) {
  return (
    <section className="bg-card border border-border rounded-[20px] p-3.5 shadow-premium card-premium space-y-2.5 animate-fade-in-up">
      <div className="flex items-center space-x-2">
        <Lightbulb size={16} className="text-[#F59E0B] fill-[#F59E0B]/20" />
        <span className="text-[12px] font-extrabold text-foreground uppercase tracking-wider">Insights</span>
      </div>

      {!hasData || insights.length === 0 ? (
        <div className="text-center py-3 space-y-1">
          <Lightbulb size={24} className="text-muted/30 mx-auto" />
          <p className="text-[13px] text-muted font-bold">Aguardando lançamentos...</p>
          <p className="text-[11px] text-muted/60">Registre corridas para ver insights automáticos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {insights.slice(0, 4).map((insight, index) => {
            const theme = INSIGHT_THEMES[insight.type] || INSIGHT_THEMES.info;
            const IconComponent = theme.icon;
            
            return (
              <div 
                key={index} 
                className={`bg-card-secondary/50 border ${theme.borderColor} rounded-[14px] p-3 flex flex-col justify-between hover:bg-card-secondary/80 transition-all active:scale-[0.98] cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-7 h-7 rounded-md ${theme.bgColor} flex items-center justify-center`}>
                    <IconComponent size={16} className={theme.iconColor} strokeWidth={2.5} />
                  </div>
                  <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider">
                    {insight.title}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-[17px] font-black text-foreground tracking-tight leading-none font-heading">
                    {insight.value}
                  </p>
                  <p className="text-[9px] font-bold text-muted mt-1 leading-tight">
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
