'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight } from '@phosphor-icons/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 space-y-8 bg-[var(--color-background)]">
      <div className="w-full max-w-sm space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">Entrar</h1>
        <p className="text-[var(--color-muted)]">Gerencie suas jornadas com eficiência.</p>
      </div>

      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
            Falha ao entrar. Verifique suas credenciais.
          </div>
        )}
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--color-foreground)]">E-mail</label>
          <input 
            type="email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--color-foreground)]"
            placeholder="seu@email.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--color-foreground)]">Senha</label>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--color-foreground)]"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full flex items-center justify-center py-4 mt-2 font-bold text-[#0A0A0A] bg-[var(--color-primary)] rounded-xl hover:bg-[#1ea850] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
        >
          {loading ? 'Entrando...' : (
            <>
              <span className="mr-2">Acessar Painel</span>
              <ArrowRight size={20} weight="bold" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
