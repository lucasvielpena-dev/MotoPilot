import React, { useMemo, useState } from 'react';
import {
  Check,
  MessageSquarePlus,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import {
  CATEGORIAS_GASTO,
  CategoriaGasto,
  Lancamento,
  PLATAFORMAS,
  Plataforma,
  TipoLancamento,
} from '../types';
import { parseValorNumerico, rotuloCategoria } from '../utils/formatters';

interface FormLancamentoProps {
  lancamentos?: Lancamento[];
  onAdicionar: (dados: {
    tipo: TipoLancamento;
    categoria: Plataforma | CategoriaGasto;
    valor: number;
    observacao?: string;
  }) => void;
}

const ATALHOS_VALOR = [5, 10, 20, 50];

function ordenarPorFrequencia<T extends string>(
  opcoes: readonly T[],
  lancamentos: Lancamento[],
  tipo: TipoLancamento
): T[] {
  const contagem = new Map<string, number>();
  for (const item of lancamentos) {
    if (item.tipo === tipo) {
      contagem.set(item.categoria, (contagem.get(item.categoria) ?? 0) + 1);
    }
  }

  return [...opcoes].sort((a, b) => {
    const diff = (contagem.get(b) ?? 0) - (contagem.get(a) ?? 0);
    if (diff !== 0) return diff;
    return opcoes.indexOf(a) - opcoes.indexOf(b);
  });
}

export const FormLancamento: React.FC<FormLancamentoProps> = ({
  lancamentos = [],
  onAdicionar,
}) => {
  const plataformasOrdenadas = useMemo(
    () => ordenarPorFrequencia(PLATAFORMAS, lancamentos, TipoLancamento.GANHO),
    [lancamentos]
  );

  const categoriasGastoOrdenadas = useMemo(
    () =>
      ordenarPorFrequencia(CATEGORIAS_GASTO, lancamentos, TipoLancamento.GASTO),
    [lancamentos]
  );

  const [modoRapido, setModoRapido] = useState<boolean>(true);
  const [tipo, setTipo] = useState<TipoLancamento>(TipoLancamento.GANHO);
  const [plataforma, setPlataforma] = useState<Plataforma>(
    () => plataformasOrdenadas[0] ?? Plataforma.IFOOD
  );
  const [categoriaGasto, setCategoriaGasto] = useState<CategoriaGasto>(
    () => categoriasGastoOrdenadas[0] ?? CategoriaGasto.COMBUSTIVEL
  );
  const [valorTexto, setValorTexto] = useState<string>('');
  const [mostrarObs, setMostrarObs] = useState<boolean>(false);
  const [observacao, setObservacao] = useState<string>('');
  const [erro, setErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<{
    texto: string;
    ehGanho: boolean;
  } | null>(null);

  const ehGanho = tipo === TipoLancamento.GANHO;
  const valorNumericoAtual = parseValorNumerico(valorTexto);

  const handleSelecionarAtalho = (valor: number) => {
    setValorTexto(valor.toFixed(2).replace('.', ','));
    if (erro) setErro(null);
  };

  const handleAlternarModoRapido = () => {
    setModoRapido((anterior) => {
      const proximo = !anterior;
      setMostrarObs(!proximo);
      return proximo;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const valor = parseValorNumerico(valorTexto);
    if (Number.isNaN(valor) || valor <= 0) {
      setErro('Informe um valor maior que R$ 0,00.');
      return;
    }

    const categoria = ehGanho ? plataforma : categoriaGasto;
    const obsLimpa = observacao.trim();

    onAdicionar({
      tipo,
      categoria,
      valor: Number(valor.toFixed(2)),
      observacao: obsLimpa || undefined,
    });

    setValorTexto('');
    setObservacao('');
    if (modoRapido) {
      setMostrarObs(false);
    }
    const msg = ehGanho ? 'Ganho registrado!' : 'Gasto registrado!';
    setConfirmado({ texto: msg, ehGanho });
    window.setTimeout(() => {
      setConfirmado((atual) => (atual?.texto === msg ? null : atual));
    }, 2200);
  };

  const campoValor = (
    <div className="neu-inset flex items-center rounded-2xl px-4 min-h-[40px]">
      <span
        className={`mr-2 text-sm font-semibold ${
          ehGanho ? 'text-[var(--rota-success)]' : 'text-[var(--rota-danger-text)]'
        }`}
      >
        R$
      </span>
      <input
        id="input-valor-lancamento"
        type="text"
        inputMode="decimal"
        value={valorTexto}
        onChange={(e) => {
          setValorTexto(e.target.value);
          if (erro) setErro(null);
        }}
        placeholder={modoRapido ? 'Outro valor (ex: 14,50)' : '0,00'}
        className="w-full bg-transparent text-base font-semibold text-[var(--rota-text)] placeholder:text-[var(--rota-text-soft)]/60 focus:outline-none tabular-nums"
      />
      {valorTexto && (
        <button
          type="button"
          onClick={() => {
            setValorTexto('');
            setErro(null);
          }}
          className="ml-2 inline-flex min-h-10 items-center px-2 -mr-2 rounded-xl text-xs font-semibold text-[var(--rota-text-soft)] hover:text-[var(--rota-text)] shrink-0"
        >
          Limpar
        </button>
      )}
    </div>
  );

  const gradeAtalhosValor = (
    <div className="grid grid-cols-4 gap-2">
      {ATALHOS_VALOR.map((valor) => {
        const selecionado =
          !Number.isNaN(valorNumericoAtual) &&
          Math.abs(valorNumericoAtual - valor) < 0.001;
        return (
          <button
            key={valor}
            type="button"
            aria-pressed={selecionado}
            aria-label={`Selecionar R$ ${valor}`}
            onClick={() => handleSelecionarAtalho(valor)}
            className={`min-h-10 rounded-2xl px-1.5 text-xs font-semibold tabular-nums whitespace-nowrap transition-colors duration-150 active:scale-[0.98] ${
              selecionado
                ? ehGanho
                  ? 'bg-[var(--rota-success-soft)] text-[var(--rota-success)] ring-1 ring-[var(--rota-success-soft)]'
                  : 'bg-[var(--rota-danger-soft)] text-[var(--rota-danger-text)] ring-1 ring-[var(--rota-danger-soft)]'
                : 'neu-btn-secondary text-[var(--rota-text)]'
            }`}
          >
            R$ {valor}
          </button>
        );
      })}
    </div>
  );

  return (
    <section aria-labelledby="titulo-lancamento" className="neu-card p-2.5 sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="icon-tile text-[var(--rota-accent)]">
            <Wallet className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 id="titulo-lancamento" className="card-title">
              Registrar movimentação
            </h2>
            <p
              className={`text-xs font-medium truncate ${
                ehGanho ? 'text-[var(--rota-success)]' : 'text-[var(--rota-danger-text)]'
              }`}
            >
              {ehGanho ? 'Adicionando valor recebido' : 'Registrando despesa'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {confirmado ? (
            <span
              className={`inline-flex min-h-10 items-center gap-1 text-xs font-semibold whitespace-nowrap ${
                confirmado.ehGanho
                  ? 'text-[var(--rota-success)]'
                  : 'text-[var(--rota-danger-text)]'
              }`}
            >
              <Check className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {confirmado.texto}
            </span>
          ) : (
            <button
              type="button"
              aria-pressed={modoRapido}
              onClick={handleAlternarModoRapido}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-2xl px-3 text-xs font-semibold whitespace-nowrap transition-colors duration-150 active:scale-[0.98] ${
                modoRapido
                  ? 'bg-[var(--rota-accent-muted)] text-[var(--rota-accent)]'
                  : 'neu-btn-secondary text-[var(--rota-text-soft)] hover:text-[var(--rota-text)]'
              }`}
            >
              <Zap className="h-3.5 w-3.5 shrink-0" strokeWidth={1.9} aria-hidden="true" />
              Modo rápido
            </button>
          )}
        </div>
      </div>

      {/* 1. Escolher Ganho ou Gasto */}
      <div
        role="tablist"
        aria-label="Tipo de movimentação"
        className="tab-track grid-cols-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={ehGanho}
          onClick={() => {
            setTipo(TipoLancamento.GANHO);
            setErro(null);
          }}
          className={`tab-item ${
            ehGanho
              ? 'bg-[var(--rota-success-soft)] text-[var(--rota-success)] ring-1 ring-[var(--rota-success-soft)]/45'
              : 'tab-item-idle'
          }`}
        >
          <TrendingUp className="h-4 w-4 shrink-0" strokeWidth={1.9} aria-hidden="true" />
          Ganho
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!ehGanho}
          onClick={() => {
            setTipo(TipoLancamento.GASTO);
            setErro(null);
          }}
          className={`tab-item ${
            !ehGanho
              ? 'bg-[var(--rota-danger-soft)] text-[var(--rota-danger-text)] ring-1 ring-[var(--rota-danger-soft)]/45'
              : 'tab-item-idle'
          }`}
        >
          <TrendingDown className="h-4 w-4 shrink-0" strokeWidth={1.9} aria-hidden="true" />
          Gasto
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        {/* 2. Plataforma ou Categoria */}
        <div>
          <span className="block text-xs font-medium text-[var(--rota-text-soft)] mb-2">
            {ehGanho ? 'Plataforma' : 'Categoria'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {ehGanho
              ? plataformasOrdenadas.map((item) => {
                  const ativo = plataforma === item;
                  const label = rotuloCategoria(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => setPlataforma(item)}
                      className={`min-h-10 rounded-2xl px-2 sm:px-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-colors duration-150 active:scale-[0.98] ${
                        ativo
                          ? 'bg-[var(--rota-success-soft)] text-[var(--rota-success)] ring-1 ring-[var(--rota-success-soft)]/50'
                          : 'bg-[var(--rota-surface-2)] text-[var(--rota-text-soft)] hover:text-[var(--rota-text)]'
                      }`}
                    >
                      {ativo && (
                        <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
                      )}
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })
              : categoriasGastoOrdenadas.map((item) => {
                  const ativo = categoriaGasto === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => setCategoriaGasto(item)}
                      className={`min-h-10 rounded-2xl px-2 sm:px-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1 sm:gap-1.5 transition-colors duration-150 active:scale-[0.98] ${
                        ativo
                          ? 'bg-[var(--rota-danger-soft)] text-[var(--rota-danger-text)] ring-1 ring-[var(--rota-danger-soft)]/50'
                          : 'bg-[var(--rota-surface-2)] text-[var(--rota-text-soft)] hover:text-[var(--rota-text)]'
                      }`}
                    >
                      {ativo && (
                        <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
                      )}
                      <span className="truncate">{item}</span>
                    </button>
                  );
                })}
          </div>
        </div>

        {/* 3. Valor rápido + campo manual */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label
              htmlFor="input-valor-lancamento"
              className="text-xs font-medium text-[var(--rota-text-soft)]"
            >
              {modoRapido ? 'Valor rápido ou manual' : 'Valor'}
            </label>
            <button
              type="button"
              aria-expanded={mostrarObs}
              onClick={() => setMostrarObs((prev) => !prev)}
              className="inline-flex min-h-10 -my-2.5 items-center gap-1 px-2 -mr-2 rounded-xl text-xs font-medium text-[var(--rota-accent)] hover:text-[var(--rota-text)] transition-colors"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              {mostrarObs ? 'Ocultar observação' : 'Observação'}
            </button>
          </div>

          <div className="space-y-2">
            {campoValor}
            {gradeAtalhosValor}
          </div>

          {erro && <p className="mt-2 text-xs text-[var(--rota-danger-text)]">{erro}</p>}
        </div>

        {/* Observação opcional */}
        {mostrarObs && (
          <div>
            <label
              htmlFor="input-observacao-lancamento"
              className="block text-xs font-medium text-[var(--rota-text-soft)] mb-1.5"
            >
              Observação (opcional)
            </label>
            <div className="neu-inset flex items-center rounded-2xl px-4 min-h-[40px]">
              <input
                id="input-observacao-lancamento"
                type="text"
                maxLength={80}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder={
                  ehGanho
                    ? 'Ex: taxa chuva, gorjeta, centro'
                    : 'Ex: troca de óleo, posto, almoço'
                }
                className="w-full bg-transparent text-sm text-[var(--rota-text)] placeholder:text-[var(--rota-text-soft)]/60 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 4. Ação principal */}
        <div className="pt-1">
          <button
            type="submit"
            className="btn-primary-glow flex w-full min-h-[40px] items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Registrar lançamento
          </button>
        </div>
      </form>
    </section>
  );
};
