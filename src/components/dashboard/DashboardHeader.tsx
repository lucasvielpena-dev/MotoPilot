'use client';

import { Bike } from 'lucide-react';

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-center py-1">
      <div className="flex items-center space-x-2">
        <Bike size={22} strokeWidth={2.5} className="text-primary" />
        <span className="text-[17px] font-extrabold tracking-tight text-foreground font-heading">MotoPilot</span>
      </div>
    </div>
  );
}
