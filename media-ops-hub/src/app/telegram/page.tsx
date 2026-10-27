'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, AlertTriangle, Clock, RefreshCw, Terminal, Bell } from 'lucide-react';

interface SystemLog {
  id: string;
  level: string;
  module: string;
  message: string;
  createdAt: string;
}

export default function TelegramLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const triggerTest = async (type: string) => {
    setTestResult('Đang xử lý...');
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      setTestResult(data.message || 'Thành công');
      fetchLogs();
    } catch (e: any) {
      setTestResult(`Lỗi: ${e.message}`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Send className="w-4 h-4" />
            <span>Giám Sát Telegram Bot 24/7 & Audit Logs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Điều Khiển Bot & Nhật Ký Hệ Thống</h1>
          <p className="text-sm text-slate-400 mt-1">
            Kiểm tra định dạng tin nhắn Telegram, các tín hiệu gọi từ Auto-post tool và nhật ký hoạt động.
          </p>
        </div>

        <button
          onClick={() => fetchLogs()}
          className="p-2.5 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
          title="Làm mới log"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {testResult && (
        <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-xl text-blue-200 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <span>{testResult}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-xs text-blue-400 hover:underline">
            Đóng
          </button>
        </div>
      )}

      {/* Control Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Thông Báo Thành Công</span>
          </div>
          <p className="text-xs text-slate-400">
            Gửi thông báo có cờ Pháp/Hà Lan, tiêu đề, thời gian, link kéo traffic và link Facebook Reels.
          </p>
          <button
            onClick={() => triggerTest('PUBLISHED')}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md"
          >
            Bắn Thử Tin Xuất Bản Mẫu
          </button>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Cảnh Báo Lỗi (Error Alert)</span>
          </div>
          <p className="text-xs text-slate-400">
            Gửi cảnh báo khẩn cấp khi Auto-post thất bại kèm nguyên nhân lỗi để can thiệp kịp thời.
          </p>
          <button
            onClick={() => triggerTest('FAILED')}
            className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition shadow-md"
          >
            Bắn Thử Tin Cảnh Báo Lỗi
          </button>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <Clock className="w-4 h-4" />
            <span>Báo Cáo Tổng Kết Ngày (23:00)</span>
          </div>
          <p className="text-xs text-slate-400">
            Thống kê tổng số video đã xuất bản, video đang hẹn giờ và số lỗi theo từng Fanpage.
          </p>
          <button
            onClick={() => triggerTest('DAILY_REPORT')}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-md"
          >
            Bắn Thử Báo Cáo Ngày
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Nhật Ký Hệ Thống & Telegram Audit Logs</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">50 sự kiện gần nhất</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto font-mono text-xs">
          {logs.map((log) => {
            const levelClass = {
              INFO: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              WARN: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              ERROR: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            }[log.level] || 'text-slate-400';

            return (
              <div key={log.id} className="p-3.5 hover:bg-slate-800/30 transition flex items-start gap-3">
                <span className="text-slate-500 whitespace-nowrap shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString('vi-VN')}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${levelClass}`}>
                  {log.level}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] shrink-0">
                  {log.module}
                </span>
                <span className="text-slate-200 flex-1 break-words">
                  {log.message}
                </span>
              </div>
            );
          })}

          {logs.length === 0 && !loading && (
            <div className="p-8 text-center text-slate-500">
              Chưa có nhật ký nào được ghi nhận.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
