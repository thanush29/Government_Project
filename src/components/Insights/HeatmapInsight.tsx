import { useHeatmapData } from '../../lib/hooks/useHeatmapData';

interface HeatmapInsightProps {
  districtName: string | null;
}

const monthShort: Record<string, string> = {
  April: 'Apr', May: 'May', June: 'Jun', July: 'Jul', August: 'Aug',
  September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec',
  January: 'Jan', February: 'Feb', March: 'Mar'
};

export default function HeatmapInsight({ districtName }: HeatmapInsightProps) {
  const { data, district, peakMonth, peakCategory, loading } =
    useHeatmapData(districtName ?? "");

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 text-gray-500 text-sm italic">
        Analyzing seasonal workforce patterns…
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 text-gray-500 text-sm italic">
        No seasonal activity data available for this district.
      </div>
    );
  }

  const totalPersondays = data.reduce(
    (sum, d) => sum + (d.women || 0) + (d.sc || 0) + (d.st || 0) + (d.others || 0),
    0
  );

  const prettyDistrict =
    district ? district.charAt(0).toUpperCase() + district.slice(1).toLowerCase() : '';

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow-md p-6 border-l-4 border-blue-600">
      <h4 className="text-lg font-bold text-gray-800 mb-3">Seasonal Work Pattern Insight</h4>

      <p className="text-gray-700 leading-relaxed mb-2">
        <span className="font-bold text-blue-600">{prettyDistrict}</span> recorded 
        <span className="font-semibold"> {totalPersondays.toLocaleString('en-IN')}</span>{' '}
        total persondays across the year — reflecting a consistent pulse of rural employment.
      </p>

      <p className="text-gray-700 leading-relaxed mb-2">
        Peak labour intensity was observed in{' '}
        <span className="font-bold text-orange-600">{monthShort[peakMonth] || peakMonth}</span>, 
        especially within the{' '}
        <span className="font-bold text-green-700">{peakCategory}</span> group —
        indicating a seasonal surge tied to agricultural and livelihood cycles.
      </p>

      <p className="text-sm text-gray-800">
        {peakCategory === "Women"
          ? "✨ Strong female-led work season — empowerment in action."
          : peakCategory === "SC" || peakCategory === "ST"
          ? "🌱 High engagement from vulnerable communities — a sign of inclusive development."
          : "📌 Workforce peak driven by general community participation — broad-based employment support."}
      </p>

      <p className="text-gray-700 text-xs mt-3 italic">
        “Every season tells a story — and here, labour becomes livelihood, month after month.”
      </p>
    </div>
  );
}
