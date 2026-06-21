'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu,
  Bell,
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
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';
import { useGoals } from '@/hooks/useGoals';
import { supabase } from '@/lib/supabase/client';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeJourney, liveDistance, startJourney, finishJourney } = useJourneys();
  const { entries, fetchRecentEntries } = useEntries();
  const { dailyGoal, fetchGoal } = useGoals();
  
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
    }
  }, [user, fetchRecentEntries, fetchGoal]);

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
      {/* Header Estilo Mockup */}
      <header className="flex justify-center items-center mb-6 bg-white px-2 py-3 border-b border-neutral-100/50 -mx-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[#EA1D2C] flex items-center justify-center">
            <Motorbike size={18} strokeWidth={2.5} className="text-white" />
          </div>
          <span className="text-[18px] font-extrabold tracking-tight text-neutral-900 font-sans">MotoPilot</span>
        </div>
      </header>

      {/* Cartão de Lucro Líquido Redesenhado */}
      <section 
        onClick={() => router.push('/relatorios')}
        className="delivery-hero rounded-[32px] p-6 relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[170px]"
      >
        <div>
          <span className="text-[14px] font-semibold opacity-90 text-white/95">{getFormattedDate()}</span>
        </div>
        
        <div className="my-3 flex items-center justify-between">
          <div className="text-[38px] leading-none font-extrabold tracking-tight select-none">
            {showAmount ? `R$ ${netProfit.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
          </div>
          <button 
            onClick={toggleShowAmount}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/15 transition-transform active:scale-95 cursor-pointer"
          >
            {showAmount ? (
              <Eye size={20} className="text-white" />
            ) : (
              <EyeOff size={20} className="text-white" />
            )}
          </button>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-white/10 text-white/80">
          <span className="text-[13px] font-medium tracking-wide uppercase">lucro líquido</span>
          <ChevronRight size={18} strokeWidth={2.5} className="opacity-80" />
        </div>
      </section>

      {/* Grid de Métricas Secundárias */}
      <section className="grid grid-cols-2 gap-4">
        {/* Tempo Online */}
        <div className="bg-white border border-neutral-100/80 rounded-[28px] p-4 flex flex-col justify-between min-h-[110px] shadow-[0_4px_16px_rgba(17,17,17,0.015)]">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-2">
            <Clock size={20} strokeWidth={2.5} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-neutral-400">Tempo online</p>
            <p className="text-[18px] font-extrabold text-neutral-800 mt-0.5">{activeJourney ? elapsedTime : '0h 0m'}</p>
          </div>
        </div>
        
        {/* Km rodados */}
        <div className="bg-white border border-neutral-100/80 rounded-[28px] p-4 flex flex-col justify-between min-h-[110px] shadow-[0_4px_16px_rgba(17,17,17,0.015)]">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center mb-2">
            <Map size={20} strokeWidth={2.5} className="text-rose-500" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-neutral-400">Km rodados</p>
            <p className="text-[18px] font-extrabold text-neutral-800 mt-0.5">{activeJourney ? `${liveDistance.toFixed(1).replace('.', ',')} km` : '0,0 km'}</p>
          </div>
        </div>
        
        {/* Entregas */}
        <div className="bg-white border border-neutral-100/80 rounded-[28px] p-4 flex flex-col justify-between min-h-[110px] shadow-[0_4px_16px_rgba(17,17,17,0.015)]">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-2">
            <ShoppingBag size={20} strokeWidth={2.5} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-neutral-400">Entregas</p>
            <p className="text-[18px] font-extrabold text-neutral-800 mt-0.5">{deliveriesCount}</p>
          </div>
        </div>
        
        {/* Gastos */}
        <div className="bg-white border border-neutral-100/80 rounded-[28px] p-4 flex flex-col justify-between min-h-[110px] shadow-[0_4px_16px_rgba(17,17,17,0.015)]">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center mb-2">
            <DollarSign size={20} strokeWidth={2.5} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-neutral-400">Gastos</p>
            <p className="text-[18px] font-extrabold text-neutral-800 mt-0.5">R$ {totalExpenses.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </section>

      {/* Seção da Jornada */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[16px] font-extrabold text-neutral-800">Jornada</h2>
          <button 
            onClick={() => router.push('/jornada')}
            className="text-[13px] font-bold text-[#EA1D2C] hover:underline cursor-pointer"
          >
            Ver todas
          </button>
        </div>
        
        <div className="bg-white border border-neutral-100/80 rounded-[28px] p-5 shadow-[0_4px_16px_rgba(234,29,44,0.02)] space-y-5">
          {activeJourney ? (
            <>
              {/* Cabeçalho da Jornada ativa */}
              <div className="flex justify-between items-center">
                <span className="text-[15px] font-bold text-neutral-800">Jornada atual</span>
                <span className="delivery-pill text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Em andamento
                </span>
              </div>
              
              {/* Grid de detalhes da Jornada */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t border-neutral-50 pt-4">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Início</span>
                  <span className="text-[14px] font-bold text-neutral-700">{activeStartTime}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Tempo online</span>
                  <span className="text-[14px] font-bold text-neutral-700">{elapsedTime}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Km rodados</span>
                  <span className="text-[14px] font-bold text-neutral-700">{liveDistance.toFixed(1).replace('.', ',')} km</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Lucro</span>
                  <span className="text-[14px] font-extrabold text-[#19A85B]">R$ {netProfit.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* Botão de Encerrar */}
              <button
                onClick={async () => {
                  setIsTransitioning(true);
                  await finishJourney();
                  setIsTransitioning(false);
                }}
                disabled={isTransitioning}
                className="w-full bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] text-[15px] flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Square size={18} fill="currentColor" />
                <span>{isTransitioning ? 'Encerrando...' : 'Encerrar jornada'}</span>
              </button>
            </>
          ) : (
            <div className="text-center py-3 space-y-4">
              <div className="space-y-1">
                <p className="text-[15px] font-bold text-neutral-800">Nenhuma jornada ativa</p>
                <p className="text-[12px] text-neutral-400 max-w-[280px] mx-auto">Inicie sua jornada para começar a registrar seus km e faturamento em tempo real.</p>
              </div>
              <button
                onClick={async () => {
                  setIsTransitioning(true);
                  await startJourney();
                  setIsTransitioning(false);
                }}
                disabled={isTransitioning}
                className="w-full bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] text-[15px] flex items-center justify-center space-x-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Play size={18} fill="currentColor" />
                <span>{isTransitioning ? 'Iniciando...' : 'Iniciar jornada'}</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Seção Resumo da Semana */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[16px] font-extrabold text-neutral-800">Resumo da semana</h2>
          <button 
            onClick={() => router.push('/relatorios')}
            className="text-[13px] font-bold text-[#EA1D2C] hover:underline cursor-pointer"
          >
            Ver relatório
          </button>
        </div>
        
        <div className="bg-white border border-neutral-100/80 rounded-[28px] p-5 shadow-[0_4px_16px_rgba(234,29,44,0.01)] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[12px] font-semibold text-neutral-400">19/05 - 25/05</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-[20px] font-extrabold text-neutral-800">R$ {totalGains.toFixed(2).replace('.', ',')}</span>
              <span className="text-[11px] font-semibold text-neutral-400">ganhos</span>
            </div>
          </div>
          
          {dailyGoal > 0 ? (
            <div className="text-right space-y-1">
              <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Progresso meta</span>
              <span className="text-[14px] font-bold text-neutral-700">
                {Math.min((netProfit / (dailyGoal * 7)) * 100, 100).toFixed(0)}% da semana
              </span>
            </div>
          ) : (
            <span className="text-[12px] text-neutral-400">Defina uma meta no perfil</span>
          )}
        </div>
      </section>

      {/* Side Menu Drawer Estilo Premium */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity duration-300"
          />
          
          {/* Drawer Body */}
          <div className="relative w-72 max-w-xs bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <div className="flex items-center space-x-2">
                <Motorbike size={22} strokeWidth={2.5} className="text-[#EA1D2C]" />
                <span className="text-[16px] font-extrabold text-neutral-800">MotoPilot Menu</span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-neutral-500 hover:text-neutral-800 cursor-pointer"
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 flex flex-col justify-between py-4">
              <div className="space-y-1">
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/perfil'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-neutral-700 rounded-xl hover:bg-neutral-50 hover:text-neutral-900 transition-colors text-left cursor-pointer"
                >
                  <User size={20} strokeWidth={2.5} className="text-neutral-500" />
                  <span>Meu Perfil</span>
                </button>
                
                <button 
                  onClick={() => { setIsMenuOpen(false); router.push('/relatorios'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-neutral-700 rounded-xl hover:bg-neutral-50 hover:text-neutral-900 transition-colors text-left cursor-pointer"
                >
                  <Settings size={20} strokeWidth={2.5} className="text-neutral-500" />
                  <span>Configurações</span>
                </button>
              </div>

              <button 
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="w-full flex items-center space-x-3 px-4 py-3.5 text-[14px] font-bold text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors text-left cursor-pointer border border-red-100 bg-red-50/10"
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
