import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export interface ChoroplethValue {
  district_name: string;
  total_individuals_worked: number;
  wages: number;
  women_persondays: number;
  sc_persondays: number;
  st_persondays: number;
  total_households_worked: number;
}

export function useChoroplethData() {
  const [data, setData] = useState<ChoroplethValue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMapData() {
      const { data: rows, error } = await supabase
        .from("district_monthly_summary")
        .select(`
          district_name,
          total_individuals_worked,
          wages,
          women_persondays,
          sc_persondays,
          st_persondays,
          total_households_worked
        `);

      if (error) {
        console.error("Supabase error:", error);
        setLoading(false);
        return;
      }

      // Aggregate by district
      const districtMap: Record<string, ChoroplethValue> = {};

      rows?.forEach(row => {
        const name = row.district_name.trim().toUpperCase();

        if (!districtMap[name]) {
          districtMap[name] = {
            district_name: name,
            total_individuals_worked: 0,
            wages: 0,
            women_persondays: 0,
            sc_persondays: 0,
            st_persondays: 0,
            total_households_worked: 0,
          };
        }

        districtMap[name].total_individuals_worked += Number(row.total_individuals_worked) || 0;
        districtMap[name].wages += Number(row.wages) || 0;
        districtMap[name].women_persondays += Number(row.women_persondays) || 0;
        districtMap[name].sc_persondays += Number(row.sc_persondays) || 0;
        districtMap[name].st_persondays += Number(row.st_persondays) || 0;
        districtMap[name].total_households_worked += Number(row.total_households_worked) || 0;
      });

      setData(Object.values(districtMap));
      setLoading(false);
    }

    fetchMapData();
  }, []);

  return { data, loading };
}
