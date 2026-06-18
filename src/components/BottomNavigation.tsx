'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  House, 
  MapTrifold, 
  Receipt, 
  ChartBar, 
  UserCircle 
} from '@phosphor-icons/react';

const navItems = [
  { name: 'Painel', href: '/', Icon: House },
  { name: 'Jornada', href: '/jornada', Icon: MapTrifold },
  { name: 'Lançamentos', href: '/lancamentos', Icon: Receipt },
  { name: 'Relatórios', href: '/relatorios', Icon: ChartBar },
  { name: 'Perfil', href: '/perfil', Icon: UserCircle },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md md:max-w-3xl lg:max-w-5xl bg-[var(--color-card)]/85 backdrop-blur-lg border border-[var(--color-border)] rounded-[24px] py-1 px-3 z-50 shadow-2xl transition-all">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.Icon;

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center w-full py-2 space-y-0.5 transition-all relative group cursor-pointer"
            >
              <IconComponent 
                size={22}
                weight={isActive ? "fill" : "regular"}
                className={`transition-all duration-300 ${
                  isActive 
                    ? 'text-[var(--color-primary)] scale-110' 
                    : 'text-[var(--color-muted)] group-hover:text-[var(--color-foreground)] group-hover:scale-105'
                }`} 
              />
              <span 
                className={`text-[9.5px] font-semibold transition-all duration-300 ${
                  isActive 
                    ? 'text-[var(--color-primary)] font-bold' 
                    : 'text-[var(--color-muted)] group-hover:text-[var(--color-foreground)]'
                }`}
              >
                {item.name}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-5 h-[3px] bg-[var(--color-primary)] rounded-full shadow-[0_1px_6px_rgba(61,219,97,0.4)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
