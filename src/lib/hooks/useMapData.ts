import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export function useMapData() {
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    async function fetchMapData() {
      const { data, error } = await supabase
        .from("district_monthly_summary")
        .select("district_name, total_individuals_worked");

      if (!error && data) {
        const aggregated = data.reduce((acc, row) => {
          const key = row.district_name.toLowerCase().trim();
          acc[key] = (acc[key] || 0) + (row.total_individuals_worked || 0);
          return acc;
        }, {});

        setMapData(
          Object.keys(aggregated).map((district) => ({
            district,
            value: aggregated[district],
          }))
        );
      }
    }

    fetchMapData();
  }, []);

  return mapData;
}
