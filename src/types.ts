export enum TipoLancamento {
  GANHO = 'ganho',
  GASTO = 'gasto',
}

export enum Plataforma {
  IFOOD = 'iFood',
  AIQFOME = 'aiqfome',
  OUTRO_APP = 'Outro app',
  PARTICULAR = 'Particular',
}

export enum CategoriaGasto {
  COMBUSTIVEL = 'Combustível',
  MANUTENCAO = 'Manutenção',
  ALIMENTACAO = 'Alimentação',
  OUTROS = 'Outros',
}

export enum FiltroPeriodo {
  HOJE = 'hoje',
  SETE_DIAS = '7dias',
  MES = 'mes',
}

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  categoria: Plataforma | CategoriaGasto;
  valor: number;
  data: string; // ISO string
  observacao?: string;
}

export interface Trajeto {
  id: string;
  data: string; // ISO string
  km: number;
  origem: 'gps' | 'manual';
  duracaoSegundos?: number;
}

export type StatusOdometro = 'idle' | 'running' | 'paused';

export const PLATAFORMAS: Plataforma[] = [
  Plataforma.IFOOD,
  Plataforma.AIQFOME,
  Plataforma.OUTRO_APP,
  Plataforma.PARTICULAR,
];

export const CATEGORIAS_GASTO: CategoriaGasto[] = [
  CategoriaGasto.COMBUSTIVEL,
  CategoriaGasto.MANUTENCAO,
  CategoriaGasto.ALIMENTACAO,
  CategoriaGasto.OUTROS,
];
