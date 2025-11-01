import Plot from 'react-plotly.js';

interface SunburstSlice {
  category: string;
  value: number;
  color: string;
}

interface SunburstDataProps {
  data: SunburstSlice[];
  loading: boolean;
  error: string | null;
}

interface SunburstProps {
  data: SunburstDataProps;
}

export default function Sunburst({ data }: SunburstProps) {
  const { data: chartData, loading, error } = data;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-red-600 text-center">
          Error loading sunburst chart: {error}
        </p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600 text-center">
          No data available for sunburst chart
        </p>
      </div>
    );
  }

  const labels = ['Total', ...chartData.map(d => d.category)];
  const parents = ['', ...chartData.map(() => 'Total')];
  const values = [
    chartData.reduce((sum, d) => sum + d.value, 0),
    ...chartData.map(d => d.value),
  ];
  const colors = ['#F3F4F6', ...chartData.map(d => d.color)];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Demographics Breakdown
      </h3>
      <Plot
        data={[
          {
            type: 'sunburst',
            labels,
            parents,
            values,
            marker: { colors },
            textinfo: 'label+percent parent',
            hovertemplate:
              '<b>%{label}</b><br>Persondays: %{value:,.0f}<br>Percentage: %{percentParent}<extra></extra>',
            branchvalues: 'total',
          },
        ]}
        layout={{
          margin: { t: 0, l: 0, r: 0, b: 0 },
          height: 400,
          font: { family: 'sans-serif', size: 14 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
        }}
        config={{
          displayModeBar: false,
          responsive: true,
        }}
        className="w-full"
      />
    </div>
  );
}
