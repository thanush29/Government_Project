import { useChoroplethData } from "../lib/hooks/useChoroplethData";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import { useState } from "react";

const INDIA_DISTRICTS = "/india_district.geojson";

interface ChoroplethMapProps {
  districtName?: string | null;
  onDistrictSelect: (district: string) => void;
}

const normalize = (name: string) => {
  if (!name) return "";
  return name
    .toUpperCase()
    .replace(/[\s.-]/g, "")
    .replace("DISTRICT", "")
    .replace("NCTOFDELHI", "DELHI")
    .trim();
};

export default function ChoroplethMap({ onDistrictSelect }: ChoroplethMapProps) {
  const { data, loading } = useChoroplethData();
  const [tooltip, setTooltip] = useState<any | null>(null);
  const [metric, setMetric] = useState<string>("total_individuals_worked");

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto rounded-full"></div>
        <p className="text-gray-600 mt-2 text-sm">Loading map data...</p>
      </div>
    );
  }

  const districtMap = Object.fromEntries(
    data.map((d) => [normalize(d.district_name), d])
  );

  const maxVal = Math.max(...data.map((d) => d[metric] || 0));

  const colorScale = scaleQuantize()
    .domain([0, maxVal])
    .range(["#fff7ed", "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c"]);

  return (
    <div className="relative bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">MGNREGA District Performance Map</h3>

        <select
          className="border p-2 text-sm rounded-md"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
        >
          <option value="total_individuals_worked">Individuals Worked</option>
          <option value="total_households_worked">Households Worked</option>
          <option value="wages">Wages Paid</option>
          <option value="women_persondays">Women Persondays</option>
          <option value="sc_persondays">SC Persondays</option>
          <option value="st_persondays">ST Persondays</option>
        </select>
      </div>

      <div className="w-full h-[520px] flex items-center justify-center border rounded-lg shadow-inner bg-gradient-to-br from-orange-50 to-green-50 relative">

        {tooltip && (
          <div
            className="absolute bg-white border shadow-md px-4 py-2 text-xs rounded-lg z-50"
            style={{ top: tooltip.y, left: tooltip.x }}
          >
            <strong className="block mb-1 text-green-700">{tooltip.district}</strong>
            <p>Individuals: <b>{tooltip.total_individuals_worked}</b></p>
            <p>Households: <b>{tooltip.total_households_worked}</b></p>
            <p>Wages: <b>₹{tooltip.wages?.toLocaleString()}</b></p>
            <p>Women: <b>{tooltip.women_persondays}</b></p>
            <p>SC: <b>{tooltip.sc_persondays}</b></p>
            <p>ST: <b>{tooltip.st_persondays}</b></p>
          </div>
        )}

        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1000, center: [82, 22] }} width={800} height={600}>
          <Geographies geography={INDIA_DISTRICTS}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const dist = normalize(geo.properties.NAME_2);
                const info = districtMap[dist];
                const value = info?.[metric] || 0;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={value ? colorScale(value) : "#E5E7EB"}
                    stroke="#FFF"
                    onMouseEnter={(evt) => {
                      if (info) {
                        setTooltip({
                          district: info.district_name,
                          ...info,
                          x: evt.clientX - 90,
                          y: evt.clientY - 120,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => info && onDistrictSelect(info.district_name)}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#2563eb", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        {/* ✅ Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-md shadow-md text-xs border">
            <p className="font-semibold mb-1 text-gray-700">Intensity Legend</p>
            <div className="flex gap-1">
              {["#fff7ed", "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c"].map((c, i) => (
                <div key={i} className="w-6 h-3 rounded-sm" style={{ background: c }} />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-600">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

      </div>
    </div>
  );
}
