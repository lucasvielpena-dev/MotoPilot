'use client';

import { 
  Wrench, 
  User, 
  MoreHorizontal, 
  Coins,
  Fuel,
  UtensilsCrossed,
  Droplet,
  TriangleAlert
} from 'lucide-react';

type BrandLogoProps = {
  name: string | null;
  type?: 'gain' | 'expense';
  className?: string;
};

export default function BrandLogo({ name, type = 'gain', className = 'w-10 h-10' }: BrandLogoProps) {
  const cleanName = (name || '').toLowerCase().trim();

  // Se for ganho, identificamos as empresas
  if (type === 'gain') {
    // iFood
    if (cleanName.includes('ifood')) {
      return (
        <div className={`${className} bg-[#D92B2B] rounded-2xl flex items-center justify-center transition-transform hover:scale-105 select-none`} title="iFood">
          {/* Logo iFood simplificada */}
          <span className="text-white font-black italic tracking-tighter text-[13px]">iFood</span>
        </div>
      );
    }

    // 99 / 99pop / 99moto
    if (cleanName.includes('99')) {
      return (
        <div className={`${className} bg-[#E6C200] rounded-2xl flex items-center justify-center transition-transform hover:scale-105 select-none`} title="99">
          {/* Logo 99 */}
          <span className="text-[#1A1A1A] font-black tracking-tight text-[18px]">99</span>
        </div>
      );
    }

    // Uber / UberMoto / UberFlash
    if (cleanName.includes('uber')) {
      return (
        <div className={`${className} bg-[#1F1F1F] border border-[#2D2D2D] rounded-2xl flex items-center justify-center transition-transform hover:scale-105 select-none`} title="Uber">
          {/* Logo Uber */}
          <span className="text-white font-bold tracking-tight text-[11px] uppercase">Uber</span>
        </div>
      );
    }

    // InDrive / Indrive
    if (cleanName.includes('indrive')) {
      return (
        <div className={`${className} bg-[#00BD56] rounded-2xl flex items-center justify-center transition-transform hover:scale-105 select-none`} title="inDrive">
          {/* Logo inDrive */}
          <span className="text-[#000000] font-black italic tracking-tighter text-[13px]">in</span>
        </div>
      );
    }

    // Particular
    if (cleanName.includes('particular') || cleanName.includes('privado')) {
      return (
        <div className={`${className} bg-[#2563EB] rounded-2xl flex items-center justify-center`} title="Corrida Particular">
          <User size={20} className="text-white" />
        </div>
      );
    }

    // aiqfome
    if (cleanName.includes('aiqfome') || cleanName.includes('aiq')) {
      return (
        <div className={`${className} bg-[#C71B5F] rounded-2xl flex items-center justify-center transition-transform hover:scale-105 select-none`} title="aiqfome">
          <span className="text-white font-black italic tracking-tighter text-[11px]">aiqfome</span>
        </div>
      );
    }

    // Maxim
    if (cleanName.includes('maxim')) {
      return (
        <div className={`${className} bg-[#E5A900] rounded-2xl flex items-center justify-center transition-transform hover:scale-105 select-none`} title="Maxim">
          <span className="text-[#1A1A1A] font-extrabold tracking-tight text-[11px] uppercase">maxim</span>
        </div>
      );
    }
  }

  // Se for despesa ou outra categoria
  if (type === 'expense') {
    // Combustível / Gasolina
    if (cleanName.includes('combust') || cleanName.includes('gasolina') || cleanName.includes('etanol') || cleanName.includes('posto')) {
      return (
        <div className={`${className} bg-[#D97706] rounded-2xl flex items-center justify-center`} title="Combustível">
          <Fuel size={20} className="text-white" />
        </div>
      );
    }

    // Alimentação / Almoço / Comida
    if (cleanName.includes('aliment') || cleanName.includes('almoço') || cleanName.includes('comida') || cleanName.includes('lanche') || cleanName.includes('janta')) {
      return (
        <div className={`${className} bg-[#10B981] rounded-2xl flex items-center justify-center`} title="Alimentação">
          <UtensilsCrossed size={20} className="text-white" />
        </div>
      );
    }

    // Manutenção / Oficina / Pneu
    if (cleanName.includes('manuten') || cleanName.includes('oficina') || cleanName.includes('pneu') || cleanName.includes('mecanic') || cleanName.includes('peça')) {
      return (
        <div className={`${className} bg-[#2563EB] rounded-2xl flex items-center justify-center`} title="Manutenção">
          <Wrench size={20} className="text-white" />
        </div>
      );
    }

    // Óleo
    if (cleanName.includes('óleo') || cleanName.includes('oleo') || cleanName.includes('lubrific')) {
      return (
        <div className={`${className} bg-[#8B5CF6] rounded-2xl flex items-center justify-center`} title="Troca de Óleo">
          <Droplet size={20} className="text-white" />
        </div>
      );
    }

    // Plataforma / Taxa
    if (cleanName.includes('plataforma') || cleanName.includes('taxa') || cleanName.includes('comis')) {
      return (
        <div className={`${className} bg-[#F43F5E] rounded-2xl flex items-center justify-center`} title="Taxa da Plataforma">
          <Coins size={20} className="text-white" />
        </div>
      );
    }

    // Multa
    if (cleanName.includes('multa')) {
      return (
        <div className={`${className} bg-[#FF4444] rounded-2xl flex items-center justify-center`} title="Multa">
          <TriangleAlert size={20} className="text-white" />
        </div>
      );
    }
  }

  // Fallback padrão se não bater com nenhum
  return (
    <div className={`${className} rounded-2xl flex items-center justify-center ${
      type === 'gain' 
        ? 'bg-[var(--color-gain)]/10 text-[var(--color-gain)] border border-[var(--color-gain)]/20' 
        : 'bg-[var(--color-expense)]/10 text-[var(--color-expense)] border border-[var(--color-expense)]/20'
    }`}>
      {type === 'gain' ? (
        <span className="text-[16px] font-bold">R$</span>
      ) : (
        <MoreHorizontal size={24} strokeWidth={2.5} />
      )}
    </div>
  );
}
