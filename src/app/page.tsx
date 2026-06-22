'use client';

import { useEffect, useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';
import { useGoals } from '@/hooks/useGoals';
import { supabase } from '@/lib/supabase/client';

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="space-y-[12px] pb-28 pt-2 animate-fade-in-up">
      {/* Logo */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Motorbike size={22} strokeWidth={2.5} className="text-foreground" />
        <span className="text-[18px] font-extrabold tracking-tight text-foreground font-heading">MotoPilot</span>
      </div>

      {/* 1. Card de Lucro (Verde #1db96b) */}
      <section 
        className="rounded-[20px] p-4 relative overflow-hidden flex flex-col justify-between space-y-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-white border-0"
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
        <div className="text-[36px] font-bold tracking-tight leading-none select-none font-heading">
          {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
        </div>

        {/* Ganhos / Gastos / Entregas com R$/entrega */}
        <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-white/90">
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
        <div className="space-y-1.5 pt-2.5 border-t border-white/10 text-[11px] font-bold text-white/90">
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

      {/* 2. Card de Jornada (Branco) */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] card-premium space-y-4">
        {/* Header com label "Jornada" + indicador de status */}
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-bold text-foreground uppercase tracking-wide">Jornada</span>
          {activeJourney ? (
            <span className="flex items-center space-x-1.5 text-[12px] font-bold text-emerald-500 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Jornada em andamento</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-[12px] font-bold text-red-500 uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Nenhuma jornada ativa</span>
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
            className="w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-3.5 rounded-xl transition-all active:scale-[0.98] text-[15px] flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
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
            className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3.5 rounded-xl transition-all active:scale-[0.98] text-[15px] flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Play size={14} fill="currentColor" />
            <span>{isTransitioning ? 'Iniciando...' : 'Iniciar Jornada'}</span>
          </button>
        )}

        {/* Grid 2x2 com Tempo online, Km rodados, Média/hora, Entregas */}
        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 border-t border-border/80 pt-4">
          <div className="flex flex-col text-left">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wide">Tempo online</span>
            <span className="text-[18px] font-extrabold text-foreground mt-0.5 font-heading">
              {activeJourney ? elapsedTime : '0h 0m'}
            </span>
          </div>
          
          <div className="border-l border-border pl-4 flex flex-col text-left">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wide">Km rodados</span>
            <span className="text-[18px] font-extrabold text-foreground mt-0.5 font-heading">
              {activeJourney ? `${liveDistance.toFixed(1).replace('.', ',')} km` : '0,0 km'}
            </span>
          </div>

          <div className="flex flex-col text-left border-t border-border/80 pt-3">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wide">Média/hora</span>
            <span className="text-[18px] font-extrabold text-foreground mt-0.5 font-heading">
              R$ {avgHourlyEarnings.toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <div className="border-l border-border pl-4 flex flex-col text-left border-t border-border/80 pt-3">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wide">Entregas</span>
            <span className="text-[18px] font-extrabold text-foreground mt-0.5 font-heading">
              {deliveriesCount}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Card de Metas (Branco) */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] card-premium space-y-4">
        <div className="flex items-center space-x-2">
          <TrendingUp size={16} className="text-primary-muted" />
          <span className="text-[12px] font-bold text-foreground uppercase tracking-wide">Metas</span>
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
                className="h-full bg-muted rounded-full transition-all duration-500"
                style={{ width: `${weeklyGoal > 0 ? Math.min((weekNetProfit / weeklyGoal) * 100, 100) : 0}%` }}
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
                className="h-full bg-muted rounded-full transition-all duration-500"
                style={{ width: `${monthlyGoal > 0 ? Math.min((monthNetProfit / monthlyGoal) * 100, 100) : 0}%` }}
              />
            </div>
            <div className="text-[9px] text-muted font-semibold">
              R$ {monthNetProfit.toFixed(0)} / R$ {monthlyGoal.toFixed(0)}
            </div>
          </div>
        </div>
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
