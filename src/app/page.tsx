'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Motorbike,
  Eye,
  EyeOff,
  Play,
  Square,
  X,
  LogOut,
  User,
  Settings,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Trophy,
  CalendarDays,
  Timer,
  Fuel
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';
import { useGoals } from '@/hooks/useGoals';
import { supabase } from '@/lib/supabase/client';

// Platform Logo Component (shared with lancamentos)
const PlatformLogo = ({ id, className = 'w-6 h-6' }: { id: string; className?: string }) => {
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
    case 'indrive':
      return (
        <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#00E676" />
          <g transform="translate(7.2, 7)">
            <rect x="1" y="4" width="1.6" height="6" rx="0.4" fill="black" />
            <circle cx="1.8" cy="1.8" r="0.9" fill="black" />
            <rect x="4" y="4" width="1.6" height="6" rx="0.4" fill="black" />
            <path d="M4.5 4.8c.8-1 2.2-1 3 0v5.2" stroke="black" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <rect x="6.9" y="5.5" width="1.6" height="4.5" rx="0.4" fill="black" />
          </g>
        </svg>
      );
    case 'lalamove':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FF6600" />
          <path d="M8 8h2v5h4v2H8V8z" fill="white" />
          <path d="M11 9.5h3.5M11.5 11.5h4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'shopee':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#EE4D2D" />
          <g transform="translate(3.6, 3.6) scale(0.7)">
            <path d="M15.9414 17.9633c.229-1.879-.981-3.077-4.1758-4.0969-1.548-.528-2.277-1.22-2.26-2.1719.065-1.056 1.048-1.825 2.352-1.85a5.2898 5.2898 0 0 1 2.8838.89c.116.072.197.06.263-.039.09-.145.315-.494.39-.62.051-.081.061-.187-.068-.281-.185-.1369-.704-.4149-.983-.5319a6.4697 6.4697 0 0 0-2.5118-.514c-1.909.008-3.4129 1.215-3.5389 2.826-.082 1.1629.494 2.1078 1.73 2.8278.262.152 1.6799.716 2.2438.892 1.774.552 2.695 1.5419 2.478 2.6969-.197 1.047-1.299 1.7239-2.818 1.7439-1.2039-.046-2.2878-.537-3.1278-1.19l-.141-.11c-.104-.08-.218-.075-.287.03-.05.077-.376.547-.458.67-.077.108-.035.168.045.234.35.293.817.613 1.134.775a6.7097 6.7097 0 0 0 2.8289.727 4.9048 4.9048 0 0 0 2.0759-.354c1.095-.465 1.8029-1.394 1.9449-2.554zM11.9986 1.4009c-2.068 0-3.7539 1.95-3.8329 4.3899h7.6657c-.08-2.44-1.765-4.3899-3.8328-4.3899zm7.8516 22.5981-.08.001-15.7843-.002c-1.074-.04-1.863-.91-1.971-1.991l-.01-.195L1.298 6.2858a.459.459 0 0 1 .45-.494h4.9748C6.8448 2.568 9.1607 0 11.9996 0c2.8388 0 5.1537 2.5689 5.2757 5.7898h4.9678a.459.459 0 0 1 .458.483l-.773 15.5883-.007.131c-.094 1.094-.979 1.9769-2.0709 2.0059z" fill="white" />
          </g>
        </svg>
      );
    case 'loggi':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#00B0FF" />
          <path d="M12 7 L16 9.3 L12 11.6 L8 9.3 Z" fill="white" fillOpacity="0.9" />
          <path d="M8 9.3 L12 11.6 L12 16.2 L8 13.9 Z" fill="white" fillOpacity="0.6" />
          <path d="M12 11.6 L16 9.3 L16 13.9 L12 16.2 Z" fill="white" fillOpacity="0.75" />
        </svg>
      );
    default:
      return null;
  }
};

const PLATFORM_NAMES: Record<string, string> = {
  ifood: 'iFood',
  aiqfome: 'Aiqfome',
  uber: 'Uber',
  '99': '99',
  indrive: 'inDrive',
  lalamove: 'Lalamove',
  shopee: 'Shopee',
  loggi: 'Loggi'
};

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const TIME_SLOTS = [
  { label: 'Manhã', range: [6, 12] },
  { label: 'Almoço', range: [12, 14] },
  { label: 'Tarde', range: [14, 18] },
  { label: 'Noite', range: [18, 23] },
  { label: 'Madrugada', range: [23, 6] }
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeJourney, liveDistance, startJourney, finishJourney, historicalJourneys, fetchHistoricalJourneys } = useJourneys();
  const { entries, fetchRecentEntries } = useEntries();
  const { dailyGoal, weeklyGoal, monthlyGoal, fetchGoal } = useGoals();
  
  const [elapsedTime, setElapsedTime] = useState('0h 0m');
  const [showAmount, setShowAmount] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('motopilot_show_amount') !== 'false';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowAmount(saved);
  }, []);

  const toggleShowAmount = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita navegar para relatórios ao clicar no olho
    const next = !showAmount;
    setShowAmount(next);
    localStorage.setItem('motopilot_show_amount', String(next));
  };

  useEffect(() => {
    if (user) {
      fetchRecentEntries(50);
      fetchGoal();
      fetchHistoricalJourneys();
    }
  }, [user, fetchRecentEntries, fetchGoal, fetchHistoricalJourneys]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJourney) {
      const startDate = new Date(activeJourney.started_at);

      interval = setInterval(() => {
        const start = startDate.getTime();
        const now = new Date().getTime();
        const diff = now - start;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setElapsedTime(`${h}h ${m}m`);
      }, 1000);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedTime('--h --m');
    }
    return () => clearInterval(interval);
  }, [activeJourney]);

  const totalGains = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalGains - totalExpenses;
  const deliveriesCount = entries.filter(e => e.type === 'gain').length;

  const totalCompletedHours = (historicalJourneys || []).reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0) / 60;
  const avgHourlyEarnings = totalCompletedHours > 0 ? totalGains / totalCompletedHours : 52.50;

  // Calculos das Metas
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const weekGains = entries.filter(e => new Date(e.date) >= sevenDaysAgo && e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const weekExpenses = entries.filter(e => new Date(e.date) >= sevenDaysAgo && e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const weekNetProfit = weekGains - weekExpenses;

  const monthGains = entries.filter(e => new Date(e.date) >= thirtyDaysAgo && e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const monthExpenses = entries.filter(e => new Date(e.date) >= thirtyDaysAgo && e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const monthNetProfit = monthGains - monthExpenses;

  // ==================== INSIGHTS AUTOMÁTICOS ====================
  const insights = useMemo(() => {
    const platformKnown = ['ifood', 'aiqfome', 'uber', '99', 'indrive', 'lalamove', 'shopee', 'loggi'];
    
    // --- Plataforma mais lucrativa ---
    const platformTotals: Record<string, number> = {};
    entries.filter(e => e.type === 'gain').forEach(e => {
      const desc = (e.description || '').toLowerCase();
      const matched = platformKnown.find(p => desc.includes(p));
      if (matched) {
        platformTotals[matched] = (platformTotals[matched] || 0) + e.amount;
      }
    });
    const platformEntries = Object.entries(platformTotals);
    platformEntries.sort((a, b) => b[1] - a[1]);
    const topPlatform = platformEntries.length > 0 ? platformEntries[0] : null;

    // --- Melhor dia da semana ---
    const weekdayTotals: Record<number, number> = {};
    const weekdayCount: Record<number, number> = {};
    entries.filter(e => e.type === 'gain').forEach(e => {
      const day = new Date(e.date).getDay();
      weekdayTotals[day] = (weekdayTotals[day] || 0) + e.amount;
      weekdayCount[day] = (weekdayCount[day] || 0) + 1;
    });
    const bestWeekday = Object.entries(weekdayTotals).reduce<{ day: number; avg: number; total: number } | null>((best, [dayStr, total]) => {
      const day = Number(dayStr);
      const count = weekdayCount[day] || 1;
      const avg = total / count;
      if (!best || avg > best.avg) return { day, avg, total };
      return best;
    }, null);

    // --- Melhor horário ---
    const slotTotals: Record<string, number> = {};
    const slotCount: Record<string, number> = {};
    entries.filter(e => e.type === 'gain').forEach(e => {
      const hour = new Date(e.date).getHours();
      let slotLabel = 'Madrugada';
      for (const slot of TIME_SLOTS) {
        if (slot.label === 'Madrugada') {
          if (hour >= 23 || hour < 6) { slotLabel = 'Madrugada'; break; }
        } else {
          if (hour >= slot.range[0] && hour < slot.range[1]) { slotLabel = slot.label; break; }
        }
      }
      slotTotals[slotLabel] = (slotTotals[slotLabel] || 0) + e.amount;
      slotCount[slotLabel] = (slotCount[slotLabel] || 0) + 1;
    });
    const bestSlot = Object.entries(slotTotals).reduce<{ label: string; avg: number; total: number } | null>((best, [label, total]) => {
      const count = slotCount[label] || 1;
      const avg = total / count;
      if (!best || avg > best.avg) return { label, avg, total };
      return best;
    }, null);

    // --- % gasto com combustível ---
    const fuelExpenses = entries
      .filter(e => e.type === 'expense')
      .filter(e => {
        const d = (e.description || '').toLowerCase();
        return d.includes('combustível') || d.includes('gasolina') || d.includes('abastecer');
      })
      .reduce((acc, curr) => acc + curr.amount, 0);
    const allExpenses = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const fuelPercentage = allExpenses > 0 ? (fuelExpenses / allExpenses) * 100 : 0;

    return {
      topPlatform,
      platformRanking: platformEntries.slice(0, 3),
      bestWeekday,
      bestSlot,
      fuelPercentage,
      fuelExpenses,
      allExpenses,
      hasData: entries.length > 0
    };
  }, [entries]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="space-y-3 pb-28 pt-1 animate-fade-in-up">
      {/* Logo */}
      <div className="flex items-center justify-center space-x-2 mb-2">
        <Motorbike size={20} strokeWidth={2.5} className="text-foreground" />
        <span className="text-[16px] font-extrabold tracking-tight text-foreground font-heading">MotoPilot</span>
      </div>

      {/* 1. Card de Lucro */}
      <section 
        className="rounded-[20px] p-3.5 relative overflow-hidden flex flex-col justify-between space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-white border-0"
        style={{ backgroundColor: '#1db96b' }}
      >
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-bold tracking-wide uppercase opacity-85">LUCRO LÍQUIDO</span>
          <button 
            onClick={toggleShowAmount}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95 cursor-pointer"
          >
            {showAmount ? (
              <Eye size={14} strokeWidth={2.5} className="text-white" />
            ) : (
              <EyeOff size={14} strokeWidth={2.5} className="text-white" />
            )}
          </button>
        </div>
        
        {/* Número principal em 36px bold branco */}
        <div className="text-[30px] font-bold tracking-tight leading-none select-none font-heading">
          {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
        </div>

        {/* Ganhos / Gastos / Entregas com R$/entrega */}
        <div className="flex justify-between items-center pt-2 border-t border-white/10 text-white/90">
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[11px] font-bold uppercase tracking-wide">Ganhos</span>
            <span className="text-[15px] font-extrabold leading-tight">
              {showAmount ? `R$ ${totalGains.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
            </span>
          </div>
          <div className="h-6 border-l border-white/20 mx-2" />
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[11px] font-bold uppercase tracking-wide">Gastos</span>
            <span className="text-[15px] font-extrabold leading-tight">
              {showAmount ? `R$ ${totalExpenses.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
            </span>
          </div>
          <div className="h-6 border-l border-white/20 mx-2" />
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[11px] font-bold uppercase tracking-wide">Entregas</span>
            <span className="text-[15px] font-extrabold leading-tight">
              {deliveriesCount} ({deliveriesCount > 0 ? `R$ ${(totalGains / deliveriesCount).toFixed(2).replace('.', ',')}` : 'R$ 0,00'}/ent)
            </span>
          </div>
        </div>

        {/* Barra de progresso da meta diária com label e percentual */}
        <div className="space-y-1 pt-2 border-t border-white/10 text-[11px] font-bold text-white/90">
          <div className="flex justify-between items-center">
            <span>Meta diária • {dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100).toFixed(0) : 0}%</span>
            <span>R$ {netProfit.toFixed(0)} / R$ {dailyGoal.toFixed(0)}</span>
          </div>
          <div className="w-full bg-white/25 h-1.5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100) : 0}%` }}
            />
          </div>
        </div>
      </section>

      {/* 2. Card de Jornada */}
      <section className="bg-card border border-border rounded-[20px] p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] card-premium space-y-3">
        {/* Header com label "Jornada" + indicador de status */}
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">Jornada</span>
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

        {/* Botão vermelho full-width */}
        {activeJourney ? (
          <button
            onClick={async () => {
              setIsTransitioning(true);
              await finishJourney();
              setIsTransitioning(false);
            }}
            disabled={isTransitioning}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-3 rounded-xl transition-all active:scale-[0.98] text-[14px] flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Square size={14} fill="currentColor" />
            <span>{isTransitioning ? 'Encerrando...' : 'Encerrar Jornada'}</span>
          </button>
        ) : (
          <button
            onClick={async () => {
              setIsTransitioning(true);
              await startJourney();
              setIsTransitioning(false);
            }}
            disabled={isTransitioning}
            className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3 rounded-xl transition-all active:scale-[0.98] text-[14px] flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Play size={14} fill="currentColor" />
            <span>{isTransitioning ? 'Iniciando...' : 'Iniciar Jornada'}</span>
          </button>
        )}

        {/* Grid 2x2 com Tempo online, Km rodados, Média/hora, Entregas */}
        <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 border-t border-border/80 pt-3">
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

          <div className="flex flex-col text-left border-t border-border/80 pt-3">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Média/hora</span>
            <span className="text-[16px] font-extrabold text-foreground mt-0.5 font-heading">
              R$ {avgHourlyEarnings.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <div className="border-l border-border pl-4 flex flex-col text-left border-t border-border/80 pt-3">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wide">Entregas</span>
            <span className="text-[16px] font-extrabold text-foreground mt-0.5 font-heading">
              {deliveriesCount}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Card de Metas */}
      <section className="bg-card border border-border rounded-[20px] p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] card-premium space-y-3">
        <div className="flex items-center space-x-2">
          <TrendingUp size={14} className="text-muted" />
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">Metas</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Meta Semanal */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-foreground items-center">
              <span>Semanal</span>
              <span>{weeklyGoal > 0 ? Math.min((weekNetProfit / weeklyGoal) * 100, 100).toFixed(0) : 0}%</span>
            </div>
            <div className="goal-bar w-full bg-card-secondary h-1.5">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${weeklyGoal > 0 ? Math.min((weekNetProfit / weeklyGoal) * 100, 100) : 0}%`,
                  backgroundColor: weeklyGoal > 0
                    ? (weekNetProfit / weeklyGoal) >= 1 ? '#10B981'
                      : (weekNetProfit / weeklyGoal) >= 0.7 ? '#22C55E'
                      : (weekNetProfit / weeklyGoal) >= 0.4 ? '#F59E0B'
                      : '#EF4444'
                    : '#71717A'
                }}
              />
            </div>
            <div className="text-[9px] text-muted font-semibold">
              R$ {weekNetProfit.toFixed(0)} / R$ {weeklyGoal.toFixed(0)}
            </div>
          </div>

          {/* Meta Mensal */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-foreground items-center">
              <span>Mensal</span>
              <span>{monthlyGoal > 0 ? Math.min((monthNetProfit / monthlyGoal) * 100, 100).toFixed(0) : 0}%</span>
            </div>
            <div className="goal-bar w-full bg-card-secondary h-1.5">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${monthlyGoal > 0 ? Math.min((monthNetProfit / monthlyGoal) * 100, 100) : 0}%`,
                  backgroundColor: monthlyGoal > 0
                    ? (monthNetProfit / monthlyGoal) >= 1 ? '#10B981'
                      : (monthNetProfit / monthlyGoal) >= 0.7 ? '#22C55E'
                      : (monthNetProfit / monthlyGoal) >= 0.4 ? '#F59E0B'
                      : '#EF4444'
                    : '#71717A'
                }}
              />
            </div>
            <div className="text-[9px] text-muted font-semibold">
              R$ {monthNetProfit.toFixed(0)} / R$ {monthlyGoal.toFixed(0)}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Comparativo Semanal */}
      <section className="bg-card border border-border rounded-[20px] p-3.5 space-y-3">
        <div className="flex items-center space-x-2">
          <TrendingUp size={14} className="text-muted" />
          <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Comparativo Semanal</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">Esta semana</span>
            <span className={`text-[15px] font-black font-heading ${weekNetProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {showAmount ? `R$ ${weekNetProfit.toFixed(0)}` : 'R$ ••••'}
            </span>
            <span className="text-[9px] text-muted block">{weekGains > 0 ? `${Math.min((weekNetProfit / weeklyGoal) * 100, 100).toFixed(0)}% da meta` : 'Sem dados'}</span>
          </div>
          <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider block">Mês inteiro</span>
            <span className={`text-[15px] font-black font-heading ${monthNetProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {showAmount ? `R$ ${monthNetProfit.toFixed(0)}` : 'R$ ••••'}
            </span>
            <span className="text-[9px] text-muted block">{monthGains > 0 ? `${Math.min((monthNetProfit / monthlyGoal) * 100, 100).toFixed(0)}% da meta` : 'Sem dados'}</span>
          </div>
        </div>
      </section>

      {/* 4.5 Insights Automáticos */}
      <section className="bg-card border border-border rounded-[20px] p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] card-premium space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles size={14} className="text-muted" />
          <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Insights Inteligentes</span>
        </div>

        {!insights.hasData ? (
          <p className="text-[12px] text-muted font-bold text-center py-4">Registre lançamentos para ver seus insights</p>
        ) : (
          <div className="space-y-2">
            {/* Plataforma mais lucrativa */}
            {insights.topPlatform && (
              <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-3 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                  <PlatformLogo id={insights.topPlatform[0]} className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <Trophy size={12} className="text-muted flex-shrink-0" />
                    <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">Plataforma mais lucrativa</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[14px] font-black text-foreground font-heading">
                      {PLATFORM_NAMES[insights.topPlatform[0]] || insights.topPlatform[0]}
                    </span>
                    <span className="text-[13px] font-extrabold text-[#10B981]">
                      R$ {insights.topPlatform[1].toFixed(0).replace('.', ',')}
                    </span>
                  </div>
                  {/* Mini ranking */}
                  {insights.platformRanking.length > 1 && (
                    <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-border/40">
                      {insights.platformRanking.slice(1).map(([pid, amount], i) => (
                        <div key={pid} className="flex items-center gap-1">
                          <span className="text-[9px] font-bold text-muted">{i + 2}º</span>
                          <PlatformLogo id={pid} className="w-4 h-4" />
                          <span className="text-[10px] font-bold text-muted">
                            R$ {amount.toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grid 2 cols: Melhor Dia + Melhor Horário */}
            <div className="grid grid-cols-2 gap-2">
              {/* Melhor dia da semana */}
              {insights.bestWeekday && (
                <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-3 space-y-1">
                  <div className="flex items-center space-x-1">
                    <CalendarDays size={11} className="text-muted flex-shrink-0" />
                    <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider">Melhor dia</span>
                  </div>
                  <span className="text-[14px] font-black text-foreground block font-heading">
                    {WEEKDAY_NAMES[insights.bestWeekday.day]}
                  </span>
                  <span className="text-[10px] font-bold text-muted block">
                    Média R$ {insights.bestWeekday.avg.toFixed(0)}/dia
                  </span>
                </div>
              )}

              {/* Melhor horário */}
              {insights.bestSlot && (
                <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-3 space-y-1">
                  <div className="flex items-center space-x-1">
                    <Timer size={11} className="text-muted flex-shrink-0" />
                    <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider">Melhor horário</span>
                  </div>
                  <span className="text-[14px] font-black text-foreground block font-heading">
                    {insights.bestSlot.label}
                  </span>
                  <span className="text-[10px] font-bold text-muted block">
                    Média R$ {insights.bestSlot.avg.toFixed(0)}/vez
                  </span>
                </div>
              )}
            </div>

            {/* % Combustível */}
            <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Fuel size={12} className="text-muted flex-shrink-0" />
                  <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider">Combustível dos gastos</span>
                </div>
                <span className="text-[13px] font-black text-foreground font-heading">
                  {insights.fuelPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-card h-2 rounded-full overflow-hidden border border-border/40">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ 
                    width: `${Math.min(insights.fuelPercentage, 100)}%`,
                    backgroundColor: insights.fuelPercentage > 50 ? '#EF4444' : insights.fuelPercentage > 30 ? '#F59E0B' : '#10B981'
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-muted">
                <span>R$ {insights.fuelExpenses.toFixed(0)} em combustível</span>
                <span>R$ {insights.allExpenses.toFixed(0)} total gastos</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. Últimos Lançamentos */}
      <section className="bg-card border border-border rounded-[20px] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock size={14} className="text-muted" />
            <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Últimos Lançamentos</span>
          </div>
          <button 
            onClick={() => router.push('/lancamentos')}
            className="text-[11px] font-extrabold text-primary hover:underline"
          >
            Ver todos
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="text-[12px] text-muted font-bold text-center py-3">Nenhum lançamento ainda</p>
        ) : (
          <div className="space-y-1.5">
            {entries.slice(0, 5).map((entry) => {
              const parts = (entry.description || '').split(' - ');
              const categoryName = entry.type === 'gain' ? 'Ganho' : (parts[0] || 'Despesa');
              const d = new Date(entry.date);
              const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
              return (
                <div key={entry.id} className="flex items-center justify-between py-2 px-1 border-b border-border/40 last:border-0">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${entry.type === 'gain' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
                    <div>
                      <span className="text-[12px] font-bold text-foreground block">{categoryName}</span>
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

      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />
          
          <div className="relative w-72 max-w-xs bg-card border-r border-border h-full shadow-2xl flex flex-col p-6 space-y-6 animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div className="flex items-center space-x-2">
                <Motorbike size={22} strokeWidth={3} className="text-primary-muted" />
                <span className="text-[16px] font-extrabold text-foreground font-heading">MotoPilot Menu</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-muted hover:text-foreground cursor-pointer"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between py-4">
              <div className="space-y-1">
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/perfil'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-muted rounded-xl hover:bg-card-secondary hover:text-foreground transition-colors text-left cursor-pointer"
                >
                  <User size={20} strokeWidth={3} className="text-foreground/60" />
                  <span>Meu Perfil</span>
                </button>
                
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/relatorios'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-muted rounded-xl hover:bg-card-secondary hover:text-foreground transition-colors text-left cursor-pointer"
                >
                  <Settings size={20} strokeWidth={3} className="text-foreground/60" />
                  <span>Configurações</span>
                </button>
              </div>

              <button 
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-red-500/60 rounded-xl hover:bg-red-500/10 hover:text-red-500/80 transition-colors text-left cursor-pointer border border-red-500/10 bg-red-500/5"
              >
                <LogOut size={20} strokeWidth={3} />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
