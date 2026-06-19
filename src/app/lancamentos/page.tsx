'use client';

import { useState, useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, Trash } from '@phosphor-icons/react';
import { useEntries } from '@/hooks/useEntries';
import BrandLogo from '@/components/BrandLogo';

export default function Lancamentos() {
  const { entries, loading: entriesLoading, fetched, fetchRecentEntries, addEntry, deleteEntry } = useEntries();
  const [type, setType] = useState<'gain' | 'expense'>('gain');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!fetched) {
      fetchRecentEntries(500);
    }
  }, [fetchRecentEntries, fetched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    setLoading(true);
    await addEntry(type, parseFloat(amount), description);
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
          {/* Tabs Nubank Style */}
          <div className="flex bg-[var(--color-card)] p-1.5 rounded-[20px] border border-[var(--color-border)]">
            <button 
              type="button"
              onClick={() => setType('gain')}
              className={`flex-1 py-3 text-[16px] font-medium rounded-[14px] transition-colors flex items-center justify-center space-x-2 ${
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
              className={`flex-1 py-3 text-[16px] font-medium rounded-[14px] transition-colors flex items-center justify-center space-x-2 ${
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
                      className="whitespace-nowrap px-4 py-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-full text-[14px] font-medium text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-primary)] transition-colors active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-5 mt-2 text-[16px] font-bold rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50 ${
                  type === 'gain' 
                    ? 'bg-[var(--color-primary)] text-[#0A0A0A] hover:bg-[#1ea850]' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {loading ? 'Processando...' : 'Adicionar Lançamento'}
              </button>
            </form>
          </section>
        </div>

        {/* Coluna Direita: Resumos e Histórico */}
        <div className="md:col-span-2 space-y-6">
          {/* Resumo */}
          <section className="grid grid-cols-2 gap-4 animate-fade-in-up delay-100">
            <div className="card-premium rounded-3xl p-5">
              <p className="text-[14px] font-medium text-[var(--color-muted)] mb-1">Total de Ganhos</p>
              <p className="text-[20px] font-semibold text-[var(--color-primary)]">R$ {totalGains.toFixed(2).replace('.', ',')}</p>
            </div>
            <div className="card-premium rounded-3xl p-5">
              <p className="text-[14px] font-medium text-[var(--color-muted)] mb-1">Total de Despesas</p>
              <p className="text-[20px] font-semibold text-red-500">R$ {totalExpenses.toFixed(2).replace('.', ',')}</p>
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
                      <div className={`text-[16px] font-semibold ${entry.type === 'gain' ? 'text-[var(--color-primary)]' : 'text-red-500'}`}>
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
