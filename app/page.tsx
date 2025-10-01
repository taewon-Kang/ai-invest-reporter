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
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI 투자 리포트 생성기</h1>
        <p className="mt-2 text-sm text-gray-600">
          심볼을 입력하고 차트와 리포트를 생성한다.
        </p>
      </div>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          fetchKlines();
        }}
      >
        <label className="flex flex-col">
          <span className="text-xs text-gray-600">심볼</span>
          <input
            className="mt-1 w-40 rounded border border-gray-300 px-3 py-2 text-sm"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="BTCUSDT"
          />
        </label>
        <label className="flex flex-col">
          <span className="text-xs text-gray-600">인터벌</span>
          <select
            className="mt-1 w-28 rounded border border-gray-300 px-3 py-2 text-sm"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
          >
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>
        </label>
        <button
          type="submit"
          className="h-9 rounded bg-blue-600 px-4 text-sm font-medium text-white disabled:opacity-50"
          disabled={disabled}
        >
          차트 불러오기
        </button>
        <button
          type="button"
          onClick={requestReport}
          className="h-9 rounded bg-gray-900 px-4 text-sm font-medium text-white disabled:opacity-50"
          disabled={disabled}
        >
          리포트 생성
        </button>
      </form>

      <section>
        {klines.length > 0 && <PriceChart klines={klines} />}
        {klines.length === 0 && (
          <div className="text-sm text-gray-500">데이터가 없습니다.</div>
        )}
      </section>

      <section>
        {report?.content && (
          <div className="rounded border border-gray-200 p-4 text-sm whitespace-pre-wrap">
            {report.content}
          </div>
        )}
      </section>
    </main>
  );
}
