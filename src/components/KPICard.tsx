import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | null | undefined;
  icon: LucideIcon;
  subtitle?: string;
  prefix?: string; // e.g. ₹
}

/** Convert numbers into readable India format (1.23L / 3.4Cr / 90K) */
function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";

  // Big crore/lakh style — India proud 🇮🇳
  if (value >= 1_00_00_000) return `${(value / 1_00_00_000).toFixed(2)} Cr`;
  if (value >= 1_00_000) return `${(value / 1_00_000).toFixed(2)} L`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;

  return value.toLocaleString("en-IN");
}

export function KPICard({ title, value, icon: Icon, subtitle, prefix }: KPICardProps) {
  const formatted = `${prefix ?? ""}${formatNumber(value)}`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatted}</h3>
          
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-green-600 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
