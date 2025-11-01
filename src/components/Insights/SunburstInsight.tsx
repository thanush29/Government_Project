import { useSunburstData } from '../../lib/hooks/useSunburstData';

interface SunburstInsightProps {
  districtName: string | null;
}

export default function SunburstInsight({ districtName }: SunburstInsightProps) {
  const { data, total, district, loading } = useSunburstData(districtName ?? "");

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4 text-gray-500 text-sm italic">
        Fetching demographic insights…
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 text-gray-500 text-sm italic">
        No demographic data available for this district.
      </div>
    );
  }

  const women = Number(data.find(d => d.category === 'Women')?.value || 0);
  const sc = Number(data.find(d => d.category === 'SC')?.value || 0);
  const st = Number(data.find(d => d.category === 'ST')?.value || 0);
  const others = Number(data.find(d => d.category === 'Others')?.value || 0);

  const pct = (v: number) => total > 0 ? ((v / total) * 100).toFixed(1) : '0.0';

  const womenPct = pct(women);
  const scPct = pct(sc);
  const stPct = pct(st);
  const othersPct = pct(others);

  const prettyDistrict =
    district ? district.charAt(0).toUpperCase() + district.slice(1).toLowerCase() : '';

  return (
    <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-xl shadow-md p-6 border-l-4 border-orange-500">
      <h4 className="text-lg font-bold text-gray-800 mb-3">Demographic Breakdown</h4>

      <p className="text-gray-700 leading-relaxed mb-2">
        <span className="font-bold text-orange-600">{prettyDistrict}</span> contributes a total of 
        <span className="font-semibold"> {total.toLocaleString('en-IN')}</span> persondays of labour
        under MGNREGA. The workforce here reflects a diverse socio-economic participation pattern.
      </p>

      <ul className="text-sm text-gray-700 space-y-1 mb-3">
        <li>👩 Women Workers: <b className="text-orange-600">{womenPct}%</b> — strong female participation.</li>
        <li>👥 SC Persondays: <b className="text-green-700">{scPct}%</b> — representation of historically disadvantaged groups.</li>
        <li>🌿 ST Persondays: <b className="text-blue-600">{stPct}%</b> — tribal engagement in rural employment.</li>
        <li>📌 Other Categories: <b className="text-gray-700">{othersPct}%</b></li>
      </ul>

      <p className="text-gray-800 text-sm">
        {Number(womenPct) > 40
          ? `✨ High women participation — indicates strong female workforce involvement & empowerment.`
          : `⚠️ Women representation is moderate — scope to strengthen gender participation programs.`}
      </p>

      <p className="text-gray-700 text-xs mt-3 italic">
        “Inclusive rural employment is not just a metric — it’s a lifeline for many households.”
      </p>
    </div>
  );
}
