'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet } from 'lucide-react';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Resumo', href: '/', Icon: Home, active: pathname === '/' },
    { name: 'Lançamentos', href: '/lancamentos', Icon: Wallet, active: pathname.startsWith('/lancamentos') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-card border-t border-border py-2 px-4 z-50 shadow-premium" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}>
      <div className="flex justify-around items-center max-w-md mx-auto relative">
        {navItems.map((item) => {
          const IconComponent = item.Icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center py-1 w-20 cursor-pointer active:scale-95 transition-all"
            >
              <IconComponent 
                size={22}
                strokeWidth={item.active ? 2.5 : 2}
                className={`transition-all duration-200 ${
                  item.active ? 'text-foreground' : 'text-muted'
                }`} 
              />
              <span 
                className={`text-[9px] font-extrabold mt-1 transition-all duration-200 uppercase tracking-tight ${
                  item.active ? 'text-foreground' : 'text-muted'
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
