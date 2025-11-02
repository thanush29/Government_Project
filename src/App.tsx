import { useEffect, useState, useRef } from 'react';
import { Users, IndianRupee, TrendingUp, MapPin, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";

import { KPICard } from './components/KPICard';
import { BarChart } from './components/BarChart';
import Sunburst from './components/Sunburst';
import Heatmap from './components/Heatmap';
import Trendline from './components/Trendline';

import BarChartInsight from './components/Insights/BarChartInsight';
import SunburstInsight from './components/Insights/SunburstInsight';
import HeatmapInsight from './components/Insights/HeatmapInsight';
import TrendInsight from './components/Insights/TrendInsight';
import OverallSummaryInsight from "./components/Insights/OverallSummaryInsight";

import { supabase } from './lib/supabase';
import { detectUserDistrict } from './utils/districtDetection';

import { useSunburstData } from './lib/hooks/useSunburstData';
import { useHeatmapData } from './lib/hooks/useHeatmapData';
import { useTrendData } from './lib/hooks/useTrendData';
import { useOverallSummaryData } from "./lib/hooks/useOverallSummaryData";

interface DistrictSummary {
  month: string;
  district_name: string;
  total_individuals_worked: number;
  wages: number;
  women_persondays: number;
  sc_persondays: number;
  st_persondays: number;
}

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [data, setData] = useState<DistrictSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(true);
  const [translateLoaded, setTranslateLoaded] = useState(false);
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  const sunburstData = useSunburstData(selectedDistrict);
  const heatmapData = useHeatmapData(selectedDistrict);
  const trendData = useTrendData(selectedDistrict);
  const { data: overallSummary, loading: overallLoading } = useOverallSummaryData();

  // Initialize Vanta.js Waves Effect (Optimized)
  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      const threeScript = document.createElement('script');
      threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
      threeScript.async = true;
      
      threeScript.onload = () => {
        const vantaScript = document.createElement('script');
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js';
        vantaScript.async = true;
        
        vantaScript.onload = () => {
          const effect = (window as any).VANTA.WAVES({
            el: vantaRef.current,
            mouseControls: false,
            touchControls: false,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x1a0a3e,
            shininess: 20.00,
            waveHeight: 15.00,
            waveSpeed: 0.60,
            zoom: 0.90
          });
          setVantaEffect(effect);
        };
        
        document.body.appendChild(vantaScript);
      };
      
      document.body.appendChild(threeScript);
    }
    
    return () => {
      if (vantaEffect) (vantaEffect as any).destroy();
    };
  }, [vantaEffect]);

  // Detect user's district
  useEffect(() => {
    async function detectLocation() {
      const result = await detectUserDistrict();
      setSelectedDistrict(result.district?.toUpperCase() || "PUNE");
      setDetectingLocation(false);
    }
    detectLocation();
  }, []);

  // Fetch DB data
  useEffect(() => {
    if (!selectedDistrict) return;
    async function fetchData() {
      setLoading(true);
      const { data: summaryData } = await supabase
        .from('district_monthly_summary')
        .select('*')
        .ilike('district_name', `%${selectedDistrict}%`)
        .order('month', { ascending: true });

      setData(summaryData ?? []);
      setLoading(false);
    }
    fetchData();
  }, [selectedDistrict]);

  // Google Translate
  useEffect(() => {
    if (translateLoaded) return;
    
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element"
      );
    };
    
    setTranslateLoaded(true);
  }, [translateLoaded]);

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

  if (detectingLocation) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        
        {/* Simplified Loading Animation */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-purple-500/30"
              style={{
                width: `${Math.random() * 150 + 50}px`,
                height: `${Math.random() * 150 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-8xl mb-6"
          >
            📍
          </motion.div>
          <motion.p 
            className="text-3xl font-bold text-white"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Detecting your location...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div ref={vantaRef} className="min-h-screen transition-all duration-700 relative overflow-hidden">
        
        {/* Simplified Professional Overlay - Reduced from 100+ to 30 elements */}
        <div className="absolute inset-0 pointer-events-none">
          
          {/* Main Gradient Orbs - Reduced from 3 large orbs */}
          <motion.div 
            className="absolute w-[800px] h-[800px] rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)',
              top: '-10%',
              right: '-5%'
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -80, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute w-[700px] h-[700px] rounded-full blur-3xl opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, transparent 70%)',
              bottom: '-5%',
              left: '-5%'
            }}
            animate={{
              x: [0, -80, 0],
              y: [0, 100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Reduced Particles - Only 30 instead of 100+ */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 8 + 3}px`,
                height: `${Math.random() * 8 + 3}px`,
                background: i % 3 === 0 ? 'rgba(139, 92, 246, 0.6)' : i % 3 === 1 ? 'rgba(236, 72, 153, 0.6)' : 'rgba(59, 130, 246, 0.6)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -80, -20],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
          
          {/* Tricolor Elements - Reduced to 12 */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`tri-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
                background: i % 3 === 0 ? 'rgba(255,153,51,0.8)' : i % 3 === 1 ? 'rgba(255,255,255,0.8)' : 'rgba(19,136,8,0.8)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-30, -100, -30],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 4,
              }}
            />
          ))}
          
          {/* Single Chakra Watermark */}
          <motion.div
            className="absolute top-1/4 right-1/5 text-[180px] opacity-10"
            animate={{
              rotate: 360,
              scale: [1, 1.15, 1],
            }}
            transition={{
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity },
            }}
          >
            ☸️
          </motion.div>
        </div>

        {/* Google Translate Widget */}
        <div className="fixed top-4 right-4 z-50">
          <div 
            id="google_translate_element" 
            className="bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-blue-600/90 p-2 rounded-xl backdrop-blur-lg shadow-xl border border-purple-400/50"
          />
        </div>

        <div className="px-4 py-10 max-w-7xl mx-auto relative z-10">

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center items-center gap-4 mb-4">
              <div>
                <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  MGNREGA
                </h1>
                <p className="text-xl md:text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text mt-2">
                  District Analytics Dashboard
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <div className="w-20 h-1.5 bg-orange-500 rounded-full" />
              <div className="w-20 h-1.5 bg-white rounded-full" />
              <div className="w-20 h-1.5 bg-green-500 rounded-full" />
            </div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center mb-12"
          >
            <div className="flex items-center bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-blue-600/90 backdrop-blur-xl border-2 border-purple-400/50 px-6 py-4 rounded-2xl shadow-2xl">
              <MapPin className="w-6 h-6 text-white mr-3" />
              <input
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value.toUpperCase())}
                className="bg-transparent outline-none text-white font-semibold text-lg w-64 placeholder-purple-200"
                placeholder="Search District..."
              />
              <Sparkles className="w-5 h-5 text-yellow-300 ml-3" />
            </div>
          </motion.div>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-32">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
                className="h-20 w-20 border-6 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
              />
              <p className="text-2xl font-bold text-white">
                Loading data...
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.5 }}
            >

              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                <KPICard title="Individuals Employed" value={totals.individuals} icon={Users} animated />
                <KPICard title="Total Wages (₹)" value={`₹ ${(totals.wages / 1e7).toFixed(2)} Cr`} icon={IndianRupee} animated />
                <KPICard title="Avg Monthly Workers" value={Math.round(totals.individuals / (data.length || 1))} icon={TrendingUp} animated />
              </div>

              {/* Charts */}
              <div className="space-y-16">

                {/* Bar Chart with Insight */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="glass-card p-6 lg:col-span-2 border border-purple-500/50 rounded-2xl shadow-xl bg-slate-900/50 backdrop-blur-lg">
                    <BarChart data={monthlyData} />
                  </div>
                  <div className="glass-card p-6 border border-orange-400/50 rounded-2xl shadow-xl bg-slate-900/50 backdrop-blur-lg">
                    <BarChartInsight districtName={selectedDistrict} />
                  </div>
                </div>

                {/* Sunburst */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="glass-card p-6 lg:col-span-2 border border-pink-500/50 rounded-2xl shadow-xl bg-slate-900/50 backdrop-blur-lg">
                    <Sunburst data={sunburstData} />
                  </div>
                  <div className="glass-card p-6 border border-purple-400/50 rounded-2xl shadow-xl bg-slate-900/50 backdrop-blur-lg">
                    <SunburstInsight districtName={selectedDistrict} />
                  </div>
                </div>

                {/* Heatmap */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="glass-card p-6 lg:col-span-2 border border-blue-500/50 rounded-2xl shadow-xl bg-slate-900/50 backdrop-blur-lg">
                    <Heatmap districtName={selectedDistrict} />
                  </div>
                  <div className="glass-card p-6 border border-cyan-400/50 rounded-2xl shadow-xl bg-slate-900/50 backdrop-blur-lg">
                    <HeatmapInsight districtName={selectedDistrict} />
                  </div>
                </div>

                {/* Trendline */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="glass-card p-6 lg:col-span-2 border border-purple-500/50 rounded-2xl shadow-xl bg-slate-900/50 backdrop-blur-lg">
                    <Trendline data={trendData} />
                  </div>
                  <div className="glass-card p-6 border border-pink-400/50 rounded-2xl shadow-xl bg-slate-900/50 backdrop-blur-lg">
                    <TrendInsight data={trendData} />
                  </div>
                </div>

                {/* Overall Summary */}
                <div className="mt-12">
                  <OverallSummaryInsight summary={overallSummary} loading={overallLoading} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <footer className="mt-20 text-center">
            <div className="flex justify-center gap-3 mb-4">
              <div className="w-16 h-1.5 bg-orange-500 rounded-full" />
              <div className="w-16 h-1.5 bg-white rounded-full" />
              <div className="w-16 h-1.5 bg-green-500 rounded-full" />
            </div>
            <p className="text-sm text-purple-200">
              🇮🇳 Data Source: Government of India
            </p>
            <p className="text-base font-semibold text-white mt-2">
              Built with ❤️ by <span className="font-black bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">Thanush</span>
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}

export default App;