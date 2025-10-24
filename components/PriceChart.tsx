"use client";
import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

type Props = {
  klines: any[];
};

export default function PriceChart({ klines }: Props) {
  const data = useMemo(() => {
    const labels = klines.map((k) => k[0]);
    const closes = klines.map((k) => Number(k[4]));
    const highs = klines.map((k) => Number(k[2]));
    const lows = klines.map((k) => Number(k[3]));

    // Calculate price change
    const firstPrice = closes[0];
    const lastPrice = closes[closes.length - 1];
    const priceChange = lastPrice - firstPrice;
    const priceChangePercent = (priceChange / firstPrice) * 100;

    const isPositive = priceChange >= 0;

    return {
      labels,
      datasets: [
        {
          label: "가격",
          data: closes,
          borderColor: isPositive ? "#10b981" : "#ef4444",
          backgroundColor: isPositive
            ? "rgba(16, 185, 129, 0.1)"
            : "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: isPositive ? "#10b981" : "#ef4444",
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 2,
          fill: true,
          borderWidth: 3,
        },
      ],
    };
  }, [klines]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: "index" as const,
      },
      scales: {
        x: {
          type: "time" as const,
          time: {
            unit: "day" as const,
            displayFormats: {
              day: "MMM dd",
              hour: "MMM dd HH:mm",
            },
          },
          grid: {
            display: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: "#6b7280",
            font: {
              size: 12,
              weight: "500" as const,
            },
          },
        },
        y: {
          beginAtZero: false,
          grid: {
            color: "#f3f4f6",
            drawBorder: false,
          },
          border: {
            display: false,
          },
          ticks: {
            color: "#6b7280",
            font: {
              size: 12,
              weight: "500" as const,
            },
            callback: function (value: any) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          cornerRadius: 12,
          displayColors: false,
          titleFont: {
            size: 14,
            weight: "600" as const,
          },
          bodyFont: {
            size: 13,
            weight: "500" as const,
          },
          padding: 12,
          callbacks: {
            title: function (context: any) {
              const date = new Date(context[0].label);
              return date.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
            },
            label: function (context: any) {
              const value = context.parsed.y;
              const firstPrice = klines[0][4];
              const change = value - firstPrice;
              const changePercent = (change / firstPrice) * 100;

              return [
                `가격: $${value.toLocaleString()}`,
                `변화: ${change >= 0 ? "+" : ""}${change.toFixed(2)} (${
                  changePercent >= 0 ? "+" : ""
                }${changePercent.toFixed(2)}%)`,
              ];
            },
          },
        },
      },
      elements: {
        point: {
          hoverBackgroundColor: "#ffffff",
        },
      },
    }),
    [klines]
  );

  // Calculate price statistics
  const stats = useMemo(() => {
    if (klines.length === 0) return null;

    const closes = klines.map((k) => Number(k[4]));
    const firstPrice = closes[0];
    const lastPrice = closes[closes.length - 1];
    const change = lastPrice - firstPrice;
    const changePercent = (change / firstPrice) * 100;
    const maxPrice = Math.max(...closes);
    const minPrice = Math.min(...closes);

    return {
      current: lastPrice,
      change,
      changePercent,
      max: maxPrice,
      min: minPrice,
      isPositive: change >= 0,
    };
  }, [klines]);

  return (
    <div className="space-y-4">
      {/* Price Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="text-sm text-gray-600 font-medium">현재 가격</div>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.current.toLocaleString()}
            </div>
          </div>

          <div
            className={`rounded-xl p-4 border ${
              stats.isPositive
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-100"
                : "bg-gradient-to-r from-red-50 to-rose-50 border-red-100"
            }`}
          >
            <div className="text-sm text-gray-600 font-medium">변화</div>
            <div
              className={`text-2xl font-bold ${
                stats.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.isPositive ? "+" : ""}
              {stats.changePercent.toFixed(2)}%
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="text-sm text-gray-600 font-medium">최고가</div>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.max.toLocaleString()}
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4 border border-orange-100">
            <div className="text-sm text-gray-600 font-medium">최저가</div>
            <div className="text-2xl font-bold text-gray-900">
              ${stats.min.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="h-96 w-full">
          <Line data={data as any} options={options as any} />
        </div>
      </div>
    </div>
  );
}
