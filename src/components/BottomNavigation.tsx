'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Home, 
  CalendarCheck, 
  Plus, 
  Receipt, 
  User 
} from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const navItems = [
    { name: 'Início', href: '/', Icon: Home, active: pathname === '/' && !isNew },
    { name: 'Jornadas', href: '/jornada', Icon: CalendarCheck, active: pathname === '/jornada' && !isNew },
    { name: 'Novo', href: '/lancamentos?new=true', Icon: Plus, isCenter: true, active: isNew },
    { name: 'Gastos', href: '/lancamentos', Icon: Receipt, active: pathname === '/lancamentos' && !isNew },
    { name: 'Perfil', href: '/perfil', Icon: User, active: pathname === '/perfil' && !isNew },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-card border-t border-border py-1.5 px-4 z-50 shadow-premium" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}>
      <div className="flex justify-around items-end max-w-md mx-auto relative">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -translate-y-4 relative z-10 cursor-pointer active:scale-95 transition-all"
              >
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(234,29,44,0.4)] border-4 border-card hover:scale-105 active:scale-90 transition-all">
                  <Plus size={26} strokeWidth={3.5} className="text-white" />
                </div>
              </Link>
            );
          }

          const IconComponent = item.Icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center py-1 w-14 cursor-pointer active:scale-95 transition-all"
            >
              <IconComponent 
                size={23}
                strokeWidth={item.active ? 2.5 : 2}
                className={`transition-all duration-200 ${
                  item.active 
                    ? 'text-primary scale-110' 
                    : 'text-muted hover:text-foreground'
                }`} 
              />
              <span 
                className={`text-[9px] font-extrabold mt-1 transition-all duration-200 uppercase tracking-tight ${
                  item.active 
                    ? 'text-primary' 
                    : 'text-muted'
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
