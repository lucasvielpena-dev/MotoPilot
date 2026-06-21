'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  CaretDown,
  Calendar,
  GasPump,
  ForkKnife,
  Wrench,
  MapPin,
  DotsThree,
  Trash,
  Plus,
  ClipboardText
} from '@phosphor-icons/react';
import { useEntries } from '@/hooks/useEntries';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

export default function Lancamentos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const { user } = useAuth();
  const { entries, loading: entriesLoading, fetched, fetchRecentEntries, addEntry, deleteEntry } = useEntries();

  // Screen 4 (Form) States
  const [expenseTab, setExpenseTab] = useState<'gasto' | 'abastecimento' | 'importar'>('gasto');
  const [category, setCategory] = useState('Alimentação');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [notes, setNotes] = useState('');
  const [pasteText, setPasteText] = useState('');
  const [loading, setLoading] = useState(false);

  // Screen 5 (List) States
  const [listTab, setListTab] = useState<'lista' | 'resumo'>('lista');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);

  // Set today's date as default in form
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  // Sync category with tab
  useEffect(() => {
    if (expenseTab === 'abastecimento') {
      setCategory('Combustível');
    } else if (expenseTab === 'gasto' && category === 'Combustível') {
      setCategory('Alimentação');
    }
  }, [expenseTab, category]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setLoading(true);
    // Para despesas salvamos com tipo 'expense'
    const desc = notes ? `${category} - ${notes}` : category;
    await addEntry('expense', parsedAmount, desc, activeJourneyId);
    setLoading(false);

    // Reset and redirect
    setAmount('');
    setNotes('');
    router.push('/lancamentos');
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;

    // Parseador simples
    const lines = pasteText.split('\n');
    let value = 0.0;
    for (const line of lines) {
      const match = /R\$\s*([0-9]+(?:,[0-9]{2})?)/i.exec(line);
      if (match) {
        value = parseFloat(match[1].replace(',', '.'));
        break;
      }
    }

    if (value > 0) {
      setLoading(true);
      await addEntry('expense', value, 'Gasto Importado', activeJourneyId);
      setLoading(false);
      setPasteText('');
      router.push('/lancamentos');
    }
  };

  // Filtragem e cálculos para Screen 5 (Gastos)
  const expenseEntries = entries.filter(e => e.type === 'expense');
  const totalExpensesSum = expenseEntries.reduce((acc, curr) => acc + curr.amount, 0);

  const getCategoryIcon = (desc: string | null) => {
    const d = (desc || '').toLowerCase();
    if (d.includes('combustível') || d.includes('gasolina') || d.includes('abastecer')) {
      return { Icon: GasPump, bg: 'bg-emerald-50', color: 'text-emerald-500' };
    }
    if (d.includes('alimentação') || d.includes('almoço') || d.includes('lanche') || d.includes('comer')) {
      return { Icon: ForkKnife, bg: 'bg-rose-50', color: 'text-rose-500' };
    }
    if (d.includes('manutenção') || d.includes('oficina') || d.includes('óleo') || d.includes('conserto')) {
      return { Icon: Wrench, bg: 'bg-indigo-50', color: 'text-indigo-500' };
    }
    if (d.includes('estacionamento') || d.includes('parar') || d.includes('pedágio')) {
      return { Icon: MapPin, bg: 'bg-blue-50', color: 'text-blue-500' };
    }
    return { Icon: DotsThree, bg: 'bg-amber-50', color: 'text-amber-500' };
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6 pb-28 pt-2">
      {isNew ? (
        /* SCREEN 4: NOVO GASTO */
        <div className="space-y-6">
          {/* Header */}
          <header className="flex justify-between items-center bg-white px-2 py-3 border-b border-neutral-100/50 -mx-4">
            <button 
              onClick={() => router.push('/lancamentos')}
              className="w-10 h-10 flex items-center justify-center text-neutral-800 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} weight="bold" />
            </button>
            <h1 className="text-[18px] font-extrabold text-neutral-800">Novo gasto</h1>
            <div className="w-10 h-10" /> {/* Spacer */}
          </header>

          {/* Tabs */}
          <div className="flex bg-neutral-100/80 p-1 rounded-2xl border border-neutral-200/40">
            <button 
              onClick={() => setExpenseTab('gasto')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${expenseTab === 'gasto' ? 'bg-white text-neutral-900 border border-neutral-200/30 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Gasto
            </button>
            <button 
              onClick={() => setExpenseTab('abastecimento')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${expenseTab === 'abastecimento' ? 'bg-white text-neutral-900 border border-neutral-200/30 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Abastecimento
            </button>
            <button 
              onClick={() => setExpenseTab('importar')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${expenseTab === 'importar' ? 'bg-white text-neutral-900 border border-neutral-200/30 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Importar
            </button>
          </div>

          {/* Form */}
          {expenseTab !== 'importar' ? (
            <form onSubmit={handleSave} className="space-y-5 bg-white border border-neutral-100/60 rounded-[32px] p-5 shadow-[0_4px_16px_rgba(17,17,17,0.01)]">
              {/* Tipo de gasto dropdown */}
              {expenseTab !== 'abastecimento' && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-neutral-400 block uppercase">Tipo de gasto</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full p-4 pr-10 bg-neutral-50 border border-neutral-200/50 rounded-2xl focus:outline-none focus:border-[#EA1D2C] appearance-none text-[15px] font-bold text-neutral-700 cursor-pointer"
                    >
                      <option value="Alimentação">Alimentação</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Estacionamento">Estacionamento</option>
                      <option value="Combustível">Combustível</option>
                      <option value="Outros">Outros</option>
                    </select>
                    <CaretDown size={18} weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Valor Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-neutral-400 block uppercase">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full p-4 bg-neutral-50 border border-neutral-200/50 rounded-2xl focus:outline-none focus:border-[#EA1D2C] text-[20px] font-extrabold text-neutral-800"
                  placeholder="50,00"
                />
              </div>

              {/* Data Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-neutral-400 block uppercase">Data</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-4 pr-10 bg-neutral-50 border border-neutral-200/50 rounded-2xl focus:outline-none focus:border-[#EA1D2C] text-[15px] font-bold text-neutral-700 cursor-pointer"
                  />
                  <Calendar size={18} weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Método de pagamento dropdown */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-neutral-400 block uppercase">Método de pagamento</label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full p-4 pr-10 bg-neutral-50 border border-neutral-200/50 rounded-2xl focus:outline-none focus:border-[#EA1D2C] appearance-none text-[15px] font-bold text-neutral-700 cursor-pointer"
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Pix">Pix</option>
                  </select>
                  <CaretDown size={18} weight="bold" className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>

              {/* Observação Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-neutral-400 block uppercase">Observação (opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-4 bg-neutral-50 border border-neutral-200/50 rounded-2xl focus:outline-none focus:border-[#EA1D2C] text-[15px] font-bold text-neutral-700"
                  placeholder="Posto Ipiranga"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-extrabold py-4.5 rounded-2xl transition-all active:scale-[0.98] text-[16px] shadow-md cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? 'Salvando...' : 'Salvar gasto'}
              </button>
            </form>
          ) : (
            /* Import Tab */
            <form onSubmit={handleImport} className="space-y-5 bg-white border border-neutral-100/60 rounded-[32px] p-5 shadow-[0_4px_16px_rgba(17,17,17,0.01)]">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-neutral-400 block uppercase flex items-center space-x-1.5">
                  <ClipboardText size={16} />
                  <span>Dados do comprovante/recibo</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  className="w-full p-4 bg-neutral-50 border border-neutral-200/50 rounded-2xl focus:outline-none focus:border-[#EA1D2C] text-[14px] font-medium text-neutral-700 resize-none"
                  placeholder={`Cole o texto do comprovante aqui.\nExemplo:\nAbastecimento Posto BR\nValor: R$ 45,00`}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !pasteText.trim()}
                className="w-full bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-extrabold py-4.5 rounded-2xl transition-all active:scale-[0.98] text-[16px] shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Salvar gasto importado'}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* SCREEN 5: GASTOS (LIST VIEW) */
        <div className="space-y-6">
          {/* Header */}
          <header className="flex justify-between items-center bg-white px-2 py-3 border-b border-neutral-100/50 -mx-4">
            <button 
              onClick={() => router.push('/')}
              className="w-10 h-10 flex items-center justify-center text-neutral-800 hover:bg-neutral-50 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} weight="bold" />
            </button>
            <h1 className="text-[18px] font-extrabold text-neutral-800">Gastos</h1>
            <div className="w-10 h-10" /> {/* Spacer */}
          </header>

          {/* Tabs */}
          <div className="flex bg-neutral-100/80 p-1 rounded-2xl border border-neutral-200/40">
            <button 
              onClick={() => setListTab('lista')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${listTab === 'lista' ? 'bg-white text-neutral-900 border border-neutral-200/30 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Lista
            </button>
            <button 
              onClick={() => setListTab('resumo')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${listTab === 'resumo' ? 'bg-white text-neutral-900 border border-neutral-200/30 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              Resumo
            </button>
          </div>

          {listTab === 'lista' ? (
            <>
              {/* Period Dropdown */}
              <div className="flex justify-center">
                <div className="bg-white border border-neutral-150 rounded-2xl px-4 py-2 text-[13px] font-bold text-neutral-700 flex items-center space-x-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:bg-neutral-50">
                  <span>Maio/2025</span>
                  <CaretDown size={16} className="text-neutral-400" />
                </div>
              </div>

              {/* Total display card */}
              <div className="bg-[#FFF1EE] border border-[#EA1D2C]/10 rounded-[28px] p-5 shadow-[0_4px_16px_rgba(234,29,44,0.02)] flex items-center justify-between">
                <span className="text-[13px] font-extrabold text-neutral-500 tracking-wide uppercase">Total de gastos</span>
                <span className="text-[22px] font-extrabold text-[#EA1D2C]">R$ {totalExpensesSum.toFixed(2).replace('.', ',')}</span>
              </div>

              {/* Scrollable list */}
              <section className="space-y-3">
                {entriesLoading && !fetched ? (
                  <div className="bg-white border border-neutral-100/85 rounded-3xl p-8 text-center">
                    <div className="w-6 h-6 border-2 border-[#EA1D2C] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-[14px] text-neutral-400">Buscando seus gastos...</p>
                  </div>
                ) : expenseEntries.length === 0 ? (
                  <div className="bg-white border border-neutral-100/85 rounded-3xl p-8 text-center">
                    <p className="text-[14px] text-neutral-400">Nenhum gasto registrado este mês.</p>
                  </div>
                ) : (
                  expenseEntries.map((entry) => {
                    const styling = getCategoryIcon(entry.description);
                    const CategoryIcon = styling.Icon;
                    return (
                      <div 
                        key={entry.id}
                        className="bg-white border border-neutral-100/80 hover:border-neutral-200/50 rounded-[24px] p-4 flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.005)]"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl ${styling.bg} flex items-center justify-center`}>
                            <CategoryIcon size={22} className={styling.color} />
                          </div>
                          <div>
                            <span className="text-[15px] font-bold text-neutral-800 block">
                              {entry.description?.split(' - ')[0] || 'Despesa'}
                            </span>
                            <span className="text-[12px] font-semibold text-neutral-400 mt-0.5 block">
                              {formatDisplayDate(entry.date)} {entry.description?.split(' - ')[1] && `| ${entry.description?.split(' - ')[1]}`}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className="text-[16px] font-extrabold text-neutral-800">
                            R$ {entry.amount.toFixed(2).replace('.', ',')}
                          </span>
                          
                          <button 
                            onClick={() => setDeleteId(entry.id)}
                            className="p-1.5 text-neutral-400 hover:text-[#EA1D2C] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Apagar lançamento"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>

              {/* Bottom New Expense Trigger button */}
              <div className="pt-2">
                <button
                  onClick={() => router.push('/lancamentos?new=true')}
                  className="w-full bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-extrabold py-4.5 rounded-2xl transition-all active:scale-[0.98] text-[15px] flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                >
                  <Plus size={18} weight="bold" />
                  <span>Novo gasto</span>
                </button>
              </div>
            </>
          ) : (
            /* Resumo Tab content */
            <div className="bg-white border border-neutral-100/85 rounded-3xl p-8 text-center space-y-3">
              <p className="text-[14px] font-bold text-neutral-700">Resumo financeiro de gastos</p>
              <p className="text-[12px] text-neutral-400">Consulte os relatórios para ver o detalhamento percentual das suas despesas e faturamento.</p>
              <button 
                onClick={() => router.push('/relatorios')}
                className="mt-2 bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-bold px-5 py-3 rounded-2xl text-[13px] active:scale-95 transition-all cursor-pointer"
              >
                Abrir Relatórios
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-white w-full max-w-sm rounded-[32px] border border-neutral-100 overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-[18px] font-extrabold text-neutral-800">Apagar Lançamento?</h3>
              <p className="text-[13px] text-neutral-400 font-semibold leading-relaxed">
                Esta ação removerá permanentemente este lançamento do seu histórico e relatórios.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-bold rounded-2xl border border-neutral-200/50 active:scale-[0.98] transition-all text-[14px] cursor-pointer"
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
                className="flex-1 py-3.5 bg-[#EA1D2C] hover:bg-[#ff3b4b] text-white font-bold rounded-2xl active:scale-[0.98] transition-all text-[14px] cursor-pointer shadow-sm"
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
