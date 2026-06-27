'use client';

import { useState, useEffect } from 'react';
import { 
  CircleUserRound, LogOut, Target, X, Sun, Plus, Trash2, CheckCircle, 
  Bike, Route, TrendingUp, Wrench
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals } from '@/hooks/useGoals';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';
import { useMaintenance } from '@/hooks/useMaintenance';
import { useFinancialStats } from '@/hooks/useFinancialStats';
import { supabase } from '@/lib/supabase/client';

export default function Perfil() {
  const { user } = useAuth();
  const { dailyGoal, weeklyGoal, monthlyGoal, updateGoal, updateGoalDirect } = useGoals();
  const { historicalJourneys } = useJourneys();
  const { entries, fetchRecentEntries } = useEntries();
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [newGoal, setNewGoal] = useState('');
  
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicle, setVehicle] = useState({ name: 'Minha Moto', plate: 'AAA-0000', type: 'moto' });
  const [tempName, setTempName] = useState('');
  const [tempPlate, setTempPlate] = useState('');
  const [tempType, setTempType] = useState('moto');

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [newMaintenanceName, setNewMaintenanceName] = useState('');
  const [newMaintenanceInterval, setNewMaintenanceInterval] = useState('');
  const [isOdometerModalOpen, setIsOdometerModalOpen] = useState(false);
  const [tempOdometer, setTempOdometer] = useState('');

  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'ifood'>('dark');

  const anyModalOpen = isOdometerModalOpen || isMaintenanceModalOpen || isGoalModalOpen || isVehicleModalOpen;

  useEffect(() => {
    if (anyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [anyModalOpen]);

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') || 'dark') as 'light' | 'dark' | 'ifood';
    setTheme(savedTheme);
    const savedVehicle = localStorage.getItem('active_vehicle');
    if (savedVehicle) {
      try { setVehicle(JSON.parse(savedVehicle)); } catch {}
    }
  }, []);

  const changeTheme = (newTheme: 'light' | 'dark' | 'ifood') => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => { fetchRecentEntries(500); }, [fetchRecentEntries]);

  const stats = useFinancialStats(entries, historicalJourneys || [], null, dailyGoal);
  const { currentOdometer, maintenanceItems, addItem: addMaintenanceItem, removeItem: removeMaintenanceItem, resetItem: resetMaintenanceItem, saveOdometer } = useMaintenance(stats.totalDistance);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal) return;
    setLoading(true);
    const value = parseFloat(newGoal);
    if (goalType === 'daily') await updateGoal(value);
    else await updateGoalDirect(goalType, value);
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
    if (!isNaN(km) && km >= 0) saveOdometer(km);
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

  const getUrgencyStyles = (urgency: 'ok' | 'warning' | 'urgent') => {
    if (urgency === 'urgent') return { text: 'text-red-500', bg: 'bg-red-500/10', bar: 'bg-red-500' };
    if (urgency === 'warning') return { text: 'text-amber-500', bg: 'bg-amber-500/10', bar: 'bg-amber-500' };
    return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500' };
  };

  const totalHours = historicalJourneys.reduce((acc, curr) => acc + curr.duration_minutes, 0) / 60;

  return (
    <div className="space-y-3 pb-28 pt-2 px-4 animate-fade-in-up">
      {/* Header */}
      <header className="flex items-center justify-between py-2">
        <h1 className="text-[16px] font-extrabold text-foreground font-heading">Perfil</h1>
        <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center text-muted hover:text-red-500 rounded-xl transition-colors cursor-pointer" title="Sair">
          <LogOut size={20} strokeWidth={2.5} />
        </button>
      </header>

      {/* User Card */}
      <section className="bg-card border border-border p-4 rounded-[20px] shadow-premium flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
          <CircleUserRound size={32} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[15px] font-black text-foreground truncate font-heading">{user?.email?.split('@')[0] || 'Piloto'}</h2>
          <p className="text-[11px] text-muted truncate mt-0.5">{user?.email}</p>
        </div>
      </section>

      {/* Resumo Geral */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-sm">
        <h3 className="text-[12px] font-black text-foreground font-heading mb-3">Resumo Geral</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2.5 bg-card-secondary/40 p-3 rounded-xl">
            <TrendingUp size={16} className="text-emerald-500 flex-shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-muted uppercase block">Lucro Total</span>
              <span className="text-[14px] font-black text-foreground font-heading">R$ {stats.netProfit.toFixed(0)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 bg-card-secondary/40 p-3 rounded-xl">
            <Bike size={16} className="text-primary flex-shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-muted uppercase block">Entregas</span>
              <span className="text-[14px] font-black text-foreground font-heading">{stats.deliveriesCount}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 bg-card-secondary/40 p-3 rounded-xl">
            <Route size={16} className="text-blue-500 flex-shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-muted uppercase block">Km Rodados</span>
              <span className="text-[14px] font-black text-foreground font-heading">{stats.totalDistance.toFixed(0)} km</span>
            </div>
          </div>
          <div className="flex items-center space-x-2.5 bg-card-secondary/40 p-3 rounded-xl">
            <TrendingUp size={16} className="text-amber-500 flex-shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-muted uppercase block">Tempo Total</span>
              <span className="text-[14px] font-black text-foreground font-heading">{Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}m</span>
            </div>
          </div>
        </div>
      </section>

      {/* Veículo + Manutenção */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-[12px] font-black text-foreground font-heading">Veículo</h3>
          <div className="flex space-x-1.5">
            <button 
              onClick={() => { setTempOdometer(String(currentOdometer)); setIsOdometerModalOpen(true); }}
              className="text-[10px] font-extrabold bg-card border border-border px-2 py-1 rounded-lg text-foreground hover:bg-card-secondary active:scale-95 transition-all cursor-pointer"
            >
              Odômetro
            </button>
            <button 
              onClick={handleOpenVehicleModal}
              className="text-[10px] font-extrabold bg-card border border-border px-2 py-1 rounded-lg text-primary hover:bg-primary/5 active:scale-95 transition-all cursor-pointer"
            >
              Editar
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-card-secondary/40 border border-border/40 p-3 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wrench size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-extrabold text-foreground">{vehicle.name}</h4>
            <span className="text-[10px] font-black text-muted uppercase">{vehicle.plate} · {currentOdometer.toFixed(0)} km</span>
          </div>
        </div>

        {/* Itens de Manutenção */}
        <div className="space-y-2">
          {maintenanceItems.map((item: any) => {
            const styles = getUrgencyStyles(item.urgency);
            return (
              <div key={item.id} className="bg-card-secondary/20 border border-border/50 rounded-xl p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="text-[12px] font-bold text-foreground">{item.name}</h5>
                    <span className="text-[9px] text-muted">A cada {item.intervalKm} km</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${styles.bg} ${styles.text}`}>
                      {item.kmRemaining <= 0 ? 'Fazer já!' : `${item.kmRemaining.toFixed(0)} km`}
                    </span>
                    <button onClick={() => resetMaintenanceItem(item.id)} className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-lg active:scale-90 transition-all cursor-pointer" title="Feito">
                      <CheckCircle size={14} />
                    </button>
                    {!['oleo', 'relacao', 'pneus', 'pastilhas'].includes(item.id) && (
                      <button onClick={() => removeMaintenanceItem(item.id)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg active:scale-90 transition-all cursor-pointer" title="Remover">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full bg-card-secondary h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${styles.bar}`} style={{ width: `${item.progress}%` }} />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-muted mt-1">
                  <span>Último: {item.lastServiceKm.toFixed(0)} km</span>
                  <span>Próximo: {item.nextServiceKm.toFixed(0)} km</span>
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
          <span>Adicionar Revisão</span>
        </button>
      </section>

      {/* Metas */}
      <section className="bg-card border border-border rounded-[20px] shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-border/60">
          <span className="text-[12px] font-black text-foreground font-heading">Metas</span>
        </div>
        {[
          { type: 'daily' as const, label: 'Diária', value: dailyGoal },
          { type: 'weekly' as const, label: 'Semanal', value: weeklyGoal },
          { type: 'monthly' as const, label: 'Mensal', value: monthlyGoal },
        ].map((g, i) => (
          <div key={g.type} className={`flex justify-between items-center p-3.5 ${i < 2 ? 'border-b border-border/60' : ''}`}>
            <div>
              <p className="text-[13px] font-extrabold text-foreground">{g.label}</p>
              <p className="text-[10px] text-muted">R$ {g.value.toFixed(2).replace('.', ',')}</p>
            </div>
            <button 
              onClick={() => { setGoalType(g.type); setNewGoal(String(g.value)); setIsGoalModalOpen(true); }} 
              className="text-[12px] font-extrabold text-primary hover:underline cursor-pointer"
            >
              Editar
            </button>
          </div>
        ))}
      </section>

      {/* Tema */}
      <section className="bg-card border border-border rounded-[20px] p-4 shadow-sm space-y-3">
        <span className="text-[12px] font-black text-foreground font-heading">Aparência</span>
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
      </section>

      {/* Modais */}
      {isOdometerModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-[15px] font-extrabold text-foreground font-heading">Ajustar Odômetro</h3>
              <button onClick={() => setIsOdometerModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveOdometer} className="p-4 space-y-4">
              <input type="number" step="1" required value={tempOdometer} onChange={e => setTempOdometer(e.target.value)}
                className="w-full py-3 px-4 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-[18px] font-black text-foreground" />
              <button type="submit" className="w-full py-3 bg-primary text-white font-extrabold rounded-xl transition-all active:scale-[0.98] text-[13px] cursor-pointer">Salvar</button>
            </form>
          </div>
        </div>
      )}

      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-[15px] font-extrabold text-foreground font-heading">Nova Revisão</h3>
              <button onClick={() => setIsMaintenanceModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddMaintenance} className="p-4 space-y-4">
              <input type="text" required value={newMaintenanceName} onChange={e => setNewMaintenanceName(e.target.value)} placeholder="Ex: Troca de Óleo"
                className="w-full py-2.5 px-3 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground" />
              <input type="number" required value={newMaintenanceInterval} onChange={e => setNewMaintenanceInterval(e.target.value)} placeholder="Intervalo em km"
                className="w-full py-2.5 px-3 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground" />
              <button type="submit" className="w-full py-3 bg-primary text-white font-extrabold rounded-xl transition-all active:scale-[0.98] text-[13px] cursor-pointer">Adicionar</button>
            </form>
          </div>
        </div>
      )}

      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-[15px] font-extrabold text-foreground font-heading">
                {goalType === 'daily' ? 'Meta Diária' : goalType === 'weekly' ? 'Meta Semanal' : 'Meta Mensal'}
              </h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateGoal} className="p-4 space-y-4">
              <input type="number" step="0.01" required value={newGoal} onChange={e => setNewGoal(e.target.value)}
                className="w-full py-3 px-4 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-[18px] font-black text-foreground" placeholder="0,00" autoFocus />
              <div className="flex space-x-2">
                <button type="button" onClick={() => setIsGoalModalOpen(false)} className="flex-1 py-3 font-bold text-foreground bg-card-secondary border border-border rounded-xl active:scale-[0.98] transition-all text-[13px] cursor-pointer">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 font-bold text-white bg-primary rounded-xl active:scale-[0.98] transition-transform disabled:opacity-50 text-[13px] cursor-pointer">
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl animate-fade-in-up max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="text-[15px] font-extrabold text-foreground font-heading">Editar Veículo</h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateVehicle} className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'moto', label: 'Moto' },
                  { id: 'carro', label: 'Carro' },
                  { id: 'bike', label: 'Bike' }
                ].map(t => (
                  <button key={t.id} type="button" onClick={() => setTempType(t.id)}
                    className={`py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      tempType === t.id ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-border bg-card text-muted hover:text-foreground'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <input type="text" required value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Ex: Honda CG 160"
                className="w-full p-2.5 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground" />
              <input type="text" required value={tempPlate} onChange={e => setTempPlate(e.target.value)} placeholder="Ex: ABC-1234"
                className="w-full p-2.5 bg-card-secondary border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold font-mono text-foreground uppercase" />
              <button type="submit" className="w-full py-3 font-bold text-white bg-primary rounded-xl active:scale-[0.98] transition-transform text-[13px] cursor-pointer shadow-md">Salvar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
