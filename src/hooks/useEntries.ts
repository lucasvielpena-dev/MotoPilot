'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Entry = {
  id: string;
  user_id: string;
  journey_id: string | null;
  type: 'gain' | 'expense';
  amount: number;
  description: string | null;
  rides_count: number | null;
  km_total: number | null;
  date: string;
};

export function useEntries() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchRecentEntries = useCallback(async (limit = 500) => {
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
      setFetched(true);
    }
    setLoading(false);
  }, [user]);

  const addEntry = async (
    type: 'gain' | 'expense', 
    amount: number, 
    description: string, 
    journeyId?: string | null,
    ridesCount?: number | null,
    kmTotal?: number | null
  ) => {
    if (!user) return { error: { message: 'Usuário não logado' } };

    const insertData: any = {
      user_id: user.id,
      journey_id: journeyId ?? null,
      type,
      amount,
      description
    };

    if (ridesCount !== undefined && ridesCount !== null) {
      insertData.rides_count = ridesCount;
    }
    if (kmTotal !== undefined && kmTotal !== null) {
      insertData.km_total = kmTotal;
    }

    const { data, error } = await supabase
      .from('entries')
      .insert([insertData])
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
    fetched,
    fetchRecentEntries,
    addEntry,
    deleteEntry
  };
}
