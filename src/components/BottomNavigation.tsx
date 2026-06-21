'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  House, 
  ClockCounterClockwise, 
  Plus, 
  Receipt, 
  UserCircle 
} from '@phosphor-icons/react';

export function BottomNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const navItems = [
    { name: 'Início', href: '/', Icon: House, active: pathname === '/' && !isNew },
    { name: 'Histórico', href: '/jornada', Icon: ClockCounterClockwise, active: pathname === '/jornada' && !isNew },
    { name: 'Novo', href: '/lancamentos?new=true', Icon: Plus, isCenter: true, active: isNew },
    { name: 'Gastos', href: '/lancamentos', Icon: Receipt, active: pathname === '/lancamentos' && !isNew },
    { name: 'Perfil', href: '/perfil', Icon: UserCircle, active: pathname === '/perfil' && !isNew },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-neutral-100/80 py-1.5 px-4 z-50 shadow-[0_-4px_24px_rgba(234,29,44,0.06)]" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}>
      <div className="flex justify-around items-end max-w-md mx-auto relative">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -translate-y-4 relative z-10 cursor-pointer"
              >
                <div className="w-14 h-14 bg-[#EA1D2C] rounded-full flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(234,29,44,0.6)] border-4 border-white hover:scale-105 active:scale-95 transition-all">
                  <Plus size={26} weight="bold" className="text-white" />
                </div>
              </Link>
            );
          }

          const IconComponent = item.Icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center py-1 w-14 cursor-pointer"
            >
              <IconComponent 
                size={22}
                weight={item.active ? "fill" : "regular"}
                className={`transition-all duration-200 ${
                  item.active 
                    ? 'text-[#EA1D2C] scale-110' 
                    : 'text-[#737373] hover:text-[#171717]'
                }`} 
              />
              <span 
                className={`text-[9.5px] mt-1 transition-all duration-200 ${
                  item.active 
                    ? 'text-[#EA1D2C] font-semibold' 
                    : 'text-[#737373]'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
