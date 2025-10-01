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
  Legend
);

type Props = {
  klines: any[];
};

export default function PriceChart({ klines }: Props) {
  const data = useMemo(() => {
    const labels = klines.map((k) => k[0]);
    const closes = klines.map((k) => Number(k[4]));
    return {
      labels,
      datasets: [
        {
          label: "Close",
          data: closes,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.15)",
          tension: 0.2,
          pointRadius: 0,
        },
      ],
    };
  }, [klines]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { type: "time", time: { unit: "day" } },
        y: { beginAtZero: false },
      },
      plugins: {
        legend: { display: false },
      },
    }),
    []
  );

  return (
    <div className="h-80 w-full">
      <Line data={data as any} options={options as any} />
    </div>
  );
}
