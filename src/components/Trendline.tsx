import Plot from 'react-plotly.js';

interface TrendlineProps {
  data: ReturnType<typeof useTrendData>;
}

const monthShort: Record<string, string> = {
  'April': 'Apr', 'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug',
  'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec',
  'January': 'Jan', 'February': 'Feb', 'March': 'Mar'
};

export default function Trendline({ data }: TrendlineProps) {
  const { data: trend, loading, error } = data;

  if (loading) return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <p className="text-red-600 text-center">Error loading trendline: {error}</p>
    </div>
  );

  if (!trend || trend.length === 0) return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <p className="text-gray-600 text-center">No data available for trendline</p>
    </div>
  );

  const months = trend.map(d => monthShort[d.month] || d.month);
  const wages = trend.map(d => d.wages);
  const individuals = trend.map(d => d.individuals);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Wages vs Individuals Trend</h3>
      
      <Plot
        data={[
          {
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Wages (₹)',
            x: months,
            y: wages,
            yaxis: 'y',
          },
          {
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Individuals',
            x: months,
            y: individuals,
            yaxis: 'y2',
          },
        ]}
        layout={{
          margin: { t: 20, l: 60, r: 60, b: 60 },
          height: 400,
          xaxis: { title: 'Month' },
          yaxis: { title: 'Wages (₹)' },
          yaxis2: { title: 'Individuals', overlaying: 'y', side: 'right' },
        }}
        config={{ displayModeBar: false, responsive: true }}
        className="w-full"
      />
    </div>
  );
}
