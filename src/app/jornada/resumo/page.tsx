'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Share2, 
  Clock, 
  Map, 
  ShoppingBag, 
  TrendingUp, 
  Fuel, 
  Trophy,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import type { Journey } from '@/hooks/useJourneys';
import type { Entry } from '@/hooks/useEntries';

function ResumoJornadaConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [journey, setJourney] = useState<Journey | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [dailyGoal, setDailyGoal] = useState<number>(250);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Carrega a meta diária do localStorage para o percentual da meta
    const savedGoals = localStorage.getItem('motopilot_goals');
    if (savedGoals) {
      try {
        const parsed = JSON.parse(savedGoals);
        if (parsed.daily) setDailyGoal(parsed.daily);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      
      // Busca a jornada
      const { data: jData } = await supabase
        .from('journeys')
        .select('*')
        .eq('id', id)
        .single();

      // Busca os lançamentos vinculados à jornada
      const { data: eData } = await supabase
        .from('entries')
        .select('*')
        .eq('journey_id', id);

      if (jData) setJourney(jData as Journey);
      if (eData) setEntries(eData as Entry[]);
      
      setLoading(false);
    };

    loadData();
  }, [id]);

  // Cálculos Financeiros da Jornada
  const totalGains = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalGains - totalExpenses;
  const deliveriesCount = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + (curr.rides_count || 1), 0);
  
  const fuelExpenses = entries
    .filter(e => e.type === 'expense')
    .filter(e => {
      const d = (e.description || '').toLowerCase();
      return d.includes('combustível') || d.includes('gasolina') || d.includes('abastecer');
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  const durationHours = journey ? journey.duration_minutes / 60 : 0;
  const distanceKm = journey ? journey.distance_km : 0;
  
  const avgHourlyEarnings = durationHours > 0 ? totalGains / durationHours : 0;
  const avgProfitPerKm = distanceKm > 0 ? netProfit / distanceKm : 0;
  
  const goalPercentage = dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100) : 0;

  // Encontra a plataforma mais lucrativa da jornada
  const platformTotals: Record<string, number> = {};
  entries.filter(e => e.type === 'gain').forEach(e => {
    const desc = (e.description || '').toLowerCase();
    const platforms = ['ifood', 'aiqfome', 'uber', '99', 'indrive', 'lalamove', 'shopee', 'loggi'];
    const matched = platforms.find(p => desc.includes(p));
    if (matched) {
      platformTotals[matched] = (platformTotals[matched] || 0) + e.amount;
    }
  });
  const sortedPlatforms = Object.entries(platformTotals).sort((a, b) => b[1] - a[1]);
  const topPlatform = sortedPlatforms.length > 0 ? sortedPlatforms[0][0] : 'Nenhuma';

  // Formatador de data
  const formatJourneyDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // Exportar imagem via Canvas do navegador
  const handleExportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configura canvas de alta resolução 1080x1080
    canvas.width = 1080;
    canvas.height = 1080;

    // Fundo Gradiente Verde
    const grad = ctx.createLinearGradient(0, 0, 0, 1080);
    grad.addColorStop(0, '#121212');
    grad.addColorStop(1, '#0b0b0b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Borda Decorativa da Marca
    ctx.fillStyle = '#EA1D2C'; // Cor MotoPilot
    ctx.fillRect(0, 0, 1080, 20);

    // Textos Principais
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 46px Poppins, sans-serif';
    ctx.fillText('MOTOPILOT', 80, 110);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '700 24px Plus Jakarta Sans, sans-serif';
    ctx.fillText(`JORNADA DE ${journey ? formatJourneyDate(journey.started_at) : 'HOJE'}`, 80, 155);

    // Caixa de Destaque - Lucro Líquido
    ctx.fillStyle = 'rgba(29, 185, 107, 0.1)';
    ctx.strokeStyle = 'rgba(29, 185, 107, 0.2)';
    ctx.lineWidth = 4;
    ctx.roundRect ? ctx.roundRect(80, 210, 920, 200, 32) : ctx.rect(80, 210, 920, 200);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1DB96B';
    ctx.font = '700 22px Plus Jakarta Sans, sans-serif';
    ctx.fillText('LUCRO LÍQUIDO DA JORNADA', 120, 270);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 76px Poppins, sans-serif';
    ctx.fillText(`R$ ${netProfit.toFixed(2).replace('.', ',')}`, 120, 360);

    // Detalhes da Grade de Estatísticas
    const gridItems = [
      { label: 'Tempo Trabalhado', val: journey ? `${Math.floor(journey.duration_minutes / 60)}h ${journey.duration_minutes % 60}m` : '--' },
      { label: 'Distância Percorrida', val: `${distanceKm.toFixed(1).replace('.', ',')} km` },
      { label: 'Total de Entregas', val: `${deliveriesCount} ent.` },
      { label: 'Média por Hora', val: `R$ ${avgHourlyEarnings.toFixed(2).replace('.', ',')}/h` },
      { label: 'Lucro por Km', val: `R$ ${avgProfitPerKm.toFixed(2).replace('.', ',')}/km` },
      { label: 'Plataforma Principal', val: topPlatform.toUpperCase() },
      { label: 'Combustível', val: `R$ ${fuelExpenses.toFixed(2).replace('.', ',')}` },
      { label: 'Meta Diária batida', val: `${goalPercentage.toFixed(0)}%` }
    ];

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#222222';

    gridItems.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      
      const x = 80 + col * 480;
      const y = 470 + row * 130;

      // Desenha caixa para cada info
      ctx.fillStyle = '#121212';
      ctx.roundRect ? ctx.roundRect(x, y, 440, 105, 16) : ctx.rect(x, y, 440, 105);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#A1A1AA';
      ctx.font = '700 18px Plus Jakarta Sans, sans-serif';
      ctx.fillText(item.label.toUpperCase(), x + 25, y + 40);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 28px Poppins, sans-serif';
      ctx.fillText(item.val, x + 25, y + 80);
    });

    // Rodapé
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '700 20px Plus Jakarta Sans, sans-serif';
    ctx.fillText('Gerado automaticamente pelo aplicativo MotoPilot', 80, 1020);

    // Baixar a Imagem
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `motopilot-resumo-${journey ? formatJourneyDate(journey.started_at) : 'jornada'}.png`;
    link.href = url;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[14px] text-muted font-bold">Gerando resumo da jornada...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-28 pt-2 animate-fade-in-up">
      {/* Header */}
      <header className="flex justify-between items-center bg-card px-2 py-3 border-b border-border -mx-4">
        <button 
          onClick={() => router.push('/')}
          className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <h1 className="text-[16px] font-extrabold text-foreground font-heading">Resumo da Jornada</h1>
        <div className="w-10 h-10" />
      </header>

      {/* Caixa de Mensagem Motivacional baseada na Meta */}
      <section className="bg-primary/10 border border-primary/20 rounded-[20px] p-4 flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-[22px] flex-shrink-0 animate-bounce">
          🏆
        </div>
        <div className="space-y-0.5">
          <h3 className="text-[13px] font-extrabold text-foreground font-heading">Jornada Concluída!</h3>
          <p className="text-[11px] text-muted font-semibold leading-relaxed">
            {goalPercentage >= 100 
              ? 'Excelente piloto! Meta diária concluída e bolso cheio!' 
              : 'Bom trabalho piloto! Cada quilômetro te aproxima dos seus objetivos!'}
          </p>
        </div>
      </section>

      {/* Caixa do Lucro Principal */}
      <section className="bg-card border border-border rounded-[24px] p-5 shadow-premium text-center space-y-2">
        <span className="text-[11px] font-black text-muted uppercase tracking-wider block">LUCRO LÍQUIDO</span>
        <div className="text-[34px] font-black text-[#1DB96B] tracking-tight font-heading">
          R$ {netProfit.toFixed(2).replace('.', ',')}
        </div>
        <div className="flex justify-center space-x-4 text-[11px] font-bold text-muted pt-2 border-t border-border/60">
          <span>Ganhos: <strong className="text-foreground">R$ {totalGains.toFixed(0)}</strong></span>
          <span>·</span>
          <span>Gastos: <strong className="text-foreground">R$ {totalExpenses.toFixed(0)}</strong></span>
        </div>
      </section>

      {/* Grid de Estatísticas Detalhadas */}
      <section className="grid grid-cols-2 gap-3">
        {/* Tempo */}
        <div className="bg-card border border-border rounded-[20px] p-4 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-muted">
            <Clock size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Tempo</span>
          </div>
          <span className="text-[16px] font-extrabold text-foreground font-heading">
            {journey ? `${Math.floor(journey.duration_minutes / 60)}h ${journey.duration_minutes % 60}m` : '0h 0m'}
          </span>
        </div>

        {/* Quilômetros */}
        <div className="bg-card border border-border rounded-[20px] p-4 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-muted">
            <Map size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Distância</span>
          </div>
          <span className="text-[16px] font-extrabold text-foreground font-heading">
            {distanceKm.toFixed(1).replace('.', ',')} km
          </span>
        </div>

        {/* Entregas */}
        <div className="bg-card border border-border rounded-[20px] p-4 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-muted">
            <ShoppingBag size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Entregas</span>
          </div>
          <span className="text-[16px] font-extrabold text-foreground font-heading">
            {deliveriesCount}
          </span>
        </div>

        {/* Média/hora */}
        <div className="bg-card border border-border rounded-[20px] p-4 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-muted">
            <TrendingUp size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Média/hora</span>
          </div>
          <span className="text-[16px] font-extrabold text-foreground font-heading">
            R$ {avgHourlyEarnings.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Lucro por Km */}
        <div className="bg-card border border-border rounded-[20px] p-4 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-muted">
            <TrendingUp size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Lucro/km</span>
          </div>
          <span className="text-[16px] font-extrabold text-foreground font-heading">
            R$ {avgProfitPerKm.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Combustível */}
        <div className="bg-card border border-border rounded-[20px] p-4 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-muted">
            <Fuel size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Combustível</span>
          </div>
          <span className="text-[16px] font-extrabold text-foreground font-heading">
            R$ {fuelExpenses.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Plataforma principal */}
        <div className="bg-card border border-border rounded-[20px] p-4 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-muted">
            <Trophy size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Plataforma</span>
          </div>
          <span className="text-[15px] font-extrabold text-foreground font-heading truncate">
            {topPlatform.toUpperCase()}
          </span>
        </div>

        {/* Percentual concluído */}
        <div className="bg-card border border-border rounded-[20px] p-4 space-y-2 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-muted">
            <Trophy size={16} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Meta Diária</span>
          </div>
          <span className="text-[16px] font-extrabold text-foreground font-heading">
            {goalPercentage.toFixed(0)}%
          </span>
        </div>
      </section>

      {/* Botões de Ações */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleExportImage}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[14px] rounded-[18px] flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer shadow-md"
        >
          <Download size={16} className="mr-1" />
          <span>Salvar como Imagem</span>
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full py-4 bg-card-secondary hover:bg-card-secondary/80 text-foreground font-extrabold text-[14px] rounded-[18px] border border-border transition-all active:scale-[0.98] cursor-pointer"
        >
          Voltar ao Início
        </button>
      </div>

      {/* Canvas Oculto para Renderização de Exportação */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default function ResumoJornada() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[14px] text-muted font-bold">Carregando resumo...</p>
      </div>
    }>
      <ResumoJornadaConteudo />
    </Suspense>
  );
}
