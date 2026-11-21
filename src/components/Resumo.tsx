import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Target, TrendingDown } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
  filtrarPorPeriodo,
  formatarDuracao,
  formatarKm,
  formatarMoeda,
  parseValorNumerico,
  rotuloCategoria,
} from '../utils/formatters';

interface ResumoProps {
  periodo: FiltroPeriodo;
  onMudarPeriodo: (periodo: FiltroPeriodo) => void;
  lancamentos: Lancamento[];
  todosLancamentos: Lancamento[];
  trajetos: Trajeto[];
  metaDiaria: number;
  onMudarMetaDiaria: (novaMeta: number) => void;
}

interface DadoDiaGrafico {
  chave: string;
  rotulo: string;
  dataCompleta: string;
  ganhos: number;
  gastos: number;
  lucro: number;
}

const OPCOES_PERIODO: { valor: FiltroPeriodo; rotulo: string }[] = [
  { valor: FiltroPeriodo.HOJE, rotulo: 'Hoje' },
  { valor: FiltroPeriodo.SETE_DIAS, rotulo: '7 dias' },
  { valor: FiltroPeriodo.MES, rotulo: 'Mês' },
];

const DIAS_SEMANA_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const Resumo: React.FC<ResumoProps> = ({
  periodo,
  onMudarPeriodo,
  lancamentos,
  todosLancamentos,
  trajetos,
  metaDiaria,
  onMudarMetaDiaria,
}) => {
  const [metaTexto, setMetaTexto] = useState<string>(() =>
    metaDiaria > 0 ? metaDiaria.toFixed(2).replace('.', ',') : ''
  );
  const [abaDetalhes, setAbaDetalhes] = useState<'plataformas' | 'gastos'>(
    'plataformas'
  );

  useEffect(() => {
    const parsed = parseValorNumerico(metaTexto);
    if (metaDiaria <= 0 && metaTexto.trim() !== '') {
      setMetaTexto('');
    } else if (
      metaDiaria > 0 &&
      (Number.isNaN(parsed) || Math.abs(parsed - metaDiaria) > 0.009)
    ) {
      setMetaTexto(metaDiaria.toFixed(2).replace('.', ','));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaDiaria]);

  const handleMetaChange = (valorDigitado: string) => {
    setMetaTexto(valorDigitado);
    if (!valorDigitado.trim()) {
      onMudarMetaDiaria(0);
      return;
    }
    const parsed = parseValorNumerico(valorDigitado);
    if (!Number.isNaN(parsed) && parsed > 0) {
      onMudarMetaDiaria(Number(parsed.toFixed(2)));
    }
  };

  const ganhosHoje = useMemo(
    () =>
      filtrarPorPeriodo(todosLancamentos, FiltroPeriodo.HOJE)
        .filter((l) => l.tipo === TipoLancamento.GANHO)
        .reduce((acc, l) => acc + l.valor, 0),
    [todosLancamentos]
  );

  const faltaParaMeta = Math.max(0, metaDiaria - ganhosHoje);
  const progressoMeta =
    metaDiaria > 0 ? Math.min(100, (ganhosHoje / metaDiaria) * 100) : 0;
  const metaAlcancada = metaDiaria > 0 && ganhosHoje >= metaDiaria;

  const totalGanhos = lancamentos
    .filter((l) => l.tipo === TipoLancamento.GANHO)
    .reduce((acc, l) => acc + l.valor, 0);

  const totalGastos = lancamentos
    .filter((l) => l.tipo === TipoLancamento.GASTO)
    .reduce((acc, l) => acc + l.valor, 0);

  const lucro = totalGanhos - totalGastos;

  const totalKm = trajetos.reduce((acc, t) => acc + t.km, 0);
  const totalSegundos = trajetos.reduce(
    (acc, t) => acc + (t.duracaoSegundos ?? 0),
    0
  );

  const ganhoPorKm = totalKm > 0 ? totalGanhos / totalKm : 0;
  const custoPorKm = totalKm > 0 ? totalGastos / totalKm : 0;
  const lucroPorKm = totalKm > 0 ? lucro / totalKm : 0;
  const ganhoPorHora =
    totalSegundos > 0 ? totalGanhos / (totalSegundos / 3600) : 0;

  const temDados = lancamentos.length > 0 || trajetos.length > 0;
  const lucroPositivo = lucro > 0;

  const ganhosPorPlataforma = PLATAFORMAS.map((plat: Plataforma) => {
    const soma = lancamentos
      .filter(
        (l) => l.tipo === TipoLancamento.GANHO && l.categoria === plat
      )
      .reduce((acc, l) => acc + l.valor, 0);
    return {
      plataforma: rotuloCategoria(plat),
      total: soma,
      percentual: totalGanhos > 0 ? (soma / totalGanhos) * 100 : 0,
    };
  });

  const gastosPorCategoria = CATEGORIAS_GASTO.map((cat: CategoriaGasto) => {
    const soma = lancamentos
      .filter(
        (l) => l.tipo === TipoLancamento.GASTO && l.categoria === cat
      )
      .reduce((acc, l) => acc + l.valor, 0);
    return {
      categoria: cat,
      total: soma,
      percentual: totalGastos > 0 ? (soma / totalGastos) * 100 : 0,
    };
  });

  const dadosUltimos7Dias = useMemo<DadoDiaGrafico[]>(() => {
    const hoje = new Date();
    const ganhosPorDia = new Map<string, number>();
    const gastosPorDia = new Map<string, number>();

    for (const item of todosLancamentos) {
      const d = new Date(item.data);
      if (Number.isNaN(d.getTime())) continue;
      const chave = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (item.tipo === TipoLancamento.GANHO) {
        ganhosPorDia.set(chave, (ganhosPorDia.get(chave) ?? 0) + item.valor);
      } else {
        gastosPorDia.set(chave, (gastosPorDia.get(chave) ?? 0) + item.valor);
      }
    }

    const lista: DadoDiaGrafico[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const dia = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        hoje.getDate() - offset
      );
      const chave = `${dia.getFullYear()}-${dia.getMonth()}-${dia.getDate()}`;
      const diaMes = String(dia.getDate()).padStart(2, '0');
      const mes = String(dia.getMonth() + 1).padStart(2, '0');
      const nomeDia = DIAS_SEMANA_CURTOS[dia.getDay()];
      const ganhosDia = Number((ganhosPorDia.get(chave) ?? 0).toFixed(2));
      const gastosDia = Number((gastosPorDia.get(chave) ?? 0).toFixed(2));

      lista.push({
        chave,
        rotulo: offset === 0 ? 'Hoje' : nomeDia,
        dataCompleta: `${nomeDia} · ${diaMes}/${mes}`,
        ganhos: ganhosDia,
        gastos: gastosDia,
        lucro: Number((ganhosDia - gastosDia).toFixed(2)),
      });
    }
    return lista;
  }, [todosLancamentos]);

  const total7DiasGanhos = dadosUltimos7Dias.reduce((acc, d) => acc + d.ganhos, 0);
  const total7DiasGastos = dadosUltimos7Dias.reduce((acc, d) => acc + d.gastos, 0);

  return (
    <section aria-labelledby="titulo-resumo" className="neu-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="icon-tile text-[var(--rota-accent)]">
            <BarChart3
              className="h-[18px] w-[18px]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <h2 id="titulo-resumo" className="card-title">
              Resumo
            </h2>
            <p className="text-xs font-medium text-[var(--rota-text-soft)] truncate tabular-nums">
              {lancamentos.length}{' '}
              {lancamentos.length === 1 ? 'lançamento' : 'lançamentos'}
              {totalSegundos > 0
                ? ` · ${formatarDuracao(totalSegundos)} em rota`
                : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filtro Hoje / 7 dias / Mês */}
      <div
        role="tablist"
        aria-label="Filtrar resumo por período"
        className="tab-track grid-cols-3"
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

      {/* Resultado do período */}
      <div className="mt-4">
        {temDados ? (
          <div
            className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
              lucroPositivo
                ? 'bg-[var(--rota-success-tint)] text-[var(--rota-success)]'
                : 'bg-[var(--rota-danger-tint)] text-[var(--rota-danger-text)]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {lucroPositivo ? (
                <CheckCircle2
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              ) : (
                <TrendingDown
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              )}
              <span className="text-sm font-semibold truncate">
                {lucroPositivo
                  ? 'Saldo positivo no período'
                  : 'Despesas maiores que receita'}
              </span>
            </div>
            <span className="text-sm font-semibold tabular-nums whitespace-nowrap shrink-0">
              {formatarMoeda(lucroPorKm)}/km
            </span>
          </div>
        ) : (
          <div className="neu-inset rounded-2xl px-4 py-3.5 text-center text-xs text-[var(--rota-text-soft)]">
            Registre ganhos, despesas ou trajetos para ver o balanço do período.
          </div>
        )}
      </div>

      {/* Grade dos 8 indicadores principais */}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        <div className="neu-tile p-3.5">
          <span className="block text-xs text-[var(--rota-text-soft)]">Receita</span>
          <span className="mt-1 block text-base font-bold text-[var(--rota-success)] tabular-nums">
            {formatarMoeda(totalGanhos)}
          </span>
        </div>

        <div className="neu-tile p-3.5">
          <span className="block text-xs text-[var(--rota-text-soft)]">Despesas</span>
          <span
            className={`mt-1 block text-base font-bold tabular-nums ${
              totalGastos > 0 ? 'text-[var(--rota-danger-text)]' : 'text-[var(--rota-text)]'
            }`}
          >
            {formatarMoeda(totalGastos)}
          </span>
        </div>

        <div className="neu-tile p-3.5">
          <span className="block text-xs text-[var(--rota-text-soft)]">
            {totalGastos === 0 ? 'Lucro estimado' : 'Lucro'}
          </span>
          <span
            className={`mt-1 block text-base font-bold tabular-nums ${
              lucro > 0
                ? 'text-[var(--rota-success)]'
                : lucro < 0
                  ? 'text-[var(--rota-danger-text)]'
                  : 'text-[var(--rota-text)]'
            }`}
          >
            {formatarMoeda(lucro)}
          </span>
        </div>

        <div className="neu-tile p-3.5">
          <span className="block text-xs text-[var(--rota-text-soft)]">Distância</span>
          <span className="mt-1 block text-base font-bold text-[var(--rota-text)] tabular-nums">
            {formatarKm(totalKm)} km
          </span>
        </div>

        <div className="neu-tile p-3.5">
          <span className="block text-xs text-[var(--rota-text-soft)]">Receita por km</span>
          <span className="mt-1 block text-base font-bold text-[var(--rota-accent)] tabular-nums">
            {formatarMoeda(ganhoPorKm)}/km
          </span>
        </div>

        <div className="neu-tile p-3.5">
          <span className="block text-xs text-[var(--rota-text-soft)]">Lucro por km</span>
          <span
            className={`mt-1 block text-base font-bold tabular-nums ${
              lucroPorKm > 0
                ? 'text-[var(--rota-success)]'
                : lucroPorKm < 0
                  ? 'text-[var(--rota-danger-text)]'
                  : 'text-[var(--rota-text)]'
            }`}
          >
            {formatarMoeda(lucroPorKm)}/km
          </span>
        </div>

        <div className="neu-tile p-3.5">
          <span className="block text-xs text-[var(--rota-text-soft)]">Custo por km</span>
          <span
            className={`mt-1 block text-base font-bold tabular-nums ${
              custoPorKm > 0 ? 'text-[var(--rota-danger-text)]' : 'text-[var(--rota-text)]'
            }`}
          >
            {formatarMoeda(custoPorKm)}/km
          </span>
        </div>

        <div className="neu-tile p-3.5">
          <span className="block text-xs text-[var(--rota-text-soft)]">Ganho por hora</span>
          <span className="mt-1 block text-base font-bold text-[var(--rota-accent)] tabular-nums">
            {totalSegundos > 0 ? `${formatarMoeda(ganhoPorHora)}/h` : '—'}
          </span>
        </div>
      </div>

      {/* Meta diária */}
      <div className="mt-4 pt-4 border-t border-[var(--rota-line)]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label
            htmlFor="input-meta-diaria"
            className="section-subtitle inline-flex items-center gap-1.5"
          >
            <Target
              className="h-4 w-4 text-[var(--rota-accent)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Meta diária
          </label>
          <span className="text-xs text-[var(--rota-text-soft)] tabular-nums">
            Hoje:{' '}
            <strong className="text-[var(--rota-success)] font-semibold">
              {formatarMoeda(ganhosHoje)}
            </strong>
          </span>
        </div>

        <div className="neu-inset flex items-center rounded-2xl px-4 min-h-[48px]">
          <span className="mr-2 text-sm font-semibold text-[var(--rota-accent)]">R$</span>
          <input
            id="input-meta-diaria"
            type="text"
            inputMode="decimal"
            value={metaTexto}
            onChange={(e) => handleMetaChange(e.target.value)}
            placeholder="Ex: 200,00"
            className="w-full bg-transparent text-base font-semibold text-[var(--rota-text)] placeholder:text-[var(--rota-text-soft)]/60 focus:outline-none tabular-nums"
          />
          {metaDiaria > 0 && (
            <span className="ml-2 text-xs font-semibold text-[var(--rota-accent)] tabular-nums shrink-0">
              {Math.round(progressoMeta)}%
            </span>
          )}
        </div>

        <div className="mt-3">
          <div
            role="progressbar"
            aria-label="Progresso da meta de ganho diário"
            aria-valuemin={0}
            aria-valuemax={metaDiaria > 0 ? metaDiaria : 100}
            aria-valuenow={
              metaDiaria > 0 ? Math.min(ganhosHoje, metaDiaria) : 0
            }
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--rota-track)]"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                metaAlcancada ? 'bg-[var(--rota-success)]' : 'bg-[var(--rota-accent-strong)]'
              }`}
              style={{ width: `${progressoMeta}%` }}
            />
          </div>

          <p className="mt-2 text-xs tabular-nums">
            {metaDiaria <= 0 ? (
              <span className="text-[var(--rota-text-soft)]">
                Defina um valor acima para acompanhar sua meta diária.
              </span>
            ) : metaAlcancada ? (
              <span className="font-semibold text-[var(--rota-success)]">
                {formatarMoeda(ganhosHoje)} de {formatarMoeda(metaDiaria)} · Meta alcançada
              </span>
            ) : (
              <span className="text-[var(--rota-text-soft)]">
                {Math.round(progressoMeta)}% da meta diária · Faltam{' '}
                <strong className="font-semibold text-[var(--rota-text)]">
                  {formatarMoeda(faltaParaMeta)}
                </strong>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Evolução dos últimos 7 dias */}
      <div className="mt-4 pt-4 border-t border-[var(--rota-line)]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="section-subtitle">Últimos 7 dias</h3>
          <div className="flex items-center gap-3 text-xs tabular-nums">
            <span className="font-semibold text-[var(--rota-accent)]">
              +{formatarMoeda(total7DiasGanhos)}
            </span>
            <span className="font-semibold text-[var(--rota-danger)]">
              -{formatarMoeda(total7DiasGastos)}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[var(--rota-track)] p-3">
          <div className="h-[176px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosUltimos7Dias}
                margin={{ top: 8, right: 6, left: -8, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="rotulo"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--rota-text-soft)',
                    fontSize: 12,
                    fontFamily: 'Nunito, system-ui, sans-serif',
                  }}
                />
                <YAxis
                  width={52}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--rota-text-soft)',
                    fontSize: 12,
                    fontFamily: 'Nunito, system-ui, sans-serif',
                  }}
                  tickFormatter={(v: number) =>
                    v === 0 ? 'R$0' : `R$${Math.round(v)}`
                  }
                />
                <Tooltip
                  cursor={{ fill: 'rgba(58, 134, 208, 0.08)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) {
                      return null;
                    }
                    const ponto = payload[0].payload as DadoDiaGrafico;
                    return (
                      <div className="rounded-2xl bg-[var(--rota-surface)] px-3 py-2 shadow-lg space-y-0.5">
                        <p className="text-xs text-[var(--rota-text-soft)]">
                          {ponto.dataCompleta}
                        </p>
                        <p className="text-xs font-semibold text-[var(--rota-success)] tabular-nums">
                          Receita: {formatarMoeda(ponto.ganhos)}
                        </p>
                        <p className="text-xs font-semibold text-[var(--rota-danger)] tabular-nums">
                          Despesas: {formatarMoeda(ponto.gastos)}
                        </p>
                        <p className="text-xs font-semibold text-[var(--rota-text)] tabular-nums pt-0.5 border-t border-[var(--rota-line)]">
                          Lucro: {formatarMoeda(ponto.lucro)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="ganhos"
                  fill="#2672B5"
                  radius={[6, 6, 2, 2]}
                  maxBarSize={18}
                />
                <Bar
                  dataKey="gastos"
                  fill="#F07878"
                  radius={[6, 6, 2, 2]}
                  maxBarSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {total7DiasGanhos === 0 && total7DiasGastos === 0 && (
            <p className="mt-2 text-center text-xs text-[var(--rota-text-soft)]">
              Sem movimentações registradas nos últimos 7 dias.
            </p>
          )}
        </div>
      </div>

      {/* Detalhamento alternado: Plataformas | Despesas */}
      <div className="mt-4 pt-4 border-t border-[var(--rota-line)]">
        <div
          role="tablist"
          aria-label="Alternar detalhamento entre plataformas e despesas"
          className="tab-track grid-cols-2 mb-3"
        >
          <button
            type="button"
            role="tab"
            aria-selected={abaDetalhes === 'plataformas'}
            onClick={() => setAbaDetalhes('plataformas')}
            className={`tab-item ${
              abaDetalhes === 'plataformas' ? 'tab-item-active' : 'tab-item-idle'
            }`}
          >
            Plataformas
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={abaDetalhes === 'gastos'}
            onClick={() => setAbaDetalhes('gastos')}
            className={`tab-item ${
              abaDetalhes === 'gastos' ? 'tab-item-active' : 'tab-item-idle'
            }`}
          >
            Despesas
          </button>
        </div>

        {abaDetalhes === 'plataformas' ? (
          <div className="space-y-3">
            {ganhosPorPlataforma.map((item) => (
              <div key={item.plataforma}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-[var(--rota-text)]">
                    {item.plataforma}
                  </span>
                  <span className="font-semibold text-[var(--rota-success)] tabular-nums">
                    {formatarMoeda(item.total)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--rota-track)]">
                  <div
                    className="h-full rounded-full bg-[var(--rota-accent)] transition-all duration-300"
                    style={{ width: `${Math.min(100, item.percentual)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {gastosPorCategoria.map((item) => (
              <div key={item.categoria}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-[var(--rota-text)]">
                    {item.categoria}
                  </span>
                  <span className="font-semibold text-[var(--rota-danger)] tabular-nums">
                    {formatarMoeda(item.total)}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--rota-track)]">
                  <div
                    className="h-full rounded-full bg-[var(--rota-danger)] transition-all duration-300"
                    style={{ width: `${Math.min(100, item.percentual)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
