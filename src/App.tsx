import { useEffect, useState, useRef } from 'react';
import { Users, IndianRupee, TrendingUp, MapPin, Moon, Sun, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

import { KPICard } from './components/KPICard';
import { BarChart } from './components/BarChart';
import Sunburst from './components/Sunburst';
import Heatmap from './components/Heatmap';
import Trendline from './components/Trendline';

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
  const [dark, setDark] = useState(false);
  const [translateLoaded, setTranslateLoaded] = useState(false);
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  const sunburstData = useSunburstData(selectedDistrict);
  const heatmapData = useHeatmapData(selectedDistrict);
  const trendData = useTrendData(selectedDistrict);
  const { data: overallSummary, loading: overallLoading } = useOverallSummaryData();

  // Initialize Vanta.js Waves Effect
  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      // Load Three.js
      const threeScript = document.createElement('script');
      threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
      threeScript.async = true;
      
      threeScript.onload = () => {
        // Load Vanta Waves
        const vantaScript = document.createElement('script');
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js';
        vantaScript.async = true;
        
        vantaScript.onload = () => {
          const effect = (window as any).VANTA.WAVES({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x1a0a3e,
            shininess: 35.00,
            waveHeight: 25.00,
            waveSpeed: 1.20,
            zoom: 0.80
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
      <div className="min-h-screen flex justify-center items-center relative overflow-hidden">
        {/* Animated Gradient Background */}
        <motion.div 
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ffa726 100%)',
              'linear-gradient(135deg, #ffa726 0%, #667eea 25%, #764ba2 50%, #f093fb 75%, #f5576c 100%)',
              'linear-gradient(135deg, #f5576c 0%, #ffa726 25%, #667eea 50%, #764ba2 75%, #f093fb 100%)',
              'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ffa726 100%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Floating Orbs */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl"
            style={{
              width: `${Math.random() * 300 + 200}px`,
              height: `${Math.random() * 300 + 200}px`,
              background: `radial-gradient(circle, ${
                i % 4 === 0 ? 'rgba(139, 92, 246, 0.4)' :
                i % 4 === 1 ? 'rgba(236, 72, 153, 0.4)' :
                i % 4 === 2 ? 'rgba(59, 130, 246, 0.4)' :
                'rgba(251, 191, 36, 0.4)'
              } 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 200 - 100, 0],
              y: [0, Math.random() * 200 - 100, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Particles */}
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 8 + 3}px`,
              height: `${Math.random() * 8 + 3}px`,
              background: i % 4 === 0 ? '#8b5cf6' : i % 4 === 1 ? '#ec4899' : i % 4 === 2 ? '#3b82f6' : '#fbbf24',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              boxShadow: `0 0 20px ${i % 4 === 0 ? '#8b5cf6' : i % 4 === 1 ? '#ec4899' : i % 4 === 2 ? '#3b82f6' : '#fbbf24'}`
            }}
            animate={{
              y: [-30, -100, -30],
              x: [0, Math.random() * 60 - 30, 0],
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={{ 
              rotate: 360,
              scale: [1, 1.4, 1]
            }} 
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="text-9xl mb-6"
            style={{
              filter: 'drop-shadow(0 0 40px rgba(255,255,255,0.9))'
            }}
          >
            🛰️
          </motion.div>
          <motion.p 
            className="text-4xl font-black text-white drop-shadow-2xl"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ textShadow: '0 0 30px rgba(255,255,255,0.8)' }}
          >
            Locating your district…
          </motion.p>
          <motion.div
            className="flex gap-3 mt-8"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div 
                key={i}
                className="w-5 h-5 rounded-full"
                style={{
                  background: i === 0 ? '#8b5cf6' : i === 1 ? '#ec4899' : '#3b82f6',
                  boxShadow: `0 0 20px ${i === 0 ? '#8b5cf6' : i === 1 ? '#ec4899' : '#3b82f6'}`
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div ref={vantaRef} className="min-h-screen transition-all duration-700 relative overflow-hidden">
        
        {/* Vanta.js will render here as background */}
        
        {/* Additional Colorful Overlay Effects */}
        <div className="absolute inset-0 pointer-events-none">
          
          {/* Large Flowing Gradient Orbs */}
          <motion.div 
            className="absolute w-[1200px] h-[1200px] rounded-full blur-3xl opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(236, 72, 153, 0.4) 40%, rgba(59, 130, 246, 0.3) 70%, transparent 100%)',
              top: '-15%',
              right: '-10%'
            }}
            animate={{
              x: [0, 200, -150, 0],
              y: [0, -150, 200, 0],
              scale: [1, 1.4, 1.2, 1],
              rotate: [0, 120, 240, 360]
            }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute w-[1000px] h-[1000px] rounded-full blur-3xl opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.4) 40%, rgba(236, 72, 153, 0.3) 70%, transparent 100%)',
              bottom: '-10%',
              left: '-5%'
            }}
            animate={{
              x: [0, -180, 150, 0],
              y: [0, 180, -120, 0],
              scale: [1, 1.5, 1.3, 1],
              rotate: [360, 240, 120, 0]
            }}
            transition={{
              duration: 45,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute w-[900px] h-[900px] rounded-full blur-3xl opacity-25"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(251, 191, 36, 0.4) 40%, rgba(59, 130, 246, 0.3) 70%, transparent 100%)',
              top: '35%',
              left: '45%'
            }}
            animate={{
              x: [0, 150, -100, 0],
              y: [0, -120, 150, 0],
              scale: [1, 1.35, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Vibrant Floating Particles */}
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 12 + 4}px`,
                height: `${Math.random() * 12 + 4}px`,
                background: i % 5 === 0 
                  ? 'rgba(139, 92, 246, 0.9)' 
                  : i % 5 === 1 
                  ? 'rgba(236, 72, 153, 0.9)' 
                  : i % 5 === 2
                  ? 'rgba(59, 130, 246, 0.9)'
                  : i % 5 === 3
                  ? 'rgba(251, 191, 36, 0.9)'
                  : 'rgba(16, 185, 129, 0.9)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: i % 5 === 0 
                  ? '0 0 35px rgba(139, 92, 246, 1)' 
                  : i % 5 === 1 
                  ? '0 0 35px rgba(236, 72, 153, 1)' 
                  : i % 5 === 2
                  ? '0 0 35px rgba(59, 130, 246, 1)'
                  : i % 5 === 3
                  ? '0 0 35px rgba(251, 191, 36, 1)'
                  : '0 0 35px rgba(16, 185, 129, 1)'
              }}
              animate={{
                y: [-50, -140, -50],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0.5, 1, 0.5],
                scale: [1, 2, 1]
              }}
              transition={{
                duration: 6 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Rotating Geometric Shapes */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`shape-${i}`}
              className="absolute border-2 rounded-lg"
              style={{
                width: `${Math.random() * 120 + 60}px`,
                height: `${Math.random() * 120 + 60}px`,
                borderColor: i % 4 === 0 
                  ? 'rgba(139, 92, 246, 0.5)' 
                  : i % 4 === 1 
                  ? 'rgba(236, 72, 153, 0.5)'
                  : i % 4 === 2
                  ? 'rgba(59, 130, 246, 0.5)'
                  : 'rgba(251, 191, 36, 0.5)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.8, 0.3],
                borderRadius: ['15%', '50%', '15%']
              }}
              transition={{
                duration: 20 + Math.random() * 15,
                repeat: Infinity,
                delay: Math.random() * 8,
                ease: "linear"
              }}
            />
          ))}
          
          {/* Tricolor Elements */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`tri-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 10 + 4}px`,
                height: `${Math.random() * 10 + 4}px`,
                background: i % 3 === 0 ? 'rgba(255,153,51,0.9)' : i % 3 === 1 ? 'rgba(255,255,255,1)' : 'rgba(19,136,8,0.9)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: i % 3 === 0 ? '0 0 30px rgba(255,153,51,1)' : i % 3 === 1 ? '0 0 25px rgba(255,255,255,1)' : '0 0 30px rgba(19,136,8,1)'
              }}
              animate={{
                y: [-40, -130, -40],
                x: [0, Math.random() * 80 - 40, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.8, 1]
              }}
              transition={{
                duration: 6 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 6,
                ease: "easeInOut"
              }}
            />
          ))}
          
          {/* Rainbow Wave Pattern */}
          <motion.div
            className="absolute inset-0 opacity-15"
            style={{
              background: `
                repeating-linear-gradient(45deg, 
                  transparent 0px, 
                  transparent 70px, 
                  rgba(139, 92, 246, 0.6) 70px, 
                  rgba(139, 92, 246, 0.6) 75px, 
                  transparent 75px, 
                  transparent 145px,
                  rgba(236, 72, 153, 0.6) 145px,
                  rgba(236, 72, 153, 0.6) 150px,
                  transparent 150px,
                  transparent 220px,
                  rgba(59, 130, 246, 0.6) 220px,
                  rgba(59, 130, 246, 0.6) 225px,
                  transparent 225px,
                  transparent 295px,
                  rgba(251, 191, 36, 0.6) 295px,
                  rgba(251, 191, 36, 0.6) 300px
                )
              `
            }}
            animate={{
              backgroundPosition: ['0px 0px', '400px 400px']
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Pulsing Chakra Watermarks */}
          <motion.div
            className="absolute top-1/5 right-1/6 text-[240px] opacity-15"
            style={{
              filter: 'drop-shadow(0 0 50px rgba(139, 92, 246, 0.8))'
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.25, 1],
              opacity: [0.1, 0.25, 0.1]
            }}
            transition={{
              rotate: { duration: 50, repeat: Infinity, ease: "linear" },
              scale: { duration: 7, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 7, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            ☸️
          </motion.div>
          
          <motion.div
            className="absolute bottom-1/5 left-1/6 text-[220px] opacity-15"
            style={{
              filter: 'drop-shadow(0 0 50px rgba(236, 72, 153, 0.8))'
            }}
            animate={{
              rotate: -360,
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.25, 0.1]
            }}
            transition={{
              rotate: { duration: 60, repeat: Infinity, ease: "linear" },
              scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            ☸️
          </motion.div>
        </div>

        {/* Google Translate Widget */}
        <motion.div 
          className="fixed top-4 right-4 flex gap-3 z-50"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            id="google_translate_element" 
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-2 rounded-2xl backdrop-blur-xl shadow-2xl border-2 border-purple-400"
            whileHover={{ 
              scale: 1.08, 
              boxShadow: "0 0 50px rgba(139, 92, 246, 0.9)",
              background: "linear-gradient(to right, rgb(59, 130, 246), rgb(236, 72, 153), rgb(139, 92, 246))"
            }}
            transition={{ type: "spring", stiffness: 400 }}
          />
        </motion.div>

        <div className="px-4 py-10 max-w-7xl mx-auto relative z-10">

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center mb-12"
          >
            <div className="flex justify-center gap-4 items-center mb-4">
              <div>
                <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
                  MGNREGA
                </h1>
                <p className="text-2xl md:text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text mt-2">
                  District Analytics Dashboard
                </p>
              </div>
            </div>
            <motion.div
              className="flex justify-center gap-3 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="w-24 h-2 bg-orange-500 rounded-full shadow-lg shadow-orange-500"
                animate={{ scaleX: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="w-24 h-2 bg-white rounded-full shadow-lg shadow-white"
                animate={{ scaleX: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div 
                className="w-24 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500"
                animate={{ scaleX: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              />
            </motion.div>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center gap-3 mb-12"
          >
            <motion.div 
              className="flex items-center bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 backdrop-blur-xl border-3 border-purple-400 px-8 py-5 rounded-3xl shadow-2xl"
              whileHover={{ 
                scale: 1.06, 
                boxShadow: "0 30px 60px rgba(139, 92, 246, 0.7)",
                background: "linear-gradient(to right, rgb(59, 130, 246), rgb(236, 72, 153), rgb(139, 92, 246))"
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MapPin className="w-7 h-7 text-white mr-3" />
              <input
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value.toUpperCase())}
                className="bg-transparent outline-none text-white font-bold text-xl w-72 placeholder-purple-200"
                placeholder="Search District..."
              />
              <Sparkles className="w-6 h-6 text-yellow-300 ml-3 animate-pulse" />
            </motion.div>
          </motion.div>

          {/* Loading */}
          {loading ? (
            <motion.div 
              className="text-center py-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
                className="h-24 w-24 border-8 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
                style={{
                  boxShadow: "0 0 50px rgba(139, 92, 246, 0.9)"
                }}
              />
              <motion.p 
                className="text-3xl font-bold text-white"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ textShadow: '0 0 30px rgba(139, 92, 246, 0.8)' }}
              >
                Fetching data from servers…
              </motion.p>
              <motion.div
                className="flex justify-center gap-3 mt-6"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-4 h-4 bg-purple-500 rounded-full shadow-lg shadow-purple-500" />
                <div className="w-4 h-4 bg-pink-500 rounded-full shadow-lg shadow-pink-500" />
                <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, delay: 0.3 }}
            >

              {/* KPIs */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.15
                    }
                  }
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <KPICard title="Individuals Employed" value={totals.individuals.toLocaleString()} icon={Users} animated />
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.05, rotate: -1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <KPICard title="Total Wages (₹)" value={`₹ ${(totals.wages / 1e7).toFixed(2)} Cr`} icon={IndianRupee} animated />
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <KPICard title="Avg Monthly Workers" value={Math.round(totals.individuals / (data.length || 1)).toLocaleString()} icon={TrendingUp} animated />
                </motion.div>
              </motion.div>

              {/* Charts */}
              <div className="space-y-20">

                {/* Decorative India map background */}
                <div className="fixed bottom-10 right-10 text-8xl opacity-20 pointer-events-none hidden md:block">
                  🗺️
                </div>

                {/* Bar */}
                <motion.div 
                  className="glass-card p-8 border-2 border-purple-500 rounded-3xl shadow-2xl bg-slate-900/60 backdrop-blur-xl"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  whileHover={{ 
                    boxShadow: "0 30px 60px rgba(139, 92, 246, 0.6)",
                    y: -8,
                    borderColor: "rgba(236, 72, 153, 1)"
                  }}
                >
                  <BarChart data={monthlyData} />
                </motion.div>

                {/* Sunburst */}
                <motion.div 
                  className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="glass-card p-8 lg:col-span-2 border-2 border-pink-500 rounded-3xl shadow-2xl bg-slate-900/60 backdrop-blur-xl"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 30px 60px rgba(236, 72, 153, 0.6)",
                      borderColor: "rgba(139, 92, 246, 1)"
                    }}
                  >
                    <Sunburst data={sunburstData} />
                  </motion.div>
                  <motion.div 
                    className="glass-card p-8 border-2 border-purple-400 rounded-3xl shadow-2xl bg-slate-900/60 backdrop-blur-xl"
                    whileHover={{ 
                      scale: 1.06,
                      rotate: 2,
                      boxShadow: "0 30px 60px rgba(139, 92, 246, 0.6)"
                    }}
                  >
                    <SunburstInsight districtName={selectedDistrict} />
                  </motion.div>
                </motion.div>

                {/* Heatmap */}
                <motion.div 
                  className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="glass-card p-8 lg:col-span-2 border-2 border-blue-500 rounded-3xl shadow-2xl bg-slate-900/60 backdrop-blur-xl"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 30px 60px rgba(59, 130, 246, 0.6)",
                      borderColor: "rgba(236, 72, 153, 1)"
                    }}
                  >
                    <Heatmap districtName={selectedDistrict} />
                  </motion.div>
                  <motion.div 
                    className="glass-card p-8 border-2 border-cyan-400 rounded-3xl shadow-2xl bg-slate-900/60 backdrop-blur-xl"
                    whileHover={{ 
                      scale: 1.06,
                      rotate: -2,
                      boxShadow: "0 30px 60px rgba(59, 130, 246, 0.6)"
                    }}
                  >
                    <HeatmapInsight districtName={selectedDistrict} />
                  </motion.div>
                </motion.div>

                {/* Trend */}
                <motion.div 
                  className="grid grid-cols-1 lg:grid-cols-3 gap-10"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="glass-card p-8 lg:col-span-2 border-2 border-purple-500 rounded-3xl shadow-2xl bg-slate-900/60 backdrop-blur-xl"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 30px 60px rgba(139, 92, 246, 0.6)",
                      borderColor: "rgba(59, 130, 246, 1)"
                    }}
                  >
                    <Trendline data={trendData} />
                  </motion.div>
                  <motion.div 
                    className="glass-card p-8 border-2 border-pink-400 rounded-3xl shadow-2xl bg-slate-900/60 backdrop-blur-xl"
                    whileHover={{ 
                      scale: 1.06,
                      rotate: 2,
                      boxShadow: "0 30px 60px rgba(236, 72, 153, 0.6)"
                    }}
                  >
                    <TrendInsight data={trendData} />
                  </motion.div>
                </motion.div>

                {/* Overall Summary */}
                <motion.div 
                  className="mt-12"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <OverallSummaryInsight summary={overallSummary} loading={overallLoading} />
                </motion.div>
              </div>
            </motion.div>
          )}

          <motion.footer 
            className="mt-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex justify-center gap-3 mb-4">
              <motion.div 
                className="w-20 h-2 bg-orange-500 rounded-full shadow-lg shadow-orange-500"
                animate={{ scaleX: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div 
                className="w-20 h-2 bg-white rounded-full shadow-lg shadow-white"
                animate={{ scaleX: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div 
                className="w-20 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500"
                animate={{ scaleX: [1, 1.4, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              />
            </div>
            <p className="text-base text-purple-200">
              🇮🇳 Data Source: Government of India
            </p>
            <motion.p 
              className="text-lg font-semibold text-white mt-2"
              whileHover={{ 
                scale: 1.15,
                textShadow: "0 0 25px rgba(139, 92, 246, 0.9)"
              }}
            >
              Built with ❤️ by <span className="font-black bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">Thanush</span>
            </motion.p>
          </motion.footer>

        </div>
      </div>
    </div>
  );
}

export default App;