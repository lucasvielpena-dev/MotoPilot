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
  const { dailyGoal, weeklyGoal, monthlyGoal, fetchGoal } = useGoals();
  
  const [elapsedTime, setElapsedTime] = useState('0h 0m');
  const [activeStartTime, setActiveStartTime] = useState('--:--');
  const [showAmount, setShowAmount] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const displayGanhosSemana = weekGains > 0 ? weekGains : 122.50;
  const displayDistanceSemana = weeklyDistance > 0 ? weeklyDistance : 45.2;
  const displayDeliveriesSemana = entries.filter(e => new Date(e.date) >= sevenDaysAgo && e.type === 'gain').length || 18;

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
    <div className="space-y-6 pb-28 pt-2">
      {/* Logo */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary-muted flex items-center justify-center">
          <Motorbike size={18} strokeWidth={2.5} className="text-white" />
        </div>
        <span className="text-[18px] font-extrabold tracking-tight text-foreground font-heading">MotoPilot</span>
      </div>

      {/* Cartão de Lucro Líquido */}
      <section className="delivery-hero rounded-[28px] p-5 relative overflow-hidden flex flex-col justify-between space-y-4 shadow-lg">
        <div className="flex justify-between items-center">
          <span className="text-[12px] font-bold tracking-wide uppercase opacity-85">lucro líquido</span>
          <button 
            onClick={toggleShowAmount}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95 cursor-pointer"
          >
            {showAmount ? (
              <Eye size={16} className="text-white" />
            ) : (
              <EyeOff size={16} className="text-white" />
            )}
          </button>
        </div>
        
        <div className="text-[32px] font-extrabold tracking-tight leading-none select-none font-heading">
          {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
        </div>

        {/* Progresso da Meta Diária - Barra grossa */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[11px] font-bold text-white/90">
            <span>Meta diária • {dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100).toFixed(0) : 0}% concluída</span>
            <span>R$ {netProfit.toFixed(2).replace('.', ',')} / R$ {dailyGoal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="goal-bar w-full bg-white/25">
            <div 
              className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100) : 0}%` }}
            />
          </div>
        </div>

        {/* Detalhes de Faturamento/Gastos/Lucro */}
        <div className="flex justify-between items-center pt-3 border-t border-white/10 text-[11px] font-bold text-white/90">
          <div className="text-left">
            <span className="opacity-75 block text-[9px] uppercase tracking-wide">Faturamento</span>
            <span className="text-[13px] font-extrabold">R$ {totalGains.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="h-6 border-l border-white/20" />
          <div className="text-left">
            <span className="opacity-75 block text-[9px] uppercase tracking-wide">Gastos</span>
            <span className="text-[13px] font-extrabold">R$ {totalExpenses.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="h-6 border-l border-white/20" />
          <div className="text-left">
            <span className="opacity-75 block text-[9px] uppercase tracking-wide">Lucro</span>
            <span className="text-[13px] font-extrabold">R$ {netProfit.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </section>

      {/* Resumo Financeiro Rápido (movido para cima) */}
      <section className="bg-card border border-border rounded-[24px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.01)] flex justify-between items-center text-center card-premium">
        <div className="flex-1">
          <span className="text-[10px] font-bold text-muted block uppercase">Ganhos</span>
          <span className="text-[15px] font-extrabold text-foreground mt-0.5 block font-heading">R$ {displayGanhosSemana.toFixed(2).replace('.', ',')}</span>
        </div>
        <div className="h-6 border-l border-border" />
        <div className="flex-1">
          <span className="text-[10px] font-bold text-muted block uppercase">Km rodados</span>
          <span className="text-[15px] font-extrabold text-foreground mt-0.5 block font-heading">{displayDistanceSemana.toFixed(1).replace('.', ',')} km</span>
        </div>
        <div className="h-6 border-l border-border" />
        <div className="flex-1">
          <span className="text-[10px] font-bold text-muted block uppercase">Entregas</span>
          <span className="text-[15px] font-extrabold text-foreground mt-0.5 block font-heading">{displayDeliveriesSemana}</span>
        </div>
      </section>

      {/* Grid de Estatísticas */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-[24px] p-4 flex flex-col justify-between min-h-[95px] shadow-[0_4px_16px_rgba(0,0,0,0.005)] card-premium hover:translate-y-[-2px] transition-transform">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-1">
            <Clock size={16} strokeWidth={2.5} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted">Tempo online</p>
            <p className="text-[16px] font-extrabold text-foreground mt-0.5 font-heading">{activeJourney ? elapsedTime : '0h 0m'}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-[24px] p-4 flex flex-col justify-between min-h-[95px] shadow-[0_4px_16px_rgba(0,0,0,0.005)] card-premium hover:translate-y-[-2px] transition-transform">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center mb-1">
            <Map size={16} strokeWidth={2.5} className="text-rose-500" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted">Km rodados</p>
            <p className="text-[16px] font-extrabold text-foreground mt-0.5 font-heading">{activeJourney ? `${liveDistance.toFixed(1).replace('.', ',')} km` : '0,0 km'}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-[24px] p-4 flex flex-col justify-between min-h-[95px] shadow-[0_4px_16px_rgba(0,0,0,0.005)] card-premium hover:translate-y-[-2px] transition-transform">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-1">
            <ShoppingBag size={16} strokeWidth={2.5} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted">Entregas</p>
            <p className="text-[16px] font-extrabold text-foreground mt-0.5 font-heading">{deliveriesCount}</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-[24px] p-4 flex flex-col justify-between min-h-[95px] shadow-[0_4px_16px_rgba(0,0,0,0.005)] card-premium hover:translate-y-[-2px] transition-transform">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center mb-1">
            <TrendingUp size={16} strokeWidth={2.5} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted">Média por hora</p>
            <p className="text-[16px] font-extrabold text-foreground mt-0.5 font-heading">R$ {avgHourlyEarnings.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </section>

      {/* Ação Rápida - Combustível */}
      <section>
        <button
          onClick={() => router.push('/lancamentos?new=true&cat=Combustivel')}
          className="w-full bg-card border border-border rounded-[24px] p-4 shadow-[0_4px_16px_rgba(0,0,0,0.005)] flex items-center space-x-4 hover:bg-card-secondary/50 transition-all active:scale-[0.98] cursor-pointer card-premium"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Fuel size={22} className="text-emerald-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-extrabold text-foreground">Registrar Combustível</p>
            <p className="text-[11px] font-semibold text-muted mt-0.5">Atalho rápido para abastecimento</p>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </button>
      </section>

      {/* Seção da Jornada */}
      <section className="space-y-3">
        <h2 className="text-[16px] font-extrabold text-foreground font-heading px-1">Jornada</h2>
        
        <div className="bg-card border border-border rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.005)] space-y-5 card-premium">
          {activeJourney ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-bold text-foreground">Jornada atual</span>
                <span className="delivery-pill text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Em andamento
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-border pt-4">
                <div>
                  <span className="text-[11px] font-semibold text-muted block uppercase">Início</span>
                  <span className="text-[14px] font-bold text-foreground font-heading">{activeStartTime}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted block uppercase">Tempo online</span>
                  <span className="text-[14px] font-bold text-foreground font-heading">{elapsedTime}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted block uppercase">Km rodados</span>
                  <span className="text-[14px] font-bold text-foreground font-heading">{liveDistance.toFixed(1).replace('.', ',')} km</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted block uppercase">Lucro</span>
                  <span className="text-[14px] font-extrabold text-success-muted font-heading">R$ {netProfit.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  setIsTransitioning(true);
                  await finishJourney();
                  setIsTransitioning(false);
                }}
                disabled={isTransitioning}
                className="w-full bg-primary-muted hover:bg-primary/80 text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] text-[15px] flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Square size={18} fill="currentColor" />
                <span>{isTransitioning ? 'Encerrando...' : 'Encerrar jornada'}</span>
              </button>
            </>
          ) : (
            <div className="text-center py-3 space-y-4">
              <div className="space-y-1">
                <p className="text-[15px] font-bold text-foreground">Nenhuma jornada ativa</p>
                <p className="text-[12px] text-muted max-w-[280px] mx-auto">Inicie sua jornada para começar a registrar seus km e faturamento em tempo real.</p>
              </div>
              <button
                onClick={async () => {
                  setIsTransitioning(true);
                  await startJourney();
                  setIsTransitioning(false);
                }}
                disabled={isTransitioning}
                className="w-full bg-primary-muted hover:bg-primary/80 text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] text-[15px] flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Play size={18} fill="currentColor" />
                <span>{isTransitioning ? 'Iniciando...' : 'Iniciar jornada'}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Seção de Metas */}
      <section className="space-y-3">
        <h2 className="text-[16px] font-extrabold text-foreground font-heading px-1">Metas</h2>

        <div className="bg-card border border-border rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.005)] space-y-4 card-premium">
          {/* Meta Diária - Barra grossa */}
          <div className="space-y-2">
            <div className="flex justify-between text-[12px] font-bold text-foreground">
              <span>Meta diária</span>
              <span>{dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100).toFixed(0) : 0}%</span>
            </div>
            <div className="goal-bar w-full bg-card-secondary">
              <div 
                className="h-full bg-primary-muted rounded-full transition-all duration-500"
                style={{ width: `${dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted font-semibold">
              <span>R$ {netProfit.toFixed(2).replace('.', ',')}</span>
              <span>R$ {dailyGoal.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            {/* Meta Semanal */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-foreground">
                <span>Meta semanal</span>
                <span>{weeklyGoal > 0 ? Math.min((weekNetProfit / weeklyGoal) * 100, 100).toFixed(0) : 0}%</span>
              </div>
              <div className="goal-bar w-full bg-card-secondary">
                <div 
                  className="h-full bg-success-muted rounded-full transition-all duration-500"
                  style={{ width: `${weeklyGoal > 0 ? Math.min((weekNetProfit / weeklyGoal) * 100, 100) : 0}%` }}
                />
              </div>
              <div className="text-[9px] text-muted font-semibold">
                R$ {weekNetProfit.toFixed(2).replace('.', ',')} / R$ {weeklyGoal.toFixed(2).replace('.', ',')}
              </div>
            </div>

            {/* Meta Mensal */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-foreground">
                <span>Meta mensal</span>
                <span>{monthlyGoal > 0 ? Math.min((monthNetProfit / monthlyGoal) * 100, 100).toFixed(0) : 0}%</span>
              </div>
              <div className="goal-bar w-full bg-card-secondary">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${monthlyGoal > 0 ? Math.min((monthNetProfit / monthlyGoal) * 100, 100) : 0}%` }}
                />
              </div>
              <div className="text-[9px] text-muted font-semibold">
                R$ {monthNetProfit.toFixed(2).replace('.', ',')} / R$ {monthlyGoal.toFixed(2).replace('.', ',')}
              </div>
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
                <Motorbike size={22} strokeWidth={2.5} className="text-primary-muted" />
                <span className="text-[16px] font-extrabold text-foreground font-heading">MotoPilot Menu</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-muted hover:text-foreground cursor-pointer"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between py-4">
              <div className="space-y-1">
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/perfil'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-muted rounded-xl hover:bg-card-secondary hover:text-foreground transition-colors text-left cursor-pointer"
                >
                  <User size={20} strokeWidth={2.5} className="text-muted" />
                  <span>Meu Perfil</span>
                </button>
                
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/relatorios'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-muted rounded-xl hover:bg-card-secondary hover:text-foreground transition-colors text-left cursor-pointer"
                >
                  <Settings size={20} strokeWidth={2.5} className="text-muted" />
                  <span>Configurações</span>
                </button>
              </div>

              <button 
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-red-500/60 rounded-xl hover:bg-red-500/10 hover:text-red-500/80 transition-colors text-left cursor-pointer border border-red-500/10 bg-red-500/5"
              >
                <LogOut size={20} strokeWidth={2.5} />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
