import { useBarChartData } from '../../lib/hooks/useBarChartData';

interface BarChartInsightProps {
  districtName: string | null;
}

function formatNumberIN(num: number) {
  if (num >= 1_00_00_000) return `${(num / 1_00_00_000).toFixed(2)} Cr`;
  if (num >= 1_00_000) return `${(num / 1_00_000).toFixed(2)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString("en-IN");
}

export default function BarChartInsight({ districtName }: BarChartInsightProps) {
  const { data, total, average, peakMonth, peakValue, district, loading } = useBarChartData(districtName ?? "");

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 text-gray-500 text-sm italic">
        Fetching monthly workforce insights…
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 text-gray-500 text-sm italic">
        No monthly workforce data available for this district.
      </div>
    );
  }

  const prettyDistrict =
    district ? district.charAt(0).toUpperCase() + district.slice(1).toLowerCase() : '';

  const variability = data.length > 0 
    ? ((Math.max(...data.map(d => d.total_individuals_worked)) - 
        Math.min(...data.map(d => d.total_individuals_worked))) / average * 100)
    : 0;

  const isPeakHigh = peakValue > average * 1.3;
  const isStable = variability < 30;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl shadow-md p-6 border-l-4 border-orange-500">
      <h4 className="text-lg font-bold text-gray-800 mb-3">📊 Monthly Workforce Trends</h4>

      <p className="text-gray-700 leading-relaxed mb-2">
        <span className="font-bold text-orange-600">{prettyDistrict}</span> recorded a total of 
        <span className="font-semibold"> {formatNumberIN(total)}</span> individuals worked across all months
        under MGNREGA, with an average of <span className="font-semibold">{formatNumberIN(average)}</span> workers per month.
      </p>

      <ul className="text-sm text-gray-700 space-y-1 mb-3">
        <li>📈 Peak Employment Month: <b className="text-orange-600">{peakMonth}</b> with <b>{formatNumberIN(peakValue)}</b> workers</li>
        <li>📊 Monthly Average: <b className="text-blue-600">{formatNumberIN(average)}</b> individuals</li>
        <li>📉 Variability: <b className={isStable ? "text-green-600" : "text-yellow-600"}>{variability.toFixed(1)}%</b> 
          {isStable ? " — stable workforce" : " — seasonal fluctuations observed"}
        </li>
      </ul>

      <p className="text-gray-800 text-sm mb-2">
        {isPeakHigh
          ? `🌟 ${peakMonth} shows exceptional demand — likely peak agricultural or construction season.`
          : `📌 Employment remains relatively steady — consistent rural employment throughout the year.`}
      </p>

      {!isStable && (
        <p className="text-gray-800 text-sm">
          ⚠️ High variability suggests seasonal dependency — diversification of work types could stabilize employment.
        </p>
      )}

      <p className="text-gray-700 text-xs mt-3 italic">
        "Monthly patterns reveal the pulse of rural employment demand and planning opportunities."
      </p>
    </div>
  );
}