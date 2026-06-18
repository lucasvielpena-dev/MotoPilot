'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BottomNavigation } from '@/components/BottomNavigation';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function ClientAppWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const [dbError, setDbError] = useState<boolean>(false);

  useEffect(() => {
    // Inicializa o tema do aplicativo (escuro por padrão)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Verifica se as tabelas existem fazendo uma query rápida na tabela de metas
    supabase.from('goals').select('id').limit(1).then(({ error }) => {
      if (error && error.code === 'PGRST205') {
        setDbError(true);
      }
    });
  }, []);

  return (
    <AuthProvider>
      <ProtectedRoute>
        <main className={`flex-1 w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto relative px-4 ${!isLoginPage ? 'pb-24 md:pb-28' : ''}`}>
          {dbError && (
            <div className="my-4 p-4 bg-red-950/60 border border-red-500/30 rounded-2xl text-red-200 text-[13px] leading-relaxed flex flex-col space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-red-400">
                <span>🚨 Banco de Dados Incompleto</span>
              </div>
              <p>
                As tabelas necessárias não foram encontradas no seu banco de dados do Supabase. Para corrigir, vá no painel do Supabase, abra o <strong>SQL Editor</strong>, crie uma <strong>New Query</strong>, cole o conteúdo do arquivo <code>supabase/schema.sql</code> e execute (<strong>Run</strong>).
              </p>
            </div>
          )}
          {children}
        </main>
        {!isLoginPage && <BottomNavigation />}
      </ProtectedRoute>
    </AuthProvider>
  );
}
