import React, { useMemo, useRef, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Upload,
  Wrench,
} from 'lucide-react';
import { Lancamento, Trajeto } from '../types';
import { formatarKm, parseValorNumerico } from '../utils/formatters';
import {
  BackupRota,
  ConfigTrocaOleo,
  carregarConfigOleo,
  gerarConteudoCsv,
  salvarConfigOleo,
  validarEConverterBackupJson,
} from '../utils/storage';

interface ManutencaoBackupProps {
  todosLancamentos: Lancamento[];
  todosTrajetos: Trajeto[];
  metaDiaria: number;
  onRestaurarBackup: (
    lancamentos: Lancamento[],
    trajetos: Trajeto[],
    metaDiaria: number,
    configOleo?: ConfigTrocaOleo
  ) => void;
}

function baixarArquivo(conteudo: string, nomeArquivo: string, mime: string) {
  const blob = new Blob([conteudo], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const ManutencaoBackup: React.FC<ManutencaoBackupProps> = ({
  todosLancamentos,
  todosTrajetos,
  metaDiaria,
  onRestaurarBackup,
}) => {
  const [configOleo, setConfigOleo] = useState<ConfigTrocaOleo>(() =>
    carregarConfigOleo()
  );
  const [intervaloOleoTexto, setIntervaloOleoTexto] = useState<string>(() =>
    String(carregarConfigOleo().intervaloKm)
  );
  const [mensagemBackup, setMensagemBackup] = useState<{
    texto: string;
    erro?: boolean;
  } | null>(null);
  const inputRestoreRef = useRef<HTMLInputElement | null>(null);

  const exibirMensagemBackup = (texto: string, erro = false) => {
    setMensagemBackup({ texto, erro });
    window.setTimeout(() => {
      setMensagemBackup((atual) => (atual?.texto === texto ? null : atual));
    }, 3000);
  };

  const totalKmHistorico = useMemo(
    () => todosTrajetos.reduce((acc, t) => acc + t.km, 0),
    [todosTrajetos]
  );

  const handleIntervaloOleoChange = (valorDigitado: string) => {
    setIntervaloOleoTexto(valorDigitado);
    const parsed = parseValorNumerico(valorDigitado);
    if (!Number.isNaN(parsed) && parsed >= 100) {
      const atualizado: ConfigTrocaOleo = {
        ...configOleo,
        intervaloKm: Math.round(parsed),
      };
      setConfigOleo(atualizado);
      salvarConfigOleo(atualizado);
    }
  };

  const handleRegistrarTrocaOleo = () => {
    const atualizado: ConfigTrocaOleo = {
      ...configOleo,
      kmBase: Number(totalKmHistorico.toFixed(2)),
      ultimaTrocaData: new Date().toISOString(),
    };
    setConfigOleo(atualizado);
    salvarConfigOleo(atualizado);
  };

  const kmDesdeTrocaOleo = Math.max(0, totalKmHistorico - configOleo.kmBase);
  const faltaParaTrocaOleo = Math.max(
    0,
    configOleo.intervaloKm - kmDesdeTrocaOleo
  );
  const progressoOleo =
    configOleo.intervaloKm > 0
      ? Math.min(100, (kmDesdeTrocaOleo / configOleo.intervaloKm) * 100)
      : 0;
  const oleoVencido = kmDesdeTrocaOleo >= configOleo.intervaloKm;
  const oleoProximo = !oleoVencido && progressoOleo >= 80;

  const handleExportarCsv = () => {
    if (todosLancamentos.length === 0 && todosTrajetos.length === 0) {
      exibirMensagemBackup('Não há dados para exportar ainda.', true);
      return;
    }
    const dataStr = new Date().toISOString().slice(0, 10);
    const csv = gerarConteudoCsv(todosLancamentos, todosTrajetos);
    baixarArquivo(
      csv,
      `rota-relatorio-${dataStr}.csv`,
      'text/csv;charset=utf-8;'
    );
    exibirMensagemBackup('Planilha CSV baixada!');
  };

  const handleSalvarBackup = () => {
    const dataStr = new Date().toISOString().slice(0, 10);
    const payload: BackupRota = {
      versao: 1,
      exportadoEm: new Date().toISOString(),
      metaDiaria,
      configOleo,
      lancamentos: todosLancamentos,
      trajetos: todosTrajetos,
    };
    baixarArquivo(
      JSON.stringify(payload, null, 2),
      `rota-backup-${dataStr}.json`,
      'application/json'
    );
    exibirMensagemBackup('Backup salvo no aparelho!');
  };

  const handleArquivoBackupSelecionado = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const texto = await file.text();
      const backup = validarEConverterBackupJson(texto);
      if (!backup) {
        exibirMensagemBackup('Arquivo de backup inválido.', true);
        return;
      }

      onRestaurarBackup(
        backup.lancamentos,
        backup.trajetos,
        backup.metaDiaria,
        backup.configOleo
      );

      if (backup.configOleo) {
        setConfigOleo(backup.configOleo);
        setIntervaloOleoTexto(String(backup.configOleo.intervaloKm));
        salvarConfigOleo(backup.configOleo);
      }

      exibirMensagemBackup('Dados restaurados com sucesso!');
    } catch {
      exibirMensagemBackup('Não foi possível ler o arquivo.', true);
    }
  };

  return (
    <section aria-labelledby="titulo-manutencao-backup" className="neu-card p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="icon-tile text-[var(--rota-accent)]">
            <Wrench
              className="h-[18px] w-[18px]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0">
            <h2 id="titulo-manutencao-backup" className="card-title">
              Manutenção e dados
            </h2>
            <p className="text-xs font-medium text-[var(--rota-text-soft)] truncate">
              Troca de óleo e cópia de segurança
            </p>
          </div>
        </div>
      </div>

      {/* Controle de manutenção: Troca de óleo */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <label
            htmlFor="input-intervalo-oleo"
            className="section-subtitle"
          >
            Troca de óleo
          </label>
          <span className="text-xs font-medium text-[var(--rota-text-soft)] tabular-nums">
            {formatarKm(kmDesdeTrocaOleo)} / {configOleo.intervaloKm} km
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="neu-inset flex flex-1 items-center rounded-2xl px-4 min-h-[48px]">
            <span className="mr-2 text-xs font-medium text-[var(--rota-text-soft)] whitespace-nowrap">
              A cada
            </span>
            <input
              id="input-intervalo-oleo"
              type="text"
              inputMode="numeric"
              value={intervaloOleoTexto}
              onChange={(e) => handleIntervaloOleoChange(e.target.value)}
              placeholder="1000"
              className="w-full bg-transparent text-sm font-semibold text-[var(--rota-text)] placeholder:text-[var(--rota-text-soft)]/60 focus:outline-none tabular-nums"
            />
            <span className="ml-2 text-xs font-semibold text-[var(--rota-text-soft)]">km</span>
          </div>

          <button
            type="button"
            onClick={handleRegistrarTrocaOleo}
            className="neu-btn-secondary min-h-[48px] shrink-0 rounded-2xl px-4 text-xs font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
          >
            Troquei agora
          </button>
        </div>

        <div className="mt-3">
          <div
            role="progressbar"
            aria-label="Progresso até a próxima troca de óleo"
            aria-valuemin={0}
            aria-valuemax={configOleo.intervaloKm}
            aria-valuenow={Math.min(kmDesdeTrocaOleo, configOleo.intervaloKm)}
            className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--rota-track)]"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                oleoVencido
                  ? 'bg-[var(--rota-danger)]'
                  : oleoProximo
                    ? 'bg-[var(--rota-warn)]'
                    : 'bg-[var(--rota-accent)]'
              }`}
              style={{ width: `${progressoOleo}%` }}
            />
          </div>

          <p className="mt-2 text-xs tabular-nums">
            {oleoVencido ? (
              <span className="font-semibold text-[var(--rota-danger)]">
                Troca de óleo recomendada agora (
                {formatarKm(kmDesdeTrocaOleo - configOleo.intervaloKm)} km acima)
              </span>
            ) : oleoProximo ? (
              <span className="font-semibold text-[var(--rota-warn)]">
                Atenção: faltam {formatarKm(faltaParaTrocaOleo)} km para trocar o
                óleo
              </span>
            ) : (
              <span className="text-[var(--rota-text-soft)]">
                Faltam{' '}
                <strong className="font-semibold text-[var(--rota-text)]">
                  {formatarKm(faltaParaTrocaOleo)} km
                </strong>{' '}
                para a próxima troca.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Exportar planilha CSV e Backup JSON */}
      <div className="mt-4 pt-4 border-t border-[var(--rota-line)]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <h3 className="section-subtitle">Planilha e backup</h3>
          {mensagemBackup && (
            <span
              className={`text-xs font-semibold ${
                mensagemBackup.erro
                  ? 'text-[var(--rota-danger)]'
                  : 'text-[var(--rota-success)]'
              }`}
            >
              {mensagemBackup.texto}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 min-[350px]:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleExportarCsv}
            className="neu-btn-secondary min-h-[44px] flex items-center justify-center gap-1.5 rounded-2xl px-2 sm:px-3 text-xs font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
          >
            <FileSpreadsheet
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[var(--rota-success)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            CSV
          </button>

          <button
            type="button"
            onClick={handleSalvarBackup}
            className="neu-btn-secondary min-h-[44px] flex items-center justify-center gap-1.5 rounded-2xl px-2 sm:px-3 text-xs font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
          >
            <Download
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[var(--rota-accent)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Backup
          </button>

          <button
            type="button"
            onClick={() => inputRestoreRef.current?.click()}
            className="neu-btn-secondary min-h-[44px] flex items-center justify-center gap-1.5 rounded-2xl px-2 sm:px-3 text-xs font-semibold text-[var(--rota-text)] whitespace-nowrap active:scale-[0.98]"
          >
            <Upload
              className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-[var(--rota-accent)]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Restaurar
          </button>
        </div>

        <input
          ref={inputRestoreRef}
          type="file"
          accept=".json,application/json"
          onChange={handleArquivoBackupSelecionado}
          className="hidden"
          aria-label="Selecionar arquivo de backup JSON"
        />
      </div>
    </section>
  );
};
