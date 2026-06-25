'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export interface MaintenanceItem {
  id: string;
  name: string;
  intervalKm: number;
  lastServiceKm: number;
}

const DEFAULT_ITEMS: MaintenanceItem[] = [
  { id: 'oleo', name: 'Troca de Óleo', intervalKm: 3000, lastServiceKm: 0 },
  { id: 'relacao', name: 'Relação (Corrente/Coroa/Pinhão)', intervalKm: 15000, lastServiceKm: 0 },
  { id: 'pneus', name: 'Pneus (Dianteiro/Traseiro)', intervalKm: 20000, lastServiceKm: 0 },
  { id: 'pastilhas', name: 'Pastilhas de Freio', intervalKm: 10000, lastServiceKm: 0 }
];

export function useMaintenance(totalKm: number) {
  const [currentOdometer, setCurrentOdometer] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const savedOdo = localStorage.getItem('motopilot_odometer_manual');
      return savedOdo ? parseFloat(savedOdo) : 0;
    } catch {
      return 0;
    }
  });

  const [items, setItems] = useState<MaintenanceItem[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_ITEMS;
    try {
      const savedItems = localStorage.getItem('motopilot_maintenance_items');
      return savedItems ? JSON.parse(savedItems) : DEFAULT_ITEMS;
    } catch {
      return DEFAULT_ITEMS;
    }
  });

  // Sincroniza odometer do Supabase com local se manual não estiver presente
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedOdo = localStorage.getItem('motopilot_odometer_manual');
      if (!savedOdo && totalKm > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentOdometer(totalKm);
      }
    } catch {}
  }, [totalKm]);

  const saveItems = useCallback((newItems: MaintenanceItem[]) => {
    setItems(newItems);
    localStorage.setItem('motopilot_maintenance_items', JSON.stringify(newItems));
  }, []);

  const saveOdometer = useCallback((km: number) => {
    setCurrentOdometer(km);
    localStorage.setItem('motopilot_odometer_manual', String(km));
  }, []);

  const addItem = useCallback((name: string, intervalKm: number, lastServiceKm: number) => {
    const newItem: MaintenanceItem = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      intervalKm,
      lastServiceKm
    };
    const updated = [...items, newItem];
    saveItems(updated);
  }, [items, saveItems]);

  const removeItem = useCallback((id: string) => {
    const updated = items.filter(item => item.id !== id);
    saveItems(updated);
  }, [items, saveItems]);

  const resetItem = useCallback((id: string, customKm?: number) => {
    const serviceKm = customKm !== undefined ? customKm : (currentOdometer || totalKm);
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, lastServiceKm: serviceKm };
      }
      return item;
    });
    saveItems(updated);
  }, [items, currentOdometer, totalKm, saveItems]);

  // Calcula quilometragem restante e urgência
  const itemsWithStatus = useMemo(() => {
    const odometer = currentOdometer > 0 ? currentOdometer : totalKm;
    return items.map(item => {
      const nextServiceKm = item.lastServiceKm + item.intervalKm;
      const kmRemaining = Math.max(0, nextServiceKm - odometer);
      const progress = Math.max(0, Math.min(100, (kmRemaining / item.intervalKm) * 100));

      let urgency: 'ok' | 'warning' | 'urgent' = 'ok';
      if (kmRemaining <= 200) {
        urgency = 'urgent';
      } else if (kmRemaining <= 600) {
        urgency = 'warning';
      }

      return {
        ...item,
        kmRemaining,
        progress,
        urgency,
        nextServiceKm
      };
    });
  }, [items, currentOdometer, totalKm]);

  return {
    currentOdometer: currentOdometer > 0 ? currentOdometer : totalKm,
    maintenanceItems: itemsWithStatus,
    addItem,
    removeItem,
    resetItem,
    saveOdometer
  };
}
