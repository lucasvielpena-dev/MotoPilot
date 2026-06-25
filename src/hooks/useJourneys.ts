'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOdometer } from './useOdometer';

export type Journey = {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  distance_km: number;
  duration_minutes: number;
  status: 'active' | 'finished';
  created_at: string;
};

export function useJourneys() {
  const { user } = useAuth();
  const [activeJourney, setActiveJourney] = useState<Journey | null>(null);
  const [loading, setLoading] = useState(true);

  // Instancia o odômetro
  const odometer = useOdometer(activeJourney?.id || null);

  const fetchActiveJourney = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('journeys')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setActiveJourney(data as Journey);
      // Popula a quilometragem atual para não perder o valor salvo
      odometer.setInitialDistance(Number(data.distance_km) || 0);
    } else {
      setActiveJourney(null);
    }
    setLoading(false);
  }, [user, odometer]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchActiveJourney();
  }, [fetchActiveJourney]);

  const startJourney = async () => {
    if (!user) return { error: { message: 'Usuário não logado' } };
    
    const { data, error } = await supabase
      .from('journeys')
      .insert([
        { user_id: user.id, status: 'active', distance_km: 0 }
      ])
      .select()
      .single();

    if (error) return { error };
    setActiveJourney(data as Journey);
    odometer.setInitialDistance(0);
    return { data };
  };

  const finishJourney = async () => {
    if (!activeJourney || !user) return { error: { message: 'Sem jornada ativa' } };
    
    const start = new Date(activeJourney.started_at).getTime();
    const now = new Date().getTime();
    const durationMinutes = Math.floor((now - start) / 60000);
    
    const { data, error } = await supabase
      .from('journeys')
      .update({ 
        ended_at: new Date().toISOString(),
        distance_km: odometer.distanceKm,
        duration_minutes: durationMinutes,
        status: 'finished'
      })
      .eq('id', activeJourney.id)
      .select()
      .single();

    if (error) return { error };
    setActiveJourney(null);
    return { data };
  };

  const [historicalJourneys, setHistoricalJourneys] = useState<Journey[]>([]);

  const fetchHistoricalJourneys = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('journeys')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'finished')
      .order('started_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setHistoricalJourneys(data as Journey[]);
    }
  }, [user]);

  return {
    activeJourney,
    historicalJourneys,
    loading,
    startJourney,
    finishJourney,
    fetchActiveJourney,
    fetchHistoricalJourneys,
    liveDistance: odometer.distanceKm,
    isTracking: odometer.isTracking,
    gpsAccuracy: odometer.gpsAccuracy,
    gpsStatus: odometer.gpsStatus,
    speed: odometer.speed,
    trackerError: odometer.error
  };
}
