'use client';

import { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Settings, 
  LogOut, 
  Flag, 
  X, 
  Sun, 
  Moon,
  Wrench,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals } from '@/hooks/useGoals';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';
import { supabase } from '@/lib/supabase/client';

export default function Perfil() {
  const { user } = useAuth();
  const { dailyGoal, weeklyGoal, monthlyGoal, updateGoal, updateGoalDirect } = useGoals();
  const { historicalJourneys } = useJourneys();
  const { entries, fetchRecentEntries } = useEntries();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);

  // Tema Claro / Escuro / iFood
  const [theme, setTheme] = useState<'light' | 'dark' | 'ifood'>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') || 'dark') as 'light' | 'dark' | 'ifood';
    setTheme(saved);
  }, []);

  const changeTheme = (newTheme: 'light' | 'dark' | 'ifood') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    fetchRecentEntries(500);
  }, [fetchRecentEntries]);

  // Estados do Veículo
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicle, setVehicle] = useState({
    name: '',
    plate: '',
    type: 'moto'
  });
  const [tempName, setTempName] = useState('');
  const [tempPlate, setTempPlate] = useState('');
  const [tempType, setTempType] = useState('moto');

  // Estados de Revisão
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenance, setMaintenance] = useState({
    currentOdometer: 0,
    intervalKm: 3000,
    lastServiceKm: 0
  });
  const [tempOdometer, setTempOdometer] = useState('');
  const [tempInterval, setTempInterval] = useState('');

  // Carrega dados do veículo e manutenção do localStorage
  useEffect(() => {
    const savedVehicle = localStorage.getItem('active_vehicle');
    if (savedVehicle) {
      try {
        setVehicle(JSON.parse(savedVehicle));
      } catch (e) {
        console.error('Erro ao ler veículo:', e);
      }
    }
    const savedMaintenance = localStorage.getItem('vehicle_maintenance');
    if (savedMaintenance) {
      try {
        setMaintenance(JSON.parse(savedMaintenance));
      } catch (e) {
        console.error('Erro ao ler manutenção:', e);
      }
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal) return;
    setLoading(true);
    const value = parseFloat(newGoal);
    if (goalType === 'daily') {
      await updateGoal(value);
    } else {
      await updateGoalDirect(goalType, value);
    }
    setLoading(false);
    setIsGoalModalOpen(false);
    setNewGoal('');
  };

  const handleOpenVehicleModal = () => {
    setTempName(vehicle.name);
    setTempPlate(vehicle.plate);
    setTempType(vehicle.type);
    setIsVehicleModalOpen(true);
  };

  const handleUpdateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newVehicle = { name: tempName, plate: tempPlate, type: tempType };
    setVehicle(newVehicle);
    localStorage.setItem('active_vehicle', JSON.stringify(newVehicle));
    setIsVehicleModalOpen(false);
  };

  const handleOpenMaintenanceModal = () => {
    setTempOdometer(String(maintenance.currentOdometer || totalKm.toFixed(0)));
    setTempInterval(String(maintenance.intervalKm));
    setIsMaintenanceModalOpen(true);
  };

  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const newMaintenance = {
      currentOdometer: parseFloat(tempOdometer) || 0,
      intervalKm: parseFloat(tempInterval) || 3000,
      lastServiceKm: maintenance.lastServiceKm
    };
    setMaintenance(newMaintenance);
    localStorage.setItem('vehicle_maintenance', JSON.stringify(newMaintenance));
    setIsMaintenanceModalOpen(false);
  };

  // Cumulative driver stats
  const totalGains = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const totalDeliveries = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + (curr.rides_count || 1), 0);
  const totalKm = historicalJourneys.reduce((acc, curr) => acc + curr.distance_km, 0);

  // Calcula km até próxima revisão
  const effectiveOdometer = maintenance.currentOdometer > 0 ? maintenance.currentOdometer : totalKm;
  const nextServiceKm = maintenance.lastServiceKm + maintenance.intervalKm;
  const kmUntilService = Math.max(0, nextServiceKm - effectiveOdometer);
  const serviceUrgency = kmUntilService <= 200 ? 'urgent' : kmUntilService <= 500 ? 'warning' : 'ok';

  const getVehicleEmoji = (type: string) => {
    switch (type) {
      case 'moto': return '🏍️';
      case 'carro': return '🚗';
      case 'bike': return '🚲';
      default: return '📦';
    }
  };

  return (
    <div className="p-3 space-y-4 pb-28">
      <header className="flex justify-between items-center mb-2">
        <h1 className="text-[18px] font-black tracking-tight text-foreground font-heading">Perfil</h1>
        <button className="text-muted hover:text-foreground transition-colors">
          <Settings size={22} />
        </button>
      </header>

      {/* Info do Usuário */}
      <section className="flex items-center space-x-3 bg-card border border-border p-4 rounded-[20px] shadow-premium animate-fade-in-up">
        <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative flex-shrink-0">
          <UserCircle size={32} className="text-primary" />
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center animate-pulse" title="Online"></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-[15px] font-black text-foreground truncate font-heading">
              {user?.email?.split('@')[0] || 'Piloto'}
            </h2>
            <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide bg-primary/10 text-primary rounded-md border border-primary/15">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-muted truncate mt-0.5">{user?.email}</p>
          <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 bg-foreground/5 rounded-full text-[10px] font-bold text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Piloto Online</span>
          </div>
        </div>
      </section>

      {/* Grid de Estatísticas Cumulativas */}
      <section className="grid grid-cols-3 gap-2 animate-fade-in-up delay-75">
        <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-2.5 text-center">
          <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Total Km</span>
          <span className="text-[13px] font-black text-foreground block mt-0.5 font-heading">
            {totalKm.toFixed(0).replace('.', ',')} km
          </span>
        </div>
        <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-2.5 text-center">
          <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Entregas</span>
          <span className="text-[13px] font-black text-foreground block mt-0.5 font-heading">
            {totalDeliveries}
          </span>
        </div>
        <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-2.5 text-center">
          <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Ganhos</span>
          <span className="text-[13px] font-black text-foreground block mt-0.5 font-heading">
            R$ {totalGains.toFixed(0)}
          </span>
        </div>
      </section>

      {/* Veículo Ativo com Detalhes */}
      <section className="bg-card border border-border rounded-[20px] p-4 animate-fade-in-up delay-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Veículo de Trabalho</h3>
          <button 
            onClick={handleOpenVehicleModal}
            className="text-[12px] font-extrabold text-primary hover:underline active:scale-95 transition-transform"
          >
            Editar
          </button>
        </div>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-11 h-11 bg-card-secondary rounded-xl flex items-center justify-center border border-border/60">
            <span className="text-[22px]">{getVehicleEmoji(vehicle.type)}</span>
          </div>
          <div>
            <h4 className="text-[14px] font-extrabold text-foreground font-heading">{vehicle.name}</h4>
            <span className="text-[10px] font-bold text-muted tracking-widest bg-card-secondary/60 px-1.5 py-0.5 rounded-md border border-border/60 uppercase inline-block mt-0.5">
              {vehicle.plate}
            </span>
          </div>
        </div>

        <div className="border-t border-border/60 pt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="space-y-0.5">
            <span className="text-muted block font-semibold">Odômetro atual</span>
            <span className="text-foreground font-extrabold font-heading">{effectiveOdometer.toFixed(0).replace('.', ',')} km</span>
          </div>
          <div className="space-y-0.5 border-l border-border/60 pl-3">
            <span className="text-muted block font-semibold">Próxima revisão</span>
            <span className={`font-extrabold font-heading ${
              serviceUrgency === 'urgent' ? 'text-[#EF4444]' :
              serviceUrgency === 'warning' ? 'text-[#F59E0B]' :
              'text-[#10B981]'
            }`}>
              Em {kmUntilService.toFixed(0).replace('.', ',')} km
            </span>
          </div>
        </div>

        <button
          onClick={handleOpenMaintenanceModal}
          className="w-full mt-3 py-2.5 bg-card-secondary/50 hover:bg-card-secondary border border-border/60 rounded-xl text-[12px] font-bold text-foreground flex items-center justify-center space-x-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Wrench size={14} className="text-muted" />
          <span>Configurar Revisão</span>
        </button>
      </section>

      {/* Ajustes e Preferências */}
      <section className="space-y-2 pt-1 animate-fade-in-up delay-150">
        <h3 className="text-[11px] font-extrabold text-muted px-1 uppercase tracking-wider">Metas</h3>
        
        <div className="bg-card border border-border rounded-[20px] overflow-hidden">
          {/* Meta Diária */}
          <div className="flex justify-between items-center p-3.5 border-b border-border/60">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-card-secondary/60 rounded-xl">
                <Flag size={14} className="text-muted" />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-foreground">Diária</p>
                <p className="text-[10px] text-muted">R$ {dailyGoal.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            <button 
              onClick={() => { setGoalType('daily'); setNewGoal(String(dailyGoal)); setIsGoalModalOpen(true); }} 
              className="text-[12px] font-extrabold text-primary hover:underline"
            >
              Editar
            </button>
          </div>

          {/* Meta Semanal */}
          <div className="flex justify-between items-center p-3.5 border-b border-border/60">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-card-secondary/60 rounded-xl">
                <Calendar size={14} className="text-muted" />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-foreground">Semanal</p>
                <p className="text-[10px] text-muted">R$ {weeklyGoal.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            <button 
              onClick={() => { setGoalType('weekly'); setNewGoal(String(weeklyGoal)); setIsGoalModalOpen(true); }} 
              className="text-[12px] font-extrabold text-primary hover:underline"
            >
              Editar
            </button>
          </div>

          {/* Meta Mensal */}
          <div className="flex justify-between items-center p-3.5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-card-secondary/60 rounded-xl">
                <TrendingUp size={14} className="text-muted" />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-foreground">Mensal</p>
                <p className="text-[10px] text-muted">R$ {monthlyGoal.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            <button 
              onClick={() => { setGoalType('monthly'); setNewGoal(String(monthlyGoal)); setIsGoalModalOpen(true); }} 
              className="text-[12px] font-extrabold text-primary hover:underline"
            >
              Editar
            </button>
          </div>
        </div>
      </section>

      {/* Tema */}
      <section className="space-y-2 pt-1 animate-fade-in-up delay-175">
        <h3 className="text-[11px] font-extrabold text-muted px-1 uppercase tracking-wider">Aparência</h3>
        
        <div className="bg-card border border-border rounded-[20px] p-3.5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-card-secondary/60 rounded-xl">
              <Settings size={14} className="text-muted" />
            </div>
            <div>
              <p className="text-[13px] font-extrabold text-foreground">Tema do Aplicativo</p>
              <p className="text-[10px] text-muted">Escolha seu estilo visual</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', label: 'Claro' },
              { id: 'dark', label: 'Escuro' },
              { id: 'ifood', label: 'iFood' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => changeTheme(t.id as 'light' | 'dark' | 'ifood')}
                className={`py-2.5 rounded-xl border text-[12px] font-extrabold text-center transition-all cursor-pointer active:scale-95 ${
                  theme === t.id 
                    ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                    : 'border-border/60 bg-card-secondary/40 text-muted hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Ações */}
      <section className="space-y-2 pt-1 animate-fade-in-up delay-200">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-card hover:bg-card-secondary text-red-500 font-extrabold py-3.5 rounded-[20px] border border-border transition-colors active:scale-[0.98] text-[14px] shadow-sm cursor-pointer"
        >
          <LogOut size={20} />
          <span>Sair da Conta</span>
        </button>
      </section>

      {/* Modal de Meta */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-border/60">
              <h3 className="text-[16px] font-extrabold text-foreground font-heading">
                {goalType === 'daily' ? 'Meta Diária' : goalType === 'weekly' ? 'Meta Semanal' : 'Meta Mensal'}
              </h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateGoal} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-muted block uppercase tracking-wider">Novo valor (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  className="w-full py-3 px-4 bg-card-secondary/50 border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-[18px] font-black text-foreground"
                  placeholder="0,00"
                  autoFocus
                />
              </div>

              <div className="flex space-x-2">
                <button 
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-3 font-bold text-foreground bg-card-secondary/50 border border-border rounded-xl hover:bg-card-secondary transition-all active:scale-[0.98] text-[13px] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 font-bold text-white bg-primary rounded-xl hover:bg-primary/95 active:scale-[0.98] transition-transform disabled:opacity-50 text-[13px] cursor-pointer"
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Alterar Veículo */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-card w-full max-w-sm rounded-[32px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h3 className="text-[18px] font-extrabold text-foreground font-heading">Editar Veículo</h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateVehicle} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider mb-2">Tipo de Veículo</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'moto', label: '🏍️ Moto' },
                    { id: 'carro', label: '🚗 Carro' },
                    { id: 'bike', label: '🚲 Bike' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTempType(t.id)}
                      className={`py-3 rounded-xl border text-[13px] font-bold transition-all cursor-pointer ${
                        tempType === t.id 
                          ? 'border-primary bg-primary-soft text-primary' 
                          : 'border-border bg-card text-muted hover:text-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Modelo / Marca</label>
                <input 
                  type="text" 
                  required
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className="w-full p-4 bg-card-secondary border border-border rounded-2xl focus:outline-none focus:border-primary transition-colors text-[14px] font-bold text-foreground"
                  placeholder="Ex: Honda CG 160"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Placa</label>
                <input 
                  type="text" 
                  required
                  value={tempPlate}
                  onChange={e => setTempPlate(e.target.value)}
                  className="w-full p-4 bg-card-secondary border border-border rounded-2xl focus:outline-none focus:border-primary transition-colors text-[14px] font-bold font-mono text-foreground uppercase"
                  placeholder="Ex: ABC-1234"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-4 mt-2 font-bold text-white bg-primary rounded-2xl hover:bg-primary/95 active:scale-[0.98] transition-transform text-[14px] cursor-pointer shadow-md"
              >
                Salvar Veículo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Configurar Revisão */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-card w-full max-w-sm rounded-[32px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h3 className="text-[18px] font-extrabold text-foreground font-heading">Configurar Revisão</h3>
              <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveMaintenance} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Odômetro Atual (km)</label>
                <input 
                  type="number" 
                  required
                  value={tempOdometer}
                  onChange={e => setTempOdometer(e.target.value)}
                  className="w-full p-4 bg-card-secondary border border-border rounded-2xl focus:outline-none focus:border-primary transition-colors text-[16px] font-black text-foreground"
                  placeholder="Ex: 45000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Intervalo para Revisão (km)</label>
                <input 
                  type="number" 
                  required
                  value={tempInterval}
                  onChange={e => setTempInterval(e.target.value)}
                  className="w-full p-4 bg-card-secondary border border-border rounded-2xl focus:outline-none focus:border-primary transition-colors text-[16px] font-black text-foreground"
                  placeholder="Ex: 3000"
                />
              </div>

              {kmUntilService <= 500 && (
                <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl">
                  <span className="text-[12px] font-bold text-[#F59E0B]">
                    ⚠️ Sua próxima revisão está agendada para {kmUntilService.toFixed(0).replace('.', ',')} km!
                  </span>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full py-4 mt-2 font-bold text-white bg-primary rounded-2xl hover:bg-primary/95 active:scale-[0.98] transition-transform text-[14px] cursor-pointer shadow-md"
              >
                Salvar Configuração
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
