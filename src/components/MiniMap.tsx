'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para os ícones padrão do leaflet no Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para atualizar o centro do mapa
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MiniMap({ className = "h-48" }: { isTracking: boolean; className?: string }) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      const geoId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.error("Map GPS Error:", err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(geoId);
    }
  }, []);

  if (!position) {
    return (
      <div className={`w-full bg-[var(--color-card-secondary)] rounded-2xl flex flex-col items-center justify-center border border-[var(--color-border)] animate-pulse ${className}`}>
        <span className="text-[var(--color-muted)] text-[14px]">Buscando localização...</span>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm relative z-0 ${className}`}>
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={false} 
        zoomControl={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ChangeView center={position} zoom={16} />
        <Marker position={position}>
          <Popup>Você está aqui.</Popup>
        </Marker>
      </MapContainer>
      
      {/* Overlay para evitar scroll acidental no mobile */}
      <div className="absolute inset-0 z-[400] pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"></div>
    </div>
  );
}
