import { useEffect, useState } from 'react';
import { Users, IndianRupee, TrendingUp, MapPin, Globe } from 'lucide-react';
import { KPICard } from './components/KPICard';
import { BarChart } from './components/BarChart';
import { PieChart } from './components/PieChart';
import { supabase } from './lib/supabase';
import { detectUserState, INDIAN_STATES } from './utils/stateDetection';

interface StateSummary {
  month: string;
  state_name: string;
  total_individuals_worked: number;
  wages: number;
  women_persondays: number;
  sc_persondays: number;
  st_persondays: number;
}

function App() {
  const [selectedState, setSelectedState] = useState<string>('');
  const [data, setData] = useState<StateSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(true);

  useEffect(() => {
    async function detectLocation() {
      const result = await detectUserState();
      setSelectedState(result.state || 'Maharashtra');
      setDetectingLocation(false);
    }
    detectLocation();
  }, []);

  useEffect(() => {
    if (!selectedState) return;

    async function fetchData() {
      setLoading(true);
      const { data: summaryData, error } = await supabase
        .from('state_monthly_summary')
        .select('*')
        .ilike('state_name', `%${selectedState}%`)
        .order('month', { ascending: true });

      if (!error) {
        setData(summaryData ?? []);
      } else {
        console.error('Supabase error ->', error);
        setData([]);
      }

      setLoading(false);
    }

    fetchData();
  }, [selectedState]);

  const totals = data.reduce(
    (acc, item) => ({
      individuals: acc.individuals + (item.total_individuals_worked || 0),
      wages: acc.wages + (item.wages || 0),
      women: acc.women + (item.women_persondays || 0),
      sc: acc.sc + (item.sc_persondays || 0),
      st: acc.st + (item.st_persondays || 0),
    }),
    { individuals: 0, wages: 0, women: 0, sc: 0, st: 0 }
  );

  const monthlyData = data.map((item) => ({
    month: item.month,
    total_individuals_worked: item.total_individuals_worked || 0,
  }));

  const pieData = [
    { label: 'Women', value: totals.women, color: '#f97316' },
    { label: 'SC', value: totals.sc, color: '#16a34a' },
    { label: 'ST', value: totals.st, color: '#3b82f6' }
  ];

  if (detectingLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Detecting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div id="google_translate_element" className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2"></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-5xl">🇮🇳</span>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-white to-green-600 bg-clip-text text-transparent">
              MGNREGA Dashboard
            </h1>
          </div>
          <p className="text-lg text-gray-700 font-medium">Rural Employment Insights</p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-600">
            <Globe className="w-4 h-4" />
            <span>Switch language using the translator above</span>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            <label htmlFor="state-select" className="text-lg font-medium text-gray-700">
              Select State:
            </label>
          </div>
          <select
            id="state-select"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-6 py-3 text-lg border-2 border-orange-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 bg-white shadow-md transition-all hover:shadow-lg"
          >
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Loading data...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <KPICard title="Total Individuals Worked" value={totals.individuals.toLocaleString('en-IN')} icon={Users} />
              <KPICard title="Total Wages (₹)" value={`₹ ${(totals.wages / 1e7).toFixed(2)} Cr`} icon={IndianRupee} />
              <KPICard title="Avg Monthly Workers" value={Math.round(totals.individuals / (data.length || 1)).toLocaleString('en-IN')} icon={TrendingUp} />
            </div>

            {monthlyData.length > 0 && <BarChart data={monthlyData} />}
            {pieData.some((d) => d.value > 0) && <PieChart data={pieData} title="Demographics Breakdown (Persondays)" />}
          </div>
        )}

        <footer className="mt-12 pt-8 border-t-2 border-gray-200 text-center text-gray-600">
          <p className="text-sm">
            Data powered by <span className="font-bold text-orange-600">Government of India</span> |
            Built by <span className="font-bold text-green-600">Thanush</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
