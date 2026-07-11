'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight } from 'lucide-react';

const GoogleIcon = ({ size = 22 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.63-1.09-1.39-1.39-2.22"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isCapacitor = typeof window !== 'undefined' && !!(window as unknown as { Capacitor?: unknown }).Capacitor;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const redirectTo = isCapacitor
      ? `${window.location.origin}/`
      : window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: email.split('@')[0] } }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login')) {
          setError('E-mail ou senha incorretos.');
        } else {
          setError(error.message);
        }
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 space-y-8 bg-[var(--color-background)]">
      <div className="w-full max-w-sm space-y-2 text-center">
        <div className="mx-auto w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mb-4">
          <span className="text-white font-black text-[28px]">M</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)] font-heading">
          {mode === 'login' ? 'Bem-vindo' : 'Criar Conta'}
        </h1>
        <p className="text-[var(--color-muted)]">
          {mode === 'login' ? 'Entre para gerenciar suas jornadas.' : 'Cadastre-se para começar.'}
        </p>
      </div>

      {/* Botão Google */}
      {!isCapacitor && (
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full max-w-sm flex items-center justify-center gap-3 py-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl text-[var(--color-foreground)] font-medium hover:bg-[var(--color-card-secondary)] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <GoogleIcon size={22} />
          <span>Entrar com Google</span>
        </button>
      )}

      {/* Divisor */}
      {!isCapacitor && (
        <div className="w-full max-w-sm flex items-center gap-4">
          <div className="flex-1 h-px bg-[var(--color-border)]"></div>
          <span className="text-[13px] text-[var(--color-muted)]">ou</span>
          <div className="flex-1 h-px bg-[var(--color-border)]"></div>
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-xl border border-red-500/20">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 text-sm text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-xl border border-[var(--color-primary)]/20">
            {success}
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
            minLength={6}
            className="w-full p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--color-foreground)]"
            placeholder="••••••••"
          />
        </div>

        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--color-foreground)]">Confirmar Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[var(--color-foreground)]"
              placeholder="••••••••"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center py-4 mt-2 font-bold text-white bg-[var(--color-primary)] rounded-xl hover:bg-[#ff3b4b] active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100 cursor-pointer"
        >
          {loading ? 'Processando...' : (
            <>
              <span className="mr-2">{mode === 'login' ? 'Entrar' : 'Criar Conta'}</span>
              <ArrowRight size={20} strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      {/* Toggle Login/Signup */}
      <button
        onClick={() => {
          setMode(mode === 'login' ? 'signup' : 'login');
          setError(null);
          setSuccess(null);
        }}
        className="text-[14px] text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors"
      >
        {mode === 'login'
          ? 'Não tem conta? Criar conta'
          : 'Já tem conta? Entrar'}
      </button>
    </div>
  );
}
