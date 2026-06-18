'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useJourneys } from '@/hooks/useJourneys';

export type Entry = {
  id: string;
  user_id: string;
  journey_id: string | null;
  type: 'gain' | 'expense';
  amount: number;
  description: string | null;
  date: string;
};

export function useEntries() {
  const { user } = useAuth();
  const { activeJourney } = useJourneys();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecentEntries = useCallback(async (limit = 10) => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(limit);

    if (!error && data) {
      setEntries(data);
    }
    setLoading(false);
  }, [user]);

  const addEntry = async (type: 'gain' | 'expense', amount: number, description: string) => {
    if (!user) return { error: { message: 'Usuário não logado' } };

    const { data, error } = await supabase
      .from('entries')
      .insert([
        {
          user_id: user.id,
          journey_id: activeJourney?.id || null,
          type,
          amount,
          description
        }
      ])
      .select()
      .single();

    if (!error && data) {
      setEntries(prev => [data, ...prev]);
    }

    return { data, error };
  };

  const deleteEntry = async (id: string) => {
    if (!user) return { error: { message: 'Usuário não logado' } };

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }

    return { error };
  };

  return {
    entries,
    loading,
    fetchRecentEntries,
    addEntry,
    deleteEntry
  };
}
