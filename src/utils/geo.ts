export interface Coordenada {
  lat: number;
  lon: number;
}

function paraRadianos(graus: number): number {
  return (graus * Math.PI) / 180;
}

/**
 * Calcula a distância em quilômetros entre duas coordenadas usando a fórmula de Haversine.
 */
export function calcularDistanciaHaversineKm(a: Coordenada, b: Coordenada): number {
  const RAIO_TERRA_KM = 6371;
  const dLat = paraRadianos(b.lat - a.lat);
  const dLon = paraRadianos(b.lon - a.lon);

  const lat1 = paraRadianos(a.lat);
  const lat2 = paraRadianos(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const h =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * (sinLon * sinLon);
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return RAIO_TERRA_KM * c;
}
