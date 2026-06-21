'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight, GoogleLogo } from '@phosphor-icons/react';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor;

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
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
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
          <GoogleLogo size={22} weight="fill" />
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
              <ArrowRight size={20} weight="bold" />
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
