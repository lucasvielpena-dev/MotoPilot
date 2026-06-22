'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu,
  Wallet,
  Motorbike,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Clock,
  Map,
  ShoppingBag,
  DollarSign,
  Play,
  Square,
  X,
  LogOut,
  User,
  Settings,
  TrendingUp,
  Fuel
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
  const { dailyGoal, weeklyGoal, monthlyGoal, fetchGoal, updateGoalDirect } = useGoals();
  
  const [elapsedTime, setElapsedTime] = useState('0h 0m');
  const [activeStartTime, setActiveStartTime] = useState('--:--');
  const [showAmount, setShowAmount] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [editingGoal, setEditingGoal] = useState<'daily' | 'weekly' | 'monthly' | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('motopilot_show_amount') !== 'false';
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
      // Formata a hora de início
      const startDate = new Date(activeJourney.started_at);
      setActiveStartTime(startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      interval = setInterval(() => {
        const start = startDate.getTime();
        const now = new Date().getTime();
        const diff = now - start;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setElapsedTime(`${h}h ${m}m`);
      }, 1000);
    } else {
      setElapsedTime('--h --m');
      setActiveStartTime('--:--');
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
  
  const weeklyDistance = (historicalJourneys || []).reduce((acc, curr) => acc + (curr.distance_km || 0), 0) + liveDistance;

  const displayGanhosSemana = weekGains;
  const displayDistanceSemana = weeklyDistance;
  const displayDeliveriesSemana = entries.filter(e => new Date(e.date) >= sevenDaysAgo && e.type === 'gain').length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveGoal = async (field: 'daily' | 'weekly' | 'monthly') => {
    const value = parseFloat(goalInput.replace(',', '.'));
    if (!isNaN(value) && value >= 0) {
      await updateGoalDirect(field, value);
    }
    setEditingGoal(null);
    setGoalInput('');
  };

  const startEditGoal = (field: 'daily' | 'weekly' | 'monthly', currentValue: number) => {
    setEditingGoal(field);
    setGoalInput(currentValue.toFixed(0));
  };

  const getFormattedDate = () => {
    const date = new Date();
    const day = date.getDate();
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return `Hoje, ${day} de ${months[date.getMonth()]}`;
  };

  return (
    <div className="space-y-[12px] pb-28 pt-2">
      {/* Logo */}
      <div className="flex items-center justify-center space-x-2 mb-4">
        <Motorbike size={22} strokeWidth={2.5} className="text-foreground" />
        <span className="text-[18px] font-extrabold tracking-tight text-foreground font-heading">MotoPilot</span>
      </div>

      {/* 1. Card Principal Redesenhado - Lucro Líquido */}
      <section 
        className="rounded-[20px] p-4 relative overflow-hidden flex flex-col justify-between space-y-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] text-white border-0"
        style={{
          background: netProfit >= 0
            ? `radial-gradient(circle at 85% 18%, rgba(255,255,255,0.18), transparent 20%), linear-gradient(135deg, #059669 0%, #34D399 ${Math.min(50 + (netProfit / (dailyGoal || 1)) * 50, 100)}%)`
            : `radial-gradient(circle at 85% 18%, rgba(255,255,255,0.18), transparent 20%), linear-gradient(135deg, #DC2626 0%, #F87171 ${Math.min(50 + (Math.abs(netProfit) / (dailyGoal || 1)) * 50, 100)}%)`,
          boxShadow: netProfit >= 0
            ? `0 12px 28px -12px rgba(5, 150, 105, ${Math.min(0.2 + (netProfit / (dailyGoal || 1)) * 0.25, 0.45)})`
            : `0 12px 28px -12px rgba(220, 38, 38, ${Math.min(0.2 + (Math.abs(netProfit) / (dailyGoal || 1)) * 0.25, 0.45)})`
        }}
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
        
        <div className="text-[48px] font-extrabold tracking-tight leading-none select-none font-heading">
          {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
        </div>

        {/* Progresso da Meta Diária */}
        <div className="space-y-1 pt-0.5">
          <div className="flex justify-between text-[11px] font-bold text-white/90">
            <span>Meta diária • {dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100).toFixed(0) : 0}%</span>
            <span>R$ {netProfit.toFixed(2).replace('.', ',')} / R$ {dailyGoal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="w-full bg-white/25 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Ganhos | Gastos | Lucro */}
        <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-white/90">
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[12px] font-bold uppercase tracking-wide">Ganhos</span>
            <span className="text-[24px] font-extrabold leading-tight">
              {showAmount ? `R$ ${totalGains.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
            </span>
          </div>
          <div className="h-8 border-l border-white/20 mx-2" />
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[12px] font-bold uppercase tracking-wide">Gastos</span>
            <span className="text-[24px] font-extrabold leading-tight">
              {showAmount ? `R$ ${totalExpenses.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
            </span>
          </div>
          <div className="h-8 border-l border-white/20 mx-2" />
          <div className="text-left flex-1">
            <span className="opacity-75 block text-[12px] font-bold uppercase tracking-wide">Lucro</span>
            <span className="text-[24px] font-extrabold leading-tight">
              {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
            </span>
          </div>
        </div>

        {/* Linha 8 Entregas | 1,4 km | R$53,68/entrega */}
        <div className="pt-2 border-t border-white/10 flex justify-center items-center text-[12px] font-bold text-white/90 space-x-2">
          <span>{deliveriesCount} {deliveriesCount === 1 ? 'Entrega' : 'Entregas'}</span>
          <span className="opacity-40">|</span>
          <span>{activeJourney ? liveDistance.toFixed(1).replace('.', ',') : '0,0'} km</span>
          <span className="opacity-40">|</span>
          <span>R$ {(deliveriesCount > 0 ? totalGains / deliveriesCount : 0).toFixed(2).replace('.', ',')}/entrega</span>
        </div>
      </section>

      {/* 2. Jornada - Dashboard Inteligente */}
      <section className="space-y-2">
        <div className="bg-card border border-border rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-3.5 card-premium">
          {activeJourney ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-muted uppercase tracking-wide">Jornada</span>
                <span className="flex items-center space-x-1.5 text-[12px] font-bold text-emerald-500 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Jornada em andamento</span>
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-1 border-t border-border/80 pt-3">
                <div className="text-center">
                  <span className="text-[12px] font-bold text-muted block uppercase tracking-wide">Online</span>
                  <span className="text-[18px] font-extrabold text-foreground block font-heading">{elapsedTime}</span>
                </div>
                <div className="border-l border-border/60 text-center">
                  <span className="text-[12px] font-bold text-muted block uppercase tracking-wide">Ganhos</span>
                  <span className="text-[18px] font-extrabold text-foreground block font-heading">
                    {showAmount ? `R$ ${totalGains.toFixed(0)}` : 'R$ ••'}
                  </span>
                </div>
                <div className="border-l border-border/60 text-center">
                  <span className="text-[12px] font-bold text-muted block uppercase tracking-wide">Km</span>
                  <span className="text-[18px] font-extrabold text-foreground block font-heading">{liveDistance.toFixed(1).replace('.', ',')}</span>
                </div>
                <div className="border-l border-border/60 text-center">
                  <span className="text-[12px] font-bold text-muted block uppercase tracking-wide">Entregas</span>
                  <span className="text-[18px] font-extrabold text-foreground block font-heading">{deliveriesCount}</span>
                </div>
              </div>

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
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-muted uppercase tracking-wide">Jornada</span>
                <span className="flex items-center space-x-1.5 text-[12px] font-bold text-red-500 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Nenhuma jornada ativa</span>
                </span>
              </div>

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
            </>
          )}
        </div>
      </section>

      {/* 3. Grid de Estatísticas Compacto */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] card-premium">
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <div className="flex flex-col text-left">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wide">Tempo Online</span>
            <span className="text-[18px] font-extrabold text-foreground mt-0.5 font-heading">
              {activeJourney ? elapsedTime : '0h 0m'}
            </span>
          </div>
          
          <div className="border-l border-border pl-4 flex flex-col text-left">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wide">KM Rodados</span>
            <span className="text-[18px] font-extrabold text-foreground mt-0.5 font-heading">
              {activeJourney ? `${liveDistance.toFixed(1).replace('.', ',')} km` : '0,0 km'}
            </span>
          </div>

          <div className="col-span-2 border-t border-border/80 my-0.5" />

          <div className="flex flex-col text-left">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wide">Entregas</span>
            <span className="text-[18px] font-extrabold text-foreground mt-0.5 font-heading">
              {deliveriesCount}
            </span>
          </div>
          
          <div className="border-l border-border pl-4 flex flex-col text-left">
            <span className="text-[12px] font-bold text-muted uppercase tracking-wide">Média/Hora</span>
            <span className="text-[18px] font-extrabold text-foreground mt-0.5 font-heading">
              R$ {avgHourlyEarnings.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Metas Colapsáveis */}
      <section className="space-y-2">
        <div 
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('input') || target.closest('button.edit-goal-btn') || target.closest('button.save-goal-btn')) {
              return;
            }
            setIsGoalsExpanded(!isGoalsExpanded);
          }}
          className="bg-card border border-border rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] cursor-pointer card-premium select-none"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className="text-primary-muted" />
              <span className="text-[12px] font-bold text-foreground uppercase tracking-wide">Metas</span>
            </div>
            
            <div className="flex items-center space-x-1.5 text-[12px] font-bold text-muted">
              <span>Meta diária • {dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100).toFixed(0) : 0}%</span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-300 ${isGoalsExpanded ? 'rotate-180' : ''}`} 
              />
            </div>
          </div>

          {isGoalsExpanded && (
            <div className="space-y-4 pt-4 border-t border-border/80 mt-3 animate-in fade-in duration-200">
              {/* Meta Diária */}
              <div className="space-y-2">
                <div className="flex justify-between text-[12px] font-bold text-foreground items-center">
                  <span>Meta diária</span>
                  <div className="flex items-center space-x-2">
                    <span>{dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100).toFixed(0) : 0}%</span>
                    {editingGoal === 'daily' ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={goalInput}
                          onChange={e => setGoalInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveGoal('daily'); if (e.key === 'Escape') { setEditingGoal(null); setGoalInput(''); }}}
                          className="w-20 px-2 py-0.5 bg-card-secondary border border-primary rounded-lg text-[12px] font-bold text-foreground focus:outline-none focus:border-primary text-right"
                          autoFocus
                        />
                        <button onClick={() => handleSaveGoal('daily')} className="save-goal-btn text-emerald-500 hover:text-emerald-600 cursor-pointer">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEditGoal('daily', dailyGoal)} className="edit-goal-btn w-6 h-6 rounded-full bg-card-secondary flex items-center justify-center text-muted hover:text-foreground hover:bg-primary/10 transition-colors cursor-pointer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                    )}
                  </div>
                </div>
                <div className="goal-bar w-full bg-card-secondary">
                  <div 
                    className="h-full bg-foreground/60 rounded-full transition-all duration-500"
                    style={{ width: `${dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100) : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted font-semibold">
                  <span>R$ {netProfit.toFixed(2).replace('.', ',')}</span>
                  <span>R$ {dailyGoal.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <div className="border-t border-border/60" />

              <div className="grid grid-cols-2 gap-4">
                {/* Meta Semanal */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-foreground items-center">
                    <span>Semanal</span>
                    <div className="flex items-center space-x-1.5">
                      <span>{weeklyGoal > 0 ? Math.min((weekNetProfit / weeklyGoal) * 100, 100).toFixed(0) : 0}%</span>
                      {editingGoal === 'weekly' ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={goalInput}
                            onChange={e => setGoalInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveGoal('weekly'); if (e.key === 'Escape') { setEditingGoal(null); setGoalInput(''); }}}
                            className="w-20 px-2 py-0.5 bg-card-secondary border border-primary rounded-lg text-[12px] font-bold text-foreground focus:outline-none focus:border-primary text-right"
                            autoFocus
                          />
                          <button onClick={() => handleSaveGoal('weekly')} className="save-goal-btn text-emerald-500 hover:text-emerald-600 cursor-pointer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEditGoal('weekly', weeklyGoal)} className="edit-goal-btn w-6 h-6 rounded-full bg-card-secondary flex items-center justify-center text-muted hover:text-foreground hover:bg-primary/10 transition-colors cursor-pointer">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="goal-bar w-full bg-card-secondary">
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
                    <div className="flex items-center space-x-1.5">
                      <span>{monthlyGoal > 0 ? Math.min((monthNetProfit / monthlyGoal) * 100, 100).toFixed(0) : 0}%</span>
                      {editingGoal === 'monthly' ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={goalInput}
                            onChange={e => setGoalInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveGoal('monthly'); if (e.key === 'Escape') { setEditingGoal(null); setGoalInput(''); }}}
                            className="w-20 px-2 py-0.5 bg-card-secondary border border-primary rounded-lg text-[12px] font-bold text-foreground focus:outline-none focus:border-primary text-right"
                            autoFocus
                          />
                          <button onClick={() => handleSaveGoal('monthly')} className="save-goal-btn text-emerald-500 hover:text-emerald-600 cursor-pointer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEditGoal('monthly', monthlyGoal)} className="edit-goal-btn w-6 h-6 rounded-full bg-card-secondary flex items-center justify-center text-muted hover:text-foreground hover:bg-primary/10 transition-colors cursor-pointer">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="goal-bar w-full bg-card-secondary">
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
            </div>
          )}
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
