import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export interface TrendDataPoint {
  month: string;
  wages: number;
  individuals: number;
}

export interface TrendData {
  data: TrendDataPoint[];
  district: string;
  totalWages: number;
  totalIndividuals: number;
  avgWagePerPerson: number;
  loading: boolean;
  error: string | null;
}

export function useTrendData(districtName: string | null): TrendData {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [totalWages, setTotalWages] = useState(0);
  const [totalIndividuals, setTotalIndividuals] = useState(0);
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
          .select('month, wages, total_individuals_worked')
          .ilike('district_name', `%${districtName}%`)
          .order('month', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (!districtData || districtData.length === 0) {
          setData([]);
          setTotalWages(0);
          setTotalIndividuals(0);
          setLoading(false);
          return;
        }

        const trendData: TrendDataPoint[] = districtData.map(item => ({
          month: item.month,
          wages: item.wages || 0,
          individuals: item.total_individuals_worked || 0,
        }));

        const sumWages = trendData.reduce((sum, d) => sum + d.wages, 0);
        const sumIndividuals = trendData.reduce((sum, d) => sum + d.individuals, 0);

        setData(trendData);
        setTotalWages(sumWages);
        setTotalIndividuals(sumIndividuals);
        setLoading(false);
      } catch (err) {
        console.error('Trend data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setLoading(false);
      }
    }

    fetchData();
  }, [districtName]);

  const avgWagePerPerson = totalIndividuals > 0 ? totalWages / totalIndividuals : 0;

  return {
    data,
    district: districtName || '',
    totalWages,
    totalIndividuals,
    avgWagePerPerson,
    loading,
    error,
  };
}
