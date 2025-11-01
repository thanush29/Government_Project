import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export interface SunburstDataPoint {
  category: string;
  value: number;
  color: string;
}

export interface SunburstData {
  data: SunburstDataPoint[];
  total: number;
  district: string;
  loading: boolean;
  error: string | null;
}

export function useSunburstData(districtName: string | null): SunburstData {
  const [data, setData] = useState<SunburstDataPoint[]>([]);
  const [total, setTotal] = useState(0);
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
        const { data: rows, error: fetchErr } = await supabase
          .from("district_monthly_summary")
          .select("women_persondays, sc_persondays, st_persondays, total_individuals_worked")
          .eq("district_name", districtName);

        if (fetchErr) throw fetchErr;
        if (!rows || rows.length === 0) {
          setData([]);
          setTotal(0);
          setLoading(false);
          return;
        }

        // Sum all rows for district
        const totals = rows.reduce(
          (acc, r) => ({
            women: acc.women + (r.women_persondays || 0),
            sc: acc.sc + (r.sc_persondays || 0),
            st: acc.st + (r.st_persondays || 0),
            total_pd: acc.total_pd + (r.total_individuals_worked || 0), // already persondays sum
          }),
          { women: 0, sc: 0, st: 0, total_pd: 0 }
        );

        const known = totals.women + totals.sc + totals.st;
        const others = Math.max(0, totals.total_pd - known);
        const finalTotal = known + others;

        const chartData: SunburstDataPoint[] = [
          { category: "Women", value: totals.women, color: "#FB923C" },
          { category: "SC", value: totals.sc, color: "#16A34A" },
          { category: "ST", value: totals.st, color: "#3B82F6" },
          { category: "Others", value: others, color: "#E5E7EB" },
        ];

        setData(chartData);
        setTotal(finalTotal);

      } catch (err: any) {
        console.error("Sunburst fetch failed:", err);
        setError(err.message);
      }

      setLoading(false);
    }

    fetchData();
  }, [districtName]);

  return {
    data,
    total,
    district: districtName || "",
    loading,
    error,
  };
}
