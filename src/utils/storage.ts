import {
  CategoriaGasto,
  Lancamento,
  Plataforma,
  TipoLancamento,
  Trajeto,
} from '../types';

const KEY_LANCAMENTOS = 'rota_lancamentos_v1';
const KEY_TRAJETOS = 'rota_trajetos_v1';
const KEY_ODOMETRO_KM = 'rota_odometro_km_v1';
const KEY_ODOMETRO_SEGUNDOS = 'rota_odometro_segundos_v1';
const KEY_META_DIARIA = 'rota_meta_diaria_v1';
const KEY_ULTIMO_KM_PAINEL = 'rota_ultimo_km_painel_v1';
const KEY_CONFIG_OLEO = 'rota_config_oleo_v1';

export interface ConfigTrocaOleo {
  intervaloKm: number;
  kmBase: number;
  ultimaTrocaData?: string;
}

const TIPOS_VALIDOS = new Set<string>(Object.values(TipoLancamento));
const CATEGORIAS_VALIDAS = new Set<string>([
  ...Object.values(Plataforma),
  ...Object.values(CategoriaGasto),
]);

function sanitizarLancamentos(itens: unknown[]): Lancamento[] {
  return itens
    .filter(
      (item): item is Lancamento =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as Lancamento).id === 'string' &&
        TIPOS_VALIDOS.has(String((item as Lancamento).tipo)) &&
        CATEGORIAS_VALIDAS.has(String((item as Lancamento).categoria)) &&
        typeof (item as Lancamento).valor === 'number' &&
        Number.isFinite((item as Lancamento).valor) &&
        (item as Lancamento).valor > 0 &&
        typeof (item as Lancamento).data === 'string'
    )
    .map((item) => ({
      id: item.id,
      tipo: item.tipo,
      categoria: item.categoria,
      valor: Number(item.valor.toFixed(2)),
      data: item.data,
      observacao:
        typeof item.observacao === 'string' && item.observacao.trim()
          ? item.observacao.trim().slice(0, 80)
          : undefined,
    }));
}

function sanitizarTrajetos(itens: unknown[]): Trajeto[] {
  return itens
    .filter(
      (item): item is Trajeto =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as Trajeto).id === 'string' &&
        typeof (item as Trajeto).data === 'string' &&
        typeof (item as Trajeto).km === 'number' &&
        Number.isFinite((item as Trajeto).km) &&
        (item as Trajeto).km > 0 &&
        ((item as Trajeto).origem === 'gps' ||
          (item as Trajeto).origem === 'manual')
    )
    .map((item) => ({
      id: item.id,
      data: item.data,
      km: Number(item.km.toFixed(2)),
      origem: item.origem,
      duracaoSegundos:
        typeof item.duracaoSegundos === 'number' &&
        Number.isFinite(item.duracaoSegundos) &&
        item.duracaoSegundos > 0
          ? Math.floor(item.duracaoSegundos)
          : undefined,
    }));
}

export function carregarLancamentos(): Lancamento[] {
  try {
    const raw = localStorage.getItem(KEY_LANCAMENTOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sanitizarLancamentos(parsed) : [];
  } catch {
    return [];
  }
}

export function salvarLancamentos(lancamentos: Lancamento[]): void {
  try {
    localStorage.setItem(KEY_LANCAMENTOS, JSON.stringify(lancamentos));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function carregarTrajetos(): Trajeto[] {
  try {
    const raw = localStorage.getItem(KEY_TRAJETOS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sanitizarTrajetos(parsed) : [];
  } catch {
    return [];
  }
}

export function salvarTrajetos(trajetos: Trajeto[]): void {
  try {
    localStorage.setItem(KEY_TRAJETOS, JSON.stringify(trajetos));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function carregarKmEmAndamento(): number {
  try {
    const raw = localStorage.getItem(KEY_ODOMETRO_KM);
    if (!raw) return 0;
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  } catch {
    return 0;
  }
}

export function salvarKmEmAndamento(km: number): void {
  try {
    localStorage.setItem(KEY_ODOMETRO_KM, String(km));
  } catch {
    // Ignore storage errors
  }
}

export function carregarTempoOdometroSegundos(): number {
  try {
    const raw = localStorage.getItem(KEY_ODOMETRO_SEGUNDOS);
    if (!raw) return 0;
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;
  } catch {
    return 0;
  }
}

export function salvarTempoOdometroSegundos(segundos: number): void {
  try {
    localStorage.setItem(
      KEY_ODOMETRO_SEGUNDOS,
      String(Math.max(0, Math.floor(segundos)))
    );
  } catch {
    // Ignore storage errors
  }
}

export function carregarMetaDiaria(): number {
  try {
    const raw = localStorage.getItem(KEY_META_DIARIA);
    if (!raw) return 0;
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  } catch {
    return 0;
  }
}

export function salvarMetaDiaria(meta: number): void {
  try {
    localStorage.setItem(KEY_META_DIARIA, String(meta));
  } catch {
    // Ignore storage errors
  }
}

export function carregarUltimoKmPainel(): number {
  try {
    const raw = localStorage.getItem(KEY_ULTIMO_KM_PAINEL);
    if (!raw) return 0;
    const num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  } catch {
    return 0;
  }
}

export function salvarUltimoKmPainel(km: number): void {
  try {
    if (Number.isFinite(km) && km >= 0) {
      localStorage.setItem(KEY_ULTIMO_KM_PAINEL, String(km));
    }
  } catch {
    // Ignore storage errors
  }
}

export function carregarConfigOleo(): ConfigTrocaOleo {
  try {
    const raw = localStorage.getItem(KEY_CONFIG_OLEO);
    if (!raw) return { intervaloKm: 1000, kmBase: 0 };
    const parsed = JSON.parse(raw) as Partial<ConfigTrocaOleo>;
    const intervaloKm =
      typeof parsed?.intervaloKm === 'number' &&
      Number.isFinite(parsed.intervaloKm) &&
      parsed.intervaloKm >= 100
        ? Math.round(parsed.intervaloKm)
        : 1000;
    const kmBase =
      typeof parsed?.kmBase === 'number' &&
      Number.isFinite(parsed.kmBase) &&
      parsed.kmBase >= 0
        ? Number(parsed.kmBase.toFixed(2))
        : 0;
    const ultimaTrocaData =
      typeof parsed?.ultimaTrocaData === 'string'
        ? parsed.ultimaTrocaData
        : undefined;
    return { intervaloKm, kmBase, ultimaTrocaData };
  } catch {
    return { intervaloKm: 1000, kmBase: 0 };
  }
}

export function salvarConfigOleo(config: ConfigTrocaOleo): void {
  try {
    localStorage.setItem(KEY_CONFIG_OLEO, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}

export function gerarId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface BackupRota {
  versao: 1;
  exportadoEm: string;
  metaDiaria: number;
  configOleo?: ConfigTrocaOleo;
  lancamentos: Lancamento[];
  trajetos: Trajeto[];
}

export function gerarConteudoCsv(
  lancamentos: Lancamento[],
  trajetos: Trajeto[]
): string {
  const escapar = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const linhas: string[] = [
    'Registro;Data/Hora;Tipo;Categoria/Origem;Valor (R$);Distância (km);Observação',
  ];

  for (const item of lancamentos) {
    const dataFormatada = new Date(item.data).toLocaleString('pt-BR');
    linhas.push(
      [
        'Lançamento',
        escapar(dataFormatada),
        item.tipo === TipoLancamento.GANHO ? 'Ganho' : 'Gasto',
        escapar(item.categoria),
        item.valor.toFixed(2).replace('.', ','),
        '',
        escapar(item.observacao ?? ''),
      ].join(';')
    );
  }

  for (const trajeto of trajetos) {
    const dataFormatada = new Date(trajeto.data).toLocaleString('pt-BR');
    linhas.push(
      [
        'Trajeto',
        escapar(dataFormatada),
        'Quilometragem',
        trajeto.origem === 'gps' ? 'GPS automático' : 'Manual',
        '',
        trajeto.km.toFixed(2).replace('.', ','),
        trajeto.duracaoSegundos
          ? escapar(`Duração: ${Math.floor(trajeto.duracaoSegundos / 60)} min`)
          : '',
      ].join(';')
    );
  }

  return '\uFEFF' + linhas.join('\n');
}

export function validarEConverterBackupJson(texto: string): BackupRota | null {
  try {
    const parsed = JSON.parse(texto) as Partial<BackupRota>;
    if (
      !parsed ||
      !Array.isArray(parsed.lancamentos) ||
      !Array.isArray(parsed.trajetos)
    ) {
      return null;
    }

    const lancamentosValidos = sanitizarLancamentos(parsed.lancamentos);
    const trajetosValidos = sanitizarTrajetos(parsed.trajetos);

    const metaDiaria =
      typeof parsed.metaDiaria === 'number' &&
      Number.isFinite(parsed.metaDiaria) &&
      parsed.metaDiaria >= 0
        ? Number(parsed.metaDiaria.toFixed(2))
        : 0;

    let configOleo: ConfigTrocaOleo | undefined;
    if (parsed.configOleo && typeof parsed.configOleo === 'object') {
      const interval = parsed.configOleo.intervaloKm;
      const base = parsed.configOleo.kmBase;
      if (
        typeof interval === 'number' &&
        Number.isFinite(interval) &&
        interval >= 100 &&
        typeof base === 'number' &&
        Number.isFinite(base) &&
        base >= 0
      ) {
        configOleo = {
          intervaloKm: Math.round(interval),
          kmBase: Number(base.toFixed(2)),
          ultimaTrocaData:
            typeof parsed.configOleo.ultimaTrocaData === 'string'
              ? parsed.configOleo.ultimaTrocaData
              : undefined,
        };
      }
    }

    return {
      versao: 1,
      exportadoEm:
        typeof parsed.exportadoEm === 'string'
          ? parsed.exportadoEm
          : new Date().toISOString(),
      metaDiaria,
      configOleo,
      lancamentos: lancamentosValidos,
      trajetos: trajetosValidos,
    };
  } catch {
    return null;
  }
}
