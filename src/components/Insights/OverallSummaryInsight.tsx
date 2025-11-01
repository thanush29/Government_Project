import React from "react";
import { motion } from "framer-motion";

export default function OverallSummaryInsight({ summary, loading }: any) {
  if (loading) {
    return (
      <div className="bg-white/70 p-6 rounded-xl shadow-md border animate-pulse">
        Loading national overview…
      </div>
    );
  }

  if (!summary) return null;

  const {
    totalIndividuals,
    totalWages,
    totalWomenDays,
    totalScDays,
    totalStDays,
  } = summary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-gradient-to-r from-indigo-50 via-white to-purple-100 rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
    >
      <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
        🇮🇳 India MGNREGA — National Snapshot
      </h4>

      <p className="text-gray-700 leading-relaxed mb-2">
        Across the nation, <span className="font-bold text-indigo-700">{totalIndividuals.toLocaleString("en-IN")}</span> citizens secured employment under the MGNREGA program — 
        a testament to India's grassroots work guarantee mission.
      </p>

      <p className="text-gray-700 mb-2">
        Total wages disbursed stand at 
        <span className="font-bold text-purple-700"> ₹{(totalWages / 1e7).toFixed(2)} Cr</span>, 
        supporting millions of households with dignity & livelihood.
      </p>

      <p className="text-gray-700 mb-2">
        Women-led participation remains powerful — contributing 
        <span className="font-bold text-fuchsia-700"> {totalWomenDays.toLocaleString("en-IN")}</span>{" "}
        person-days of work.
      </p>

      <p className="text-gray-700">
        Inclusivity continues, with 
        <span className="font-bold text-emerald-700"> {totalScDays.toLocaleString("en-IN")}</span> SC person-days 
        and <span className="font-bold text-yellow-700"> {totalStDays.toLocaleString("en-IN")}</span> ST person-days, 
        strengthening rural socio-economic equity.
      </p>
    </motion.div>
  );
}
