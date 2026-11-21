import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Navigation,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
} from 'lucide-react';
import { StatusOdometro } from '../types';
import {
  formatarDuracao,
  formatarKm,
  parseValorNumerico,
} from '../utils/formatters';
import { calcularDistanciaHaversineKm, Coordenada } from '../utils/geo';
import {
  carregarKmEmAndamento,
  carregarTempoOdometroSegundos,
  carregarUltimoKmPainel,
  salvarKmEmAndamento,
  salvarTempoOdometroSegundos,
  salvarUltimoKmPainel,
} from '../utils/storage';

interface OdometroProps {
  onSalvarTrajeto: (
    km: number,
    origem: 'gps' | 'manual',
    duracaoSegundos?: number
  ) => void;
}

export type CodigoErroGeolocalizacao =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNSUPPORTED'
  | 'INSECURE_CONTEXT'
  | 'UNKNOWN';

interface ErroGeolocalizacaoState {
  codigo: CodigoErroGeolocalizacao;
  mensagem: string;
  sugestao: string;
  mensagemOriginal?: string;
  ocorreuEm: string;
  bloqueadoPorIframe?: boolean;
  podeTentarNovamente?: boolean;
}

const PRECISAO_MAXIMA_METROS = 40;
const DESLOCAMENTO_MINIMO_METROS = 5;
const SALTO_MAXIMO_KM = 2;

function registrarLogErroGps(registro: ErroGeolocalizacaoState, codeNum?: number) {
  console.error('[Rota · Monitoramento GPS] Falha na geolocalização:', {
    codigo: registro.codigo,
    codeNumber: codeNum ?? null,
    mensagemTraduzida: registro.mensagem,
    sugestao: registro.sugestao,
    mensagemOriginal: registro.mensagemOriginal ?? null,
    horario: registro.ocorreuEm,
    emIframe: typeof window !== 'undefined' && window.self !== window.top,
    contextoSeguro: typeof window !== 'undefined' && window.isSecureContext,
  });
}

function traduzirErroGeolocalizacao(
  erro: GeolocationPositionError
): ErroGeolocalizacaoState {
  const ocorreuEm = new Date().toISOString();
  const emIframe = typeof window !== 'undefined' && window.self !== window.top;
  const msgOriginal = erro.message || '';
  const msgLower = msgOriginal.toLowerCase();
  const bloqueioPolitica =
    msgLower.includes('permissions policy') ||
    msgLower.includes('feature policy') ||
    msgLower.includes('disabled in this document');

  if (erro.code === erro.PERMISSION_DENIED) {
    if (bloqueioPolitica || emIframe) {
      return {
        codigo: 'PERMISSION_DENIED',
        mensagem:
          'Acesso ao GPS bloqueado nesta janela de visualização (permissão negada).',
        sugestao:
          'Abra o aplicativo em uma nova aba e verifique se o serviço de localização do celular está ativo.',
        mensagemOriginal: msgOriginal,
        ocorreuEm,
        bloqueadoPorIframe: true,
        podeTentarNovamente: true,
      };
    }

    return {
      codigo: 'PERMISSION_DENIED',
      mensagem: 'Permissão de acesso à localização foi negada.',
      sugestao:
        'Verifique se o serviço de localização do celular está ativo e libere a permissão de GPS nas configurações do navegador.',
      mensagemOriginal: msgOriginal,
      ocorreuEm,
      podeTentarNovamente: true,
    };
  }

  if (erro.code === erro.POSITION_UNAVAILABLE) {
    return {
      codigo: 'POSITION_UNAVAILABLE',
      mensagem: 'Posição GPS indisponível no momento.',
      sugestao:
        'Verifique se o serviço de localização (GPS) do celular está ativo e tente em um local com melhor recepção.',
      mensagemOriginal: msgOriginal,
      ocorreuEm,
      podeTentarNovamente: true,
    };
  }

  if (erro.code === erro.TIMEOUT) {
    return {
      codigo: 'TIMEOUT',
      mensagem: 'Tempo esgotado ao aguardar resposta do GPS.',
      sugestao:
        'Verifique se o serviço de localização do celular está ativo, aguarde em área aberta ou tente novamente.',
      mensagemOriginal: msgOriginal,
      ocorreuEm,
      podeTentarNovamente: true,
    };
  }

  return {
    codigo: 'UNKNOWN',
    mensagem: 'Não foi possível obter a localização pelo GPS.',
    sugestao:
      'Verifique se o serviço de localização do celular está ativo ou adicione os km manualmente.',
    mensagemOriginal: msgOriginal,
    ocorreuEm,
    podeTentarNovamente: true,
  };
}

export const Odometro: React.FC<OdometroProps> = ({ onSalvarTrajeto }) => {
  const [kmAtual, setKmAtual] = useState<number>(() => carregarKmEmAndamento());
  const [tempoSegundos, setTempoSegundos] = useState<number>(() =>
    carregarTempoOdometroSegundos()
  );
  const [status, setStatus] = useState<StatusOdometro>(() => 'running');
  const [precisaoMetros, setPrecisaoMetros] = useState<number | null>(null);
  const [velocidadeKmh, setVelocidadeKmh] = useState<number | null>(null);
  const [aguardandoSinal, setAguardandoSinal] = useState<boolean>(false);
  const [wakeLockAtivo, setWakeLockAtivo] = useState<boolean>(false);
  const [erroGps, setErroGps] = useState<ErroGeolocalizacaoState | null>(null);

  const [manualAberto, setManualAberto] = useState<boolean>(false);
  const [modoManual, setModoManual] = useState<'distancia' | 'painel'>('distancia');
  const [kmManualTexto, setKmManualTexto] = useState<string>('');
  const [kmInicialTexto, setKmInicialTexto] = useState<string>(() => {
    const ultimo = carregarUltimoKmPainel();
    return ultimo > 0 ? ultimo.toFixed(1).replace('.', ',') : '';
  });
  const [kmFinalTexto, setKmFinalTexto] = useState<string>('');
  const [erroManual, setErroManual] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const ultimoPontoRef = useRef<Coordenada | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const statusRef = useRef<StatusOdometro>(status);
  const kmAtualRef = useRef<number>(kmAtual);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    kmAtualRef.current = kmAtual;
    salvarKmEmAndamento(kmAtual);
  }, [kmAtual]);

  useEffect(() => {
    salvarTempoOdometroSegundos(tempoSegundos);
  }, [tempoSegundos]);

  useEffect(() => {
    if (status !== 'running') return;
    const timer = window.setInterval(() => {
      setTempoSegundos((anterior) => anterior + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  const mostrarFeedback = (msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => {
      setFeedback((atual) => (atual === msg ? null : atual));
    }, 2500);
  };

  const liberarWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignora erro caso já liberado pelo navegador
      } finally {
        wakeLockRef.current = null;
        setWakeLockAtivo(false);
      }
    }
  }, []);

  const solicitarWakeLock = useCallback(async () => {
    if (
      typeof navigator === 'undefined' ||
      !('wakeLock' in navigator) ||
      document.visibilityState !== 'visible'
    ) {
      return;
    }
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      setWakeLockAtivo(true);
      sentinel.addEventListener('release', () => {
        wakeLockRef.current = null;
        setWakeLockAtivo(false);
      });
    } catch {
      setWakeLockAtivo(false);
    }
  }, []);

  const pararWatchGps = useCallback(() => {
    if (watchIdRef.current !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    ultimoPontoRef.current = null;
    setAguardandoSinal(false);
  }, []);

  const processarPosicaoGps = useCallback((posicao: GeolocationPosition) => {
    const { latitude, longitude, accuracy, speed } = posicao.coords;

    if (!Number.isFinite(accuracy)) return;
    setPrecisaoMetros(Math.round(accuracy));
    if (typeof speed === 'number' && Number.isFinite(speed) && speed >= 0) {
      setVelocidadeKmh(Math.round(speed * 3.6));
    }

    if (accuracy > PRECISAO_MAXIMA_METROS) {
      return;
    }

    setAguardandoSinal(false);
    setErroGps(null);
    const novoPonto: Coordenada = { lat: latitude, lon: longitude };

    if (!ultimoPontoRef.current) {
      ultimoPontoRef.current = novoPonto;
      return;
    }

    const distanciaKm = calcularDistanciaHaversineKm(
      ultimoPontoRef.current,
      novoPonto
    );
    const distanciaMetros = distanciaKm * 1000;

    if (distanciaMetros < DESLOCAMENTO_MINIMO_METROS) {
      return;
    }

    if (distanciaKm > SALTO_MAXIMO_KM) {
      return;
    }

    setKmAtual((anterior) => anterior + distanciaKm);
    ultimoPontoRef.current = novoPonto;
  }, []);

  const tratarErroWatchGps = useCallback(
    (erro: GeolocationPositionError) => {
      setAguardandoSinal(false);
      const registroErro = traduzirErroGeolocalizacao(erro);
      registrarLogErroGps(registroErro, erro.code);
      setErroGps(registroErro);

      if (registroErro.codigo === 'PERMISSION_DENIED') {
        pararWatchGps();
        void liberarWakeLock();
        setStatus(kmAtualRef.current > 0 ? 'paused' : 'idle');
      }
    },
    [liberarWakeLock, pararWatchGps]
  );

  const iniciarWatchGps = useCallback(() => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const registroErro: ErroGeolocalizacaoState = {
        codigo: 'INSECURE_CONTEXT',
        mensagem: 'O GPS exige conexão segura (HTTPS) para funcionar.',
        sugestao:
          'Acesse o aplicativo por HTTPS e verifique se o serviço de localização do celular está ativo.',
        ocorreuEm: new Date().toISOString(),
      };
      registrarLogErroGps(registroErro);
      setErroGps(registroErro);
      setStatus(kmAtualRef.current > 0 ? 'paused' : 'idle');
      return;
    }

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      const registroErro: ErroGeolocalizacaoState = {
        codigo: 'UNSUPPORTED',
        mensagem: 'GPS automático não é compatível com este navegador.',
        sugestao:
          'Use outro navegador atualizado ou adicione os quilômetros manualmente.',
        ocorreuEm: new Date().toISOString(),
      };
      registrarLogErroGps(registroErro);
      setErroGps(registroErro);
      setStatus(kmAtualRef.current > 0 ? 'paused' : 'idle');
      return;
    }

    pararWatchGps();
    setErroGps(null);
    setAguardandoSinal(true);
    setStatus('running');

    watchIdRef.current = navigator.geolocation.watchPosition(
      processarPosicaoGps,
      tratarErroWatchGps,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 15000,
      }
    );
  }, [pararWatchGps, processarPosicaoGps, tratarErroWatchGps]);

  useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;
    const handlePermChange = () => {
      if (permissionStatus?.state === 'granted') {
        setErroGps(null);
      }
    };

    if ('permissions' in navigator && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((res) => {
          permissionStatus = res;
          res.addEventListener('change', handlePermChange);
        })
        .catch(() => {
          // Alguns navegadores não suportam query('geolocation')
        });
    }

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        statusRef.current === 'running'
      ) {
        void solicitarWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      permissionStatus?.removeEventListener('change', handlePermChange);
      pararWatchGps();
      void liberarWakeLock();
    };
  }, [liberarWakeLock, pararWatchGps, solicitarWakeLock]);

  // Odômetro inicia rodando assim que o app abre — o dia em andamento
  // segue contando mesmo sem uma corrida separada agora
  useEffect(() => {
    iniciarWatchGps();
    void solicitarWakeLock();
  }, [iniciarWatchGps, solicitarWakeLock]);

  const handleIniciarOuContinuar = () => {
    iniciarWatchGps();
    void solicitarWakeLock();
  };

  const handlePausar = () => {
    pararWatchGps();
    void liberarWakeLock();
    setStatus('paused');
  };

  const handleSalvarTrajetoGps = () => {
    if (kmAtual <= 0) return;
    const kmParaSalvar = Number(kmAtual.toFixed(2));
    const estavaRodando = statusRef.current === 'running';
    pararWatchGps();
    void liberarWakeLock();
    onSalvarTrajeto(
      kmParaSalvar > 0 ? kmParaSalvar : kmAtual,
      'gps',
      tempoSegundos > 0 ? tempoSegundos : undefined
    );
    setKmAtual(0);
    setTempoSegundos(0);
    setPrecisaoMetros(null);
    setVelocidadeKmh(null);
    setErroGps(null);
    if (estavaRodando) {
      // o odômetro segue rodando depois de registrar o trajeto
      iniciarWatchGps();
      void solicitarWakeLock();
    }
    mostrarFeedback('Trajeto salvo!');
  };

  const handleZerar = () => {
    pararWatchGps();
    void liberarWakeLock();
    setKmAtual(0);
    setTempoSegundos(0);
    setPrecisaoMetros(null);
    setVelocidadeKmh(null);
    setErroGps(null);
    setStatus('idle');
  };

  const kmInicialLimpo = kmInicialTexto.trim().replace(',', '.');
  const kmInicialEhZero =
    kmInicialLimpo !== '' && Number(kmInicialLimpo) === 0;
  const kmInicialNum = kmInicialEhZero
    ? 0
    : parseValorNumerico(kmInicialTexto);
  const kmFinalNum = parseValorNumerico(kmFinalTexto);
  const distanciaPainelValida =
    !Number.isNaN(kmInicialNum) &&
    !Number.isNaN(kmFinalNum) &&
    kmFinalNum > kmInicialNum
      ? Number((kmFinalNum - kmInicialNum).toFixed(2))
      : null;

  const handleAdicionarManual = (e: React.FormEvent) => {
    e.preventDefault();
    setErroManual(null);

    if (modoManual === 'painel') {
      if (Number.isNaN(kmInicialNum) || kmInicialNum < 0) {
        setErroManual('Informe o km inicial do painel.');
        return;
      }
      if (Number.isNaN(kmFinalNum) || kmFinalNum <= kmInicialNum) {
        setErroManual('O km final deve ser maior que o km inicial.');
        return;
      }
      const distancia = Number((kmFinalNum - kmInicialNum).toFixed(2));
      onSalvarTrajeto(distancia, 'manual');
      salvarUltimoKmPainel(kmFinalNum);
      setKmInicialTexto(kmFinalNum.toFixed(1).replace('.', ','));
      setKmFinalTexto('');
      setManualAberto(false);
      mostrarFeedback(`${formatarKm(distancia)} km salvos`);
      return;
    }

    const valor = parseValorNumerico(kmManualTexto);
    if (Number.isNaN(valor) || valor <= 0) {
      setErroManual('Digite uma distância válida em km.');
      return;
    }
    onSalvarTrajeto(Number(valor.toFixed(2)), 'manual');
    setKmManualTexto('');
    setManualAberto(false);
    mostrarFeedback(`${formatarKm(valor)} km salvos`);
  };

  const textoStatus =
    status === 'running'
      ? aguardandoSinal
        ? 'Buscando sinal GPS...'
        : 'Registrando via GPS'
      : status === 'paused'
        ? 'Trajeto pausado'
        : 'Pronto para rodar';

  return (
    <section aria-labelledby="titulo-odometro" className="neu-card p-2 sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="icon-tile text-[var(--rota-accent)]">
            <Navigation className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 id="titulo-odometro" className="card-title">
              Odômetro
            </h2>
            <p className="text-xs font-medium text-[var(--rota-text-soft)] truncate tabular-nums">
              {textoStatus}
              {(status === 'running' || tempoSegundos > 0) &&
                ` · ${formatarDuracao(tempoSegundos)}`}
              {status === 'running' &&
              velocidadeKmh !== null &&
              velocidadeKmh > 1
                ? ` · ${velocidadeKmh} km/h`
                : ''}
              {status === 'running' && precisaoMetros !== null
                ? ` · ${precisaoMetros} m`
                : ''}
              {status === 'running' && wakeLockAtivo ? ' · Tela ativa' : ''}
            </p>
          </div>
        </div>

        {feedback ? (
          <span className="inline-flex min-h-[44px] items-center gap-1 text-xs font-semibold text-[var(--rota-success)] whitespace-nowrap shrink-0">
            <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {feedback}
          </span>
        ) : (
          <button
            type="button"
            aria-expanded={manualAberto}
            onClick={() => {
              setManualAberto((prev) => !prev);
              setErroManual(null);
            }}
            className="neu-btn-secondary inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-2xl px-3.5 text-xs font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
          >
            Modo manual
            {manualAberto ? (
              <ChevronUp className="h-4 w-4 text-[var(--rota-accent)]" strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[var(--rota-accent)]" strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Leitura principal da distância */}
      <div className="my-2 sm:my-3 flex items-baseline justify-center gap-2 text-center">
        <span className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[var(--rota-text)] tabular-nums">
          {formatarKm(kmAtual)}
        </span>
        <span className="text-lg font-semibold text-[var(--rota-accent)]">km</span>
      </div>

      {/* Mensagem de erro GPS traduzida */}
      {erroGps && (
        <div
          role="alert"
          className="mb-4 rounded-2xl bg-[var(--rota-danger-tint)] p-4 text-xs leading-relaxed text-[var(--rota-text)]"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle
              className="h-4 w-4 shrink-0 text-[var(--rota-danger)] mt-0.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--rota-text)]">{erroGps.mensagem}</p>
              <p className="text-xs text-[var(--rota-text-soft)]">{erroGps.sugestao}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {erroGps.bloqueadoPorIframe && typeof window !== 'undefined' && (
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-glow inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl px-4 text-xs font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Abrir em nova aba
              </a>
            )}
            {erroGps.podeTentarNovamente && (
              <button
                type="button"
                onClick={handleIniciarOuContinuar}
                className="neu-btn-secondary inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl px-4 text-xs font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
              >
                <RefreshCw className="h-4 w-4 text-[var(--rota-accent)]" strokeWidth={1.75} aria-hidden="true" />
                Tentar novamente
              </button>
            )}
          </div>
        </div>
      )}

      {/* Botões principais do Odômetro */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {status === 'running' ? (
          <button
            type="button"
            onClick={handlePausar}
            className="neu-btn-secondary flex-1 min-w-[116px] min-h-[40px] flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 text-xs sm:text-sm font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
          >
            <Pause className="h-4 w-4 shrink-0 text-[var(--rota-accent)]" strokeWidth={1.75} aria-hidden="true" />
            Pausar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleIniciarOuContinuar}
            className="btn-primary-glow flex-1 min-w-[116px] min-h-[40px] flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 text-xs sm:text-sm font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
          >
            <Play className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            {status === 'paused' ? 'Continuar' : 'Iniciar'}
          </button>
        )}

        <button
          type="button"
          onClick={handleSalvarTrajetoGps}
          disabled={kmAtual <= 0}
          className={`min-h-[40px] min-w-[124px] flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-2xl px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
            kmAtual > 0
              ? status === 'running'
                ? 'btn-primary-glow text-[var(--rota-text)] active:scale-[0.98]'
                : 'bg-[var(--rota-success-soft)] text-[var(--rota-success)] hover:bg-[var(--rota-success-strong)] active:scale-[0.98]'
              : 'bg-[var(--rota-surface-2)] text-[var(--rota-text-soft)] cursor-not-allowed'
          }`}
        >
          <Save className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          Salvar trajeto
        </button>

        {status === 'paused' && (kmAtual > 0 || tempoSegundos > 0) && (
          <button
            type="button"
            onClick={handleZerar}
            aria-label="Descartar trajeto atual"
            title="Descartar trajeto atual"
            className="neu-btn-secondary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[var(--rota-text-soft)] hover:text-[var(--rota-danger)] active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Painel recolhível para modo manual (Distância ou Painel) */}
      {manualAberto && (
        <form onSubmit={handleAdicionarManual} className="mt-4 pt-4 border-t border-[var(--rota-line)]">
          <div
            role="tablist"
            aria-label="Modo de entrada manual de quilômetros"
            className="tab-track grid-cols-2 mb-3"
          >
            <button
              type="button"
              role="tab"
              aria-selected={modoManual === 'distancia'}
              onClick={() => {
                setModoManual('distancia');
                setErroManual(null);
              }}
              className={`tab-item ${
                modoManual === 'distancia' ? 'tab-item-active' : 'tab-item-idle'
              }`}
            >
              Distância
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={modoManual === 'painel'}
              onClick={() => {
                setModoManual('painel');
                setErroManual(null);
              }}
              className={`tab-item ${
                modoManual === 'painel' ? 'tab-item-active' : 'tab-item-idle'
              }`}
            >
              Painel
            </button>
          </div>

          {modoManual === 'distancia' ? (
            <div className="flex items-center gap-2">
              <div className="neu-inset flex flex-1 items-center rounded-2xl px-4 min-h-[40px]">
                <input
                  id="input-km-manual"
                  type="text"
                  inputMode="decimal"
                  value={kmManualTexto}
                  onChange={(e) => {
                    setKmManualTexto(e.target.value);
                    if (erroManual) setErroManual(null);
                  }}
                  placeholder="Ex: 38,5"
                  className="w-full bg-transparent text-sm font-semibold text-[var(--rota-text)] placeholder:text-[var(--rota-text-soft)]/60 focus:outline-none tabular-nums"
                />
                <span className="ml-2 text-xs font-semibold text-[var(--rota-text-soft)]">km</span>
              </div>
              <button
                type="submit"
                className="btn-primary-glow flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-2xl px-4 text-xs font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                Adicionar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="input-km-inicial"
                    className="block text-xs font-medium text-[var(--rota-text-soft)] mb-1.5"
                  >
                    Km inicial
                  </label>
                  <div className="neu-inset flex items-center rounded-2xl px-3.5 min-h-[40px]">
                    <input
                      id="input-km-inicial"
                      type="text"
                      inputMode="decimal"
                      value={kmInicialTexto}
                      onChange={(e) => {
                        setKmInicialTexto(e.target.value);
                        if (erroManual) setErroManual(null);
                      }}
                      placeholder="Ex: 42150"
                      className="w-full bg-transparent text-sm font-semibold text-[var(--rota-text)] placeholder:text-[var(--rota-text-soft)]/60 focus:outline-none tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="input-km-final"
                    className="block text-xs font-medium text-[var(--rota-text-soft)] mb-1.5"
                  >
                    Km final
                  </label>
                  <div className="neu-inset flex items-center rounded-2xl px-3.5 min-h-[40px]">
                    <input
                      id="input-km-final"
                      type="text"
                      inputMode="decimal"
                      value={kmFinalTexto}
                      onChange={(e) => {
                        setKmFinalTexto(e.target.value);
                        if (erroManual) setErroManual(null);
                      }}
                      placeholder="Ex: 42238"
                      className="w-full bg-transparent text-sm font-semibold text-[var(--rota-text)] placeholder:text-[var(--rota-text-soft)]/60 focus:outline-none tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[var(--rota-text-soft)] tabular-nums">
                  {distanciaPainelValida !== null ? (
                    <>
                      Distância:{' '}
                      <strong className="font-semibold text-[var(--rota-accent)]">
                        {formatarKm(distanciaPainelValida)} km
                      </strong>
                    </>
                  ) : (
                    'Informe o hodômetro da moto'
                  )}
                </span>

                <button
                  type="submit"
                  className="btn-primary-glow flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl px-4 text-xs font-semibold text-[var(--rota-text)] whitespace-nowrap shrink-0 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  Salvar km
                </button>
              </div>
            </div>
          )}

          {erroManual && (
            <p className="mt-2 text-xs text-[var(--rota-danger)]">{erroManual}</p>
          )}
        </form>
      )}
    </section>
  );
};
