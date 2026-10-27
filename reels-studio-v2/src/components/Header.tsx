"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  PlaySquare,
  PenTool,
  Library,
  Layers,
  Settings,
  BarChart3,
  Cpu,
  Radio,
  Sparkles,
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [showTgModal, setShowTgModal] = useState(false);
  const [tgStatus, setTgStatus] = useState<{ configured: boolean; botUsername: string | null; events: any[] } | null>(null);
  const [testingTg, setTestingTg] = useState(false);

  useEffect(() => {
    fetchTgStatus();
  }, []);

  async function fetchTgStatus() {
    try {
      const res = await fetch("/api/telegram");
      const json = await res.json();
      if (json.success && json.data) {
        setTgStatus(json.data);
      }
    } catch (err) {
      console.error("Lỗi lấy trạng thái Telegram", err);
    }
  }

  async function handleSendTestTelegram() {
    setTestingTg(true);
    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_event" }),
      });
      const json = await res.json();
      fetchTgStatus();
      if (json.success) {
        alert("Đã tạo sự kiện và lưu vào hàng đợi Telegram Outbox!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTestingTg(false);
    }
  }

  return (
    <header className="story-masthead sticky top-0 z-50 px-4 gap-3 flex items-center justify-between shadow-xs">
      {/* Brand & Left Navigation */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <Link href="/render" className="shrink-0 flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img src="/brand/tree-logo.png" alt="" className="story-tree-logo" width={38} height={38} />
          <div className="flex flex-col">
            <span className="story-wordmark font-extrabold leading-tight tracking-tight">
              The Story
            </span>
          </div>
        </Link>

        <nav aria-label="Điều hướng chính" className="flex items-center gap-1 font-bold overflow-x-auto whitespace-nowrap min-w-0 flex-1">
          {[
            ["/render", "Dựng video"], ["/batches", "Lô video"], ["/cards", "Viết & kho thẻ"],
            ["/settings", "Cài đặt page"], ["/viral", "Kho Viral"], ["/radar", "Radar"],
            ["/web-pages", "Web & Page"], ["/stats", "Báo cáo"],
          ].map(([href,label]) => <Link key={href} href={href} className={`shrink-0 px-2.5 py-2 rounded-lg ${pathname.startsWith(href) ? "text-blue-800 bg-blue-100 border-2 border-blue-500 shadow-sm font-extrabold" : "border-2 border-transparent hover:bg-blue-50 hover:text-blue-800"}`}>{label}</Link>)}
        </nav>
      </div>

      {/* Right User & Actions */}
      <div className="shrink-0 flex items-center gap-3">
        {/* Telegram Bell Button */}
        <button
          onClick={() => {
            setShowTgModal(true);
            fetchTgStatus();
          }}
          className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-colors relative"
          title="Hộp thư Telegram Outbox"
        >
          <Bell className="w-4 h-4" />
          {tgStatus?.configured && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          )}
        </button>


      </div>

      {/* Telegram Outbox Modal */}
      {showTgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Hộp Thư Thông Báo Telegram (Outbox)</h3>
              </div>
              <button
                onClick={() => setShowTgModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Trạng thái cấu hình bot:</span>
                  {tgStatus?.configured ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Đã kết nối (@{tgStatus.botUsername || "bot"})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Chưa cấu hình (TELEGRAM_BOT_TOKEN)
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Thông báo về lô video dựng xong, lỗi kết xuất và trạng thái worker sẽ được lưu bền vững vào bảng SQLite <code className="text-blue-700 font-bold">telegram_outbox</code> và tự động gửi lại có backoff.
                </p>
              </div>

              {/* Event Logs */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">Hàng đợi sự kiện gần đây:</div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                  {tgStatus?.events && tgStatus.events.length > 0 ? (
                    tgStatus.events.map((ev: any) => (
                      <div key={ev.id} className="text-[11px] p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{ev.event_type}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${ev.status === "delivered" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          {ev.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Chưa có thông báo nào trong hàng đợi.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={handleSendTestTelegram}
                disabled={testingTg}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingTg ? "Đang gửi..." : "Thử nghiệm gửi Outbox"}</span>
              </button>

              <button
                onClick={() => setShowTgModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
