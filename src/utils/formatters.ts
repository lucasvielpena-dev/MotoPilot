import { FiltroPeriodo } from '../types';

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatarMoeda(valor: number): string {
  const safe = Number.isFinite(valor) ? valor : 0;
  return brlFormatter.format(safe);
}

export function formatarKm(km: number): string {
  const safe = Number.isFinite(km) ? Math.max(0, km) : 0;
  const arredondado = Math.round(safe * 100) / 100;
  if (arredondado === 0) {
    return '0';
  }
  if (Number.isInteger(arredondado)) {
    return arredondado.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return arredondado.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
}

export function rotuloCategoria(categoria: string): string {
  if (categoria === 'Outro app') return 'Outro aplicativo';
  if (categoria === 'Particular') return 'Corrida particular';
  return categoria;
}

export function formatarDataHora(isoData: string): string {
  const date = new Date(isoData);
  if (Number.isNaN(date.getTime())) {
    return '--/-- · --:--';
  }
  const formatted = dateTimeFormatter.format(date);
  return formatted.replace(', ', ' · ');
}

/**
 * Converte texto digitado no padrão brasileiro (ex: "1.234,56", "45,5" ou "45.5") em número.
 */
export function parseValorNumerico(entrada: string): number {
  const limpo = entrada.trim().replace(/\s+/g, '').replace(/^R\$\s*/i, '');
  if (!limpo) return NaN;

  let normalizado = limpo;
  if (limpo.includes(',') && limpo.includes('.')) {
    normalizado = limpo.replace(/\./g, '').replace(',', '.');
  } else if (limpo.includes(',')) {
    normalizado = limpo.replace(',', '.');
  }

  const numero = Number(normalizado);
  if (!Number.isFinite(numero) || numero <= 0) {
    return NaN;
  }
  return numero;
}

export function filtrarPorPeriodo<T extends { data: string }>(
  itens: T[],
  periodo: FiltroPeriodo,
  agora: Date = new Date()
): T[] {
  const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);
  const fimHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999);

  return itens.filter((item) => {
    const d = new Date(item.data);
    if (Number.isNaN(d.getTime())) return false;

    if (periodo === FiltroPeriodo.HOJE) {
      return d >= inicioHoje && d <= fimHoje;
    }

    if (periodo === FiltroPeriodo.SETE_DIAS) {
      const inicio7Dias = new Date(inicioHoje);
      inicio7Dias.setDate(inicio7Dias.getDate() - 6);
      return d >= inicio7Dias && d <= fimHoje;
    }

    // FiltroPeriodo.MES -> mês calendário atual
    return d.getFullYear() === agora.getFullYear() && d.getMonth() === agora.getMonth();
  });
}

export function rotuloPeriodo(periodo: FiltroPeriodo): string {
  switch (periodo) {
    case FiltroPeriodo.HOJE:
      return 'Hoje';
    case FiltroPeriodo.SETE_DIAS:
      return '7 dias';
    case FiltroPeriodo.MES:
      return 'Mês';
  }
}

export function formatarDuracao(segundos: number): string {
  const safe = Number.isFinite(segundos) && segundos > 0 ? Math.floor(segundos) : 0;
  const horas = Math.floor(safe / 3600);
  const minutos = Math.floor((safe % 3600) / 60);
  const segs = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(horas)}:${pad(minutos)}:${pad(segs)}`;
}
