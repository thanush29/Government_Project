interface TrendInsightProps {
  data: ReturnType<typeof useTrendData>;
}

export default function TrendInsight({ data }: TrendInsightProps) {
  const {
    district,
    totalWages,
    totalIndividuals,
    avgWagePerPerson,
    peakMonth,
    monthlyGrowthRate,
    loading
  } = data;

  if (loading || totalIndividuals === 0) {
    return (
      <div className="bg-white rounded-xl p-4 text-gray-500 text-sm italic">
        Crunching wage insights…
      </div>
    );
  }

  const crore = (v: number) => (v / 1e7).toFixed(2);

  return (
    <div className="bg-gradient-to-r from-green-50 to-orange-50 rounded-xl shadow-md p-6 border-l-4 border-green-500">
      
      {/* Heading */}
      <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        Wage Trend Insight
        <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded-full">
          MNREGA
        </span>
      </h4>

      {/* Summary */}
      <p className="text-gray-700 leading-relaxed mb-3">
        In <span className="font-bold text-green-700">{district}</span>, MNREGA played a key role
        in supporting rural livelihoods this year. Here's the wage story:
      </p>

      {/* Bullet Insights */}
      <ul className="space-y-1 text-gray-700 ml-3 mb-3">
        <li className="flex gap-2">
          ✅ <span>
            Total wages disbursed:{" "}
            <b className="text-gray-900">₹{crore(totalWages)} Cr</b>
          </span>
        </li>

        <li className="flex gap-2">
          ✅ <span>
            Total workers benefitted:{" "}
            <b className="text-gray-900">{totalIndividuals.toLocaleString("en-IN")}</b>
          </span>
        </li>

        <li className="flex gap-2">
          ✅ <span>
            Avg earning per worker:{" "}
            <b className="text-orange-600">₹{avgWagePerPerson.toFixed(2)}</b>
          </span>
        </li>

        {peakMonth && (
          <li className="flex gap-2">
            📈 <span>
              Highest MNREGA activity seen in{" "}
              <b className="text-blue-600">{peakMonth}</b>
            </span>
          </li>
        )}

        {monthlyGrowthRate !== undefined && (
          <li className="flex gap-2">
            {monthlyGrowthRate > 0 ? "🚀" : "📉"}{" "}
            <span>
              Wage momentum changed by{" "}
              <b
                className={`${monthlyGrowthRate > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {monthlyGrowthRate.toFixed(1)}%
              </b>{" "}
              month-over-month
            </span>
          </li>
        )}
      </ul>

      {/* Closing line */}
      <p className="text-gray-600 italic text-sm">
        These numbers reflect how MNREGA supported daily earnings and stability in {district}.
      </p>
    </div>
  );
}
