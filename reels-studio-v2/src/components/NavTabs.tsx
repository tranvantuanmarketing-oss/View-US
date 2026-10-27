"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PenTool,
  Library,
  Layers,
  Film,
  PlaySquare,
  Settings,
  BarChart3,
  Cpu,
} from "lucide-react";

export function NavTabs() {
  const pathname = usePathname();

  const tabs = [
    { label: "Viết thẻ", href: "/cards/writer", icon: PenTool },
    { label: "Kho thẻ", href: "/cards", icon: Library },
    { label: "Lấy thẻ cho page", href: "/cards/pull", icon: Layers },
    { label: "Lô video", href: "/batches", icon: Film },
    { label: "Dựng video", href: "/render", icon: PlaySquare },
    { label: "Cài đặt page", href: "/settings", icon: Settings },
    { label: "Thống kê", href: "/stats", icon: BarChart3 },
    { label: "Máy dựng", href: "/helpers", icon: Cpu },
  ];

  return (
    <nav className="bg-white border-b border-blue-200 px-6 flex items-center gap-1 overflow-x-auto scrollbar-none shadow-2xs">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          pathname === tab.href ||
          (tab.href !== "/" && pathname.startsWith(tab.href.split("?")[0]));

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              isActive
                ? "text-blue-700 border-blue-600 bg-blue-50/70 font-bold"
                : "text-slate-700 border-transparent hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/40"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-blue-400"}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
