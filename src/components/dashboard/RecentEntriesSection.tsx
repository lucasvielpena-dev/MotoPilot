'use client';

import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import type { Entry } from '@/hooks/useEntries';

interface RecentEntriesSectionProps {
  entries: Entry[];
}

// Plataforma Logo helper
const PlatformLogoMini = ({ id, className = 'w-4 h-4' }: { id: string; className?: string }) => {
  switch (id) {
    case 'ifood':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#EA1D2C" />
          <g transform="translate(3.6, 3.6) scale(0.7)">
            <path d="M8.428 1.67c-4.65 0-7.184 4.149-7.184 6.998 0 2.294 2.2 3.299 4.25 3.299l-.006-.006c4.244 0 7.184-3.854 7.184-6.998 0-2.29-2.175-3.293-4.244-3.293zm11.328 0c-4.65 0-7.184 4.149-7.184 6.998 0 2.294 2.2 3.299 4.25 3.299l-.006-.006C21.061 11.96 24 8.107 24 4.963c0-2.29-2.18-3.293-4.244-3.293z" fill="white" />
          </g>
        </svg>
      );
    case 'aiqfome':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FF0066" />
          <path d="M12 7.5c-1.8 0-3.3 1.3-3.6 3-.1 0-.2-.1-.4-.1-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5h8c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5c-.2 0-.3 0-.4.1-.3-1.7-1.8-3-3.6-3z" fill="white" />
          <circle cx="10" cy="12.5" r="0.8" fill="#FF0066" />
          <circle cx="14" cy="12.5" r="0.8" fill="#FF0066" />
          <path d="M11 14c.3.3.7.3 1 0" stroke="#FF0066" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
      );
    case 'uber':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="black" />
          <g transform="translate(3.6, 3.6) scale(0.7)">
            <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101.826 0 1.562-.316 2.094-.87v.736H6.27V7.97H5.082v4.888c0 1.257-.85 2.106-1.947 2.106-1.11 0-1.946-.827-1.946-2.106V7.971H0zm7.44 0v7.925h1.13v-.725c.521.532 1.257.86 2.06.86a3.006 3.006 0 0 0 3.034-3.01 3.01 3.01 0 0 0-3.033-3.024 2.86 2.86 0 0 0-2.049.861V7.971H7.439zm9.869 2.038c-1.687 0-2.965 1.37-2.965 3 0 1.72 1.334 3.01 3.066 3.01 1.053 0 1.913-.463 2.49-1.233l-.826-.611c-.43.577-.996.847-1.664.847-.973 0-1.753-.7-1.912-1.64h4.697v-.373c0-1.72-1.222-3-2.886-3zm6.295.068c-.634 0-1.098.294-1.381.758v-.713h-1.131v5.774h1.142V12.61c0-.894.544-1.47 1.291-1.47H24v-1.065h-.396zm-6.319.928c.85 0 1.564.588 1.756 1.47H15.52c.203-.882.916-1.47 1.765-1.47zm-6.732.012c1.086 0 1.98.883 1.98 2.004a1.993 1.993 0 0 1-1.98 2.001A1.989 1.989 0 0 1 8.56 13.02a1.99 1.99 0 0 1 1.992-2.004z" fill="white" />
          </g>
        </svg>
      );
    case '99':
      return (
        <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FFB300" />
          <g transform="translate(6, 6) skewX(-10)">
            <path d="M5.5 5.5a2.2 2.2 0 1 1-2.2-2.2A2.2 2.2 0 0 1 5.5 5.5zm-.9 0a1.3 1.3 0 1 0-1.3 1.3A1.3 1.3 0 0 0 4.6 5.5zm.9 0c0 1.8-1.2 4-3 5l-.4-.6c1.4-.9 2.2-2.4 2.2-4.4z" fill="black" />
            <path d="M10.5 5.5a2.2 2.2 0 1 1-2.2-2.2A2.2 2.2 0 0 1 10.5 5.5zm-.9 0a1.3 1.3 0 1 0-1.3 1.3A1.3 1.3 0 0 0 9.6 5.5zm.9 0c0 1.8-1.2 4-3 5l-.4-.6c1.4-.9 2.2-2.4 2.2-4.4z" fill="black" />
          </g>
        </svg>
      );
    default:
      return null;
  }
};

export function RecentEntriesSection({ entries }: RecentEntriesSectionProps) {
  const router = useRouter();

  const parseDescription = (entry: Entry) => {
    const parts = (entry.description || '').split(' - ');
    const isGain = entry.type === 'gain';
    
    let title = isGain ? 'Ganho' : (parts[0] || 'Despesa');
    let platformId = '';
    
    if (isGain) {
      const platformCandidate = parts[1] ? parts[1].trim() : '';
      const lowerCandidate = platformCandidate.toLowerCase();
      const platforms = ['ifood', 'aiqfome', 'uber', '99', 'indrive', 'lalamove', 'shopee', 'loggi'];
      const matched = platforms.find(p => lowerCandidate.includes(p));
      if (matched) {
        platformId = matched;
        title = platformCandidate;
      }
    }
    
    return { title, platformId };
  };

  return (
    <section className="bg-card border border-border rounded-[20px] p-3.5 space-y-2.5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock size={14} className="text-muted" />
          <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Últimos Lançamentos</span>
        </div>
        <button 
          onClick={() => router.push('/lancamentos')}
          className="text-[11px] font-extrabold text-primary hover:underline cursor-pointer active:scale-95 transition-all"
        >
          Ver todos
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="text-[12px] text-muted font-bold text-center py-3">Nenhum lançamento registrado</p>
      ) : (
        <div className="space-y-1.5">
          {entries.slice(0, 5).map((entry) => {
            const { title, platformId } = parseDescription(entry);
            const d = new Date(entry.date);
            const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
            
            return (
              <div 
                key={entry.id} 
                className="flex items-center justify-between py-2 px-1 border-b border-border/40 last:border-0 hover:bg-card-secondary/20 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  {platformId ? (
                    <div className="w-6 h-6 rounded-lg bg-card-secondary flex items-center justify-center border border-border/40">
                      <PlatformLogoMini id={platformId} />
                    </div>
                  ) : (
                    <span className={`w-1.5 h-1.5 rounded-full ${entry.type === 'gain' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
                  )}
                  <div>
                    <span className="text-[12px] font-bold text-foreground block truncate max-w-[160px]">{title}</span>
                    <span className="text-[10px] text-muted">{dateStr}</span>
                  </div>
                </div>
                <span className={`text-[13px] font-extrabold font-heading ${entry.type === 'gain' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {entry.type === 'gain' ? '+' : '-'}R$ {entry.amount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
