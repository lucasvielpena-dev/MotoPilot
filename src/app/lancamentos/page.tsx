'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  Fuel,
  UtensilsCrossed,
  Wrench,
  MapPin,
  MoreHorizontal,
  Trash2,
  Plus,
  Wallet
} from 'lucide-react';
import { useEntries, type Entry } from '@/hooks/useEntries';

// Platform selection config for gains
const PLATFORMS = [
  { id: 'ifood', name: 'iFood', color: '#EA1D2C' },
  { id: 'aiqfome', name: 'Aiqfome', color: '#FF0066' },
  { id: 'uber', name: 'Uber', color: '#000000' },
  { id: '99', name: '99', color: '#FFB300' },
  { id: 'indrive', name: 'inDrive', color: '#00E676' },
  { id: 'lalamove', name: 'Lalamove', color: '#FF6600' },
  { id: 'shopee', name: 'Shopee', color: '#EE4D2D' },
  { id: 'loggi', name: 'Loggi', color: '#00B0FF' },
  { id: 'outros', name: 'Outros', color: '#F59E0B' }
];

const PLATFORM_LOGOS: Record<string, string> = {
  ifood: 'IF',
  aiqfome: 'AI',
  uber: 'UB',
  99: '99',
  indrive: 'ID',
  lalamove: 'LM',
  shopee: 'SP',
  loggi: 'LG',
  outros: 'OU'
};

const parseEntry = (entry: Entry) => {
  const isGain = entry.type === 'gain';
  const desc = entry.description || '';
  const parts = desc.split(' - ');
  
  let title = isGain ? 'Ganho' : (parts[0] || 'Despesa');
  let platformId = '';
  let subText = '';
  
  if (isGain) {
    const platformCandidate = parts[0] || '';
    const lowerCandidate = platformCandidate.toLowerCase();
    
    const matched = PLATFORMS.find(p => lowerCandidate.includes(p.id));
    if (matched) {
      platformId = matched.id;
      title = matched.name;
      subText = parts.slice(1).join(' - ');
    } else {
      subText = desc;
    }
  } else {
    let paymentMethodVal = 'Dinheiro';
    let notesVal = '';
    if (parts.length === 2) {
      paymentMethodVal = parts[1];
    } else if (parts.length >= 3) {
      paymentMethodVal = parts[1];
      notesVal = parts.slice(2).join(' - ');
    }
    subText = notesVal ? `${paymentMethodVal} · ${notesVal}` : paymentMethodVal;
  }
  
  return { title, platformId, subText };
};

const getStripeColor = (entry: Entry, platformId: string) => {
  if (entry.type === 'gain') {
    const matched = PLATFORMS.find(p => p.id === platformId);
    return matched ? matched.color : '#10B981';
  } else {
    const desc = (entry.description || '').toLowerCase();
    if (desc.includes('combustível') || desc.includes('gasolina') || desc.includes('abastecer')) return '#10B981';
    if (desc.includes('alimentação') || desc.includes('almoço') || desc.includes('lanche')) return '#EF4444';
    if (desc.includes('manutenção') || desc.includes('oficina') || desc.includes('óleo')) return '#6366F1';
    if (desc.includes('estacionamento') || desc.includes('pedágio')) return '#3B82F6';
    return '#F59E0B';
  }
};

export default function Lancamentos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const { entries, loading: entriesLoading, fetched, fetchRecentEntries, addEntry, deleteEntry } = useEntries();

  // Form States
  const [expenseTab, setExpenseTab] = useState<'gasto' | 'ganhos'>('gasto');
  const [category, setCategory] = useState('Alimentação');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [notes, setNotes] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('ifood');
  const [loading, setLoading] = useState(false);
  const [saveSuccessType, setSaveSuccessType] = useState<'gasto' | 'ganhos' | null>(null);

  const amountRef = useRef<HTMLInputElement>(null);

  const quickExpenses = [
    { Icon: Fuel, label: 'Combustível', category: 'Combustível', amount: '50' },
    { Icon: UtensilsCrossed, label: 'Almoço', category: 'Alimentação', amount: '25' },
    { Icon: Wrench, label: 'Manutenção', category: 'Manutenção', amount: '40' }
  ];

  useEffect(() => {
    if (isNew && !saveSuccessType) {
      setTimeout(() => amountRef.current?.focus(), 150);
    }
  }, [isNew, expenseTab, saveSuccessType]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Ganhos' | 'Gastos' | 'Combustível' | 'Alimentação' | 'Manutenção'>('Todos');
  
  const [periodFilter, setPeriodFilter] = useState<'semanal' | 'mensal' | 'todos'>('mensal');
  
  const [todayStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [yesterdayStr] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (!fetched) {
      fetchRecentEntries(500);
    }
  }, [fetchRecentEntries, fetched]);

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setLoading(true);
    // Format description: Category - PaymentMethod - Notes
    const desc = notes ? `${category} - ${paymentMethod} - ${notes}` : `${category} - ${paymentMethod}`;
    const res = await addEntry('expense', parsedAmount, desc);
    setLoading(false);

    if (!res.error) {
      setSaveSuccessType('gasto');
      setAmount('');
      setNotes('');
    }
  };

  const handleSaveGain = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setLoading(true);
    const platformObj = PLATFORMS.find(p => p.id === selectedPlatform);
    const platformName = platformObj ? platformObj.name : 'Outros';
    const desc = notes ? `${platformName} - ${notes}` : platformName;

    const res = await addEntry('gain', parsedAmount, desc);
    setLoading(false);

    if (!res.error) {
      setSaveSuccessType('ganhos');
      setAmount('');
      setNotes('');
    }
  };

  // Filter entries
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const periodFilteredEntries = entries.filter(e => {
    const entryDate = new Date(e.date);
    if (periodFilter === 'semanal') return entryDate >= sevenDaysAgo;
    if (periodFilter === 'mensal') return entryDate >= thirtyDaysAgo;
    return true;
  });

  const filteredEntries = periodFilteredEntries.filter(entry => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Ganhos') return entry.type === 'gain';
    if (activeFilter === 'Gastos') return entry.type === 'expense';
    
    const desc = (entry.description || '').toLowerCase();
    if (activeFilter === 'Combustível') return desc.includes('combustível') || desc.includes('gasolina') || desc.includes('abastecer');
    if (activeFilter === 'Alimentação') return desc.includes('alimentação') || desc.includes('almoço') || desc.includes('lanche');
    if (activeFilter === 'Manutenção') return desc.includes('manutenção') || desc.includes('oficina') || desc.includes('óleo');
    return true;
  });

  const totalGains = periodFilteredEntries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = periodFilteredEntries.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalGains - totalExpenses;

  const getCategoryIcon = (desc: string | null, type?: string) => {
    if (type === 'gain') return Wallet;
    const d = (desc || '').toLowerCase();
    if (d.includes('combustível') || d.includes('gasolina') || d.includes('abastecer')) return Fuel;
    if (d.includes('alimentação') || d.includes('almoço') || d.includes('lanche')) return UtensilsCrossed;
    if (d.includes('manutenção') || d.includes('oficina') || d.includes('óleo')) return Wrench;
    if (d.includes('estacionamento') || d.includes('pedágio')) return MapPin;
    return MoreHorizontal;
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const categoriesList = [
    { name: 'Alimentação', label: 'Alimentação', Icon: UtensilsCrossed, color: 'rose' },
    { name: 'Combustível', label: 'Combustível', Icon: Fuel, color: 'emerald' },
    { name: 'Manutenção', label: 'Manutenção', Icon: Wrench, color: 'indigo' },
    { name: 'Estacionamento', label: 'Estacionamento', Icon: MapPin, color: 'blue' },
    { name: 'Outros', label: 'Outros', Icon: MoreHorizontal, color: 'amber' }
  ];

  return (
    <div className="space-y-3 pb-28 pt-2 px-4 animate-fade-in-up">
      {isNew ? (
        <div className="space-y-3">
          <header className="flex items-center space-x-3 py-2">
            <button 
              onClick={() => router.push('/lancamentos')}
              className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <h1 className="text-[16px] font-extrabold text-foreground font-heading">Novo lançamento</h1>
          </header>

          {saveSuccessType ? (
            <div className="bg-card border border-border rounded-[20px] p-5 text-center space-y-4 shadow-premium animate-fade-in-up">
              <div className="w-14 h-14 bg-card-secondary rounded-full flex items-center justify-center mx-auto border border-border">
                <svg className="w-7 h-7 text-foreground" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-[16px] font-black text-foreground font-heading">
                  {saveSuccessType === 'gasto' ? 'Gasto salvo!' : 'Ganho salvo!'}
                </h3>
                <p className="text-[12px] text-muted font-semibold">Lançamento registrado.</p>
              </div>
              <div className="flex flex-col space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSaveSuccessType(null)}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3.5 rounded-2xl transition-all active:scale-[0.98] text-[14px] cursor-pointer shadow-sm"
                >
                  Novo lançamento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSaveSuccessType(null);
                    router.push('/lancamentos');
                  }}
                  className="w-full bg-card-secondary hover:bg-card-secondary/80 text-foreground font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] text-[14px] border border-border cursor-pointer"
                >
                  Voltar para lista
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex bg-card-secondary/80 p-0.5 rounded-xl border border-border">
                <button 
                  onClick={() => setExpenseTab('gasto')} 
                  className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${expenseTab === 'gasto' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
                >
                  Gasto
                </button>
                <button 
                  onClick={() => setExpenseTab('ganhos')} 
                  className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all cursor-pointer ${expenseTab === 'ganhos' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
                >
                  Ganho
                </button>
              </div>

              {expenseTab === 'ganhos' ? (
                <form onSubmit={handleSaveGain} className="space-y-3">
                  {/* Valor do ganho */}
                  <div className="flex flex-col items-center justify-center py-5 bg-card border border-border rounded-[20px]">
                    <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider mb-1">Valor do ganho</span>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-lg font-bold text-muted">R$</span>
                      <input
                        ref={amountRef}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="bg-transparent border-none text-center focus:outline-none text-[32px] font-black text-foreground w-[200px] font-heading"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  {/* Plataforma */}
                  <div className="bg-card border border-border rounded-[20px] p-3.5 space-y-2.5">
                    <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Origem/Plataforma</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {PLATFORMS.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPlatform(p.id)}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all border ${
                            selectedPlatform === p.id 
                              ? 'bg-primary/10 text-primary border-primary/40' 
                              : 'bg-card-secondary/40 text-foreground border-border hover:bg-card-secondary'
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Detalhes simples */}
                  <div className="bg-card border border-border rounded-[20px] p-3.5 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Data</label>
                      <div className="flex space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setDate(todayStr)}
                          className={`flex-1 py-2 text-[12px] font-extrabold rounded-xl border ${date === todayStr ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card-secondary/40 text-foreground border-border hover:bg-card-secondary/80'}`}
                        >
                          Hoje
                        </button>
                        <button
                          type="button"
                          onClick={() => setDate(yesterdayStr)}
                          className={`flex-1 py-2 text-[12px] font-extrabold rounded-xl border ${date === yesterdayStr ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card-secondary/40 text-foreground border-border hover:bg-card-secondary/80'}`}
                        >
                          Ontem
                        </button>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={e => setDate(e.target.value)}
                          className="flex-1 py-2 px-2.5 bg-card-secondary/40 border border-border rounded-xl text-[12px] font-extrabold text-foreground focus:outline-none focus:border-primary text-center"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Observação</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full py-2.5 px-3 bg-card-secondary/40 border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground placeholder:text-muted/50"
                        placeholder="Ex: Corrida extra, taxa extra, etc."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3.5 rounded-[16px] transition-all active:scale-[0.98] text-[14px] shadow-sm disabled:opacity-50 mt-1 cursor-pointer"
                  >
                    {loading ? 'Salvando...' : 'Salvar Ganho'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSaveExpense} className="space-y-3">
                  {/* Categorias Gasto */}
                  <div className="bg-card border border-border rounded-[20px] p-3.5 space-y-3">
                    <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Categoria</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {categoriesList.map(cat => {
                        const CatIcon = cat.Icon;
                        const isActive = category === cat.name;
                        return (
                          <button
                            key={cat.name}
                            type="button"
                            onClick={() => setCategory(cat.name)}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all active:scale-95 ${
                              isActive 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-border bg-card text-foreground hover:bg-card-secondary'
                            }`}
                          >
                            <CatIcon size={14} />
                            <span className="text-[8px] font-bold tracking-tight">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Atalhos rápidos de valores */}
                    <div className="space-y-1.5 pt-2 border-t border-border/40">
                      <span className="text-[9px] font-extrabold text-muted block uppercase tracking-wider">Valores rápidos</span>
                      <div className="flex space-x-1.5 overflow-x-auto pb-1 hide-scrollbar">
                        {quickExpenses.map((rec, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setCategory(rec.category);
                              setAmount(rec.amount);
                            }}
                            className="flex items-center space-x-1.5 px-3 py-1.5 bg-card-secondary/40 hover:bg-card border border-border rounded-lg text-[10px] font-bold text-foreground transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                          >
                            <rec.Icon size={12} />
                            <span className="font-extrabold">{rec.label} R$ {rec.amount}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Valor do Gasto */}
                  <div className="flex flex-col items-center justify-center py-5 bg-card border border-border rounded-[20px]">
                    <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider mb-1">Valor do gasto</span>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-lg font-bold text-muted">R$</span>
                      <input
                        ref={amountRef}
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="bg-transparent border-none text-center focus:outline-none text-[32px] font-black text-foreground w-[200px] font-heading"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  {/* Detalhes do Gasto */}
                  <div className="bg-card border border-border rounded-[20px] p-3.5 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Data</label>
                      <div className="flex space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setDate(todayStr)}
                          className={`flex-1 py-2 text-[12px] font-extrabold rounded-xl border ${date === todayStr ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card-secondary/40 text-foreground border-border hover:bg-card-secondary/80'}`}
                        >
                          Hoje
                        </button>
                        <button
                          type="button"
                          onClick={() => setDate(yesterdayStr)}
                          className={`flex-1 py-2 text-[12px] font-extrabold rounded-xl border ${date === yesterdayStr ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card-secondary/40 text-foreground border-border hover:bg-card-secondary/80'}`}
                        >
                          Ontem
                        </button>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={e => setDate(e.target.value)}
                          className="flex-1 py-2 px-2.5 bg-card-secondary/40 border border-border rounded-xl text-[12px] font-extrabold text-foreground focus:outline-none focus:border-primary text-center"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Forma de Pagamento</label>
                      <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full py-2.5 px-3 bg-card-secondary/40 border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground cursor-pointer"
                      >
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Cartão de Débito">Cartão de Débito</option>
                        <option value="Pix">Pix</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Observação</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full py-2.5 px-3 bg-card-secondary/40 border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground placeholder:text-muted/50"
                        placeholder="Ex: Posto BR, lanche da tarde, etc."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3.5 rounded-[16px] transition-all active:scale-[0.98] text-[14px] shadow-sm disabled:opacity-50 mt-1 cursor-pointer"
                  >
                    {loading ? 'Salvando...' : 'Salvar Gasto'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3.5 animate-fade-in-up">
          <header className="flex items-center space-x-3 py-2">
            <button 
              onClick={() => router.push('/')}
              className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <h1 className="text-[16px] font-extrabold text-foreground font-heading">Lançamentos</h1>
          </header>

          {/* Cards Resumo Período */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card border border-border rounded-[20px] p-2.5 text-center shadow-sm">
              <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Ganhos</span>
              <span className="text-[13px] font-black text-[#10B981] mt-0.5 block font-heading">R$ {totalGains.toFixed(0)}</span>
            </div>
            <div className="bg-card border border-border rounded-[20px] p-2.5 text-center shadow-sm">
              <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Gastos</span>
              <span className="text-[13px] font-black text-red-500 mt-0.5 block font-heading">R$ {totalExpenses.toFixed(0)}</span>
            </div>
            <div className="bg-card border border-border rounded-[20px] p-2.5 text-center shadow-sm">
              <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Saldo</span>
              <span className={`text-[13px] font-black mt-0.5 block font-heading ${netBalance >= 0 ? 'text-[#1DB96B]' : 'text-red-500'}`}>R$ {netBalance.toFixed(0)}</span>
            </div>
          </div>

          {/* Filtro Período */}
          <div className="flex bg-card-secondary/50 p-0.5 rounded-xl border border-border">
            {(['semanal', 'mensal', 'todos'] as const).map(period => (
              <button
                key={period}
                onClick={() => setPeriodFilter(period)}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all capitalize ${
                  periodFilter === period 
                    ? 'bg-card text-foreground border border-border shadow-sm' 
                    : 'text-muted hover:text-foreground'
                }`}
              >
                {period === 'semanal' ? '7 dias' : period === 'mensal' ? '30 dias' : 'Todos'}
              </button>
            ))}
          </div>

          {/* Filtros de Categoria */}
          <div className="flex overflow-x-auto gap-1.5 py-1 hide-scrollbar">
            {(['Todos', 'Ganhos', 'Gastos', 'Combustível', 'Alimentação', 'Manutenção'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-[11px] font-extrabold rounded-full border whitespace-nowrap transition-all ${
                  activeFilter === filter 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-card text-muted border-border hover:bg-card-secondary'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Listagem */}
          <section className="space-y-2 pt-1">
            {entriesLoading && !fetched ? (
              <div className="bg-card border border-border rounded-[20px] p-8 text-center shadow-sm">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[11px] text-muted font-bold">Buscando lançamentos...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="bg-card border border-border rounded-[20px] p-8 text-center shadow-sm">
                <p className="text-[12px] text-muted font-bold">Nenhum lançamento encontrado.</p>
              </div>
            ) : (
              filteredEntries.map(entry => {
                const CategoryIcon = getCategoryIcon(entry.description, entry.type);
                const { title, platformId, subText } = parseEntry(entry);
                const stripeColor = getStripeColor(entry, platformId);
                const isGain = entry.type === 'gain';

                return (
                  <div
                    key={entry.id}
                    className="bg-card border border-border rounded-[16px] p-3 flex justify-between items-center transition-all overflow-hidden"
                    style={{ borderLeft: `4px solid ${stripeColor}` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-card-secondary border border-border flex items-center justify-center flex-shrink-0">
                        {isGain && platformId && PLATFORM_LOGOS[platformId] ? (
                          <span className="text-[10px] font-bold text-foreground font-heading">{PLATFORM_LOGOS[platformId]}</span>
                        ) : (
                          <CategoryIcon size={16} className="text-muted" />
                        )}
                      </div>
                      <div>
                        <span className="text-[12px] font-black text-foreground block leading-tight">{title}</span>
                        <span className="text-[9px] text-muted font-semibold block mt-0.5">{formatDisplayDate(entry.date)}</span>
                        {subText && <span className="text-[10px] font-medium text-muted/80 block mt-0.5 italic">{subText}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pl-2">
                      <span className={`text-[13px] font-black font-heading ${isGain ? 'text-[#10B981]' : 'text-red-500'}`}>
                        {isGain ? '+' : '-'} R$ {entry.amount.toFixed(2).replace('.', ',')}
                      </span>
                      <button
                        onClick={() => setDeleteId(entry.id)}
                        className="p-1.5 text-muted hover:text-[#EF4444] rounded-lg transition-colors"
                        title="Apagar lançamento"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </section>

          {/* Botão flutuante / rodapé para novo lançamento */}
          <div className="pt-2">
            <button
              onClick={() => router.push('/lancamentos?new=true')}
              className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3 rounded-[20px] transition-all active:scale-[0.98] text-[14px] flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <Plus size={16} />
              <span>Novo lançamento</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-[24px] border border-border overflow-hidden shadow-2xl p-5 space-y-5 animate-fade-in-up">
            <div className="text-center space-y-1">
              <h3 className="text-[16px] font-extrabold text-foreground font-heading">Apagar Lançamento?</h3>
              <p className="text-[12px] text-muted font-semibold">Esta ação é permanente.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 bg-card-secondary hover:bg-card-secondary/80 text-foreground font-bold rounded-2xl border border-border active:scale-[0.98] transition-all text-[13px] cursor-pointer"
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
                className="flex-1 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl active:scale-[0.98] transition-all text-[13px] cursor-pointer shadow-sm"
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
