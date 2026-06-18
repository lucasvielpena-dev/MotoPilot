'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useGoals() {
  const { user } = useAuth();
  const [dailyGoal, setDailyGoal] = useState<number>(250);

  const fetchGoal = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('goals')
      .select('daily_goal')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setDailyGoal(data.daily_goal);
    }
  }, [user]);

  const updateGoal = async (amount: number) => {
    if (!user) return { error: { message: 'Usuário não logado' } };

    const { error } = await supabase
      .from('goals')
      .upsert({ user_id: user.id, daily_goal: amount, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (!error) {
      setDailyGoal(amount);
    }
    return { error };
  };

  return {
    dailyGoal,
    fetchGoal,
    updateGoal
  };
}
