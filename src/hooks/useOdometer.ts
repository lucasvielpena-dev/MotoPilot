'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { calculateDistance } from '@/lib/location/haversine';
import { Capacitor, registerPlugin } from '@capacitor/core';

type BackgroundLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number | null;
  time?: number;
};

type BackgroundGeolocationPlugin = {
  addWatcher: (
    options: {
      backgroundMessage?: string;
      backgroundTitle?: string;
      requestPermissions?: boolean;
      stale?: boolean;
      distanceFilter?: number;
    },
    callback: (
      location?: BackgroundLocation,
      error?: { code?: string; message?: string }
    ) => void
  ) => Promise<string>;

  removeWatcher: (options: { id: string }) => Promise<void>;
};

const BackgroundGeolocation =
  registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');


type GpsStatus = 'inactive' | 'acquiring' | 'active';

const STORAGE_KEY = 'motopilot_distance';
const STORAGE_LOC_KEY = 'motopilot_last_location';
const STORAGE_LAST_TIME_KEY = 'motopilot_last_update_time';

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

function saveLastUpdateTime() {
  try { localStorage.setItem(STORAGE_LAST_TIME_KEY, String(Date.now())); } catch {}
}

function loadLastUpdateTime(): number {
  try {
    const val = localStorage.getItem(STORAGE_LAST_TIME_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch { return 0; }
}

function clearOdometerStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_LOC_KEY);
    localStorage.removeItem(STORAGE_LAST_TIME_KEY);
  } catch {}
}

export function useOdometer(journeyId: string | null) {
  const [distanceKm, setDistanceKm] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('inactive');
  const [error, setError] = useState<string | null>(null);

  const lastLocationRef = useRef<{ lat: number; lon: number } | null>(null);
  const watchIdRef = useRef<number | string | null>(null);
  const backgroundWatchIdRef = useRef<string | null>(null);
  const distanceRef = useRef(0);
  const lastSaveTimeRef = useRef<number>(0);
  const journeyIdRef = useRef<string | null>(null);
  // Tracks whether we're resuming from background so we skip the first
  // distance delta (which would be a giant "teleport" jump).
  const justResumedRef = useRef(false);

  // Sincroniza o journeyId ref
  useEffect(() => {
    journeyIdRef.current = journeyId;
  }, [journeyId]);

  const saveLocationToDb = useCallback(async (lat: number, lon: number) => {
    const jId = journeyIdRef.current;
    if (!jId) return;

    supabase.from('journey_locations').insert([
      { journey_id: jId, latitude: lat, longitude: lon }
    ]).then(
      () => {},
      (err) => console.error('Failed to save location:', err)
    );

    supabase.from('journeys')
      .update({ distance_km: distanceRef.current })
      .eq('id', jId)
      .then(
        () => {},
        (err) => console.error('Failed to update journey distance:', err)
      );
  }, []);

  const persistDistance = useCallback(() => {
    saveDistance(distanceRef.current);
  }, []);

  const handleLocation = useCallback((latitude: number, longitude: number, accuracy: number | null) => {
    setGpsAccuracy(accuracy !== null ? Math.round(accuracy) : null);
    setGpsStatus('active');

    if (accuracy !== null && accuracy > 100) return;

    // If we just resumed from background, update the reference point
    // without adding distance — the gap was too long to measure accurately.
    if (justResumedRef.current) {
      justResumedRef.current = false;
      lastLocationRef.current = { lat: latitude, lon: longitude };
      saveLastLocation(latitude, longitude);
      saveLastUpdateTime();
      return;
    }

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
    saveLastUpdateTime();

    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;
    const isFirstSave = lastSaveTimeRef.current === 0;

    // Salva no banco a cada 10s
    if (isFirstSave || timeSinceLastSave >= 10000) {
      lastSaveTimeRef.current = now;
      saveLocationToDb(latitude, longitude);
    }
  }, [persistDistance, saveLocationToDb]);

  const startNativeBackgroundTracking = useCallback(async () => {
    try {
      const watcherId = await BackgroundGeolocation.addWatcher(
        {
          backgroundTitle: 'MotoPilot rodando',
          backgroundMessage: 'Sua jornada está ativa e os km continuam sendo marcados.',
          requestPermissions: true,
          stale: false,
          distanceFilter: 5
        },
        (location, err) => {
          if (err) {
            console.error('Erro no GPS em segundo plano:', err);
            setGpsStatus('inactive');

            if (err.code === 'NOT_AUTHORIZED') {
              setError('Permissão de localização negada. Ative a localização nas configurações.');
            } else {
              setError(err.message || 'Não foi possível manter o GPS em segundo plano.');
            }

            return;
          }

          if (!location) return;

          handleLocation(
            location.latitude,
            location.longitude,
            location.accuracy ?? null
          );
        }
      );

      backgroundWatchIdRef.current = watcherId;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Failed to start native background tracking:', err);
      setError('Erro ao iniciar rastreamento nativo: ' + errorMsg);
      setGpsStatus('inactive');
      setIsTracking(false);
    }
  }, [handleLocation]);

  const startBrowserTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada neste dispositivo.');
      setGpsStatus('inactive');
      setIsTracking(false);
      return;
    }

    navigator.permissions?.query({ name: 'geolocation' as PermissionName }).then((permission) => {
      if (permission && permission.state === 'denied') {
        setError('Permissão de localização negada. Ative nas configurações.');
        setGpsStatus('inactive');
        setIsTracking(false);
        return;
      }
    }).catch(() => {});

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        handleLocation(latitude, longitude, accuracy);
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
  }, [handleLocation]);

  const startTracking = useCallback(async () => {
    if (!journeyId) return;

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

    if (Capacitor.isNativePlatform()) {
      await startNativeBackgroundTracking();
    } else {
      startBrowserTracking();
    }
  }, [journeyId, startNativeBackgroundTracking, startBrowserTracking]);

  const stopTracking = useCallback(() => {
    if (backgroundWatchIdRef.current !== null) {
      BackgroundGeolocation.removeWatcher({
        id: backgroundWatchIdRef.current
      }).catch(console.error);
      backgroundWatchIdRef.current = null;
    }

    if (watchIdRef.current !== null) {
      if (!Capacitor.isNativePlatform()) {
        navigator.geolocation.clearWatch(Number(watchIdRef.current));
      }
      watchIdRef.current = null;
    }
    setIsTracking(false);
    setGpsStatus('inactive');
    setGpsAccuracy(null);
  }, []);

  // Handle app lifecycle: background / foreground transitions
  // This is the key fix — when the app resumes from background, we reload
  // the persisted distance (which the native plugin callback may have updated)
  // and mark justResumed so the first GPS reading doesn't create a jump.
  useEffect(() => {
    const saveOnPause = () => {
      persistDistance();
      const jId = journeyIdRef.current;
      if (jId && distanceRef.current > 0) {
        // Use sendBeacon-style fire-and-forget for reliability
        supabase.from('journeys')
          .update({ distance_km: distanceRef.current })
          .eq('id', jId)
          .then(
            () => {},
            (err) => console.error('Failed to save on pause:', err)
          );
      }
    };

    const handleResume = () => {
      // When coming back from background, reload persisted distance
      // in case it drifted or the native callback wrote to localStorage
      const savedDist = loadSavedDistance();
      if (savedDist > distanceRef.current) {
        distanceRef.current = savedDist;
        setDistanceKm(savedDist);
      }

      // Check how long we were in the background
      const lastUpdate = loadLastUpdateTime();
      const elapsed = Date.now() - lastUpdate;

      // If more than 30 seconds passed since last location update,
      // assume we were in background and skip the next distance delta
      // to avoid a big "teleport" jump from stale -> current position.
      if (elapsed > 30000) {
        justResumedRef.current = true;
        lastLocationRef.current = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveOnPause();
      } else if (document.visibilityState === 'visible') {
        handleResume();
      }
    };

    // Also listen for Capacitor's native App events if available
    let appResumeCleanup: (() => void) | null = null;
    let appPauseCleanup: (() => void) | null = null;

    if (Capacitor.isNativePlatform()) {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('resume', () => {
          handleResume();
        }).then(handle => {
          appResumeCleanup = () => handle.remove();
        });

        App.addListener('pause', () => {
          saveOnPause();
        }).then(handle => {
          appPauseCleanup = () => handle.remove();
        });
      }).catch(() => {
        // @capacitor/app not available, visibilitychange is sufficient
      });
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', saveOnPause);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', saveOnPause);
      appResumeCleanup?.();
      appPauseCleanup?.();
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
