'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  ChevronDown,
  Calendar,
  Fuel,
  ForkKnife,
  Wrench,
  MapPin,
  MoreHorizontal,
  Trash2,
  Plus,
  ClipboardList,
  Upload,
  FileSpreadsheet,
  ChevronUp,
  DollarSign
} from 'lucide-react';
import { useEntries } from '@/hooks/useEntries';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

export default function Lancamentos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const { user } = useAuth();
  const { entries, loading: entriesLoading, fetched, fetchRecentEntries, addEntry, deleteEntry } = useEntries();

  // Screen 4 (Form) States
  const [expenseTab, setExpenseTab] = useState<'gasto' | 'ganhos' | 'importar'>('gasto');
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
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Combustível' | 'Alimentação' | 'Manutenção' | 'Estacionamento' | 'Outros'>('Todos');
  const [periodFilter, setPeriodFilter] = useState<'semanal' | 'mensal' | 'personalizado'>('mensal');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [todayStr, setTodayStr] = useState('');
  const [yesterdayStr, setYesterdayStr] = useState('');
  const [showFinancialSummary, setShowFinancialSummary] = useState(false);

  // Handle quick action fuel category
  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat === 'Combustivel') {
      setCategory('Combustível');
      setExpenseTab('gasto');
    }
  }, [searchParams]);

  // Set today's date as default in form dynamically
  useEffect(() => {
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];
    setDate(todayISO);
    setTodayStr(todayISO);

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];
    setYesterdayStr(yesterdayISO);
  }, []);

  // Sync category with tab
  useEffect(() => {
    if (expenseTab === 'gasto' && category === 'Combustível') {
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
    const desc = notes ? `${category} - ${notes}` : category;
    await addEntry('expense', parsedAmount, desc, activeJourneyId);
    setLoading(false);

    setAmount('');
    setNotes('');
    router.push('/lancamentos');
  };

  const handleSaveGain = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setLoading(true);
    const desc = notes ? `Ganho - ${notes}` : 'Ganho';
    await addEntry('gain', parsedAmount, desc, activeJourneyId);
    setLoading(false);

    setAmount('');
    setNotes('');
    router.push('/lancamentos');
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;

    const lines = pasteText.split('\n').filter(l => l.trim());
    let entries: { type: 'gain' | 'expense'; amount: number; desc: string }[] = [];

    // Try CSV format: Data,Tipo,Valor
    const csvHeader = lines[0]?.toLowerCase() || '';
    if (csvHeader.includes(',') && (csvHeader.includes('data') || csvHeader.includes('tipo') || csvHeader.includes('valor'))) {
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 3) {
          const type = parts[1].toLowerCase().includes('ganho') || parts[1].toLowerCase().includes('corrida') ? 'gain' : 'expense';
          const amount = parseFloat(parts[2].replace('R$', '').replace('.', '').replace(',', '.').trim());
          if (!isNaN(amount) && amount > 0) {
            entries.push({ type, amount, desc: parts[1].trim() || (type === 'gain' ? 'Ganho Importado' : 'Gasto Importado') });
          }
        }
      }
    }

    // Try JSON format
    if (entries.length === 0) {
      try {
        const jsonData = JSON.parse(pasteText);
        const items = Array.isArray(jsonData) ? jsonData : [jsonData];
        for (const item of items) {
          const type = (item.tipo || item.type || '').toLowerCase().includes('ganho') || (item.tipo || item.type || '').toLowerCase().includes('corrida') ? 'gain' : 'expense';
          const amount = parseFloat(String(item.valor || item.value || item.amount || 0).replace('R$', '').replace('.', '').replace(',', '.'));
          if (!isNaN(amount) && amount > 0) {
            entries.push({ type, amount, desc: item.descricao || item.desc || item.description || (type === 'gain' ? 'Ganho Importado' : 'Gasto Importado') });
          }
        }
      } catch {
        // Not JSON, try line-by-line
      }
    }

    // Fallback: simple line-by-line R$ parsing
    if (entries.length === 0) {
      for (const line of lines) {
        const match = /R\$\s*([0-9]+(?:,[0-9]{2})?)/i.exec(line);
        if (match) {
          const value = parseFloat(match[1].replace(',', '.'));
          if (value > 0) {
            entries.push({ type: 'expense', amount: value, desc: 'Gasto Importado' });
          }
        }
      }
    }

    if (entries.length > 0) {
      setLoading(true);
      for (const entry of entries) {
        await addEntry(entry.type, entry.amount, entry.desc, activeJourneyId);
      }
      setLoading(false);
      setPasteText('');
      router.push('/lancamentos');
    }
  };

  // Filtragem e cálculos para Screen 5 (Gastos)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const periodFilteredEntries = entries.filter(e => {
    if (e.type !== 'expense') return false;
    const entryDate = new Date(e.date);
    if (periodFilter === 'semanal') return entryDate >= sevenDaysAgo;
    if (periodFilter === 'mensal') return entryDate >= thirtyDaysAgo;
    if (periodFilter === 'personalizado' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      return entryDate >= start && entryDate <= end;
    }
    return true;
  });

  const expenseEntries = periodFilteredEntries;
  const totalExpensesSum = expenseEntries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalGains = entries.filter(e => e.type === 'gain').reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalGains - totalExpensesSum;

  const filteredEntries = expenseEntries.filter(entry => {
    if (activeFilter === 'Todos') return true;
    const desc = (entry.description || '').toLowerCase();
    if (activeFilter === 'Combustível') return desc.includes('combustível') || desc.includes('gasolina') || desc.includes('abastecer');
    if (activeFilter === 'Alimentação') return desc.includes('alimentação') || desc.includes('almoço') || desc.includes('lanche') || desc.includes('comer');
    if (activeFilter === 'Manutenção') return desc.includes('manutenção') || desc.includes('oficina') || desc.includes('óleo') || desc.includes('conserto');
    if (activeFilter === 'Estacionamento') return desc.includes('estacionamento') || desc.includes('parar') || desc.includes('pedágio');
    if (activeFilter === 'Outros') return !desc.includes('combustível') && !desc.includes('gasolina') && !desc.includes('abastecer') && !desc.includes('alimentação') && !desc.includes('almoço') && !desc.includes('lanche') && !desc.includes('comer') && !desc.includes('manutenção') && !desc.includes('oficina') && !desc.includes('óleo') && !desc.includes('conserto') && !desc.includes('estacionamento') && !desc.includes('parar') && !desc.includes('pedágio');
    return true;
  });

  const totalFilteredSum = filteredEntries.reduce((acc, curr) => acc + curr.amount, 0);
  const uniqueDays = new Set(expenseEntries.map(e => e.date)).size || 1;
  const dailyAverage = totalExpensesSum / uniqueDays;
  const maxExpense = expenseEntries.reduce((max, curr) => curr.amount > max ? curr.amount : max, 0);

  // Category Bar Chart data aggregation
  const categoryTotals = {
    Alimentação: 0,
    Combustível: 0,
    Manutenção: 0,
    Estacionamento: 0,
    Outros: 0,
  };
  expenseEntries.forEach(entry => {
    const desc = (entry.description || '').toLowerCase();
    if (desc.includes('combustível') || desc.includes('gasolina') || desc.includes('abastecer')) {
      categoryTotals.Combustível += entry.amount;
    } else if (desc.includes('alimentação') || desc.includes('almoço') || desc.includes('lanche') || desc.includes('comer')) {
      categoryTotals.Alimentação += entry.amount;
    } else if (desc.includes('manutenção') || desc.includes('oficina') || desc.includes('óleo') || desc.includes('conserto')) {
      categoryTotals.Manutenção += entry.amount;
    } else if (desc.includes('estacionamento') || desc.includes('parar') || desc.includes('pedágio')) {
      categoryTotals.Estacionamento += entry.amount;
    } else {
      categoryTotals.Outros += entry.amount;
    }
  });

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  })).filter(item => item.value > 0);

  const getCategoryIcon = (desc: string | null) => {
    const d = (desc || '').toLowerCase();
    if (d.includes('combustível') || d.includes('gasolina') || d.includes('abastecer')) {
      return { Icon: Fuel, bg: 'bg-emerald-50', color: 'text-emerald-500' };
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
    return { Icon: MoreHorizontal, bg: 'bg-amber-50', color: 'text-amber-500' };
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const categoriesList = [
    { name: 'Alimentação', label: 'Alimentação', Icon: ForkKnife, color: 'rose' },
    { name: 'Combustível', label: 'Combustível', Icon: Fuel, color: 'emerald' },
    { name: 'Manutenção', label: 'Manutenção', Icon: Wrench, color: 'indigo' },
    { name: 'Estacionamento', label: 'Estacionamento', Icon: MapPin, color: 'blue' },
    { name: 'Outros', label: 'Outros', Icon: MoreHorizontal, color: 'amber' }
  ];

  const filterOptions = ['Todos', 'Combustível', 'Alimentação', 'Manutenção', 'Estacionamento', 'Outros'] as const;

  return (
    <div className="space-y-6 pb-28 pt-2">
      {isNew ? (
        /* SCREEN 4: NOVO GASTO */
        <div className="space-y-6">
          {/* Header */}
          <header className="flex justify-between items-center bg-card px-2 py-3 border-b border-border -mx-4">
            <button 
              onClick={() => router.push('/lancamentos')}
              className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
            <h1 className="text-[18px] font-extrabold text-foreground font-heading">Novo lançamento</h1>
            <div className="w-10 h-10" /> {/* Spacer */}
          </header>

          {/* Tabs */}
          <div className="flex bg-card-secondary/80 p-1 rounded-2xl border border-border">
            <button 
              onClick={() => setExpenseTab('gasto')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${expenseTab === 'gasto' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
              Gasto
            </button>
            <button 
              onClick={() => setExpenseTab('ganhos')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${expenseTab === 'ganhos' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
              Ganhos
            </button>
            <button 
              onClick={() => setExpenseTab('importar')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${expenseTab === 'importar' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
              Importar
            </button>
          </div>

          {/* Form */}
          {expenseTab === 'ganhos' ? (
            /* Ganhos Form */
            <form onSubmit={handleSaveGain} className="space-y-5 bg-card border border-border rounded-[32px] p-5 shadow-premium">
              <div className="flex flex-col items-center justify-center py-5 bg-emerald-50 rounded-[28px] border border-emerald-200 mb-3">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Valor do ganho</span>
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-xl font-bold text-emerald-500">R$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    required
                    autoFocus
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="bg-transparent border-none text-center focus:outline-none text-[36px] font-black text-emerald-600 w-[220px] font-heading"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Data</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setDate(todayStr)}
                    className={`flex-1 py-3.5 text-[13px] font-extrabold rounded-2xl border transition-all active:scale-[0.97] ${date === todayStr ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-card text-foreground border-border hover:bg-card-secondary/80'}`}
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(yesterdayStr)}
                    className={`flex-1 py-3.5 text-[13px] font-extrabold rounded-2xl border transition-all active:scale-[0.97] ${date === yesterdayStr ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-card text-foreground border-border hover:bg-card-secondary/80'}`}
                  >
                    Ontem
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full py-3.5 px-3 bg-card border border-border rounded-2xl text-[13px] font-extrabold text-foreground focus:outline-none focus:border-emerald-500 cursor-pointer text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Observação (opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-4 bg-card-secondary/50 border border-border rounded-2xl focus:outline-none focus:border-emerald-500 text-[14px] font-bold text-foreground placeholder:text-muted/65"
                  placeholder="Ex: corrida 99, iFood, etc."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4.5 rounded-[24px] transition-all active:scale-[0.98] text-[15px] shadow-lg cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? 'Salvando...' : 'Salvar Ganho'}
              </button>
            </form>
          ) : expenseTab !== 'importar' ? (
            <form onSubmit={handleSave} className="space-y-5 bg-card border border-border rounded-[32px] p-5 shadow-premium">
              {/* Category Grid (for general gasto) */}
              {expenseTab === 'gasto' && (
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Categoria</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categoriesList.map((cat) => {
                      const CatIcon = cat.Icon;
                      const isActive = category === cat.name;
                      
                      const borderStyles = isActive 
                        ? cat.color === 'rose' ? 'border-[#EF4444] bg-[#EF4444]/5 text-[#EF4444]'
                          : cat.color === 'emerald' ? 'border-[#10B981] bg-[#10B981]/5 text-[#10B981]'
                          : cat.color === 'indigo' ? 'border-[#6366F1] bg-[#6366F1]/5 text-[#6366F1]'
                          : cat.color === 'blue' ? 'border-[#3B82F6] bg-[#3B82F6]/5 text-[#3B82F6]'
                          : 'border-[#F59E0B] bg-[#F59E0B]/5 text-[#F59E0B]'
                        : 'border-border bg-card text-foreground hover:bg-card-secondary/80';

                      return (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setCategory(cat.name)}
                          className={`p-3.5 rounded-[20px] border flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition-all active:scale-[0.95] ${borderStyles}`}
                        >
                          <CatIcon size={20} />
                          <span className="text-[11px] font-bold tracking-tight">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Big amount field */}
              <div className="flex flex-col items-center justify-center py-5 bg-card-secondary/40 rounded-[28px] border border-border/50 mb-3">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Valor do gasto</span>
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-xl font-bold text-muted">R$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    required
                    autoFocus
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="bg-transparent border-none text-center focus:outline-none text-[36px] font-black text-foreground w-[220px] font-heading"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Data</label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setDate(todayStr)}
                    className={`flex-1 py-3.5 text-[13px] font-extrabold rounded-2xl border transition-all active:scale-[0.97] ${date === todayStr ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card text-foreground border-border hover:bg-card-secondary/80'}`}
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(yesterdayStr)}
                    className={`flex-1 py-3.5 text-[13px] font-extrabold rounded-2xl border transition-all active:scale-[0.97] ${date === yesterdayStr ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card text-foreground border-border hover:bg-card-secondary/80'}`}
                  >
                    Ontem
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full py-3.5 px-3 bg-card border border-border rounded-2xl text-[13px] font-extrabold text-foreground focus:outline-none focus:border-primary cursor-pointer text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Método de pagamento dropdown */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Método de pagamento</label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full p-4 pr-10 bg-card-secondary/50 border border-border rounded-2xl focus:outline-none focus:border-primary appearance-none text-[14px] font-bold text-foreground cursor-pointer"
                  >
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Pix">Pix</option>
                  </select>
                  <ChevronDown size={18} strokeWidth={2.5} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                </div>
              </div>

              {/* Observação Input */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted block uppercase tracking-wider">Observação (opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-4 bg-card-secondary/50 border border-border rounded-2xl focus:outline-none focus:border-primary text-[14px] font-bold text-foreground placeholder:text-muted/65"
                  placeholder="Posto Ipiranga, almoço, etc."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-4.5 rounded-[24px] transition-all active:scale-[0.98] text-[15px] shadow-lg cursor-pointer disabled:opacity-50 mt-4"
              >
                {loading ? 'Salvando...' : 'Salvar Gasto'}
              </button>
            </form>
          ) : (
            /* Import Tab */
            <form onSubmit={handleImport} className="space-y-5 bg-card border border-border rounded-[32px] p-5 shadow-premium">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted block uppercase flex items-center space-x-1.5">
                  <ClipboardList size={16} />
                  <span>Dados do comprovante/recibo</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  className="w-full p-4 bg-card-secondary/50 border border-border rounded-2xl focus:outline-none focus:border-primary text-[14px] font-medium text-foreground resize-none"
                  placeholder={`Cole o texto ou cole um CSV/JSON.\n\nCSV: Data,Tipo,Valor\n2024-01-15,Ganho,45.00\n2024-01-15,Gasto,25.00\n\nJSON:\n[{"tipo":"Ganho","valor":45.00}]`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-muted block uppercase">Ou importe arquivo</label>
                <label className="flex items-center justify-center space-x-2 py-4 bg-card-secondary/50 border border-dashed border-border rounded-2xl cursor-pointer hover:bg-card-secondary transition-colors">
                  <Upload size={18} className="text-muted" />
                  <span className="text-[13px] font-bold text-muted">Selecionar CSV ou JSON</span>
                  <input
                    type="file"
                    accept=".csv,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setPasteText(ev.target?.result as string);
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-muted">
                <FileSpreadsheet size={14} />
                <span>Formatos aceitos: CSV (Data,Tipo,Valor) ou JSON array</span>
              </div>

              <button
                type="submit"
                disabled={loading || !pasteText.trim()}
                className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-4.5 rounded-2xl transition-all active:scale-[0.98] text-[16px] shadow-lg cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Importar Lançamentos'}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* SCREEN 5: GASTOS (LIST VIEW) */
        <div className="space-y-6 animate-fade-in-up">
          {/* Header */}
          <header className="flex justify-between items-center bg-card px-2 py-3 border-b border-border -mx-4">
            <button 
              onClick={() => router.push('/')}
              className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
            <h1 className="text-[18px] font-extrabold text-foreground font-heading">Gastos</h1>
            <div className="w-10 h-10" /> {/* Spacer */}
          </header>

          {/* Tabs */}
          <div className="flex bg-card-secondary/80 p-1 rounded-2xl border border-border">
            <button 
              onClick={() => setListTab('lista')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${listTab === 'lista' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
              Lista
            </button>
            <button 
              onClick={() => setListTab('resumo')} 
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-xl transition-all cursor-pointer ${listTab === 'resumo' ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted hover:text-foreground'}`}
            >
              Resumo
            </button>
          </div>

          {/* Financial Summary Accordion */}
          <button
            onClick={() => setShowFinancialSummary(!showFinancialSummary)}
            className="w-full bg-card border border-border rounded-[20px] p-4 flex items-center justify-between hover:bg-card-secondary/50 transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign size={18} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-extrabold text-foreground">Resumo Financeiro</p>
                <p className="text-[11px] text-muted font-semibold">Entradas vs. Saídas</p>
              </div>
            </div>
            {showFinancialSummary ? <ChevronUp size={18} className="text-muted" /> : <ChevronDown size={18} className="text-muted" />}
          </button>

          {showFinancialSummary && (
            <div className="bg-card border border-border rounded-[24px] p-5 space-y-4 animate-fade-in-up">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-emerald-500/10 rounded-xl">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase block">Entradas</span>
                  <span className="text-[16px] font-black text-emerald-600 font-heading block mt-1">R$ {totalGains.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-xl">
                  <span className="text-[10px] font-bold text-primary uppercase block">Saídas</span>
                  <span className="text-[16px] font-black text-primary font-heading block mt-1">R$ {totalExpensesSum.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className={`text-center p-3 rounded-xl ${netProfit >= 0 ? 'bg-emerald-500/10' : 'bg-primary/10'}`}>
                  <span className={`text-[10px] font-bold uppercase block ${netProfit >= 0 ? 'text-emerald-600' : 'text-primary'}`}>Lucro</span>
                  <span className={`text-[16px] font-black font-heading block mt-1 ${netProfit >= 0 ? 'text-emerald-600' : 'text-primary'}`}>R$ {(totalGains - totalExpensesSum).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted">Total Entradas</span>
                  <span className="text-emerald-600">R$ {totalGains.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted">Total Saídas</span>
                  <span className="text-primary">- R$ {totalExpensesSum.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-[13px] font-black">
                  <span className="text-foreground">Lucro Líquido</span>
                  <span className={netProfit >= 0 ? 'text-emerald-600' : 'text-primary'}>R$ {(totalGains - totalExpensesSum).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          )}

          {listTab === 'lista' ? (
            <>
              {/* Category Spending Recharts Bar Chart */}
              <section className="bg-card border border-border rounded-[32px] p-5 shadow-premium">
                <h3 className="text-[12px] font-bold text-muted uppercase tracking-wider mb-4">Divisão de despesas</h3>
                {chartData.length === 0 ? (
                  <div className="h-[120px] flex items-center justify-center text-muted text-[13px] font-semibold">
                    Nenhum gasto registrado para gráfico.
                  </div>
                ) : (
                  <div className="h-[140px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                        <Tooltip 
                          formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Gasto']}
                          contentStyle={{ background: 'var(--card-color)', borderColor: 'var(--border-color)', borderRadius: '12px', fontSize: '11px', color: 'var(--text-color)' }}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={12}>
                          {chartData.map((entry, index) => {
                            const colors = {
                              Combustível: '#10B981',
                              Alimentação: '#EF4444',
                              Manutenção: '#6366F1',
                              Estacionamento: '#3B82F6',
                              Outros: '#F59E0B'
                            };
                            return <Cell key={`cell-${index}`} fill={colors[entry.name as keyof typeof colors] || '#71717A'} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>

              {/* Financial stats summary indicators */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-card border border-border rounded-[24px] p-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                  <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider block">Total Mês</span>
                  <span className="text-[15px] font-black text-foreground mt-1 block font-heading">R$ {totalExpensesSum.toFixed(0).replace('.', ',')}</span>
                </div>
                <div className="bg-card border border-border rounded-[24px] p-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                  <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider block">Média Diária</span>
                  <span className="text-[15px] font-black text-foreground mt-1 block font-heading">R$ {dailyAverage.toFixed(0).replace('.', ',')}</span>
                </div>
                <div className="bg-card border border-border rounded-[24px] p-3 text-center shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                  <span className="text-[9px] font-extrabold text-muted uppercase tracking-wider block">Maior Gasto</span>
                  <span className="text-[15px] font-black text-foreground mt-1 block font-heading">R$ {maxExpense.toFixed(0).replace('.', ',')}</span>
                </div>
              </div>

              {/* Filtro de Período */}
              <div className="flex bg-card-secondary/80 p-1 rounded-2xl border border-border">
                {(['semanal', 'mensal', 'personalizado'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setPeriodFilter(period)}
                    className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all cursor-pointer capitalize ${
                      periodFilter === period
                        ? 'bg-card text-foreground border border-border shadow-sm'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {period === 'semanal' ? '7 dias' : period === 'mensal' ? '30 dias' : 'Personalizado'}
                  </button>
                ))}
              </div>

              {/* Filtro de Data Personalizado */}
              {periodFilter === 'personalizado' && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-muted block uppercase mb-1">De</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={e => setCustomStartDate(e.target.value)}
                      className="w-full py-2.5 px-3 bg-card border border-border rounded-xl text-[13px] font-bold text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-muted block uppercase mb-1">Até</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={e => setCustomEndDate(e.target.value)}
                      className="w-full py-2.5 px-3 bg-card border border-border rounded-xl text-[13px] font-bold text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}

              {/* Filtration pills - Categorias */}
              <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar -mx-4 px-4">
                {filterOptions.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 text-[12px] font-extrabold rounded-full whitespace-nowrap border transition-all active:scale-95 cursor-pointer ${
                        isActive
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-card text-muted border-border hover:bg-card-secondary/80'
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

              {/* Total display card of the current filter */}
              {activeFilter !== 'Todos' && (
                <div className="bg-card border border-border rounded-[24px] p-4 shadow-sm flex items-center justify-between">
                  <span className="text-[12px] font-bold text-muted uppercase tracking-wider">Total {activeFilter}</span>
                  <span className="text-[16px] font-extrabold text-foreground font-heading">R$ {totalFilteredSum.toFixed(2).replace('.', ',')}</span>
                </div>
              )}

              {/* Scrollable list */}
              <section className="space-y-3">
                {entriesLoading && !fetched ? (
                  <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-sm">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-[14px] text-muted font-bold">Buscando seus gastos...</p>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-sm">
                    <p className="text-[14px] text-muted font-bold">Nenhum gasto encontrado.</p>
                  </div>
                ) : (
                  filteredEntries.map((entry) => {
                    const styling = getCategoryIcon(entry.description);
                    const CategoryIcon = styling.Icon;
                    return (
                      <div 
                        key={entry.id}
                        className="bg-card border border-border hover:border-border/80 rounded-[24px] p-4 flex justify-between items-center shadow-sm active:scale-[0.99] transition-all"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl ${styling.bg} flex items-center justify-center`}>
                            <CategoryIcon size={22} className={styling.color} />
                          </div>
                          <div>
                            <span className="text-[15px] font-bold text-foreground block">
                              {entry.description?.split(' - ')[0] || 'Despesa'}
                            </span>
                            <span className="text-[12px] font-semibold text-muted mt-0.5 block">
                              {formatDisplayDate(entry.date)} {entry.description?.split(' - ')[1] && `| ${entry.description?.split(' - ')[1]}`}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className="text-[16px] font-extrabold text-foreground font-heading">
                            R$ {entry.amount.toFixed(2).replace('.', ',')}
                          </span>
                          
                          <button 
                            onClick={() => setDeleteId(entry.id)}
                            className="p-2 text-muted hover:text-primary hover:bg-primary-soft rounded-xl transition-colors cursor-pointer"
                            title="Apagar lançamento"
                          >
                            <Trash2 size={16} />
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
                  className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-4 rounded-2xl transition-all active:scale-[0.98] text-[15px] flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  <span>Novo gasto</span>
                </button>
              </div>
            </>
          ) : (
            /* Resumo Tab content */
            <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-4 shadow-sm">
              <p className="text-[14px] font-extrabold text-foreground">Resumo financeiro de gastos</p>
              <p className="text-[12px] text-muted leading-relaxed">Consulte os relatórios para ver o detalhamento percentual das suas despesas e faturamento.</p>
              <button 
                onClick={() => router.push('/relatorios')}
                className="mt-2 bg-primary hover:bg-primary/95 text-white font-bold px-5 py-3 rounded-2xl text-[13px] active:scale-95 transition-all cursor-pointer w-full shadow-md"
              >
                Abrir Relatórios
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:p-0">
          <div className="bg-card w-full max-w-sm rounded-[32px] border border-border overflow-hidden shadow-2xl p-6 space-y-6 animate-fade-in-up">
            <div className="text-center space-y-2">
              <h3 className="text-[18px] font-extrabold text-foreground font-heading">Apagar Lançamento?</h3>
              <p className="text-[13px] text-muted font-semibold leading-relaxed">
                Esta ação removerá permanentemente este lançamento do seu histórico e relatórios.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3.5 bg-card-secondary hover:bg-card-secondary/80 text-foreground font-bold rounded-2xl border border-border active:scale-[0.98] transition-all text-[14px] cursor-pointer"
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
                className="flex-1 py-3.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl active:scale-[0.98] transition-all text-[14px] cursor-pointer shadow-sm"
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
