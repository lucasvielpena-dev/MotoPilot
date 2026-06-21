'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowDownRight, ArrowUpRight, Trash, CheckCircle, Lightning, ClipboardText } from '@phosphor-icons/react';
import { useEntries } from '@/hooks/useEntries';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import BrandLogo from '@/components/BrandLogo';

interface ParsedRide {
  description: string;
  netAmount: number;
  grossAmount: number;
  amount: number;
  distance: number;
  duration: number;
}

function parseCopiedRide(text: string): ParsedRide | null {
  if (!text || !text.trim()) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const headerRegex = /corrida registrada|corrida finalizada|resumo da corrida/i;
  
  let description = '';
  for (const line of lines) {
    if (headerRegex.test(line)) continue;
    if (/R\$/i.test(line)) continue;
    if (/[0-9]+(?:,[0-9]+)?\s*(?:km|min|metro|hora|h|m)/i.test(line)) continue;
    if (/lucro|estimado|ganho|valor|total/i.test(line)) continue;
    description = line;
    break;
  }
  if (!description) {
    description = 'Uber Moto';
  }

  const moneyRegex = /R\$\s*([0-9]+(?:,[0-9]{2})?)/gi;
  const monetaryValues: number[] = [];
  let match;
  while ((match = moneyRegex.exec(text)) !== null) {
    const val = parseFloat(match[1].replace(',', '.'));
    if (!isNaN(val)) {
      monetaryValues.push(val);
    }
  }

  let netAmount = 0;
  let grossAmount = 0;

  if (monetaryValues.length >= 2) {
    const lucroIdx = lines.findIndex(l => /lucro|estimado|líquido/i.test(l));
    if (lucroIdx !== -1) {
      const remainingText = lines.slice(lucroIdx).join('\n');
      const netMatch = /R\$\s*([0-9]+(?:,[0-9]{2})?)/i.exec(remainingText);
      if (netMatch) {
        netAmount = parseFloat(netMatch[1].replace(',', '.'));
      }
    }
    
    if (!netAmount) {
      netAmount = Math.min(...monetaryValues);
      grossAmount = Math.max(...monetaryValues);
    } else {
      grossAmount = monetaryValues.find(v => v !== netAmount) || monetaryValues[0];
    }
  } else if (monetaryValues.length === 1) {
    netAmount = monetaryValues[0];
    grossAmount = monetaryValues[0];
  }

  const kmMatch = /([0-9]+(?:,[0-9]+)?)\s*km/i.exec(text);
  const distance = kmMatch ? parseFloat(kmMatch[1].replace(',', '.')) : 0;

  const minMatch = /([0-9]+)\s*min/i.exec(text);
  const duration = minMatch ? parseInt(minMatch[1], 10) : 0;

  return {
    description,
    netAmount,
    grossAmount,
    amount: netAmount || grossAmount,
    distance,
    duration
  };
}

export default function Lancamentos() {
  const { user } = useAuth();
  const { entries, loading: entriesLoading, fetched, fetchRecentEntries, addEntry, deleteEntry } = useEntries();
  const [type, setType] = useState<'gain' | 'expense'>('gain');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);

  // Estados do Modo de Importação Rápida
  const [inputMode, setInputMode] = useState<'manual' | 'fast_paste'>('manual');
  const [pasteText, setPasteText] = useState('');
  const [parsedRide, setParsedRide] = useState<ParsedRide | null>(null);
  const [selectedAmountType, setSelectedAmountType] = useState<'net' | 'gross'>('net');

  const handlePasteChange = (text: string) => {
    setPasteText(text);
    const parsed = parseCopiedRide(text);
    if (parsed && (parsed.netAmount > 0 || parsed.grossAmount > 0)) {
      setParsedRide(parsed);
      setSelectedAmountType('net');
    } else {
      setParsedRide(null);
    }
  };

  const handleFastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedRide) return;
    const amountToSave = selectedAmountType === 'net' ? parsedRide.netAmount : parsedRide.grossAmount;
    if (amountToSave <= 0) return;

    setLoading(true);
    await addEntry('gain', amountToSave, parsedRide.description, activeJourneyId);
    setLoading(false);
    setPasteText('');
    setParsedRide(null);
  };

  useEffect(() => {
    if (!fetched) {
      fetchRecentEntries(500);
    }
  }, [fetchRecentEntries, fetched]);

  const fetchActiveJourneyId = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('journeys')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();
    setActiveJourneyId(data?.id ?? null);
  }, [user]);

  useEffect(() => {
    fetchActiveJourneyId();
  }, [fetchActiveJourneyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    setLoading(true);
    await addEntry(type, parsed, description, activeJourneyId);
    setLoading(false);
    setAmount('');
    setDescription('');
  };

  const totalGains = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = entries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-4 space-y-6 pb-24">
      <header className="mb-6">
        <h1 className="text-[20px] font-semibold tracking-tight text-[var(--color-foreground)]">Lançamentos</h1>
        <p className="text-[14px] text-[var(--color-muted)] mt-1">Gerencie seus ganhos e gastos</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Coluna Esquerda: Formulário e Tabs */}
        <div className="md:col-span-1 space-y-6">
          {/* Alternar Modo: Manual vs Importação Rápida */}
          <div className="flex bg-[var(--color-card)] p-1 rounded-xl border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                inputMode === 'manual'
                  ? 'bg-[var(--color-card-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] shadow-sm'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }`}
            >
              <span>Manual</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('fast_paste')}
              className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                inputMode === 'fast_paste'
                  ? 'bg-[var(--color-card-secondary)] text-[var(--color-foreground)] border border-[var(--color-border)] shadow-sm'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
              }`}
            >
              <Lightning size={16} weight="fill" className="text-[var(--color-primary)]" />
              <span>Colar Corrida</span>
            </button>
          </div>

          {inputMode === 'manual' ? (
            <>
              {/* Tabs Nubank Style */}
              <div className="flex bg-[var(--color-card)] p-1.5 rounded-[20px] border border-[var(--color-border)]">
                <button 
                  type="button"
                  onClick={() => setType('gain')}
                  className={`flex-1 py-3 text-[16px] font-medium rounded-[14px] transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
                    type === 'gain' 
                      ? 'bg-[var(--color-primary)] text-[#0A0A0A] shadow-md' 
                      : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
                  }`}
                >
                  <ArrowUpRight size={20} weight="bold" />
                  <span>Ganhos</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-3 text-[16px] font-medium rounded-[14px] transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
                    type === 'expense' 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
                  }`}
                >
                  <ArrowDownRight size={20} weight="bold" />
                  <span>Despesas</span>
                </button>
              </div>

              {/* Formulário Novo Design */}
              <section className="card-premium p-5 rounded-3xl animate-fade-in-up">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-medium text-[var(--color-muted)] mb-2">Valor (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full p-5 bg-[var(--color-card-secondary)] border border-[var(--color-border)] rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[24px] font-semibold text-[var(--color-foreground)]"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-[14px] font-medium text-[var(--color-muted)] mb-2">Descrição</label>
                    <input 
                      type="text" 
                      required
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full p-5 bg-[var(--color-card-secondary)] border border-[var(--color-border)] rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[16px] text-[var(--color-foreground)] mb-3"
                      placeholder={type === 'gain' ? "Ex: Uber, 99, Particular" : "Ex: Gasolina, Almoço"}
                    />
                    
                    {/* Chips de Categoria */}
                    <div className="flex overflow-x-auto pb-2 space-x-2 hide-scrollbar">
                      {(type === 'gain' 
                        ? ['Uber', '99', 'iFood', 'Particular', 'Indrive', 'aiqfome', 'Maxim'] 
                        : ['Combustível', 'Alimentação', 'Manutenção', 'Óleo', 'Plataforma', 'Multa']
                      ).map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setDescription(chip)}
                          className="whitespace-nowrap px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-full text-[14px] font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-primary)] transition-colors active:scale-95 cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-5 mt-2 text-[16px] font-bold rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer ${
                      type === 'gain' 
                        ? 'bg-[var(--color-primary)] text-[#0A0A0A] hover:bg-[#1ea850]' 
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {loading ? 'Processando...' : 'Adicionar Lançamento'}
                  </button>
                </form>
              </section>
            </>
          ) : (
            <section className="card-premium p-5 rounded-3xl animate-fade-in-up space-y-4">
              <form onSubmit={handleFastSubmit} className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-[var(--color-muted)] mb-2 flex items-center space-x-1">
                    <ClipboardText size={16} />
                    <span>Cole os dados da corrida registrada</span>
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={pasteText}
                    onChange={e => handlePasteChange(e.target.value)}
                    className="w-full p-4 bg-[var(--color-card-secondary)] border border-[var(--color-border)] rounded-2xl focus:outline-none focus:border-[var(--color-primary)] transition-colors text-[14px] text-[var(--color-foreground)] resize-none"
                    placeholder={`Exemplo:\nCorrida registrada\nUber Moto\nR$ 24,50\n7,4 km\n18 min\nLucro estimado:\nR$ 21,80`}
                  />
                </div>

                {parsedRide && (
                  <div className="bg-[var(--color-card-secondary)] border border-[var(--color-border)] rounded-2xl p-4 space-y-4 animate-fade-in-up">
                    <div className="flex items-center space-x-3">
                      <BrandLogo name={parsedRide.description} type="gain" className="w-12 h-12 flex-shrink-0" />
                      <div>
                        <p className="text-[16px] font-semibold text-[var(--color-foreground)]">{parsedRide.description}</p>
                        <p className="text-[12px] text-[var(--color-muted)]">Corrida detectada</p>
                      </div>
                    </div>

                    {(parsedRide.distance > 0 || parsedRide.duration > 0) && (
                      <div className="grid grid-cols-2 gap-3 bg-[var(--color-background)] p-3 rounded-xl border border-[var(--color-border)]">
                        {parsedRide.distance > 0 && (
                          <div>
                            <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider block font-semibold">Distância</span>
                            <span className="text-[15px] font-bold text-[var(--color-foreground)]">{parsedRide.distance.toFixed(1).replace('.', ',')} km</span>
                          </div>
                        )}
                        {parsedRide.duration > 0 && (
                          <div>
                            <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider block font-semibold">Duração</span>
                            <span className="text-[15px] font-bold text-[var(--color-foreground)]">{parsedRide.duration} min</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-[12px] font-medium text-[var(--color-muted)] block">Valor para registrar:</span>
                      <div className="grid grid-cols-1 gap-2">
                        {parsedRide.netAmount > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedAmountType('net')}
                            className={`flex justify-between items-center p-3 rounded-xl border transition-all text-left cursor-pointer ${
                              selectedAmountType === 'net'
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-foreground)]'
                                : 'border-[var(--color-border)] hover:bg-[var(--color-background)] text-[var(--color-muted)]'
                            }`}
                          >
                            <div>
                              <span className="text-[12px] font-medium block opacity-70">Lucro Estimado (Recomendado)</span>
                              <span className="text-[15px] font-bold text-[var(--color-foreground)]">R$ {parsedRide.netAmount.toFixed(2).replace('.', ',')}</span>
                            </div>
                            {selectedAmountType === 'net' && <CheckCircle size={20} weight="fill" className="text-[var(--color-primary)]" />}
                          </button>
                        )}

                        {parsedRide.grossAmount > 0 && parsedRide.grossAmount !== parsedRide.netAmount && (
                          <button
                            type="button"
                            onClick={() => setSelectedAmountType('gross')}
                            className={`flex justify-between items-center p-3 rounded-xl border transition-all text-left cursor-pointer ${
                              selectedAmountType === 'gross'
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-foreground)]'
                                : 'border-[var(--color-border)] hover:bg-[var(--color-background)] text-[var(--color-muted)]'
                            }`}
                          >
                            <div>
                              <span className="text-[12px] font-medium block opacity-70">Valor Bruto Total</span>
                              <span className="text-[15px] font-bold text-[var(--color-foreground)]">R$ {parsedRide.grossAmount.toFixed(2).replace('.', ',')}</span>
                            </div>
                            {selectedAmountType === 'gross' && <CheckCircle size={20} weight="fill" className="text-[var(--color-primary)]" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading || !parsedRide}
                  className={`w-full py-5 text-[16px] font-bold rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer bg-[var(--color-primary)] text-[#0A0A0A] hover:bg-[#1ea850]`}
                >
                  {loading ? 'Processando...' : 'Importar Corrida ⚡'}
                </button>
              </form>
            </section>
          )}
        </div>

        {/* Coluna Direita: Resumos e Histórico */}
        <div className="md:col-span-2 space-y-6">
          {/* Resumo */}
          <section className="grid grid-cols-2 gap-4 animate-fade-in-up delay-100">
            <div className="card-premium rounded-3xl p-5">
              <p className="text-[14px] font-medium text-[var(--color-muted)] mb-1">Total de Ganhos</p>
              <p className="text-[20px] font-semibold text-[var(--color-gain)]">R$ {totalGains.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="card-premium rounded-3xl p-5">
              <p className="text-[14px] font-medium text-[var(--color-muted)] mb-1">Total de Despesas</p>
              <p className="text-[20px] font-semibold text-[var(--color-expense)]">R$ {totalExpenses.toFixed(2).replace('.', ',')}</p>
            </div>
          </section>

          {/* Lista de Transações */}
          <section className="space-y-4">
            <h2 className="text-[20px] font-semibold text-[var(--color-foreground)] px-1">Histórico</h2>
            
            <div className="space-y-3">
              {entriesLoading && !fetched ? (
                <div className="card-premium rounded-3xl p-6 text-center">
                  <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-[14px] text-[var(--color-muted)]">Carregando lançamentos...</p>
                </div>
              ) : entries.length === 0 ? (
                <div className="card-premium rounded-3xl p-6 text-center">
                  <p className="text-[14px] text-[var(--color-muted)]">Nenhum lançamento encontrado.</p>
                </div>
              ) : (
                entries.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className="flex justify-between items-center p-5 card-premium rounded-3xl group animate-fade-in-up"
                  style={{ animationDelay: `${200 + index * 50}ms` }}
                >
                    <div className="flex items-center space-x-4">
                      <BrandLogo name={entry.description} type={entry.type} className="w-12 h-12 flex-shrink-0" />
                      <div>
                        <p className="text-[16px] font-medium text-[var(--color-foreground)]">{entry.description}</p>
                        <p className="text-[14px] text-[var(--color-muted)] mt-1">{new Date(entry.date).toLocaleDateString()} {new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`text-[16px] font-semibold ${entry.type === 'gain' ? 'text-[var(--color-gain)]' : 'text-[var(--color-expense)]'}`}>
                        {entry.type === 'gain' ? '+ ' : '- '}R$ {entry.amount.toFixed(2).replace('.', ',')}
                      </div>
                      <button 
                        onClick={() => setDeleteId(entry.id)}
                        className="p-2 text-neutral-500 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 max-md:opacity-100 cursor-pointer"
                        title="Apagar lançamento"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-[var(--color-background)] w-full max-w-sm rounded-[32px] border border-[var(--color-border)] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in-100 sm:zoom-in-95 p-6 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-[20px] font-semibold text-[var(--color-foreground)]">Apagar Lançamento?</h3>
              <p className="text-[14px] text-[var(--color-muted)]">
                Esta ação não pode ser desfeita. O lançamento será removido permanentemente.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-4 bg-[var(--color-card-secondary)] hover:bg-[var(--color-border)] text-[var(--color-foreground)] font-semibold rounded-2xl border border-[var(--color-border)] active:scale-[0.98] transition-all text-[15px] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  if (deleteId) {
                    await deleteEntry(deleteId);
                    setDeleteId(null);
                  }
                }}
                className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl active:scale-[0.98] transition-all text-[15px] cursor-pointer"
              >
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
