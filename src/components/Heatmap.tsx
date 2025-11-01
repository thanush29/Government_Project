import Plot from 'react-plotly.js';
import { useHeatmapData } from '../lib/hooks/useHeatmapData';

interface HeatmapProps {
  districtName: string | null;
}

const monthShort: Record<string, string> = {
  April: 'Apr', May: 'May', June: 'Jun', July: 'Jul', August: 'Aug',
  September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec',
  January: 'Jan', February: 'Feb', March: 'Mar'
};

export default function Heatmap({ districtName }: HeatmapProps) {
  const { data, loading, error } = useHeatmapData(districtName);

  if (loading) return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex justify-center items-center h-60">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
    </div>
  );

  if (error) return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-red-600 text-center">
      Error loading heatmap: {error}
    </div>
  );

  if (!data || data.length === 0) return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-gray-600 text-center">
      No data available for heatmap
    </div>
  );

  const categories = ['Women', 'SC', 'ST', 'Others'];
  const months = data.map(d => monthShort[d.month] || d.month);

  const zValues = [
    data.map(d => d.women),
    data.map(d => d.sc),
    data.map(d => d.st),
    data.map(d => d.others),
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Category Heatmap</h3>
      <Plot
        data={[{
          type: 'heatmap',
          z: zValues,
          x: months,
          y: categories,
          colorscale: [
            [0, '#F3F4F6'],
            [0.25, '#FED7AA'],
            [0.5, '#FB923C'],
            [0.75, '#EA580C'],
            [1, '#C2410C'],
          ],
          hovertemplate: '<b>%{y}</b><br>Month: %{x}<br>Persondays: %{z:,.0f}<extra></extra>',
          showscale: true
        }]}
        layout={{
          margin: { t: 20, l: 80, r: 80, b: 80 },
          height: 400,
          font: { family: 'sans-serif', size: 12 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent'
        }}
        config={{ displayModeBar: false, responsive: true }}
        className="w-full"
      />
    </div>
  );
}
