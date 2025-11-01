import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export interface HeatmapDataPoint {
  month: string;
  women: number;
  sc: number;
  st: number;
  others: number;
}

export interface HeatmapData {
  data: HeatmapDataPoint[];
  district: string;
  peakMonth: string;
  peakCategory: string;
  loading: boolean;
  error: string | null;
}

export function useHeatmapData(districtName: string | null): HeatmapData {
  const [data, setData] = useState<HeatmapDataPoint[]>([]);
  const [peakMonth, setPeakMonth] = useState('');
  const [peakCategory, setPeakCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!districtName) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const { data: districtData, error: fetchError } = await supabase
          .from('district_monthly_summary')
          .select('month, women_persondays, sc_persondays, st_persondays, total_individuals_worked')
          .ilike('district_name', `%${districtName}%`)
          .order('month', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (!districtData || districtData.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        let maxValue = 0;
        let maxMonth = '';
        let maxCategory = '';

        const heatmapData: HeatmapDataPoint[] = districtData.map(item => {
          const women = item.women_persondays || 0;
          const sc = item.sc_persondays || 0;
          const st = item.st_persondays || 0;
          const totalCategorized = women + sc + st;
          const others = Math.max(0, (item.total_individuals_worked || 0) - totalCategorized);

          const values = { Women: women, SC: sc, ST: st, Others: others };
          const maxEntry = Object.entries(values).reduce((max, [cat, val]) =>
            val > max.value ? { category: cat, value: val } : max
          , { category: 'Women', value: 0 });

          if (maxEntry.value > maxValue) {
            maxValue = maxEntry.value;
            maxMonth = item.month;
            maxCategory = maxEntry.category;
          }

          return {
            month: item.month,
            women,
            sc,
            st,
            others,
          };
        });

        setData(heatmapData);
        setPeakMonth(maxMonth);
        setPeakCategory(maxCategory);
        setLoading(false);
      } catch (err) {
        console.error('Heatmap data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setLoading(false);
      }
    }

    fetchData();
  }, [districtName]);

  return {
    data,
    district: districtName || '',
    peakMonth,
    peakCategory,
    loading,
    error,
  };
}
