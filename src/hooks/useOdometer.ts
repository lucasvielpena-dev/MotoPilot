'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { calculateDistance } from '@/lib/location/haversine';

type GpsStatus = 'inactive' | 'acquiring' | 'active';

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

  const saveLocationToDb = useCallback(async (lat: number, lon: number) => {
    if (!journeyId) return;

    supabase.from('journey_locations').insert([
      { journey_id: journeyId, latitude: lat, longitude: lon }
    ]).then();

    supabase.from('journeys')
      .update({ distance_km: distanceRef.current })
      .eq('id', journeyId)
      .then();
  }, [journeyId]);

  const startTracking = useCallback(async () => {
    if (!journeyId) return;
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste dispositivo.');
      return;
    }

    // Solicitar permissão em dispositivos móveis (Android/Capacitor)
    try {
      const permission = await navigator.permissions?.query({ name: 'geolocation' });
      if (permission && permission.state === 'denied') {
        setError('Permissão de localização negada. Ative nas configurações do dispositivo.');
        setGpsStatus('inactive');
        return;
      }
    } catch {
      // permissions API pode não existir em todos os browsers — ignora
    }

    setIsTracking(true);
    setError(null);
    setGpsStatus('acquiring');
    lastLocationRef.current = null;
    lastSaveTimeRef.current = 0;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Atualiza indicador de precisão do GPS
        setGpsAccuracy(Math.round(accuracy));
        setGpsStatus('active');

        // Filtro de precisão: aceita até 100m (era 50m — muito restritivo no celular)
        if (accuracy > 100) return;

        let moved = false;
        if (lastLocationRef.current) {
          const dist = calculateDistance(
            lastLocationRef.current.lat,
            lastLocationRef.current.lon,
            latitude,
            longitude
          );

          // Ignora distâncias irracionais (>5km de uma vez) e micro-tremores (<5m)
          if (dist > 0.005 && dist < 5) {
            const novoKm = distanceRef.current + dist;
            distanceRef.current = novoKm;
            setDistanceKm(novoKm);
            moved = true;
          }
        } else {
          // Primeiro ponto capturado — marca como referência
          moved = true;
        }

        lastLocationRef.current = { lat: latitude, lon: longitude };

        const now = Date.now();
        const timeSinceLastSave = now - lastSaveTimeRef.current;
        const isFirstSave = lastSaveTimeRef.current === 0;

        // Salva no banco a cada 15s ou no primeiro ponto
        if (moved && (isFirstSave || timeSinceLastSave >= 15000)) {
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
  }, [journeyId, saveLocationToDb]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setGpsStatus('inactive');
    setGpsAccuracy(null);
  }, []);

  useEffect(() => {
    if (journeyId) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [journeyId, startTracking, stopTracking]);

  return {
    distanceKm,
    setInitialDistance: useCallback((km: number) => {
      distanceRef.current = km;
      setDistanceKm(km);
    }, []),
    isTracking,
    gpsAccuracy,
    gpsStatus,
    error
  };
}
