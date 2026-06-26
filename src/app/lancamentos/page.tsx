'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  ChevronDown,
  Calendar,
  Fuel,
  UtensilsCrossed,
  Wrench,
  MapPin,
  MoreHorizontal,
  Trash2,
  Plus,
  ListTodo,
  CloudUpload,
  FileText,
  ChevronUp,
  Wallet,
  Bike,
  Route,
  Clock
} from 'lucide-react';
import { useEntries } from '@/hooks/useEntries';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';

// Helper para Logos de Plataformas
const PlatformLogo = ({ id, className = 'w-6 h-6' }: { id: string; className?: string }) => {
  switch (id) {
    case 'ifood':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#EA1D2C" />
          <g transform="translate(3.6, 3.6) scale(0.7)">
            <path d="M8.428 1.67c-4.65 0-7.184 4.149-7.184 6.998 0 2.294 2.2 3.299 4.25 3.299l-.006-.006c4.244 0 7.184-3.854 7.184-6.998 0-2.29-2.175-3.293-4.244-3.293zm11.328 0c-4.65 0-7.184 4.149-7.184 6.998 0 2.294 2.2 3.299 4.25 3.299l-.006-.006C21.061 11.96 24 8.107 24 4.963c0-2.29-2.18-3.293-4.244-3.293z" fill="white" />
          </g>
        </svg>
      );
    case 'aiqfome':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FF0066" />
          <path d="M12 7.5c-1.8 0-3.3 1.3-3.6 3-.1 0-.2-.1-.4-.1-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5h8c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5c-.2 0-.3 0-.4.1-.3-1.7-1.8-3-3.6-3z" fill="white" />
          <circle cx="10" cy="12.5" r="0.8" fill="#FF0066" />
          <circle cx="14" cy="12.5" r="0.8" fill="#FF0066" />
          <path d="M11 14c.3.3.7.3 1 0" stroke="#FF0066" strokeWidth="0.8" strokeLinecap="round" />
        </svg>
      );
    case 'uber':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="black" />
          <g transform="translate(3.6, 3.6) scale(0.7)">
            <path d="M0 7.97v4.958c0 1.867 1.302 3.101 3 3.101.826 0 1.562-.316 2.094-.87v.736H6.27V7.97H5.082v4.888c0 1.257-.85 2.106-1.947 2.106-1.11 0-1.946-.827-1.946-2.106V7.971H0zm7.44 0v7.925h1.13v-.725c.521.532 1.257.86 2.06.86a3.006 3.006 0 0 0 3.034-3.01 3.01 3.01 0 0 0-3.033-3.024 2.86 2.86 0 0 0-2.049.861V7.971H7.439zm9.869 2.038c-1.687 0-2.965 1.37-2.965 3 0 1.72 1.334 3.01 3.066 3.01 1.053 0 1.913-.463 2.49-1.233l-.826-.611c-.43.577-.996.847-1.664.847-.973 0-1.753-.7-1.912-1.64h4.697v-.373c0-1.72-1.222-3-2.886-3zm6.295.068c-.634 0-1.098.294-1.381.758v-.713h-1.131v5.774h1.142V12.61c0-.894.544-1.47 1.291-1.47H24v-1.065h-.396zm-6.319.928c.85 0 1.564.588 1.756 1.47H15.52c.203-.882.916-1.47 1.765-1.47zm-6.732.012c1.086 0 1.98.883 1.98 2.004a1.993 1.993 0 0 1-1.98 2.001A1.989 1.989 0 0 1 8.56 13.02a1.99 1.99 0 0 1 1.992-2.004z" fill="white" />
          </g>
        </svg>
      );
    case '99':
      return (
        <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FFB300" />
          <g transform="translate(6, 6) skewX(-10)">
            <path d="M5.5 5.5a2.2 2.2 0 1 1-2.2-2.2A2.2 2.2 0 0 1 5.5 5.5zm-.9 0a1.3 1.3 0 1 0-1.3 1.3A1.3 1.3 0 0 0 4.6 5.5zm.9 0c0 1.8-1.2 4-3 5l-.4-.6c1.4-.9 2.2-2.4 2.2-4.4z" fill="black" />
            <path d="M10.5 5.5a2.2 2.2 0 1 1-2.2-2.2A2.2 2.2 0 0 1 10.5 5.5zm-.9 0a1.3 1.3 0 1 0-1.3 1.3A1.3 1.3 0 0 0 9.6 5.5zm.9 0c0 1.8-1.2 4-3 5l-.4-.6c1.4-.9 2.2-2.4 2.2-4.4z" fill="black" />
          </g>
        </svg>
      );
    case 'indrive':
      return (
        <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#00E676" />
          <g transform="translate(7.2, 7)">
            <rect x="1" y="4" width="1.6" height="6" rx="0.4" fill="black" />
            <circle cx="1.8" cy="1.8" r="0.9" fill="black" />
            <rect x="4" y="4" width="1.6" height="6" rx="0.4" fill="black" />
            <path d="M4.5 4.8c.8-1 2.2-1 3 0v5.2" stroke="black" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <rect x="6.9" y="5.5" width="1.6" height="4.5" rx="0.4" fill="black" />
          </g>
        </svg>
      );
    case 'lalamove':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#FF6600" />
          <path d="M8 8h2v5h4v2H8V8z" fill="white" />
          <path d="M11 9.5h3.5M11.5 11.5h4" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'shopee':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#EE4D2D" />
          <g transform="translate(3.6, 3.6) scale(0.7)">
            <path d="M15.9414 17.9633c.229-1.879-.981-3.077-4.1758-4.0969-1.548-.528-2.277-1.22-2.26-2.1719.065-1.056 1.048-1.825 2.352-1.85a5.2898 5.2898 0 0 1 2.8838.89c.116.072.197.06.263-.039.09-.145.315-.494.39-.62.051-.081.061-.187-.068-.281-.185-.1369-.704-.4149-.983-.5319a6.4697 6.4697 0 0 0-2.5118-.514c-1.909.008-3.4129 1.215-3.5389 2.826-.082 1.1629.494 2.1078 1.73 2.8278.262.152 1.6799.716 2.2438.892 1.774.552 2.695 1.5419 2.478 2.6969-.197 1.047-1.299 1.7239-2.818 1.7439-1.2039-.046-2.2878-.537-3.1278-1.19l-.141-.11c-.104-.08-.218-.075-.287.03-.05.077-.376.547-.458.67-.077.108-.035.168.045.234.35.293.817.613 1.134.775a6.7097 6.7097 0 0 0 2.8289.727 4.9048 4.9048 0 0 0 2.0759-.354c1.095-.465 1.8029-1.394 1.9449-2.554zM11.9986 1.4009c-2.068 0-3.7539 1.95-3.8329 4.3899h7.6657c-.08-2.44-1.765-4.3899-3.8328-4.3899zm7.8516 22.5981-.08.001-15.7843-.002c-1.074-.04-1.863-.91-1.971-1.991l-.01-.195L1.298 6.2858a.459.459 0 0 1 .45-.494h4.9748C6.8448 2.568 9.1607 0 11.9996 0c2.8388 0 5.1537 2.5689 5.2757 5.7898h4.9678a.459.459 0 0 1 .458.483l-.773 15.5883-.007.131c-.094 1.094-.979 1.9769-2.0709 2.0059z" fill="white" />
          </g>
        </svg>
      );
    case 'loggi':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#00B0FF" />
          <path d="M12 7 L16 9.3 L12 11.6 L8 9.3 Z" fill="white" fillOpacity="0.9" />
          <path d="M8 9.3 L12 11.6 L12 16.2 L8 13.9 Z" fill="white" fillOpacity="0.6" />
          <path d="M12 11.6 L16 9.3 L16 13.9 L12 16.2 Z" fill="white" fillOpacity="0.75" />
        </svg>
      );
    default:
      return null;
  }
};

// Parser para Lançamentos
const parseEntry = (entry: any) => {
  const parts = (entry.description || '').split(' - ');
  const isGain = entry.type === 'gain';
  
  let title = isGain ? 'Ganho' : (parts[0] || 'Despesa');
  let platformId = '';
  let subText = '';
  let duration = '';
  let cleanNotes = '';
  
  if (isGain) {
    const platformCandidate = parts[1] ? parts[1].trim() : '';
    const lowerCandidate = platformCandidate.toLowerCase();
    
    const platforms = ['ifood', 'aiqfome', 'uber', '99', 'indrive', 'lalamove', 'shopee', 'loggi'];
    const matched = platforms.find(p => lowerCandidate.includes(p));
    
    if (matched) {
      platformId = matched;
      title = platformCandidate;
      
      const remainingParts = parts.slice(2);
      const durationIdx = remainingParts.findIndex((p: string) => p.trim().endsWith(' min'));
      if (durationIdx !== -1) {
        duration = remainingParts[durationIdx].replace(' min', '').trim();
        remainingParts.splice(durationIdx, 1);
      }
      cleanNotes = remainingParts.join(' - ');
      subText = cleanNotes;
    } else {
      if (parts.length > 1) {
        const remainingParts = parts.slice(1);
        const durationIdx = remainingParts.findIndex((p: string) => p.trim().endsWith(' min'));
        if (durationIdx !== -1) {
          duration = remainingParts[durationIdx].replace(' min', '').trim();
          remainingParts.splice(durationIdx, 1);
        }
        cleanNotes = remainingParts.join(' - ');
        subText = cleanNotes;
      }
    }
  } else {
    let paymentMethodVal = 'Dinheiro';
    let notesVal = '';
    if (parts.length === 2) {
      const possiblePayment = parts[1].trim();
      const lowerPossible = possiblePayment.toLowerCase();
      if (['dinheiro', 'cartão de crédito', 'cartão de débito', 'pix'].includes(lowerPossible)) {
        paymentMethodVal = possiblePayment;
      } else {
        notesVal = possiblePayment;
      }
    } else if (parts.length >= 3) {
      paymentMethodVal = parts[1].trim();
      notesVal = parts.slice(2).join(' - ');
    }
    
    const subParts = [];
    if (paymentMethodVal && paymentMethodVal !== 'Dinheiro') {
      subParts.push(paymentMethodVal);
    }
    if (notesVal) {
      subParts.push(notesVal);
    }
    subText = subParts.join(' · ');
  }
  
  return { title, platformId, subText, duration, cleanNotes };
};

// Cores Oficiais das Chaves
const getStripeColor = (entry: any, platformId: string) => {
  if (entry.type === 'gain') {
    const platformColors: Record<string, string> = {
      ifood: '#EA1D2C',
      aiqfome: '#FF0066',
      uber: '#000000',
      99: '#FFB300',
      indrive: '#00E676',
      lalamove: '#FF6600',
      shopee: '#EE4D2D',
      loggi: '#00B0FF'
    };
    return platformColors[platformId] || '#10B981';
  } else {
    const desc = (entry.description || '').toLowerCase();
    if (desc.includes('combustível') || desc.includes('gasolina') || desc.includes('abastecer')) {
      return '#10B981';
    }
    if (desc.includes('alimentação') || desc.includes('almoço') || desc.includes('lanche') || desc.includes('comer')) {
      return '#EF4444';
    }
    if (desc.includes('manutenção') || desc.includes('oficina') || desc.includes('óleo') || desc.includes('conserto')) {
      return '#6366F1';
    }
    if (desc.includes('estacionamento') || desc.includes('parar') || desc.includes('pedágio')) {
      return '#3B82F6';
    }
    return '#F59E0B';
  }
};

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
  const [showNotesField, setShowNotesField] = useState(false);
  const [saveSuccessType, setSaveSuccessType] = useState<'gasto' | 'ganhos' | null>(null);
  const [ridesCount, setRidesCount] = useState('');
  const [kmTotal, setKmTotal] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [autoFilledKm, setAutoFilledKm] = useState(false);

  const amountRef = useRef<HTMLInputElement>(null);

  const quickRecords = [
    { Icon: Fuel, label: 'Combustível', category: 'Combustível', amount: '50' },
    { Icon: UtensilsCrossed, label: 'Almoço', category: 'Alimentação', amount: '25' },
    { Icon: Wrench, label: 'Manutenção', category: 'Manutenção', amount: '40' }
  ];

  // Load last selected category and payment method on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastCat = localStorage.getItem('motopilot_last_category');
      const lastPay = localStorage.getItem('motopilot_last_payment_method');
      if (lastCat) setCategory(lastCat);
      if (lastPay) setPaymentMethod(lastPay);
    }
  }, []);

  // Autofocus field amount when page or tab loads
  useEffect(() => {
    if (isNew && !saveSuccessType) {
      const timer = setTimeout(() => {
        amountRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isNew, expenseTab, saveSuccessType]);

  // Screen 5 (List) States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeJourneyId, setActiveJourneyId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Ganhos' | 'Gastos' | 'Combustível' | 'Alimentação' | 'Manutenção' | 'Estacionamento' | 'Outros'>('Todos');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [journeyDistanceKm, setJourneyDistanceKm] = useState<number>(0);

  const platformFilters = [
    { id: 'ifood', name: 'iFood', color: '#EA1D2C' },
    { id: 'aiqfome', name: 'Aiqfome', color: '#FF0066' },
    { id: 'uber', name: 'Uber', color: '#000000' },
    { id: '99', name: '99', color: '#FFB300' },
    { id: 'indrive', name: 'inDrive', color: '#00E676' },
    { id: 'lalamove', name: 'Lalamove', color: '#FF6600' },
    { id: 'shopee', name: 'Shopee', color: '#EE4D2D' },
    { id: 'loggi', name: 'Loggi', color: '#00B0FF' }
  ];
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

  // Sync category when switching away from gasto tab
  useEffect(() => {
    if (expenseTab !== 'gasto' && category === 'Combustível') {
      setCategory('Alimentação');
    }
  }, [expenseTab]);

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

  // Fetch active journey distance for auto-fill
  useEffect(() => {
    const fetchJourneyDistance = async () => {
      if (!activeJourneyId) {
        setJourneyDistanceKm(0);
        return;
      }
      const { data } = await supabase
        .from('journeys')
        .select('distance_km')
        .eq('id', activeJourneyId)
        .maybeSingle();
      if (data?.distance_km) {
        setJourneyDistanceKm(Number(data.distance_km));
      }
    };
    fetchJourneyDistance();
  }, [activeJourneyId]);

  // Auto-fill km when there's an active journey with GPS tracking
  useEffect(() => {
    if (activeJourneyId && journeyDistanceKm > 0 && expenseTab === 'ganhos') {
      const kmRounded = Math.round(journeyDistanceKm * 100) / 100;
      setKmTotal(kmRounded > 0 ? String(kmRounded) : '');
      setAutoFilledKm(kmRounded > 0);
    }
  }, [activeJourneyId, journeyDistanceKm, expenseTab]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setLoading(true);
    // Format: Category - PaymentMethod - Notes
    const desc = notes ? `${category} - ${paymentMethod} - ${notes}` : `${category} - ${paymentMethod}`;
    const res = await addEntry('expense', parsedAmount, desc, activeJourneyId);
    setLoading(false);

    if (!res.error) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('motopilot_last_category', category);
        localStorage.setItem('motopilot_last_payment_method', paymentMethod);
      }
      setSaveSuccessType('gasto');
      setAmount('');
      setNotes('');
      setShowNotesField(false);
    }
  };

  const handleSaveGain = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setLoading(true);
    const descParts = ['Ganho'];
    if (notes) descParts.push(notes);
    if (customNotes) descParts.push(customNotes);
    if (durationMinutes) descParts.push(`${durationMinutes} min`);
    const desc = descParts.join(' - ');

    const parsedRides = ridesCount ? parseInt(ridesCount) : null;
    const parsedKm = kmTotal ? parseFloat(kmTotal) : null;
    const res = await addEntry('gain', parsedAmount, desc, activeJourneyId, parsedRides, parsedKm);
    setLoading(false);

    if (!res.error) {
      setSaveSuccessType('ganhos');
      setAmount('');
      setNotes('');
      setShowNotesField(false);
      setRidesCount('');
      setKmTotal('');
      setDurationMinutes('');
      setCustomNotes('');
      setAutoFilledKm(false);
    }
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

  // Filtragem e cálculos para Screen 5 (Lançamentos)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const periodFilteredEntries = entries.filter(e => {
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

  const expenseEntries = periodFilteredEntries.filter(e => e.type === 'expense');
  const gainEntries = periodFilteredEntries.filter(e => e.type === 'gain');
  const totalExpensesSum = expenseEntries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalGains = gainEntries.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalGains - totalExpensesSum;

  const filteredEntries = periodFilteredEntries.filter(entry => {
    if (selectedPlatform) {
      const parsed = parseEntry(entry);
      return parsed.platformId === selectedPlatform;
    }
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Ganhos') return entry.type === 'gain';
    if (activeFilter === 'Gastos') return entry.type === 'expense';
    const desc = (entry.description || '').toLowerCase();
    if (activeFilter === 'Combustível') return desc.includes('combustível') || desc.includes('gasolina') || desc.includes('abastecer');
    if (activeFilter === 'Alimentação') return desc.includes('alimentação') || desc.includes('almoço') || desc.includes('lanche') || desc.includes('comer');
    if (activeFilter === 'Manutenção') return desc.includes('manutenção') || desc.includes('oficina') || desc.includes('óleo') || desc.includes('conserto');
    if (activeFilter === 'Estacionamento') return desc.includes('estacionamento') || desc.includes('parar') || desc.includes('pedágio');
    if (activeFilter === 'Outros') return entry.type === 'expense' && !desc.includes('combustível') && !desc.includes('gasolina') && !desc.includes('abastecer') && !desc.includes('alimentação') && !desc.includes('almoço') && !desc.includes('lanche') && !desc.includes('comer') && !desc.includes('manutenção') && !desc.includes('oficina') && !desc.includes('óleo') && !desc.includes('conserto') && !desc.includes('estacionamento') && !desc.includes('parar') && !desc.includes('pedágio');
    return true;
  });

  const totalFilteredSum = filteredEntries.reduce((acc, curr) => acc + curr.amount, 0);
  const uniqueDays = new Set(expenseEntries.map(e => e.date)).size || 1;
  const dailyAverage = totalExpensesSum / uniqueDays;
  const maxExpense = expenseEntries.reduce((max, curr) => curr.amount > max ? curr.amount : max, 0);

  const getCategoryIcon = (desc: string | null, type?: string) => {
    if (type === 'gain') {
      return { Icon: Wallet, bg: 'bg-foreground/5', color: 'text-muted' };
    }
    const d = (desc || '').toLowerCase();
    if (d.includes('combustível') || d.includes('gasolina') || d.includes('abastecer')) {
      return { Icon: Fuel, bg: 'bg-foreground/5', color: 'text-muted' };
    }
    if (d.includes('alimentação') || d.includes('almoço') || d.includes('lanche') || d.includes('comer')) {
      return { Icon: UtensilsCrossed, bg: 'bg-foreground/5', color: 'text-muted' };
    }
    if (d.includes('manutenção') || d.includes('oficina') || d.includes('óleo') || d.includes('conserto')) {
      return { Icon: Wrench, bg: 'bg-foreground/5', color: 'text-muted' };
    }
    if (d.includes('estacionamento') || d.includes('parar') || d.includes('pedágio')) {
      return { Icon: MapPin, bg: 'bg-foreground/5', color: 'text-muted' };
    }
    return { Icon: MoreHorizontal, bg: 'bg-foreground/5', color: 'text-muted' };
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDisplayTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const categoriesList = [
    { name: 'Alimentação', label: 'Alimentação', Icon: UtensilsCrossed, color: 'rose' },
    { name: 'Combustível', label: 'Combustível', Icon: Fuel, color: 'emerald' },
    { name: 'Manutenção', label: 'Manutenção', Icon: Wrench, color: 'indigo' },
    { name: 'Estacionamento', label: 'Estacionamento', Icon: MapPin, color: 'blue' },
    { name: 'Outros', label: 'Outros', Icon: MoreHorizontal, color: 'amber' }
  ];

  const filterOptions = ['Todos', 'Ganhos', 'Gastos', 'Combustível', 'Alimentação', 'Manutenção', 'Estacionamento', 'Outros'] as const;

  return (
    <div className="space-y-4 pb-28 pt-1">
      {isNew ? (
        /* SCREEN 4: NOVO GASTO */
        <div className="space-y-4">
          {/* Header */}
          <header className="flex justify-between items-center bg-card px-2 py-2 border-b border-border -mx-4">
            <button 
              onClick={() => router.push('/lancamentos')}
              className="w-9 h-9 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <h1 className="text-[16px] font-extrabold text-foreground font-heading">Novo lançamento</h1>
            <div className="w-9 h-9" /> {/* Spacer */}
          </header>

          {saveSuccessType ? (
            /* SUCCESS STATE */
            <div className="bg-card border border-border rounded-[24px] p-5 text-center space-y-4 shadow-premium animate-fade-in-up">
              <div className="w-14 h-14 bg-card-secondary rounded-full flex items-center justify-center mx-auto border border-border">
                <svg className="w-7 h-7 text-foreground" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              
              <div className="space-y-1.5">
                <h3 className="text-[16px] font-black text-foreground font-heading">
                  {saveSuccessType === 'gasto' ? 'Gasto salvo com sucesso!' : 'Ganho salvo com sucesso!'}
                </h3>
                <p className="text-[12px] text-muted font-semibold">
                  O lançamento foi registrado e atualizado em seus relatórios.
                </p>
              </div>

              <div className="flex flex-col space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSaveSuccessType(null);
                  }}
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
                  Voltar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
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
              Ganhos
            </button>
          </div>

          {/* Form */}
          {expenseTab === 'ganhos' ? (
            <form onSubmit={handleSaveGain} className="space-y-3">
              <div className="flex flex-col items-center justify-center py-4 bg-card border border-border rounded-[20px]">
                <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider mb-1">Valor do ganho</span>
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-lg font-bold text-muted">R$</span>
                  <input
                    ref={amountRef}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    required
                    autoFocus
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="bg-transparent border-none text-center focus:outline-none text-[32px] font-black text-foreground w-[200px] font-heading"
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Seção Detalhes do Ganho */}
              <div className="bg-card border border-border rounded-[20px] p-3.5 space-y-3">
                <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Detalhes do Ganho</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Bike size={11} className="text-muted" />
                      <label className="text-[9px] font-black text-muted uppercase tracking-wider">Corridas</label>
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={ridesCount}
                      onChange={e => setRidesCount(e.target.value)}
                      className="w-full py-2 px-2.5 bg-card-secondary/40 border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground placeholder:text-muted/50 text-center"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Route size={11} className="text-muted" />
                      <label className="text-[9px] font-black text-muted uppercase tracking-wider">Km</label>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0"
                        value={kmTotal}
                        onChange={e => {
                          setKmTotal(e.target.value);
                          setAutoFilledKm(false);
                        }}
                        className="w-full py-2 px-2.5 bg-card-secondary/40 border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground placeholder:text-muted/50 text-center"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Clock size={11} className="text-muted" />
                      <label className="text-[9px] font-black text-muted uppercase tracking-wider">Minutos</label>
                    </div>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(e.target.value)}
                      className="w-full py-2 px-2.5 bg-card-secondary/40 border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground placeholder:text-muted/50 text-center"
                      placeholder="0"
                    />
                  </div>
                </div>
                {autoFilledKm && (
                  <span className="text-[9px] font-bold text-primary mt-1 block">Quilômetros preenchidos via GPS da jornada</span>
                )}
                {ridesCount && amount && parseFloat(amount) > 0 && parseInt(ridesCount) > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-2.5">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Média por corrida</span>
                    <p className="text-[14px] font-black text-foreground font-heading">
                      R$ {(parseFloat(amount) / parseInt(ridesCount)).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}
                {kmTotal && amount && parseFloat(amount) > 0 && parseFloat(kmTotal) > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-2.5">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Valor por km</span>
                    <p className="text-[14px] font-black text-foreground font-heading">
                      R$ {(parseFloat(amount) / parseFloat(kmTotal)).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}
              </div>

              {/* Atalhos de origem do ganho */}
              <div className="bg-card border border-border rounded-[20px] p-3.5 space-y-2">
                <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Plataforma</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'iFood', value: 'iFood' },
                    { label: 'Aiqfome', value: 'Aiqfome' },
                    { label: 'Uber', value: 'Uber' },
                    { label: '99', value: '99' },
                    { label: 'inDrive', value: 'inDrive' },
                    { label: 'Lalamove', value: 'Lalamove' },
                    { label: 'Shopee', value: 'Shopee' },
                    { label: 'Loggi', value: 'Loggi' },
                    { label: 'Outros', value: 'Outros' }
                  ].map((src) => (
                    <button
                      key={src.value}
                      type="button"
                      onClick={() => {
                        setNotes(src.value);
                        setShowNotesField(true);
                      }}
                      className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95 cursor-pointer border ${
                        notes === src.value
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-card-secondary/60 text-foreground border-border hover:bg-card-secondary'
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-[20px] p-3.5 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Data</label>
                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setDate(todayStr)}
                      className={`flex-1 py-2.5 text-[12px] font-extrabold rounded-xl border transition-all active:scale-[0.97] ${date === todayStr ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card-secondary/40 text-foreground border-border hover:bg-card-secondary/80'}`}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(yesterdayStr)}
                      className={`flex-1 py-2.5 text-[12px] font-extrabold rounded-xl border transition-all active:scale-[0.97] ${date === yesterdayStr ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card-secondary/40 text-foreground border-border hover:bg-card-secondary/80'}`}
                    >
                      Ontem
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full py-2.5 px-2.5 bg-card-secondary/40 border border-border rounded-xl text-[12px] font-extrabold text-foreground focus:outline-none focus:border-primary cursor-pointer text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Observação</label>
                  {showNotesField ? (
                    <input
                      type="text"
                      value={customNotes}
                      onChange={e => setCustomNotes(e.target.value)}
                      className="w-full py-2.5 px-3 bg-card-secondary/40 border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground placeholder:text-muted/50 animate-in fade-in duration-200"
                      placeholder="Ex: Entrega extra, taxa extra, etc."
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowNotesField(true)}
                      className="w-full py-2.5 px-3 bg-card-secondary/30 hover:bg-card-secondary/50 border border-dashed border-border rounded-xl text-[12px] font-extrabold text-muted transition-all active:scale-[0.98] cursor-pointer text-left"
                    >
                      + Adicionar observação
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3 rounded-[16px] transition-all active:scale-[0.98] text-[14px] shadow-sm cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? 'Salvando...' : 'Salvar Ganho'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              {expenseTab === 'gasto' && (
                <div className="bg-card border border-border rounded-[20px] p-3.5 space-y-3">
                  <label className="text-[11px] font-extrabold text-muted block uppercase tracking-wider">Categoria</label>
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
                        : 'border-border bg-card-secondary/40 text-foreground hover:bg-card-secondary/80';

                      return (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => setCategory(cat.name)}
                          className={`p-3 rounded-[16px] border flex flex-col items-center justify-center space-y-1 cursor-pointer transition-all active:scale-[0.95] ${borderStyles}`}
                        >
                          <CatIcon size={18} />
                          <span className="text-[10px] font-bold tracking-tight">{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quickRecords.length > 0 && (
                    <div className="space-y-1.5 pt-1 border-t border-border/50">
                      <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Rápidos</label>
                      <div className="flex space-x-1.5 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
                        {quickRecords.map((rec, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setCategory(rec.category);
                              setAmount(rec.amount);
                            }}
                          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-card-secondary/60 hover:bg-card border border-border rounded-lg text-[11px] font-bold text-foreground transition-all active:scale-95 cursor-pointer whitespace-nowrap hover:border-border/80"
                        >
                          <rec.Icon size={13} strokeWidth={2.5} />
                          <span className="font-extrabold">{rec.label} R${rec.amount}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col items-center justify-center py-4 bg-card border border-border rounded-[20px]">
                <span className="text-[10px] font-extrabold text-muted uppercase tracking-wider mb-1">Valor do gasto</span>
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-lg font-bold text-muted">R$</span>
                  <input
                    ref={amountRef}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    required
                    autoFocus
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="bg-transparent border-none text-center focus:outline-none text-[32px] font-black text-foreground w-[200px] font-heading"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="bg-card border border-border rounded-[20px] p-3.5 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Data</label>
                  <div className="flex space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setDate(todayStr)}
                      className={`flex-1 py-2.5 text-[12px] font-extrabold rounded-xl border transition-all active:scale-[0.97] ${date === todayStr ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card-secondary/40 text-foreground border-border hover:bg-card-secondary/80'}`}
                    >
                      Hoje
                    </button>
                    <button
                      type="button"
                      onClick={() => setDate(yesterdayStr)}
                      className={`flex-1 py-2.5 text-[12px] font-extrabold rounded-xl border transition-all active:scale-[0.97] ${date === yesterdayStr ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card-secondary/40 text-foreground border-border hover:bg-card-secondary/80'}`}
                    >
                      Ontem
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full py-2.5 px-2.5 bg-card-secondary/40 border border-border rounded-xl text-[12px] font-extrabold text-foreground focus:outline-none focus:border-primary cursor-pointer text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Pagamento</label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full py-2.5 px-3 pr-10 bg-card-secondary/40 border border-border rounded-xl focus:outline-none focus:border-primary appearance-none text-[13px] font-bold text-foreground cursor-pointer"
                    >
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Pix">Pix</option>
                    </select>
                    <ChevronDown size={16} strokeWidth={2.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-muted block uppercase tracking-wider">Observação</label>
                  {showNotesField ? (
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full py-2.5 px-3 bg-card-secondary/40 border border-border rounded-xl focus:outline-none focus:border-primary text-[13px] font-bold text-foreground placeholder:text-muted/50 animate-in fade-in duration-200"
                      placeholder="Posto Ipiranga, almoço, etc."
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowNotesField(true)}
                      className="w-full py-2.5 px-3 bg-card-secondary/30 hover:bg-card-secondary/50 border border-dashed border-border rounded-xl text-[12px] font-extrabold text-muted transition-all active:scale-[0.98] cursor-pointer text-left"
                    >
                      + Adicionar observação
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3 rounded-[16px] transition-all active:scale-[0.98] text-[14px] shadow-sm cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? 'Salvando...' : 'Salvar Gasto'}
              </button>
            </form>
          )}
            </>
          )}
        </div>
      ) : (
        /* SCREEN 5: GASTOS (LIST VIEW) */
        <div className="space-y-4 animate-fade-in-up">
          {/* Header */}
          <header className="flex justify-between items-center bg-card px-2 py-2 border-b border-border -mx-4">
            <button 
              onClick={() => router.push('/')}
              className="w-9 h-9 flex items-center justify-center text-foreground hover:bg-card-secondary rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <h1 className="text-[16px] font-extrabold text-foreground font-heading">Lançamentos</h1>
            <div className="w-9 h-9" /> {/* Spacer */}
          </header>

          {/* Financial stats summary indicators */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-2.5 text-center">
                  <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Total Mês</span>
                  <span className="text-[13px] font-black text-foreground mt-0.5 block font-heading">R$ {totalExpensesSum.toFixed(0).replace('.', ',')}</span>
                </div>
                <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-2.5 text-center">
                  <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Média Diária</span>
                  <span className="text-[13px] font-black text-foreground mt-0.5 block font-heading">R$ {dailyAverage.toFixed(0).replace('.', ',')}</span>
                </div>
                <div className="bg-card-secondary/50 border border-border/60 rounded-xl p-2.5 text-center">
                  <span className="text-[8px] font-extrabold text-muted uppercase tracking-wider block">Maior Gasto</span>
                  <span className="text-[13px] font-black text-foreground mt-0.5 block font-heading">R$ {maxExpense.toFixed(0).replace('.', ',')}</span>
                </div>
              </div>

              {/* Filtro de Período */}
              <div className="flex bg-card-secondary/50 p-0.5 rounded-xl border border-border/60">
                {(['semanal', 'mensal', 'personalizado'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setPeriodFilter(period)}
                    className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all cursor-pointer capitalize ${
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

              {/* Filtros Rápidos por Plataforma */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-muted uppercase tracking-wider">Filtrar por Plataforma</span>
                  {selectedPlatform && (
                    <button 
                      onClick={() => setSelectedPlatform(null)}
                      className="text-[11px] font-extrabold text-primary hover:underline cursor-pointer"
                    >
                      Limpar filtro
                    </button>
                  )}
                </div>
                <div className="flex overflow-x-auto gap-3 py-1.5 -mx-4 px-4 hide-scrollbar">
                  {platformFilters.map((platform) => {
                    const isSelected = selectedPlatform === platform.id;
                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlatform(prev => prev === platform.id ? null : platform.id);
                          setActiveFilter('Todos');
                        }}
                        className="flex flex-col items-center space-y-1.5 flex-shrink-0 cursor-pointer group active:scale-95 transition-all"
                      >
                        <div 
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${
                            isSelected 
                              ? 'bg-card border-2 shadow-md scale-105' 
                              : 'bg-card border-border/80 hover:border-border/100'
                          }`}
                          style={{ 
                            borderColor: isSelected ? platform.color : undefined,
                            boxShadow: isSelected ? `0 4px 14px ${platform.color}15` : undefined
                          }}
                        >
                          <PlatformLogo id={platform.id} className="w-9 h-9" />
                        </div>
                        <span className={`text-[11px] font-black ${isSelected ? 'text-foreground' : 'text-muted'} transition-colors`}>
                          {platform.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtration pills - Categorias (Sticky top-0 z-30) */}
              <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border/10 flex overflow-x-auto gap-1.5 hide-scrollbar">
                {filterOptions.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveFilter(filter);
                        setSelectedPlatform(null); // Clear platform filter when selecting category
                      }}
                      className={`px-3 py-1.5 text-[11px] font-extrabold rounded-full whitespace-nowrap border transition-all active:scale-95 cursor-pointer ${
                        isActive && !selectedPlatform
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
              <section className="space-y-2">
                {entriesLoading && !fetched ? (
                  <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-sm">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-[14px] text-muted font-bold">Buscando seus gastos...</p>
                  </div>
                ) : filteredEntries.length === 0 ? (
                  <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-sm">
                    <p className="text-[14px] text-muted font-bold">Nenhum lançamento encontrado.</p>
                  </div>
                ) : (
                  filteredEntries.map((entry) => {
                    const styling = getCategoryIcon(entry.description, entry.type);
                    const CategoryIcon = styling.Icon;

                    const { title, platformId, subText, duration } = parseEntry(entry);
                    const stripeColor = getStripeColor(entry, platformId);
                    const hasPlatform = !!platformId;

                    return (
                      <div 
                        key={entry.id}
                        className="relative bg-card border border-border rounded-[16px] p-3.5 flex justify-between items-center active:scale-[0.99] transition-all overflow-hidden hover:border-border/80"
                        style={{ borderLeft: `4px solid ${stripeColor}` }}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-full bg-card-secondary/80 border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                            {entry.type === 'gain' && hasPlatform ? (
                              <PlatformLogo id={platformId} className="w-6 h-6" />
                            ) : (
                              <CategoryIcon size={18} className={styling.color} />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-[13px] font-black text-foreground tracking-tight">
                                {title}
                              </span>
                            </div>
                            
                            {/* Visual Financeiro Moderno com chips de informações */}
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-muted">
                              <span>{formatDisplayTime(entry.date)}</span>
                              <span>·</span>
                              <span>{formatDisplayDate(entry.date)}</span>
                              
                              {entry.type === 'gain' && entry.km_total && entry.km_total > 0 && (
                                <>
                                  <span>·</span>
                                  <span className="text-foreground">{entry.km_total.toFixed(1).replace('.', ',')} km</span>
                                  <span>·</span>
                                  <span className="text-primary-muted">R$ {(entry.amount / entry.km_total).toFixed(2).replace('.', ',')}/km</span>
                                </>
                              )}

                              {entry.type === 'gain' && duration && (
                                <>
                                  <span>·</span>
                                  <span className="text-emerald-500 font-extrabold">{duration} min</span>
                                </>
                              )}
                              
                              {entry.type === 'gain' && entry.rides_count && entry.rides_count > 0 && (
                                <>
                                  <span>·</span>
                                  <span>{entry.rides_count} ent.</span>
                                </>
                              )}
                            </div>
                            
                            {subText && (
                              <span className="text-[10px] font-semibold text-muted/80 block mt-0.5 italic">
                                {subText}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 pl-2">
                          <span className={`text-[14px] font-black font-heading tracking-tight ${entry.type === 'gain' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {entry.type === 'gain' ? '+' : '-'}R$ {entry.amount.toFixed(2).replace('.', ',')}
                          </span>
                          
                          <button 
                            onClick={() => setDeleteId(entry.id)}
                            className="p-1.5 text-muted hover:text-[#EF4444] rounded-xl transition-colors cursor-pointer active:scale-90"
                            title="Apagar lançamento"
                          >
                            <Trash2 size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>

              {/* Bottom New Expense Trigger button */}
              <div className="pt-1">
                <button
                  onClick={() => router.push('/lancamentos?new=true')}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-extrabold py-3 rounded-[16px] transition-all active:scale-[0.98] text-[14px] flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Novo lançamento</span>
                </button>
              </div>
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
