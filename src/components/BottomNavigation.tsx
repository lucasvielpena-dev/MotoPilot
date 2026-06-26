'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Home, 
  Bike, 
  PlusCircle, 
  BarChart3, 
  CircleUserRound 
} from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const navItems = [
    { name: 'Início', href: '/', Icon: Home, active: pathname === '/' && !isNew },
    { name: 'Corridas', href: '/lancamentos', Icon: Bike, active: pathname === '/lancamentos' && !isNew },
    { name: 'Nova', href: '/lancamentos?new=true', Icon: PlusCircle, isCenter: true, active: isNew },
    { name: 'Stats', href: '/relatorios', Icon: BarChart3, active: pathname === '/relatorios' && !isNew },
    { name: 'Perfil', href: '/perfil', Icon: CircleUserRound, active: pathname === '/perfil' && !isNew },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-card border-t border-border py-1.5 px-4 z-50 shadow-premium" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}>
      <div className="flex justify-around items-center max-w-md mx-auto relative">
        {navItems.map((item) => {
          const IconComponent = item.Icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center py-1 w-14 cursor-pointer active:scale-95 transition-all"
            >
              <IconComponent 
                size={item.isCenter ? 28 : 24}
                strokeWidth={item.active ? 2.5 : 2}
                className={`transition-all duration-200 ${
                  item.isCenter
                    ? 'text-primary'
                    : item.active 
                      ? 'text-foreground' 
                      : 'text-muted'
                }`} 
              />
              <span 
                className={`text-[9px] font-extrabold mt-1 transition-all duration-200 uppercase tracking-tight ${
                  item.active || item.isCenter
                    ? 'text-foreground' 
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
