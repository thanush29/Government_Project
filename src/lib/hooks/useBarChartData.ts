import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export interface MonthlyDataPoint {
  month: string;
  total_individuals_worked: number;
}

export interface BarChartData {
  data: MonthlyDataPoint[];
  total: number;
  average: number;
  peakMonth: string;
  peakValue: number;
  district: string;
  loading: boolean;
  error: string | null;
}

const monthOrder = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March"
];

const normalizeMonth = (m: string) => {
  const clean = m.trim().toLowerCase();
  const map: Record<string, string> = {
    apr: "April", april: "April",
    may: "May",
    jun: "June", june: "June",
    jul: "July", july: "July",
    aug: "August", august: "August",
    sep: "September", sept: "September", september: "September",
    oct: "October", october: "October",
    nov: "November", november: "November",
    dec: "December", december: "December",
    jan: "January", january: "January",
    feb: "February", february: "February",
    mar: "March", march: "March"
  };
  return map[clean] ?? m;
};

export function useBarChartData(districtName: string | null): BarChartData {
  const [data, setData] = useState<MonthlyDataPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [average, setAverage] = useState(0);
  const [peakMonth, setPeakMonth] = useState("");
  const [peakValue, setPeakValue] = useState(0);
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
          .select("month, total_individuals_worked")
          .eq("district_name", districtName);

        if (fetchErr) throw fetchErr;
        if (!rows || rows.length === 0) {
          setData([]);
          setTotal(0);
          setAverage(0);
          setPeakMonth("");
          setPeakValue(0);
          setLoading(false);
          return;
        }

        // Normalize and sort data
        const normalizedData = rows.map(r => ({
          month: normalizeMonth(r.month),
          total_individuals_worked: r.total_individuals_worked || 0
        }));

        const sortedData = normalizedData.sort(
          (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
        );

        // Calculate metrics
        const totalWorked = sortedData.reduce((sum, d) => sum + d.total_individuals_worked, 0);
        const avg = sortedData.length > 0 ? totalWorked / sortedData.length : 0;

        // Find peak month
        const peak = sortedData.reduce((max, d) => 
          d.total_individuals_worked > max.total_individuals_worked ? d : max
        , sortedData[0]);

        setData(sortedData);
        setTotal(totalWorked);
        setAverage(Math.round(avg));
        setPeakMonth(peak.month);
        setPeakValue(peak.total_individuals_worked);

      } catch (err: any) {
        console.error("BarChart fetch failed:", err);
        setError(err.message);
      }

      setLoading(false);
    }

    fetchData();
  }, [districtName]);

  return {
    data,
    total,
    average,
    peakMonth,
    peakValue,
    district: districtName || "",
    loading,
    error,
  };
}