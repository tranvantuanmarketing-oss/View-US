"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Filter, BarChart3, TrendingUp, CheckCircle2, RotateCw, Layers } from "lucide-react";

interface MatrixRow {
  staff: string;
  nl: number;
  fr: number;
  es: number;
  en: number;
  de: number;
  pl: number;
  total: number;
}

interface PageBreakdownItem {
  page: string;
  lang: string;
  staff: string;
  count: number;
}

export default function StatsPage() {
  const [dateRange, setDateRange] = useState("Tất cả thời gian");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedPage, setSelectedPage] = useState("all");

  const [matrixData, setMatrixData] = useState<MatrixRow[]>([]);
  const [pageBreakdown, setPageBreakdown] = useState<PageBreakdownItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      const json = await res.json();
      if (json.success && json.data) {
        setMatrixData(json.data.matrixData || []);
        setPageBreakdown(json.data.pageBreakdown || []);
      }
    } catch (err) {
      console.error("Lỗi nạp thống kê", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredPages = pageBreakdown.filter((item) => {
    if (selectedLanguage !== "all") {
      if (selectedLanguage === "nl" && !item.lang.toLowerCase().includes("nl")) return false;
      if (selectedLanguage === "fr" && !item.lang.toLowerCase().includes("fr")) return false;
      if (selectedLanguage === "es" && !item.lang.toLowerCase().includes("es")) return false;
      if (selectedLanguage === "en" && !item.lang.toLowerCase().includes("en")) return false;
      if (selectedLanguage === "pl" && !item.lang.toLowerCase().includes("pl")) return false;
    }
    if (selectedPage !== "all" && item.page !== selectedPage) return false;
    return true;
  });

  const totals = {
    nl: matrixData.reduce((acc, r) => acc + (r.nl || 0), 0),
    fr: matrixData.reduce((acc, r) => acc + (r.fr || 0), 0),
    es: matrixData.reduce((acc, r) => acc + (r.es || 0), 0),
    en: matrixData.reduce((acc, r) => acc + (r.en || 0), 0),
    pl: matrixData.reduce((acc, r) => acc + (r.pl || 0), 0),
    total: matrixData.reduce((acc, r) => acc + (r.total || 0), 0),
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Page Title */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Reels</h1>
            <p className="text-xs text-slate-500 mt-0.5">Thống kê hiệu suất kết xuất video theo nhân viên và trang (Dữ liệu thực từ SQLite WAL)</p>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:border-blue-400 text-xs font-semibold shadow-2xs transition-all"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Làm mới số liệu</span>
          </button>
        </div>

        {/* Filter Card */}
        <div className="bg-white border border-blue-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-wrap items-end gap-4">
            {/* Thời gian */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Thời gian</label>
              <div className="relative">
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 min-w-[210px]"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Ngôn ngữ */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ngôn ngữ</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 min-w-[170px]"
              >
                <option value="all">Tất cả</option>
                <option value="en">EN_Mỹ / Anh (Tiếng Anh)</option>
                <option value="pl">PL_Ba Lan (Tiếng Ba Lan)</option>
                <option value="nl">NL_Hà Lan (Tiếng Hà Lan)</option>
                <option value="fr">FR_Pháp (Tiếng Pháp)</option>
                <option value="es">ES_Tây Ban Nha (Tiếng Tây Ban Nha)</option>
              </select>
            </div>

            {/* Page */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Page</label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-blue-500 min-w-[200px]"
              >
                <option value="all">Tất cả</option>
                {Array.from(new Set(pageBreakdown.map((p) => p.page))).map((pName) => (
                  <option key={pName} value={pName}>
                    {pName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Matrix Card */}
        <div className="bg-white border border-blue-200/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Video dựng xong · {dateRange}</span>
              <span className="text-xs font-normal text-slate-500">
                Chỉ số thực tế · tính theo giờ Việt Nam, lúc Helper báo xong
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex items-center justify-center gap-2">
              <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
              <span>Đang tính toán số liệu thống kê...</span>
            </div>
          ) : matrixData.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">Chưa có video nào hoàn tất</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hiện tại chưa có lô video nào hoàn thành kết xuất trên hệ thống. Dữ liệu thực từ SQLite WAL.
              </p>
            </div>
          ) : (
            <>
              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                      <th className="py-2.5 px-3">Nhân viên</th>
                      <th className="py-2.5 px-3 text-right">EN_Mỹ / Anh</th>
                      <th className="py-2.5 px-3 text-right">NL_Hà Lan</th>
                      <th className="py-2.5 px-3 text-right">FR_Pháp</th>
                      <th className="py-2.5 px-3 text-right">ES_Tây Ban Nha</th>
                      <th className="py-2.5 px-3 text-right">PL_Ba Lan</th>
                      <th className="py-2.5 px-3 text-right font-bold text-slate-900">Tổng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {matrixData.map((row) => (
                      <tr key={row.staff} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">{row.staff}</td>
                        <td className="py-3 px-3 text-right text-slate-800">{row.en}</td>
                        <td className="py-3 px-3 text-right text-slate-800">{row.nl}</td>
                        <td className="py-3 px-3 text-right text-slate-800">{row.fr}</td>
                        <td className="py-3 px-3 text-right text-slate-800">{row.es}</td>
                        <td className="py-3 px-3 text-right text-slate-800">{row.pl || 0}</td>
                        <td className="py-3 px-3 text-right font-bold text-blue-700">{row.total}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/50 font-bold border-t-2 border-slate-200">
                      <td className="py-3 px-3 text-slate-900">Tổng</td>
                      <td className="py-3 px-3 text-right text-slate-900">{totals.en}</td>
                      <td className="py-3 px-3 text-right text-slate-900">{totals.nl}</td>
                      <td className="py-3 px-3 text-right text-slate-900">{totals.fr}</td>
                      <td className="py-3 px-3 text-right text-slate-900">{totals.es}</td>
                      <td className="py-3 px-3 text-right text-slate-900">{totals.pl}</td>
                      <td className="py-3 px-3 text-right text-blue-700 text-sm">{totals.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Theo Page Breakdown */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 mb-3">Theo page</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px] font-semibold">
                        <th className="py-2 px-3">Page</th>
                        <th className="py-2 px-3">Ngôn ngữ</th>
                        <th className="py-2 px-3">Nhân viên</th>
                        <th className="py-2 px-3 text-right font-bold text-slate-900">Video</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredPages.map((item) => (
                        <tr key={item.page} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{item.page}</td>
                          <td className="py-2.5 px-3 text-slate-600">{item.lang}</td>
                          <td className="py-2.5 px-3 text-slate-700">{item.staff}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-700">{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
