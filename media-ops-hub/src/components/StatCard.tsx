import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export default function StatCard({
  title,
  value,
  subtext,
  icon,
  variant = 'blue',
}: StatCardProps) {
  const variantStyles = {
    blue: {
      bg: 'bg-blue-950/30 border-blue-800/40 text-blue-400',
      badge: 'bg-blue-500/10 text-blue-400',
    },
    emerald: {
      bg: 'bg-emerald-950/30 border-emerald-800/40 text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-950/30 border-amber-800/40 text-amber-400',
      badge: 'bg-amber-500/10 text-amber-400',
    },
    rose: {
      bg: 'bg-rose-950/30 border-rose-800/40 text-rose-400',
      badge: 'bg-rose-500/10 text-rose-400',
    },
    purple: {
      bg: 'bg-purple-950/30 border-purple-800/40 text-purple-400',
      badge: 'bg-purple-500/10 text-purple-400',
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={`p-5 rounded-xl border ${style.bg} backdrop-blur-sm transition-all hover:border-slate-600`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-lg ${style.badge}`}>{icon}</div>
      </div>
      <div className="mt-3">
        <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
        {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
      </div>
    </div>
  );
}
