'use client';

import { useState, useEffect } from 'react';
import { 
  UserCircle, 
  Gear, 
  SignOut, 
  Bell, 
  X, 
  Sun, 
  Moon 
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useGoals } from '@/hooks/useGoals';
import { supabase } from '@/lib/supabase/client';

export default function Perfil() {
  const { user } = useAuth();
  const { dailyGoal, updateGoal } = useGoals();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-[20px] font-semibold tracking-tight text-[var(--color-foreground)]">Perfil</h1>
        <button className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
          <Gear size={24} />
        </button>
      </header>

      {/* Info do Usuário */}
      <section className="flex items-center space-x-4 card-premium p-6 rounded-3xl animate-fade-in-up">
        <UserCircle size={64} className="text-[var(--color-muted)]" />
        <div>
          <h2 className="text-[20px] font-bold text-[var(--color-foreground)]">{user?.email?.split('@')[0] || 'Usuário'}</h2>
          <p className="text-[14px] text-[var(--color-muted)]">{user?.email}</p>
          <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-1 bg-[#22C55E]/10 rounded-lg text-[12px] font-medium text-[#22C55E]">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
            <span>Online</span>
          </div>
        </div>
      </section>

      {/* Veículo Ativo */}
      <section className="card-premium rounded-3xl p-6 animate-fade-in-up delay-75">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[14px] font-semibold text-[var(--color-muted)] uppercase tracking-wider">Veículo Ativo</h3>
          <button 
            onClick={handleOpenVehicleModal}
            className="text-[14px] font-semibold text-[var(--color-primary)] hover:underline active:scale-95 transition-transform"
          >
            Trocar
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-[var(--color-card-secondary)] rounded-2xl flex items-center justify-center border border-[var(--color-border)]">
            <span className="text-[32px]">{getVehicleEmoji(vehicle.type)}</span>
          </div>
          <div>
            <h4 className="text-[18px] font-bold text-[var(--color-foreground)]">{vehicle.name}</h4>
            <p className="text-[14px] text-[var(--color-muted)] font-mono mt-0.5 bg-[var(--color-background)] px-2 py-0.5 rounded-md inline-block border border-[var(--color-border)] uppercase">{vehicle.plate}</p>
          </div>
        </div>
      </section>

      {/* Configurações Rápidas */}
      <section className="space-y-3 pt-2">
        <h3 className="text-[14px] font-semibold text-[var(--color-muted)] px-1 uppercase tracking-wider">Ajustes da Jornada</h3>
        
        <div className="card-premium rounded-3xl overflow-hidden animate-fade-in-up delay-150">
          <div className="flex justify-between items-center p-5 border-b border-[var(--color-border)]">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[var(--color-background)] rounded-2xl flex items-center justify-center">
                <Bell size={24} className="text-[var(--color-muted)]" />
              </div>
              <div>
                <p className="text-[16px] font-medium text-[var(--color-foreground)]">Meta Diária</p>
                <p className="text-[14px] text-[var(--color-muted)] mt-0.5">Atualmente: R$ {dailyGoal.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
            <button onClick={() => setIsGoalModalOpen(true)} className="text-[16px] font-semibold text-[var(--color-primary)]">Editar</button>
          </div>

          <div className="flex justify-between items-center p-5 border-b border-[var(--color-border)]">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[var(--color-background)] rounded-2xl flex items-center justify-center">
                <Gear size={24} className="text-[var(--color-muted)]" />
              </div>
              <div>
                <p className="text-[16px] font-medium text-[var(--color-foreground)]">Preferências do App</p>
                <p className="text-[14px] text-[var(--color-muted)] mt-0.5">Notificações e GPS</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center p-5">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[var(--color-background)] rounded-2xl flex items-center justify-center">
                {theme === 'dark' ? (
                  <Moon size={24} weight="fill" className="text-indigo-500" />
                ) : (
                  <Sun size={24} weight="fill" className="text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-[16px] font-medium text-[var(--color-foreground)]">Tema do Aplicativo</p>
                <p className="text-[14px] text-[var(--color-muted)] mt-0.5">{theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</p>
              </div>
            </div>
            {/* Toggle switch */}
            <button 
              onClick={toggleTheme}
              className={`w-9 h-5.5 rounded-full p-0.5 transition-colors relative cursor-pointer flex items-center ${
                theme === 'dark' ? 'bg-[var(--color-primary)]' : 'bg-neutral-350'
              }`}
            >
              <div 
                className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                  theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Ações */}
      <section className="pt-6">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 bg-[var(--color-card)] hover:bg-[var(--color-border)] text-red-500 font-semibold py-5 rounded-3xl border border-[var(--color-border)] transition-colors active:scale-[0.98] text-[16px]"
        >
          <SignOut size={24} />
          <span>Sair da Conta</span>
        </button>
      </section>

      {/* Modal de Meta Diária */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-[var(--color-background)] w-full max-w-md rounded-[32px] border border-[var(--color-border)] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in-100 sm:zoom-in-95">
            <div className="flex justify-between items-center p-5 border-b border-[var(--color-border)]">
              <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">Alterar Meta Diária</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateGoal} className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-[14px] font-medium text-[var(--color-muted)] block mb-2">Nova Meta (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  className="w-full p-5 bg-[var(--color-card-secondary)] border border-[var(--color-border)] rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[24px] font-semibold text-[var(--color-foreground)]"
                  placeholder="250.00"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 mt-2 font-bold text-white bg-[var(--color-primary)] rounded-2xl hover:bg-[#ff3b4b] active:scale-[0.98] transition-transform disabled:opacity-50 text-[16px] cursor-pointer"
              >
                {loading ? 'Salvando...' : 'Atualizar Meta'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Alterar Veículo */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-[var(--color-background)] w-full max-w-md rounded-[32px] border border-[var(--color-border)] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in-100 sm:zoom-in-95">
            <div className="flex justify-between items-center p-5 border-b border-[var(--color-border)]">
              <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">Editar Veículo</h3>
              <button onClick={() => setIsVehicleModalOpen(false)} className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateVehicle} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[14px] font-medium text-[var(--color-muted)] block">Tipo de Veículo</label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'moto', label: '🏍️ Moto' },
                    { id: 'carro', label: '🚗 Carro' },
                    { id: 'bike', label: '🚲 Bike' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTempType(t.id)}
                      className={`py-3 rounded-xl border text-[14px] font-medium transition-all ${
                        tempType === t.id 
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' 
                          : 'border-[var(--color-border)] bg-[var(--color-card-secondary)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-medium text-[var(--color-muted)] block">Modelo / Marca</label>
                <input 
                  type="text" 
                  required
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  className="w-full p-4 bg-[var(--color-card-secondary)] border border-[var(--color-border)] rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[16px] text-[var(--color-foreground)]"
                  placeholder="Ex: Honda CG 160"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[14px] font-medium text-[var(--color-muted)] block">Placa</label>
                <input 
                  type="text" 
                  required
                  value={tempPlate}
                  onChange={e => setTempPlate(e.target.value)}
                  className="w-full p-4 bg-[var(--color-card-secondary)] border border-[var(--color-border)] rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[16px] font-mono text-[var(--color-foreground)] uppercase"
                  placeholder="Ex: ABC-1234"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-4 mt-2 font-bold text-white bg-[var(--color-primary)] rounded-2xl hover:bg-[#ff3b4b] active:scale-[0.98] transition-transform text-[16px] cursor-pointer"
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
