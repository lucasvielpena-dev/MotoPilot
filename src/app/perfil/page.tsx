'use client';

import { useState, useEffect } from 'react';
import { 
  CircleUserRound, 
  Settings, 
  LogOut, 
  Target, 
  X, 
  Sun, 
  Moon,
  Wrench,
  Calendar,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals } from '@/hooks/useGoals';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useAchievements } from '@/hooks/useAchievements';
import { useFinancialStats } from '@/hooks/useFinancialStats';
import { supabase } from '@/lib/supabase/client';

export default function Perfil() {
  const { user } = useAuth();
  const { dailyGoal, weeklyGoal, monthlyGoal, updateGoal, updateGoalDirect } = useGoals();
  const { historicalJourneys } = useJourneys();
  const { entries, fetchRecentEntries } = useEntries();
  
  // Modais
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newGoal, setNewGoal] = useState('');
  
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicle, setVehicle] = useState({
    name: 'Minha Moto',
    plate: 'AAA-0000',
    type: 'moto'
  });
  const [tempName, setTempName] = useState('');
  const [tempPlate, setTempPlate] = useState('');
  const [tempType, setTempType] = useState('moto');

  // Modais e estados de Manutenção
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [newMaintenanceName, setNewMaintenanceName] = useState('');
  const [newMaintenanceInterval, setNewMaintenanceInterval] = useState('');
  const [isOdometerModalOpen, setIsOdometerModalOpen] = useState(false);
  const [tempOdometer, setTempOdometer] = useState('');

  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'ifood'>('dark');

  // Carrega configurações de tema e veículo
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') || 'dark') as 'light' | 'dark' | 'ifood';
    setTheme(savedTheme);

    const savedVehicle = localStorage.getItem('active_vehicle');
    if (savedVehicle) {
      try {
        setVehicle(JSON.parse(savedVehicle));
      } catch {}
    }
  }, []);

  const changeTheme = (newTheme: 'light' | 'dark' | 'ifood') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    fetchRecentEntries(500);
  }, [fetchRecentEntries]);

  // Consome estatísticas financeiras centralizadas
  const stats = useFinancialStats(entries, historicalJourneys || [], null, dailyGoal);

  // Consome hook de manutenção inteligente
  const { 
    currentOdometer, 
    maintenanceItems, 
    addItem: addMaintenanceItem, 
    removeItem: removeMaintenanceItem, 
    resetItem: resetMaintenanceItem, 
    saveOdometer 
  } = useMaintenance(stats.totalDistance);

  // Consome hook de conquistas
  const { achievements, totalUnlocked, totalCount } = useAchievements(
    entries,
    historicalJourneys || [],
    stats.todayNetProfit,
    dailyGoal
  );

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

  const handleSaveOdometer = (e: React.FormEvent) => {
    e.preventDefault();
    const km = parseFloat(tempOdometer);
    if (!isNaN(km) && km >= 0) {
      saveOdometer(km);
    }
    setIsOdometerModalOpen(false);
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const interval = parseFloat(newMaintenanceInterval);
    if (newMaintenanceName.trim() && !isNaN(interval) && interval > 0) {
      addMaintenanceItem(newMaintenanceName.trim(), interval, currentOdometer);
      setNewMaintenanceName('');
      setNewMaintenanceInterval('');
      setIsMaintenanceModalOpen(false);
    }
  };

  const getVehicleEmoji = (type: string) => {
    switch (type) {
      case 'moto': return '🏍️';
      case 'carro': return '🚗';
      case 'bike': return '🚲';
      default: return '📦';
    }
  };

  const getUrgencyStyles = (urgency: 'ok' | 'warning' | 'urgent') => {
    if (urgency === 'urgent') return { text: 'text-red-500', bg: 'bg-red-500/10', bar: 'bg-red-500' };
    if (urgency === 'warning') return { text: 'text-amber-500', bg: 'bg-amber-500/10', bar: 'bg-amber-500' };
    return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500' };
  };

  return (
    <div className="p-1 space-y-5 pb-28 animate-fade-in-up">
      <header className="flex justify-between items-center mb-2">
        <h1 className="text-[18px] font-black tracking-tight text-foreground font-heading">Perfil</h1>
        <button onClick={handleLogout} className="text-muted hover:text-red-500 transition-colors" title="Sair">
          <LogOut size={20} />
        </button>
      </header>

      {/* Info do Usuário */}
      <section className="flex items-center space-x-3 bg-card border border-border p-4 rounded-[20px] shadow-premium">
        <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative flex-shrink-0">
          <CircleUserRound size={32} className="text-primary" />
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center animate-pulse"></span>
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
        </div>
      </section>

      {/* Grid de Estatísticas Cumulativas */}
      <section className="grid grid-cols-3 gap-2">
        <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-2.5 text-center">
          <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Total Km</span>
          <span className="text-[13px] font-black text-foreground block mt-0.5 font-heading">
            {stats.totalDistance.toFixed(0).replace('.', ',')} km
          </span>
        </div>
        <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-2.5 text-center">
          <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Entregas</span>
          <span className="text-[13px] font-black text-foreground block mt-0.5 font-heading">
            {stats.deliveriesCount}
          </span>
        </div>
        <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-2.5 text-center">
          <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Ganhos</span>
          <span className="text-[13px] font-black text-foreground block mt-0.5 font-heading">
            R$ {stats.totalGains.toFixed(0)}
          </span>
        </div>
      </section>

      {/* SISTEMA DE MANUTENÇÃO INTELIGENTE */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-sm space-y-3.5">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-[12px] font-black text-foreground font-heading">Manutenção do Veículo</h3>
            <span className="text-[10px] font-bold text-muted">Odômetro: {currentOdometer.toFixed(0)} km</span>
          </div>
          <div className="flex space-x-1.5">
            <button 
              onClick={() => { setTempOdometer(String(currentOdometer)); setIsOdometerModalOpen(true); }}
              className="text-[10px] font-extrabold bg-card border border-border px-2 py-1 rounded-lg text-foreground hover:bg-card-secondary active:scale-95 transition-all"
            >
              Ajustar Km
            </button>
            <button 
              onClick={handleOpenVehicleModal}
              className="text-[10px] font-extrabold bg-card border border-border px-2 py-1 rounded-lg text-primary hover:bg-primary/5 active:scale-95 transition-all"
            >
              Editar Veículo
            </button>
          </div>
        </div>

        {/* Info do Veículo */}
        <div className="flex items-center space-x-2.5 bg-card-secondary/40 border border-border/40 p-2.5 rounded-xl">
          <span className="text-[20px]">{getVehicleEmoji(vehicle.type)}</span>
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-extrabold text-foreground leading-tight">{vehicle.name}</h4>
            <span className="text-[9px] font-black text-muted tracking-wider bg-card border border-border px-1.5 py-0.5 rounded uppercase mt-0.5 inline-block">
              {vehicle.plate}
            </span>
          </div>
        </div>

        {/* Lista de Itens de Manutenção */}
        <div className="space-y-3 pt-1">
          {maintenanceItems.map((item: any) => {
            const styles = getUrgencyStyles(item.urgency);
            return (
              <div key={item.id} className="bg-card-secondary/20 border border-border/50 rounded-xl p-3 space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-[12px] font-bold text-foreground">{item.name}</h5>
                    <span className="text-[9px] text-muted block">Intervalo: {item.intervalKm} km</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${styles.bg} ${styles.text}`}>
                      {item.kmRemaining <= 0 ? 'Fazer Já!' : `Em ${item.kmRemaining.toFixed(0)} km`}
                    </span>
                    
                    {/* Botão Resetar (Feito!) */}
                    <button
                      onClick={() => resetMaintenanceItem(item.id)}
                      className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-lg active:scale-90 transition-all cursor-pointer"
                      title="Marcar como feito"
                    >
                      <CheckCircle size={15} />
                    </button>
                    
                    {/* Botão Excluir (Se não for padrão) */}
                    {!['oleo', 'relacao', 'pneus', 'pastilhas'].includes(item.id) && (
                      <button
                        onClick={() => removeMaintenanceItem(item.id)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg active:scale-90 transition-all cursor-pointer"
                        title="Remover item"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progresso de Vida Útil */}
                <div className="space-y-1">
                  <div className="w-full bg-card-secondary h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${styles.bar}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-muted">
                    <span>Último: {item.lastServiceKm.toFixed(0)} km</span>
                    <span>Próximo: {item.nextServiceKm.toFixed(0)} km</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setIsMaintenanceModalOpen(true)}
          className="w-full py-2.5 bg-card-secondary/40 border border-dashed border-border hover:bg-card-secondary rounded-xl text-[11px] font-extrabold text-foreground flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus size={13} />
          <span>Adicionar Nova Revisão</span>
        </button>
      </section>

      {/* SISTEMA DE CONQUISTAS */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center border-b border-border/50 pb-2">
          <div className="flex items-center space-x-2">
            <Trophy size={16} className="text-[#F59E0B]" />
            <h3 className="text-[12px] font-black text-foreground font-heading">Conquistas do Piloto</h3>
          </div>
          <span className="text-[10px] font-extrabold text-muted bg-card-secondary/60 px-2 py-0.5 rounded-full border border-border/60">
            {totalUnlocked} / {totalCount}
          </span>
        </div>

        {/* Lista de Conquistas */}
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {achievements.map((ach) => (
            <div 
              key={ach.id} 
              className={`flex items-center space-x-3 p-2.5 rounded-xl border transition-all ${
                ach.unlocked 
                  ? 'bg-card border-border/80 opacity-100 hover:scale-[1.01]' 
                  : 'bg-card-secondary/10 border-border/20 opacity-50'
              }`}
            >
              <div className="text-[24px] select-none">{ach.unlocked ? ach.icon : '🔒'}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[12px] font-extrabold text-foreground truncate leading-tight">{ach.title}</h4>
                <p className="text-[10px] text-muted leading-tight mt-0.5">{ach.description}</p>
                {/* Barra de Progresso da Conquista */}
                {!ach.unlocked && (
                  <div className="mt-1.5 space-y-0.5">
                    <div className="w-full bg-card-secondary h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${ach.progress}%` }} />
                    </div>
                    <span className="text-[8px] font-bold text-muted/80 block">{ach.targetVal}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ajustes e Preferências de Metas */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-extrabold text-muted px-1 uppercase tracking-wider">Ajuste de Metas</h3>
        
        <div className="bg-card border border-border rounded-[20px] overflow-hidden">
          {/* Meta Diária */}
          <div className="flex justify-between items-center p-3.5 border-b border-border/60">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-card-secondary/60 rounded-xl">
                <Target size={14} className="text-muted" />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-foreground">Diária</p>
                <p className="text-[10px] text-muted">R$ {dailyGoal.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            <button 
              onClick={() => { setGoalType('daily'); setNewGoal(String(dailyGoal)); setIsGoalModalOpen(true); }} 
              className="text-[12px] font-extrabold text-primary hover:underline cursor-pointer"
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
              className="text-[12px] font-extrabold text-primary hover:underline cursor-pointer"
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
              className="text-[12px] font-extrabold text-primary hover:underline cursor-pointer"
            >
              Editar
            </button>
          </div>
        </div>
      </section>

      {/* Preferência de Temas */}
      <section className="space-y-2">
        <h3 className="text-[11px] font-extrabold text-muted px-1 uppercase tracking-wider">Aparência</h3>
        
        <div className="bg-card border border-border rounded-[20px] p-3.5">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-card-secondary/60 rounded-xl">
              <Sun size={14} className="text-muted" />
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

      {/* Modal Ajustar Odometer */}
      {isOdometerModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-[15px] font-extrabold text-foreground font-heading">Ajustar Odômetro Manual</h3>
              <button onClick={() => setIsOdometerModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveOdometer} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Novo Odômetro Total (km)</label>
                <input 
                  type="number"
                  step="1"
                  required
                  value={tempOdometer}
                  onChange={e => setTempOdometer(e.target.value)}
                  className="w-full py-3 px-4 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-[18px] font-black text-foreground"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white font-extrabold rounded-xl transition-all active:scale-[0.98] text-[13px] cursor-pointer">
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Nova Revisão */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-[15px] font-extrabold text-foreground font-heading">Nova Revisão</h3>
              <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMaintenance} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Nome do Item</label>
                <input 
                  type="text"
                  required
                  value={newMaintenanceName}
                  onChange={e => setNewMaintenanceName(e.target.value)}
                  placeholder="Ex: Troca de Fluido de Freio"
                  className="w-full py-2.5 px-3 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Intervalo (km)</label>
                <input 
                  type="number"
                  required
                  value={newMaintenanceInterval}
                  onChange={e => setNewMaintenanceInterval(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full py-2.5 px-3 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-white font-extrabold rounded-xl transition-all active:scale-[0.98] text-[13px] cursor-pointer">
                Adicionar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Metas */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-[15px] font-extrabold text-foreground font-heading">
                {goalType === 'daily' ? 'Meta Diária' : goalType === 'weekly' ? 'Meta Semanal' : 'Meta Mensal'}
              </h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateGoal} className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Novo valor (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  className="w-full py-3 px-4 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-[18px] font-black text-foreground"
                  placeholder="0,00"
                  autoFocus
                />
              </div>

              <div className="flex space-x-2">
                <button 
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-3 font-bold text-foreground bg-card-secondary border border-border rounded-xl active:scale-[0.98] transition-all text-[13px] cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 font-bold text-white bg-primary rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50 text-[13px] cursor-pointer"
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
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-[15px] font-extrabold text-foreground font-heading">Editar Veículo</h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateVehicle} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted block uppercase tracking-wider mb-1.5">Tipo de Veículo</label>
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
                      className={`py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                        tempType === t.id 
                          ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                          : 'border-border bg-card text-muted hover:text-foreground'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted block uppercase tracking-wider">Modelo / Marca</label>
                <input 
                  type="text" 
                  required
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className="w-full p-2.5 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-[13px] font-bold text-foreground"
                  placeholder="Ex: Honda CG 160"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted block uppercase tracking-wider">Placa</label>
                <input 
                  type="text" 
                  required
                  value={tempPlate}
                  onChange={e => setTempPlate(e.target.value)}
                  className="w-full p-2.5 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary transition-colors text-[13px] font-bold font-mono text-foreground uppercase"
                  placeholder="Ex: ABC-1234"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 mt-1 font-bold text-white bg-primary rounded-xl active:scale-[0.98] transition-transform text-[13px] cursor-pointer shadow-md"
              >
                Salvar Veículo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
