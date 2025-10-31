import { useEffect, useRef } from 'react';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
}

export function PieChart({ data, title }: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Handle HiDPI displays properly
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    const centerX = rect.width / 2;
    const centerY = (rect.height - 60) / 2;
    const radius = Math.min(centerX, centerY) - 40;

    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#666';
      ctx.fillText('No data available', centerX, centerY);
      return;
    }

    let currentAngle = -Math.PI / 2;

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Percentage text
      const midAngle = currentAngle + sliceAngle / 2;
      const textX = centerX + Math.cos(midAngle) * (radius * 0.7);
      const textY = centerY + Math.sin(midAngle) * (radius * 0.7);

      const percentage = ((item.value / total) * 100).toFixed(1);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${percentage}%`, textX, textY);

      currentAngle += sliceAngle;
    });

    // Legend
    const legendY = rect.height - 50;
    const legendItemWidth = rect.width / data.length;

    data.forEach((item, index) => {
      const legendX = legendItemWidth * index + legendItemWidth / 2;

      ctx.beginPath();
      ctx.arc(legendX - 35, legendY, 6, 0, 2 * Math.PI);
      ctx.fillStyle = item.color;
      ctx.fill();

      ctx.fillStyle = '#374151';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, legendX - 20, legendY + 1);
    });

    // Title
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, rect.width / 2, 20);

  }, [data, title]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <canvas ref={canvasRef} className="w-full" style={{ height: '350px' }} />
    </div>
  );
}
