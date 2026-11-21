import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Fuel,
  Navigation,
  Pencil,
  Receipt,
  Trash2,
  TrendingUp,
  Utensils,
  Wrench,
  X,
} from 'lucide-react';
import {
  CATEGORIAS_GASTO,
  CategoriaGasto,
  FiltroPeriodo,
  Lancamento,
  PLATAFORMAS,
  Plataforma,
  TipoLancamento,
  Trajeto,
} from '../types';
import {
  formatarDataHora,
  formatarDuracao,
  formatarKm,
  formatarMoeda,
  parseValorNumerico,
  rotuloCategoria,
  rotuloPeriodo,
} from '../utils/formatters';

interface ListaLancamentosProps {
  periodo: FiltroPeriodo;
  onMudarPeriodo: (periodo: FiltroPeriodo) => void;
  lancamentos: Lancamento[];
  trajetos: Trajeto[];
  onEditarLancamento: (atualizado: Lancamento) => void;
  onExcluirLancamento: (id: string) => void;
  onExcluirTrajeto: (id: string) => void;
}

const OPCOES_PERIODO: { valor: FiltroPeriodo; rotulo: string }[] = [
  { valor: FiltroPeriodo.HOJE, rotulo: 'Hoje' },
  { valor: FiltroPeriodo.SETE_DIAS, rotulo: '7 dias' },
  { valor: FiltroPeriodo.MES, rotulo: 'Mês' },
];

const LIMITE_INICIAL = 8;

function renderizarIconeLancamento(item: Lancamento) {
  if (item.tipo === TipoLancamento.GANHO) {
    return (
      <TrendingUp
        className="h-[18px] w-[18px]"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    );
  }
  switch (item.categoria) {
    case CategoriaGasto.COMBUSTIVEL:
      return (
        <Fuel
          className="h-[18px] w-[18px]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
    case CategoriaGasto.MANUTENCAO:
      return (
        <Wrench
          className="h-[18px] w-[18px]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
    case CategoriaGasto.ALIMENTACAO:
      return (
        <Utensils
          className="h-[18px] w-[18px]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
    default:
      return (
        <Receipt
          className="h-[18px] w-[18px]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      );
  }
}

export const ListaLancamentos: React.FC<ListaLancamentosProps> = ({
  periodo,
  onMudarPeriodo,
  lancamentos,
  trajetos,
  onEditarLancamento,
  onExcluirLancamento,
  onExcluirTrajeto,
}) => {
  const [aba, setAba] = useState<'lancamentos' | 'trajetos'>('lancamentos');
  const [mostrarTodos, setMostrarTodos] = useState<boolean>(false);

  const [itemEditando, setItemEditando] = useState<Lancamento | null>(null);
  const [editTipo, setEditTipo] = useState<TipoLancamento>(TipoLancamento.GANHO);
  const [editCategoria, setEditCategoria] = useState<Plataforma | CategoriaGasto>(
    Plataforma.IFOOD
  );
  const [editValorTexto, setEditValorTexto] = useState<string>('');
  const [editObs, setEditObs] = useState<string>('');
  const [editErro, setEditErro] = useState<string | null>(null);

  useEffect(() => {
    setMostrarTodos(false);
  }, [periodo, aba]);

  const abrirEdicao = (item: Lancamento) => {
    setItemEditando(item);
    setEditTipo(item.tipo);
    setEditCategoria(item.categoria);
    setEditValorTexto(item.valor.toFixed(2).replace('.', ','));
    setEditObs(item.observacao ?? '');
    setEditErro(null);
  };

  const salvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemEditando) return;

    const valor = parseValorNumerico(editValorTexto);
    if (Number.isNaN(valor) || valor <= 0) {
      setEditErro('Informe um valor maior que R$ 0,00.');
      return;
    }

    onEditarLancamento({
      ...itemEditando,
      tipo: editTipo,
      categoria: editCategoria,
      valor: Number(valor.toFixed(2)),
      observacao: editObs.trim() || undefined,
    });
    setItemEditando(null);
  };

  const lancamentosOrdenados = [...lancamentos].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const trajetosOrdenados = [...trajetos].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const lancamentosVisiveis = mostrarTodos
    ? lancamentosOrdenados
    : lancamentosOrdenados.slice(0, LIMITE_INICIAL);

  const trajetosVisiveis = mostrarTodos
    ? trajetosOrdenados
    : trajetosOrdenados.slice(0, LIMITE_INICIAL);

  const totalListaAtual =
    aba === 'lancamentos'
      ? lancamentosOrdenados.length
      : trajetosOrdenados.length;

  return (
    <section aria-labelledby="titulo-lista" className="neu-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="icon-tile text-[var(--rota-accent)]">
            <Clock
              className="h-[18px] w-[18px]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <h2 id="titulo-lista" className="card-title">
              Histórico
            </h2>
            <p className="text-xs font-medium text-[var(--rota-text-soft)] truncate">
              Período: {rotuloPeriodo(periodo)}
            </p>
          </div>
        </div>
      </div>

      {/* Filtro Hoje / 7 dias / Mês */}
      <div
        role="tablist"
        aria-label="Filtrar histórico por período"
        className="tab-track grid-cols-3 mb-3"
      >
        {OPCOES_PERIODO.map((opcao) => {
          const ativo = periodo === opcao.valor;
          return (
            <button
              key={opcao.valor}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => onMudarPeriodo(opcao.valor)}
              className={`tab-item ${ativo ? 'tab-item-active' : 'tab-item-idle'}`}
            >
              {opcao.rotulo}
            </button>
          );
        })}
      </div>

      {/* Alternador entre Lançamentos e Trajetos */}
      <div
        role="tablist"
        aria-label="Alternar entre lançamentos e trajetos"
        className="tab-track grid-cols-2 mb-4"
      >
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'lancamentos'}
          onClick={() => setAba('lancamentos')}
          className={`tab-item ${
            aba === 'lancamentos' ? 'tab-item-active' : 'tab-item-idle'
          }`}
        >
          Lançamentos ({lancamentosOrdenados.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={aba === 'trajetos'}
          onClick={() => setAba('trajetos')}
          className={`tab-item ${
            aba === 'trajetos' ? 'tab-item-active' : 'tab-item-idle'
          }`}
        >
          Trajetos ({trajetosOrdenados.length})
        </button>
      </div>

      {aba === 'lancamentos' ? (
        lancamentosOrdenados.length === 0 ? (
          <div className="neu-inset rounded-2xl px-4 py-6 text-center text-xs text-[var(--rota-text-soft)]">
            Nenhum ganho ou gasto registrado neste período.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--rota-line)]">
            {lancamentosVisiveis.map((item) => {
              const ehGanho = item.tipo === TipoLancamento.GANHO;
              const nomeCategoria = rotuloCategoria(item.categoria);
              return (
                <li
                  key={item.id}
                  className="flex items-start sm:items-center justify-between gap-2.5 py-3 first:pt-1 last:pb-1"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`icon-tile mt-0.5 sm:mt-0 ${
                        ehGanho ? 'text-[var(--rota-success)]' : 'text-[var(--rota-danger)]'
                      }`}
                    >
                      {renderizarIconeLancamento(item)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--rota-text)] truncate">
                        {nomeCategoria}
                      </p>
                      <p className="text-xs text-[var(--rota-text-soft)] truncate">
                        {formatarDataHora(item.data)} ·{' '}
                        {ehGanho ? 'Ganho' : 'Gasto'}
                      </p>
                      {item.observacao && (
                        <p className="text-xs text-[var(--rota-text)]/85 truncate mt-0.5">
                          {item.observacao}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-2 shrink-0">
                    <span
                      className={`text-sm font-bold tabular-nums whitespace-nowrap ${
                        ehGanho ? 'text-[var(--rota-success)]' : 'text-[var(--rota-danger)]'
                      }`}
                    >
                      {ehGanho ? '+ ' : '- '}
                      {formatarMoeda(item.valor)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(item)}
                        aria-label={`Editar ${nomeCategoria} de ${formatarMoeda(item.valor)}`}
                        className="neu-btn-secondary flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--rota-text-soft)] hover:text-[var(--rota-text)] active:scale-[0.98]"
                      >
                        <Pencil
                          className="h-4 w-4"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => onExcluirLancamento(item.id)}
                        aria-label={`Excluir ${nomeCategoria} de ${formatarMoeda(item.valor)}`}
                        className="neu-btn-secondary flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--rota-text-soft)] hover:text-[var(--rota-danger)] active:scale-[0.98]"
                      >
                        <Trash2
                          className="h-4 w-4"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : trajetosOrdenados.length === 0 ? (
        <div className="neu-inset rounded-2xl px-4 py-6 text-center text-xs text-[var(--rota-text-soft)]">
          Nenhum trajeto salvo neste período.
        </div>
      ) : (
        <ul className="divide-y divide-[var(--rota-line)]">
          {trajetosVisiveis.map((trajeto) => (
            <li
              key={trajeto.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="icon-tile text-[var(--rota-accent)]">
                  <Navigation
                    className="h-[18px] w-[18px]"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--rota-text)] tabular-nums">
                    {formatarKm(trajeto.km)} km
                  </p>
                  <p className="text-xs text-[var(--rota-text-soft)] truncate tabular-nums">
                    {formatarDataHora(trajeto.data)} ·{' '}
                    {trajeto.origem === 'gps' ? 'GPS automático' : 'Manual'}
                    {trajeto.duracaoSegundos
                      ? ` · ${formatarDuracao(trajeto.duracaoSegundos)}`
                      : ''}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onExcluirTrajeto(trajeto.id)}
                aria-label={`Excluir trajeto de ${formatarKm(trajeto.km)} km`}
                className="neu-btn-secondary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[var(--rota-text-soft)] hover:text-[var(--rota-danger)] active:scale-[0.98]"
              >
                <Trash2
                  className="h-4 w-4"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {totalListaAtual > LIMITE_INICIAL && (
        <button
          type="button"
          onClick={() => setMostrarTodos((prev) => !prev)}
          className="neu-btn-secondary mt-3 flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-2xl px-4 text-xs font-semibold text-[var(--rota-text-soft)] hover:text-[var(--rota-text)] active:scale-[0.98]"
        >
          {mostrarTodos ? (
            <>
              <ChevronUp className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Ver todos ({totalListaAtual})
            </>
          )}
        </button>
      )}

      {/* Modal de edição rápida do lançamento */}
      {itemEditando && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-editar-lancamento"
        >
          <div className="neu-card w-full max-w-[420px] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 id="titulo-editar-lancamento" className="card-title">
                Editar lançamento
              </h3>
              <button
                type="button"
                onClick={() => setItemEditando(null)}
                aria-label="Fechar edição"
                className="neu-btn-secondary flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--rota-text-soft)] hover:text-[var(--rota-text)] active:scale-[0.98]"
              >
                <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={salvarEdicao} className="space-y-4">
              <div
                role="tablist"
                aria-label="Tipo de lançamento"
                className="tab-track grid-cols-2"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={editTipo === TipoLancamento.GANHO}
                  onClick={() => {
                    setEditTipo(TipoLancamento.GANHO);
                    setEditCategoria(Plataforma.IFOOD);
                  }}
                  className={`tab-item ${
                    editTipo === TipoLancamento.GANHO
                      ? 'bg-[var(--rota-success-soft)] text-[var(--rota-success)] ring-1 ring-[var(--rota-success-soft)]/45'
                      : 'tab-item-idle'
                  }`}
                >
                  Ganho
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={editTipo === TipoLancamento.GASTO}
                  onClick={() => {
                    setEditTipo(TipoLancamento.GASTO);
                    setEditCategoria(CategoriaGasto.COMBUSTIVEL);
                  }}
                  className={`tab-item ${
                    editTipo === TipoLancamento.GASTO
                      ? 'bg-[var(--rota-danger-soft)] text-[var(--rota-danger-text)] ring-1 ring-[var(--rota-danger-soft)]/45'
                      : 'tab-item-idle'
                  }`}
                >
                  Gasto
                </button>
              </div>

              <div>
                <span className="block text-xs font-medium text-[var(--rota-text-soft)] mb-2">
                  {editTipo === TipoLancamento.GANHO
                    ? 'Plataforma'
                    : 'Categoria'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(editTipo === TipoLancamento.GANHO
                    ? PLATAFORMAS
                    : CATEGORIAS_GASTO
                  ).map((cat) => {
                    const ativo = editCategoria === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setEditCategoria(cat)}
                        className={`min-h-[44px] rounded-2xl px-2 sm:px-3 text-xs sm:text-sm font-semibold whitespace-nowrap truncate transition-colors duration-150 active:scale-[0.98] ${
                          ativo
                            ? editTipo === TipoLancamento.GANHO
                              ? 'bg-[var(--rota-success-soft)] text-[var(--rota-success)] ring-1 ring-[var(--rota-success-soft)]/50'
                              : 'bg-[var(--rota-danger-soft)] text-[var(--rota-danger-text)] ring-1 ring-[var(--rota-danger-soft)]/50'
                            : 'bg-[var(--rota-surface-2)] text-[var(--rota-text-soft)] hover:text-[var(--rota-text)]'
                        }`}
                      >
                        {rotuloCategoria(cat)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="input-edit-valor"
                  className="block text-xs font-medium text-[var(--rota-text-soft)] mb-2"
                >
                  Valor
                </label>
                <div className="neu-inset flex items-center rounded-2xl px-4 min-h-[48px]">
                  <span
                    className={`mr-2 text-sm font-semibold ${
                      editTipo === TipoLancamento.GANHO
                        ? 'text-[var(--rota-success)]'
                        : 'text-[var(--rota-danger-text)]'
                    }`}
                  >
                    R$
                  </span>
                  <input
                    id="input-edit-valor"
                    type="text"
                    inputMode="decimal"
                    value={editValorTexto}
                    onChange={(e) => {
                      setEditValorTexto(e.target.value);
                      if (editErro) setEditErro(null);
                    }}
                    className="w-full bg-transparent text-base font-semibold text-[var(--rota-text)] placeholder:text-[var(--rota-text-soft)]/60 focus:outline-none tabular-nums"
                  />
                </div>
                {editErro && (
                  <p className="mt-2 text-xs text-[var(--rota-danger-text)]">{editErro}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="input-edit-obs"
                  className="block text-xs font-medium text-[var(--rota-text-soft)] mb-2"
                >
                  Observação
                </label>
                <div className="neu-inset flex items-center rounded-2xl px-4 min-h-[48px]">
                  <input
                    id="input-edit-obs"
                    type="text"
                    maxLength={80}
                    value={editObs}
                    onChange={(e) => setEditObs(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-transparent text-sm text-[var(--rota-text)] placeholder:text-[var(--rota-text-soft)]/60 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary-glow flex w-full min-h-[48px] items-center justify-center rounded-2xl px-4 text-sm font-semibold text-[var(--rota-text)] active:scale-[0.98]"
              >
                Salvar alterações
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
