import { useEffect, useRef } from "react";

interface MonthlyData {
  month: string;
  total_individuals_worked: number | null;
}

interface BarChartProps {
  data: MonthlyData[];
}

function formatNumberIN(num: number | null) {
  if (num === null) return "—";
  if (num >= 1_00_00_000) return `${(num / 1_00_00_000).toFixed(2)} Cr`;
  if (num >= 1_00_000) return `${(num / 1_00_000).toFixed(2)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString("en-IN");
}

const monthOrder = [
  "April","May","June","July","August","September","October","November","December",
  "January","February","March"
];

const monthShort: Record<string, string> = {
  April: "Apr", May: "May", June: "Jun", July: "Jul", August: "Aug",
  September: "Sep", October: "Oct", November: "Nov", December: "Dec",
  January: "Jan", February: "Feb", March: "Mar"
};

export function BarChart({ data }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sortedData = [...data].sort(
    (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
  );

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (!sortedData || sortedData.length === 0) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data available", rect.width / 2, rect.height / 2);
      return;
    }

    const padding = { top: 30, right: 20, bottom: 60, left: 70 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    const values = sortedData.map(d => d.total_individuals_worked ?? 0);
    const maxValue = Math.max(...values) || 1;
    const barWidth = chartWidth / sortedData.length - 8;

    // Y-axis grid lines
    ctx.strokeStyle = "#e5e7eb";
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      const value = maxValue - (maxValue / 5) * i;
      ctx.fillStyle = "#6b7280";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(formatNumberIN(Math.round(value)), padding.left - 8, y + 4);
    }

    // Bars
    sortedData.forEach((d, i) => {
      const x = padding.left + i * (barWidth + 8);
      const barHeight =
        ((d.total_individuals_worked ?? 0) / maxValue) * chartHeight;
      const y = padding.top + (chartHeight - barHeight);

      ctx.fillStyle = "#f97316"; // orange
      ctx.fillRect(x, y, barWidth, barHeight);

      // Rotated Month Labels
      ctx.save();
      ctx.translate(x + barWidth / 2, padding.top + chartHeight + 8);
      ctx.rotate((-45 * Math.PI) / 180);
      ctx.fillStyle = "#374151";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(monthShort[d.month] || d.month.slice(0, 3), 0, 0);
      ctx.restore();
    });

    // Chart Title
    ctx.fillStyle = "#374151";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Monthly Individuals Worked", rect.width / 2, 22);
  }, [sortedData]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <canvas ref={canvasRef} className="w-full" style={{ height: "320px" }} />
    </div>
  );
}
