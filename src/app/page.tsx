'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CurrencyDollar, 
  MapTrifold, 
  Clock, 
  ChartPie, 
  Play, 
  Sun, 
  Moon
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';
import { useGoals } from '@/hooks/useGoals';
import BrandLogo from '@/components/BrandLogo';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeJourney, liveDistance } = useJourneys();
  const { entries, fetchRecentEntries } = useEntries();
  const { dailyGoal, fetchGoal } = useGoals();
  const [elapsedTime, setElapsedTime] = useState('0h 0m');
  const [durationHours, setDurationHours] = useState(0);

  // Tema Claro / Escuro
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') || 'dark') as 'dark' | 'light';
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  useEffect(() => {
    if (user) {
      fetchRecentEntries(5);
      fetchGoal();
    }
  }, [user, fetchRecentEntries, fetchGoal]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeJourney) {
      interval = setInterval(() => {
        const start = new Date(activeJourney.started_at).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        setDurationHours(diff / 3600000);
        setElapsedTime(`${h}h ${m}m`);
      }, 1000);
    } else {
      setElapsedTime('--h --m');
      setDurationHours(0);
    }
    return () => clearInterval(interval);
  }, [activeJourney]);

  const totalGains = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalGains - totalExpenses;
  
  const goalProgress = dailyGoal > 0 ? Math.min((netProfit / dailyGoal) * 100, 100) : 0;

  // Cálculos dinâmicos
  const avgSpeed = durationHours > 0 ? (liveDistance / durationHours).toFixed(1) : '0.0';
  const brlPerKm = liveDistance > 0 ? (totalGains / liveDistance).toFixed(2) : '0.00';

  // Circular progress SVG variables
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goalProgress / 100) * circumference;

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-[var(--color-foreground)]">Visão Geral</h1>
          <p className="text-[14px] text-[var(--color-muted)]">Bem-vindo(a), {user?.email?.split('@')[0] || 'Motorista'}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full bg-[var(--color-card)] flex items-center justify-center border border-[var(--color-border)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          >
            {theme === 'dark' ? (
              <Sun size={18} weight="fill" className="text-amber-400" />
            ) : (
              <Moon size={18} weight="fill" className="text-indigo-500" />
            )}
          </button>
          <div className="w-12 h-12 rounded-full bg-[var(--color-card)] flex items-center justify-center border border-[var(--color-border)] max-sm:hidden">
            <span className="text-[16px] font-medium">{user?.email?.[0].toUpperCase() || 'M'}</span>
          </div>
        </div>
      </header>

      {/* Cartão Principal Nubank Style */}
      <section className="card-premium rounded-3xl p-6 relative overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[16px] font-medium text-[var(--color-muted)]">Lucro Líquido Hoje</span>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="text-[42px] leading-none font-bold tracking-tight text-[var(--color-foreground)]">
            R$ {netProfit.toFixed(2).replace('.', ',')}
          </div>
          
          {/* Gráfico Circular da Meta */}
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="var(--color-border)"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="var(--color-primary)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[14px] font-bold text-[var(--color-foreground)]">{goalProgress.toFixed(0)}%</span>
              <span className="text-[8px] text-[var(--color-muted)] uppercase tracking-wider">Meta</span>
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-[14px] font-medium text-[var(--color-muted)]">
          Meta Diária: R$ {dailyGoal.toFixed(2).replace('.', ',')}
        </div>
      </section>

      {/* Métricas Secundárias */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-premium rounded-3xl p-5 animate-fade-in-up delay-75">
          <Clock size={24} weight="fill" className="text-[var(--color-muted)] mb-3" />
          <p className="text-[14px] font-medium text-[var(--color-muted)]">Tempo Online</p>
          <p className="text-[20px] font-semibold text-[var(--color-foreground)] mt-1">{elapsedTime}</p>
        </div>
        
        <div className="card-premium rounded-3xl p-5 animate-fade-in-up delay-100">
          <MapTrifold size={24} weight="fill" className="text-[var(--color-muted)] mb-3" />
          <p className="text-[14px] font-medium text-[var(--color-muted)]">Quilometragem</p>
          <p className="text-[20px] font-semibold text-[var(--color-foreground)] mt-1">{activeJourney ? liveDistance.toFixed(1) : '0.0'} km</p>
        </div>
        
        <div className="card-premium rounded-3xl p-5 animate-fade-in-up delay-150">
          <CurrencyDollar size={24} weight="fill" className="text-[var(--color-muted)] mb-3" />
          <p className="text-[14px] font-medium text-[var(--color-muted)]">Faturamento</p>
          <p className="text-[20px] font-semibold text-[var(--color-foreground)] mt-1">R$ {totalGains.toFixed(2).replace('.', ',')}</p>
        </div>
        
        <div className="card-premium rounded-3xl p-5 animate-fade-in-up delay-200">
          <ChartPie size={24} weight="fill" className="text-[var(--color-muted)] mb-3" />
          <p className="text-[14px] font-medium text-[var(--color-muted)]">R$ / KM</p>
          <p className="text-[20px] font-semibold text-[var(--color-foreground)] mt-1">R$ {brlPerKm.replace('.', ',')}</p>
        </div>
      </section>

      {/* Grid Secundário Responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="md:col-span-1 flex flex-col justify-start">
          {/* Botão Premium Jornada */}
          <button 
            onClick={() => router.push('/jornada')}
            className={`w-full py-8 px-6 rounded-3xl flex flex-col items-center justify-center space-y-2 transition-all active:scale-[0.98] h-full shadow-lg border hover:-translate-y-1 hover:shadow-xl ${
              activeJourney 
                ? 'bg-[var(--color-card-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)]' 
                : 'bg-[var(--color-primary)] hover:brightness-110 text-[#0A0A0A] border-[var(--color-primary)]'
            }`}
          >
            <div className="flex items-center space-x-2">
              {activeJourney ? null : <Play size={24} weight="fill" />}
              <span className="text-[20px] font-semibold">{activeJourney ? 'Encerrar Jornada' : 'Iniciar Jornada'}</span>
            </div>
            {!activeJourney && (
              <span className="text-[13px] font-medium opacity-80 text-center">Monitoramento automático de quilometragem e tempo online.</span>
            )}
            {activeJourney && (
              <span className="text-[13px] text-[var(--color-muted)] font-medium text-center">Jornada em andamento (Ver GPS)</span>
            )}
          </button>
        </div>

        <section className="md:col-span-2 space-y-4 animate-fade-in-up delay-250">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-[20px] font-semibold text-[var(--color-foreground)]">Últimos Lançamentos</h2>
          </div>
          
          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="card-premium rounded-3xl p-6 text-center">
                <p className="text-[14px] text-[var(--color-muted)]">Nenhum lançamento hoje.</p>
              </div>
            ) : (
              entries.slice(0, 5).map((entry, index) => (
                <div 
                  key={entry.id} 
                  className={`flex justify-between items-center p-5 card-premium rounded-3xl animate-fade-in-up`}
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <BrandLogo name={entry.description} type={entry.type} className="w-12 h-12 flex-shrink-0" />
                    <div>
                      <p className="text-[16px] font-medium text-[var(--color-foreground)]">{entry.description || (entry.type === 'gain' ? 'Ganho' : 'Despesa')}</p>
                      <p className="text-[14px] text-[var(--color-muted)] mt-1">{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className={`text-[16px] font-semibold ${entry.type === 'gain' ? 'text-[var(--color-primary)]' : 'text-red-500'}`}>
                    {entry.type === 'gain' ? '+ ' : '- '}R$ {entry.amount.toFixed(2).replace('.', ',')}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
