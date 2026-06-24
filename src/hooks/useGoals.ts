'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Goals {
  daily: number;
  weekly: number;
  monthly: number;
}

const DEFAULT_GOALS: Goals = { daily: 250, weekly: 1750, monthly: 7000 };

export function useGoals() {
  const { user } = useAuth();
  const [dailyGoal, setDailyGoal] = useState<number>(DEFAULT_GOALS.daily);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(DEFAULT_GOALS.weekly);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(DEFAULT_GOALS.monthly);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('motopilot_goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDailyGoal(parsed.daily || DEFAULT_GOALS.daily);
        setWeeklyGoal(parsed.weekly || DEFAULT_GOALS.weekly);
        setMonthlyGoal(parsed.monthly || DEFAULT_GOALS.monthly);
      } catch {}
    }
  }, []);

  const saveToLocalStorage = (goals: Goals) => {
    localStorage.setItem('motopilot_goals', JSON.stringify(goals));
  };

  const fetchGoal = useCallback(async () => {
    if (!user) return;
    
    // Tenta carregar todas as colunas
    let data: any = null;
    let error: any = null;

    const firstResult = await supabase
      .from('goals')
      .select('daily_goal, weekly_goal, monthly_goal')
      .eq('user_id', user.id)
      .maybeSingle();

    data = firstResult.data;
    error = firstResult.error;

    // Se falhar porque as colunas adicionais não existem, busca apenas a diária
    if (error && (error.code === '42703' || error.message?.includes('weekly_goal') || error.message?.includes('monthly_goal'))) {
      const fallbackResult = await supabase
        .from('goals')
        .select('daily_goal')
        .eq('user_id', user.id)
        .maybeSingle();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (!error && data) {
      setDailyGoal(data.daily_goal);
      
      const saved = localStorage.getItem('motopilot_goals');
      let currentWeekly = weeklyGoal;
      let currentMonthly = monthlyGoal;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          currentWeekly = parsed.weekly;
          currentMonthly = parsed.monthly;
        } catch {}
      }

      const finalWeekly = (data && 'weekly_goal' in data && data.weekly_goal !== null && data.weekly_goal !== undefined)
        ? data.weekly_goal 
        : (currentWeekly || data.daily_goal * 7);

      const finalMonthly = (data && 'monthly_goal' in data && data.monthly_goal !== null && data.monthly_goal !== undefined)
        ? data.monthly_goal 
        : (currentMonthly || data.daily_goal * 28);

      setWeeklyGoal(finalWeekly);
      setMonthlyGoal(finalMonthly);
      saveToLocalStorage({ 
        daily: data.daily_goal, 
        weekly: finalWeekly, 
        monthly: finalMonthly 
      });
    }
  }, [user, weeklyGoal, monthlyGoal]);

  const updateGoal = async (amount: number) => {
    if (!user) return { error: { message: 'Usuário não logado' } };

    setDailyGoal(amount);
    
    const saved = localStorage.getItem('motopilot_goals');
    let currentWeekly = weeklyGoal;
    let currentMonthly = monthlyGoal;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        currentWeekly = parsed.weekly;
        currentMonthly = parsed.monthly;
      } catch {}
    }

    const newWeekly = currentWeekly || amount * 7;
    const newMonthly = currentMonthly || amount * 28;
    setWeeklyGoal(newWeekly);
    setMonthlyGoal(newMonthly);
    saveToLocalStorage({ daily: amount, weekly: newWeekly, monthly: newMonthly });

    const payload: any = {
      user_id: user.id,
      daily_goal: amount,
      weekly_goal: newWeekly,
      monthly_goal: newMonthly,
      updated_at: new Date().toISOString()
    };

    let { error } = await supabase
      .from('goals')
      .upsert(payload, { onConflict: 'user_id' });

    if (error && (error.code === 'PGRST204' || error.message?.includes('weekly_goal') || error.message?.includes('monthly_goal') || error.message?.includes('schema cache'))) {
      const fallbackResult = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          daily_goal: amount,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      error = fallbackResult.error;
    }

    if (error) {
      console.warn('Supabase goals upsert error (localStorage saved):', error.message);
    }
    return { error };
  };

  const updateGoalDirect = async (field: 'daily' | 'weekly' | 'monthly', value: number) => {
    if (!user) return { error: { message: 'Usuário não logado' } };

    const newDaily = field === 'daily' ? value : dailyGoal;
    const newWeekly = field === 'weekly' ? value : weeklyGoal;
    const newMonthly = field === 'monthly' ? value : monthlyGoal;

    setDailyGoal(newDaily);
    setWeeklyGoal(newWeekly);
    setMonthlyGoal(newMonthly);
    saveToLocalStorage({ daily: newDaily, weekly: newWeekly, monthly: newMonthly });

    const payload: any = {
      user_id: user.id,
      daily_goal: newDaily,
      weekly_goal: newWeekly,
      monthly_goal: newMonthly,
      updated_at: new Date().toISOString()
    };

    let { error } = await supabase
      .from('goals')
      .upsert(payload, { onConflict: 'user_id' });

    if (error && (error.code === 'PGRST204' || error.message?.includes('weekly_goal') || error.message?.includes('monthly_goal') || error.message?.includes('schema cache'))) {
      const fallbackResult = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          daily_goal: newDaily,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      error = fallbackResult.error;
    }

    if (error) {
      console.warn('Supabase goals upsert error (localStorage saved):', error.message);
    }
    return { error };
  };

  return {
    dailyGoal,
    weeklyGoal,
    monthlyGoal,
    fetchGoal,
    updateGoal,
    updateGoalDirect
  };
}
