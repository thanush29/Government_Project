
import { LucideIcon } from 'lucide-react';
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: number | string | null | undefined;
  icon: LucideIcon;
  subtitle?: string;
  prefix?: string;
  animated?: boolean;
}

/** Convert numbers into readable India format (1.23L / 3.4Cr / 90K) */
function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "—";

  if (typeof value === "string") return value;

  if (value >= 1_00_00_000) return `${(value / 1_00_00_000).toFixed(2)} Cr`;
  if (value >= 1_00_000) return `${(value / 1_00_000).toFixed(2)} L`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;

  return value.toLocaleString("en-IN");
}

export function KPICard({ title, value, icon: Icon, subtitle, prefix, animated }: KPICardProps) {
  const formatted = `${prefix ?? ""}${formatNumber(value)}`;

  const CardWrapper = animated ? motion.div : "div";

  return (
    <CardWrapper
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={animated ? { duration: 0.6 } : undefined}
      whileHover={animated ? { 
        scale: 1.05,
        boxShadow: "0 25px 50px rgba(139, 92, 246, 0.6)"
      } : undefined}
      className="bg-gradient-to-br from-purple-600/90 via-pink-600/90 to-blue-600/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 transform transition-all duration-300 border-2 border-purple-400/50"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold text-purple-100 mb-2 uppercase tracking-wider">{title}</p>
          <h3 className="text-4xl font-black text-white mb-2 drop-shadow-lg">{formatted}</h3>

          {subtitle && (
            <p className="text-xs text-purple-200 font-medium">{subtitle}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-green-600 p-4 rounded-2xl shadow-xl border-2 border-white/30">
          <Icon className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
      </div>
    </CardWrapper>
  );
}