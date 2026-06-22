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
    const { data, error } = await supabase
      .from('goals')
      .select('daily_goal, weekly_goal, monthly_goal')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setDailyGoal(data.daily_goal);
      setWeeklyGoal(data.weekly_goal || data.daily_goal * 7);
      setMonthlyGoal(data.monthly_goal || data.daily_goal * 28);
      saveToLocalStorage({ 
        daily: data.daily_goal, 
        weekly: data.weekly_goal || data.daily_goal * 7, 
        monthly: data.monthly_goal || data.daily_goal * 28 
      });
    }
  }, [user]);

  const updateGoal = async (amount: number) => {
    if (!user) return { error: { message: 'Usuário não logado' } };

    const { error } = await supabase
      .from('goals')
      .upsert({ user_id: user.id, daily_goal: amount, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (!error) {
      setDailyGoal(amount);
      // Auto-adjust weekly/monthly
      const newWeekly = amount * 7;
      const newMonthly = amount * 28;
      setWeeklyGoal(newWeekly);
      setMonthlyGoal(newMonthly);
      saveToLocalStorage({ daily: amount, weekly: newWeekly, monthly: newMonthly });
    }
    return { error };
  };

  const updateGoalDirect = async (field: 'daily' | 'weekly' | 'monthly', value: number) => {
    if (!user) return { error: { message: 'Usuário não logado' } };

    const newDaily = field === 'daily' ? value : dailyGoal;
    const newWeekly = field === 'weekly' ? value : weeklyGoal;
    const newMonthly = field === 'monthly' ? value : monthlyGoal;

    const { error } = await supabase
      .from('goals')
      .upsert({ 
        user_id: user.id, 
        daily_goal: newDaily, 
        weekly_goal: newWeekly, 
        monthly_goal: newMonthly, 
        updated_at: new Date().toISOString() 
      }, { onConflict: 'user_id' });

    if (!error) {
      setDailyGoal(newDaily);
      setWeeklyGoal(newWeekly);
      setMonthlyGoal(newMonthly);
      saveToLocalStorage({ daily: newDaily, weekly: newWeekly, monthly: newMonthly });
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
