import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export interface OverallSummary {
  totalIndividuals: number;
  totalWages: number;
  totalWomenDays: number;
  totalScDays: number;
  totalStDays: number;
}

export function useOverallSummaryData() {
  const [data, setData] = useState<OverallSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverall() {
      // View: state_monthly_summary (recommended)
      const { data: result, error } = await supabase
        .from("state_monthly_summary")
        .select("total_individuals_worked, wages, women_persondays, sc_persondays, st_persondays");

      if (error) {
        console.error("Fetch overall summary error:", error);
        return;
      }

      const totals = result?.reduce(
        (acc, row) => ({
          totalIndividuals: acc.totalIndividuals + (row.total_individuals_worked || 0),
          totalWages: acc.totalWages + (row.wages || 0),
          totalWomenDays: acc.totalWomenDays + (row.women_persondays || 0),
          totalScDays: acc.totalScDays + (row.sc_persondays || 0),
          totalStDays: acc.totalStDays + (row.st_persondays || 0),
        }),
        {
          totalIndividuals: 0,
          totalWages: 0,
          totalWomenDays: 0,
          totalScDays: 0,
          totalStDays: 0,
        }
      );

      setData(totals);
      setLoading(false);
    }

    fetchOverall();
  }, []);

  return { data, loading };
}
