'use client';

import { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Settings, 
  LogOut, 
  Flag, 
  X, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals } from '@/hooks/useGoals';
import { useJourneys } from '@/hooks/useJourneys';
import { useEntries } from '@/hooks/useEntries';
import { supabase } from '@/lib/supabase/client';

export default function Perfil() {
  const { user } = useAuth();
  const { dailyGoal, updateGoal } = useGoals();
  const { historicalJourneys } = useJourneys();
  const { entries, fetchRecentEntries } = useEntries();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
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
    name: 'Honda CG 160 Titan',
    plate: 'ABC-1234',
    type: 'moto'
  });
  const [tempName, setTempName] = useState('');
  const [tempPlate, setTempPlate] = useState('');
  const [tempType, setTempType] = useState('moto');

  // Carrega o veículo salvo no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('active_vehicle');
    if (saved) {
      try {
        setVehicle(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao ler veículo:', e);
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
    await updateGoal(parseFloat(newGoal));
    setLoading(false);
    setIsGoalModalOpen(false);
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

  // Retorna o emoji adequado para o tipo de veículo
  const getVehicleEmoji = (type: string) => {
    switch (type) {
      case 'moto': return '🏍️';
      case 'carro': return '🚗';
      case 'bike': return '🚲';
      default: return '📦';
    }
  };

  // Cumulative driver stats
  const totalGains = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const totalDeliveries = entries.filter(e => e.type === 'gain').length;
  const totalKm = historicalJourneys.reduce((acc, curr) => acc + curr.distance_km, 0);

  return (
    <div className="p-4 space-y-6 pb-28">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-[20px] font-black tracking-tight text-foreground font-heading">Perfil</h1>
        <button className="text-muted hover:text-foreground transition-colors">
          <Settings size={22} />
        </button>
      </header>

      {/* Info do Usuário */}
      <section className="flex items-center space-x-4 bg-card border border-border p-6 rounded-[28px] shadow-premium animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative flex-shrink-0">
          <UserCircle size={40} className="text-primary" />
          <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center animate-pulse" title="Online"></span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-[18px] font-black text-foreground truncate font-heading">
              {user?.email?.split('@')[0] || 'Piloto'}
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-primary/10 text-primary rounded-md border border-primary/15">
              PRO
            </span>
          </div>
          <p className="text-[12px] text-muted truncate mt-0.5">{user?.email}</p>
          <div className="mt-2 inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-full text-[11px] font-bold text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Piloto Online</span>
          </div>
        </div>
      </section>

      {/* Grid de Estatísticas Cumulativas */}
      <section className="grid grid-cols-3 gap-2.5 animate-fade-in-up delay-75">
        <div className="bg-card border border-border rounded-[20px] p-3 text-center shadow-sm">
          <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Total Km</span>
          <span className="text-[15px] font-black text-foreground block mt-1 font-heading">
            {totalKm.toFixed(0).replace('.', ',')} km
          </span>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3 text-center shadow-sm">
          <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Entregas</span>
          <span className="text-[15px] font-black text-foreground block mt-1 font-heading">
            {totalDeliveries}
          </span>
        </div>
        <div className="bg-card border border-border rounded-[20px] p-3 text-center shadow-sm">
          <span className="text-[9px] font-bold text-muted uppercase tracking-wider block">Ganhos</span>
          <span className="text-[15px] font-black text-emerald-500 block mt-1 font-heading">
            R$ {totalGains.toFixed(0)}
          </span>
        </div>
      </section>

      {/* Veículo Ativo com Detalhes */}
      <section className="bg-card border border-border rounded-[28px] p-5 shadow-premium animate-fade-in-up delay-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[12px] font-bold text-muted uppercase tracking-wider">Veículo de Trabalho</h3>
          <button 
            onClick={handleOpenVehicleModal}
            className="text-[13px] font-extrabold text-primary hover:underline active:scale-95 transition-transform"
          >
            Editar
          </button>
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-14 h-14 bg-card-secondary rounded-2xl flex items-center justify-center border border-border">
            <span className="text-[28px]">{getVehicleEmoji(vehicle.type)}</span>
          </div>
          <div>
            <h4 className="text-[16px] font-extrabold text-foreground font-heading">{vehicle.name}</h4>
            <span className="text-[11px] font-bold text-muted tracking-widest bg-card-secondary px-2 py-0.5 rounded-md border border-border uppercase inline-block mt-0.5">
              {vehicle.plate}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4 grid grid-cols-2 gap-3 text-[12px]">
          <div className="space-y-0.5">
            <span className="text-muted block font-semibold">Abastecimento</span>
            <span className="text-foreground font-extrabold">2 dias atrás (Posto Ipiranga)</span>
          </div>
          <div className="space-y-0.5 border-l border-border pl-3">
            <span className="text-muted block font-semibold">Próxima Revisão</span>
            <span className="text-[#F59E0B] font-extrabold">Em 1.250 km (Óleo)</span>
          </div>
        </div>
      </section>

      {/* Ajustes e Preferências */}
      <section className="space-y-3 pt-2 animate-fade-in-up delay-150">
        <h3 className="text-[12px] font-bold text-muted px-1 uppercase tracking-wider">Configurações & Ajustes</h3>
        
        <div className="bg-card border border-border rounded-[28px] overflow-hidden shadow-premium">
          {/* Meta Diária */}
          <div className="flex justify-between items-center p-5 border-b border-border hover:bg-card-secondary/30 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-card-secondary rounded-2xl">
                <Flag size={20} className="text-primary animate-pulse" />
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-foreground">Meta Diária</p>
                <p className="text-[12px] text-muted mt-0.5">Meta ativa: R$ {dailyGoal.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsGoalModalOpen(true)} 
              className="text-[13px] font-extrabold text-primary hover:underline"
            >
              Editar
            </button>
          </div>

          {/* Theme Selector */}
          <div className="p-5 space-y-3">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-card-secondary rounded-2xl">
                <Settings size={20} className="text-muted" />
              </div>
              <div>
                <p className="text-[15px] font-extrabold text-foreground">Tema do Aplicativo</p>
                <p className="text-[12px] text-muted mt-0.5">Escolha seu estilo visual premium</p>
              </div>
            </div>
            
            {/* 3-Theme Selector Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-1.5">
              {[
                { id: 'light', label: '☀ Claro' },
                { id: 'dark', label: '🌙 Escuro' },
                { id: 'ifood', label: '🔴 iFood' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id as 'light' | 'dark' | 'ifood')}
                  className={`py-3.5 rounded-2xl border text-[13px] font-extrabold text-center transition-all cursor-pointer active:scale-95 ${
                    theme === t.id 
                      ? 'border-primary ring-2 ring-primary/20 shadow-sm font-black' 
                      : 'border-border bg-card text-muted hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ações */}
      <section className="pt-2 animate-fade-in-up delay-200">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-card hover:bg-card-secondary text-red-500 font-extrabold py-4.5 rounded-[24px] border border-border transition-colors active:scale-[0.98] text-[15px] shadow-sm cursor-pointer"
        >
          <LogOut size={20} />
          <span>Sair da Conta</span>
        </button>
      </section>

      {/* Modal de Meta Diária */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-card w-full max-w-sm rounded-[32px] border border-border overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h3 className="text-[18px] font-extrabold text-foreground font-heading">Meta Diária</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-muted hover:text-foreground transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateGoal} className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Nova Meta (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  className="w-full p-4 bg-card-secondary border border-border rounded-2xl focus:outline-none focus:border-primary transition-colors text-[20px] font-black text-foreground"
                  placeholder="250,00"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 font-bold text-white bg-primary rounded-2xl hover:bg-primary/95 active:scale-[0.98] transition-transform disabled:opacity-50 text-[14px] cursor-pointer shadow-md"
              >
                {loading ? 'Salvando...' : 'Salvar Meta'}
              </button>
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
    </div>
  );
}
