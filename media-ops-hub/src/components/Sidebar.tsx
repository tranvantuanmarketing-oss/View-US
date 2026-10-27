'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Film, 
  Link2, 
  Layers, 
  Send, 
  Clock, 
  ShieldCheck,
  Radio
} from 'lucide-react';

const navigation = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Lên lịch & Kho Reels', href: '/posts', icon: Film },
  { name: 'Kho Link Blog Kéo View', href: '/links', icon: Link2 },
  { name: '4 Fanpage FB', href: '/fanpages', icon: Layers },
  { name: 'Telegram Bot & Logs', href: '/telegram', icon: Send },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg">
              MO
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">MEDIA OPS HUB</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-400 font-medium">Auto Bot 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Múi giờ thị trường */}
        <div className="px-4 py-3 mx-4 my-4 rounded-lg bg-slate-800/50 border border-slate-750 text-xs">
          <div className="text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Múi Giờ Vận Hành</span>
          </div>
          <div className="space-y-1.5 text-slate-300">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">🇫🇷 Paris:</span>
              <span className="font-mono text-blue-300 font-medium">UTC+2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">🇳🇱 Amsterdam:</span>
              <span className="font-mono text-amber-300 font-medium">UTC+2</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            SQLite Database
          </span>
          <span className="text-emerald-400 font-mono">dev.db</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Version</span>
          <span className="font-mono">1.0.0 (Phase 1 MVP)</span>
        </div>
      </div>
    </aside>
  );
}
