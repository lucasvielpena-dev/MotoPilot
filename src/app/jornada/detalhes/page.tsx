'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowLeft, Share2, Clock, Route, Package, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Journey } from '@/hooks/useJourneys';
import type { Entry } from '@/hooks/useEntries';

const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

function DetalhesJornadaConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [journey, setJourney] = useState<Journey | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailTab, setDetailTab] = useState<'mapa' | 'resumo'>('mapa');

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setLoading(true);
      const { data: jData } = await supabase.from('journeys').select('*').eq('id', id).single();
      const { data: eData } = await supabase.from('entries').select('*').eq('journey_id', id);
      if (jData) setJourney(jData as Journey);
      if (eData) setEntries(eData as Entry[]);
      setLoading(false);
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="text-center py-12 space-y-4 px-4">
        <p className="text-muted font-bold">Jornada não encontrada.</p>
        <button onClick={() => router.push('/jornada')} className="bg-primary hover:bg-primary/95 text-white font-bold px-5 py-2.5 rounded-xl text-[14px] cursor-pointer">
          Voltar
        </button>
      </div>
    );
  }

  const gains = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const expenses = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const profit = gains - expenses;
  const deliveries = entries.filter(e => e.type === 'gain').length;
  const durationHours = journey.duration_minutes / 60;
  const avgEarningsPerHour = durationHours > 0 ? gains / durationHours : 0;

  const formatJourneyDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${weekdays[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
  };

  const getHourTime = (dateStr: string | null) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleShare = async () => {
    const text = `Jornada - ${formatJourneyDate(journey!.started_at)}\nDistância: ${journey!.distance_km.toFixed(1).replace('.', ',')} km\nTempo: ${Math.floor(journey!.duration_minutes / 60)}h ${journey!.duration_minutes % 60}m\nLucro: R$ ${profit.toFixed(2).replace('.', ',')}`;
    if (navigator.share) {
      await navigator.share({ title: 'MotoPilot', text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="space-y-3 pb-28 pt-2 px-4 animate-fade-in-up">
      {/* Header */}
      <header className="flex items-center justify-between py-2">
        <button onClick={() => router.push('/jornada')} className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="text-[16px] font-extrabold text-foreground font-heading">Detalhes</h1>
        <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer">
          <Share2 size={22} strokeWidth={2.5} />
        </button>
      </header>

      {/* Date + Profit */}
      <section className="bg-card border border-border rounded-[20px] p-5 shadow-premium flex justify-between items-center">
        <div>
          <span className="text-[15px] font-extrabold text-foreground block">{formatJourneyDate(journey.started_at)}</span>
          <span className="text-[12px] font-semibold text-muted mt-0.5 block">
            {Math.floor(journey.duration_minutes / 60)}h {journey.duration_minutes % 60}m
          </span>
        </div>
        <span className="text-[20px] font-extrabold text-[#19A85B] font-heading">R$ {profit.toFixed(2).replace('.', ',')}</span>
      </section>

      {/* Stats Grid */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
          <div>
            <span className="text-[10px] font-bold text-muted block uppercase">Início</span>
            <span className="text-[15px] font-extrabold text-foreground mt-0.5 block">{getHourTime(journey.started_at)}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted block uppercase">Término</span>
            <span className="text-[15px] font-extrabold text-foreground mt-0.5 block">{getHourTime(journey.ended_at)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center"><Clock size={16} className="text-muted" /></div>
            <div>
              <span className="text-[10px] font-bold text-muted block uppercase">Tempo</span>
              <span className="text-[14px] font-extrabold text-foreground font-heading">{Math.floor(journey.duration_minutes / 60)}h {journey.duration_minutes % 60}m</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center"><Route size={16} className="text-muted" /></div>
            <div>
              <span className="text-[10px] font-bold text-muted block uppercase">Km</span>
              <span className="text-[14px] font-extrabold text-foreground font-heading">{journey.distance_km.toFixed(1).replace('.', ',')} km</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center"><Package size={16} className="text-muted" /></div>
            <div>
              <span className="text-[10px] font-bold text-muted block uppercase">Entregas</span>
              <span className="text-[14px] font-extrabold text-foreground font-heading">{deliveries}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-foreground/5 flex items-center justify-center"><TrendingUp size={16} className="text-muted" /></div>
            <div>
              <span className="text-[10px] font-bold text-muted block uppercase">Média/h</span>
              <span className="text-[14px] font-extrabold text-foreground font-heading">R$ {avgEarningsPerHour.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-sm">
        {detailTab === 'mapa' ? (
          <div className="w-full relative overflow-hidden rounded-[16px]">
            <MiniMap isTracking={false} />
          </div>
        ) : (
          <div className="space-y-2">
            {entries.length === 0 ? (
              <p className="text-[13px] text-muted py-3 text-center">Nenhum lançamento vinculado.</p>
            ) : (
              entries.map(e => (
                <div key={e.id} className="flex justify-between items-center py-2.5 px-3 bg-card-secondary rounded-xl">
                  <div>
                    <span className="text-[13px] font-bold text-foreground block">{e.description}</span>
                    <span className="text-[11px] font-semibold text-muted block">{e.type === 'gain' ? 'Faturamento' : 'Despesa'}</span>
                  </div>
                  <span className={`text-[13px] font-extrabold ${e.type === 'gain' ? 'text-[#19A85B]' : 'text-[#EA1D2C]'}`}>
                    {e.type === 'gain' ? '+' : '-'} R$ {e.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Tab Selector */}
      <div className="flex bg-card-secondary/80 p-1 rounded-2xl border border-border">
        <button onClick={() => setDetailTab('mapa')} className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${detailTab === 'mapa' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-foreground'}`}>
          Mapa
        </button>
        <button onClick={() => setDetailTab('resumo')} className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${detailTab === 'resumo' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-foreground'}`}>
          Resumo
        </button>
      </div>
    </div>
  );
}

export default function DetalhesJornada() {
  return (
    <Suspense fallback={<div className="flex flex-col items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <DetalhesJornadaConteudo />
    </Suspense>
  );
}
