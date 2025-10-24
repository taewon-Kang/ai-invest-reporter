"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import PriceChart from "@/components/PriceChart";

type Report = {
  content: string;
};

export default function HomePage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1h");
  const [klines, setKlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  const fetchKlines = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/klines?symbol=${symbol}&interval=${interval}&limit=300`
      );
      const json = await res.json();
      setKlines(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval]);

  useEffect(() => {
    fetchKlines();
  }, [fetchKlines]);

  const requestReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, timeframe: interval }),
      });
      const json = await res.json();
      setReport(json);
    } finally {
      setLoading(false);
    }
  }, [symbol, interval]);

  const disabled = useMemo(() => loading || !symbol, [loading, symbol]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            AI 투자 리포트 생성기
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            최신 차트 데이터와 AI 분석을 통해 스마트한 투자 인사이트를
            얻어보세요
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <form
            className="flex flex-wrap items-end gap-6"
            onSubmit={(e) => {
              e.preventDefault();
              fetchKlines();
            }}
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                거래 심볼
              </label>
              <input
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="BTCUSDT"
              />
            </div>

            <div className="min-w-[120px]">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                시간 간격
              </label>
              <select
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              >
                <option value="1h">1시간</option>
                <option value="4h">4시간</option>
                <option value="1d">1일</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg"
                disabled={disabled}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    로딩중...
                  </div>
                ) : (
                  "차트 불러오기"
                )}
              </button>

              <button
                type="button"
                onClick={requestReport}
                className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-lg"
                disabled={disabled}
              >
                AI 리포트 생성
              </button>
            </div>
          </form>
        </div>

        {/* Chart Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">가격 차트</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              실시간 데이터
            </div>
          </div>

          {klines.length > 0 ? (
            <div className="relative">
              <PriceChart klines={klines} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">차트 데이터를 불러오세요</p>
              <p className="text-sm">
                위의 컨트롤 패널에서 심볼을 입력하고 차트를 불러오세요
              </p>
            </div>
          )}
        </section>

        {/* Report Section */}
        {report?.content && (
          <section className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                AI 투자 분석 리포트
              </h2>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
              <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {report.content}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
