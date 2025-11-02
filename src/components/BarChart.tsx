import { useEffect, useRef, useState } from "react";

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

const normalizeMonth = (m: string) => {
  const clean = m.trim().toLowerCase();
  const map: Record<string, string> = {
    apr: "April", april: "April",
    may: "May",
    jun: "June", june: "June",
    jul: "July", july: "July",
    aug: "August", august: "August",
    sep: "September", sept: "September", september: "September",
    oct: "October", october: "October",
    nov: "November", november: "November",
    dec: "December", december: "December",
    jan: "January", january: "January",
    feb: "February", february: "February",
    mar: "March", march: "March"
  };
  return map[clean] ?? m; // fallback original
};

export function BarChart({ data }: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [fixedIndex, setFixedIndex] = useState<number | null>(null);

  const normalizedData = data.map(d => ({
    ...d,
    month: normalizeMonth(d.month)
  }));

  const sortedData = [...normalizedData].sort(
    (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
  );

  const drawChart = () => {
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

    const padding = { top: 30, right: 20, bottom: 60, left: 70 };
    const chartHeight = rect.height - padding.top - padding.bottom;
    const chartWidth = rect.width - padding.left - padding.right;

    const values = sortedData.map(d => d.total_individuals_worked ?? 0);
    const maxValue = Math.max(...values) || 1;
    const barWidth = chartWidth / sortedData.length - 8;

    // Grid
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

    sortedData.forEach((d, i) => {
      const x = padding.left + i * (barWidth + 8);
      const barHeight = ((d.total_individuals_worked ?? 0) / maxValue) * chartHeight;
      const y = padding.top + (chartHeight - barHeight);

      const isActive = i === (fixedIndex ?? hoverIndex);
      ctx.fillStyle = isActive ? "#fb923c" : "#f97316";
      ctx.globalAlpha = isActive ? 1 : 0.8;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Month label — NEVER undefined now
      const lbl = monthShort[d.month] ?? d.month;
      ctx.save();
      ctx.translate(x + barWidth / 2, padding.top + chartHeight + 8);
      ctx.rotate((-45 * Math.PI) / 180);
      ctx.fillStyle = "#374151";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(lbl, 0, 0);
      ctx.restore();

      if (isActive) {
        const val = formatNumberIN(d.total_individuals_worked);
        ctx.fillStyle = "#111827";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${val}`, x + barWidth / 2, y - 6);
      }
    });

    ctx.fillStyle = "#374151";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Monthly Individuals Worked", rect.width / 2, 22);
  };

  useEffect(drawChart, [sortedData, hoverIndex, fixedIndex]);

  const handleMove = (e: any) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const barWidth = (rect.width - 90) / sortedData.length;
    const index = Math.floor((x - 70) / barWidth);
    if (index !== hoverIndex) setHoverIndex(index >= 0 ? index : null);
  };

  const lockTooltip = () => setFixedIndex(hoverIndex);
  const clearTooltip = () => { setHoverIndex(null); setFixedIndex(null); };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 select-none">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: "320px" }}
        onMouseMove={handleMove}
        onMouseLeave={clearTooltip}
        onClick={lockTooltip}
        onTouchMove={handleMove}
        onTouchStart={lockTooltip}
      />
    </div>
  );
}
