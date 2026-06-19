'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { calculateDistance } from '@/lib/location/haversine';

type GpsStatus = 'inactive' | 'acquiring' | 'active';

const STORAGE_KEY = 'motopilot_distance';
const STORAGE_LOC_KEY = 'motopilot_last_location';

function loadSavedDistance(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? parseFloat(val) : 0;
  } catch { return 0; }
}

function saveDistance(km: number) {
  try { localStorage.setItem(STORAGE_KEY, String(km)); } catch {}
}

function loadLastLocation(): { lat: number; lon: number } | null {
  try {
    const val = localStorage.getItem(STORAGE_LOC_KEY);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

function saveLastLocation(lat: number, lon: number) {
  try { localStorage.setItem(STORAGE_LOC_KEY, JSON.stringify({ lat, lon })); } catch {}
}

function clearOdometerStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_LOC_KEY);
  } catch {}
}

export function useOdometer(journeyId: string | null) {
  const [distanceKm, setDistanceKm] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('inactive');
  const [error, setError] = useState<string | null>(null);

  const lastLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const distanceRef = useRef(0);
  const lastSaveTimeRef = useRef<number>(0);
  const journeyIdRef = useRef<string | null>(null);

  // Sincroniza o journeyId ref
  useEffect(() => {
    journeyIdRef.current = journeyId;
  }, [journeyId]);

  const saveLocationToDb = useCallback(async (lat: number, lon: number) => {
    const jId = journeyIdRef.current;
    if (!jId) return;

    supabase.from('journey_locations').insert([
      { journey_id: jId, latitude: lat, longitude: lon }
    ]).then();

    supabase.from('journeys')
      .update({ distance_km: distanceRef.current })
      .eq('id', jId)
      .then();
  }, []);

  const persistDistance = useCallback(() => {
    saveDistance(distanceRef.current);
  }, []);

  const startTracking = useCallback(async () => {
    if (!journeyId) return;
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste dispositivo.');
      return;
    }

    try {
      const permission = await navigator.permissions?.query({ name: 'geolocation' });
      if (permission && permission.state === 'denied') {
        setError('Permissão de localização negada. Ative nas configurações do dispositivo.');
        setGpsStatus('inactive');
        return;
      }
    } catch {}

    setIsTracking(true);
    setError(null);
    setGpsStatus('acquiring');

    // Restaurar última localização salva para continuidade
    const savedLoc = loadLastLocation();
    if (savedLoc) {
      lastLocationRef.current = savedLoc;
    } else {
      lastLocationRef.current = null;
    }

    lastSaveTimeRef.current = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        setGpsAccuracy(Math.round(accuracy));
        setGpsStatus('active');

        if (accuracy > 100) return;

        if (lastLocationRef.current) {
          const dist = calculateDistance(
            lastLocationRef.current.lat,
            lastLocationRef.current.lon,
            latitude,
            longitude
          );

          if (dist > 0.005 && dist < 5) {
            distanceRef.current += dist;
            setDistanceKm(distanceRef.current);
            persistDistance();
          }
        }

        lastLocationRef.current = { lat: latitude, lon: longitude };
        saveLastLocation(latitude, longitude);

        const now = Date.now();
        const timeSinceLastSave = now - lastSaveTimeRef.current;
        const isFirstSave = lastSaveTimeRef.current === 0;

        // Salva no banco a cada 10s
        if (isFirstSave || timeSinceLastSave >= 10000) {
          lastSaveTimeRef.current = now;
          saveLocationToDb(latitude, longitude);
        }
      },
      (err) => {
        console.error('GPS Error:', err);
        setGpsStatus('inactive');
        if (err.code === 1) {
          setError('Permissão de localização negada. Ative nas configurações.');
        } else if (err.code === 2) {
          setError('Sinal de GPS indisponível. Tente ao ar livre.');
        } else if (err.code === 3) {
          setError('Timeout ao obter localização. Verifique o GPS.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );
  }, [journeyId, saveLocationToDb, persistDistance]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setGpsStatus('inactive');
    setGpsAccuracy(null);
  }, []);

  // Salva a distância no Supabase quando a app vai ser suspensa
  useEffect(() => {
    const saveOnPause = () => {
      persistDistance();
      const jId = journeyIdRef.current;
      if (jId && distanceRef.current > 0) {
        supabase.from('journeys')
          .update({ distance_km: distanceRef.current })
          .eq('id', jId)
          .then();
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveOnPause();
    });
    window.addEventListener('beforeunload', saveOnPause);

    return () => {
      document.removeEventListener('visibilitychange', saveOnPause);
      window.removeEventListener('beforeunload', saveOnPause);
    };
  }, [persistDistance]);

  useEffect(() => {
    if (journeyId) {
      // Restaurar distância do localStorage antes de buscar do Supabase
      const saved = loadSavedDistance();
      if (saved > 0) {
        distanceRef.current = saved;
        setDistanceKm(saved);
      }
      startTracking();
    } else {
      stopTracking();
      clearOdometerStorage();
    }

    return () => {
      stopTracking();
    };
  }, [journeyId, startTracking, stopTracking]);

  return {
    distanceKm,
    setInitialDistance: useCallback((km: number) => {
      // Só atualiza se o valor do Supabase for maior que o local
      // (protege contra reset ao re-montar)
      const saved = loadSavedDistance();
      const best = Math.max(km, saved);
      distanceRef.current = best;
      setDistanceKm(best);
      saveDistance(best);
    }, []),
    isTracking,
    gpsAccuracy,
    gpsStatus,
    error
  };
}
