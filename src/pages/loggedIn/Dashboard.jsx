import { useState, useEffect } from "react";
import { getSectionsSummary } from "../../data/sections";
import SectionCard from "../../components/SectionCard";
import SectionMap from "../../components/SectionMap";

export default function Dashboard() {
  const [sections, setSections] = useState([]);
  const [sortBy, setSortBy] = useState("lastUpdated");

  useEffect(() => {
    getSectionsSummary()
      .then((data) => setSections(data))
      .catch((err) => console.error("Failed to fetch sections:", err));
  }, []);

  const sortedSections = [...sections].sort((a, b) => {
    if (sortBy === "lastUpdated") {
      return new Date(b.last_updated) - new Date(a.last_updated);
    } else if (sortBy === "avgGrade") {
      return (b.avg_grade ?? -2) - (a.avg_grade ?? -2);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-blue-900">
            Climbing Sections
          </h1>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded border-gray-300 bg-white shadow-sm text-sm px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="lastUpdated">Last Set</option>
              <option value="avgGrade">Average Grade</option>
            </select>
          </div>
        </div>

        <div className="mb-12 rounded-lg overflow-hidden shadow-sm">
          <SectionMap sections={sections} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSections.map((section) => (
            <SectionCard
              key={section.section_id}
              id={section.section_id}
              name={section.name}
              lastUpdated={
                section.last_updated
                  ? new Date(section.last_updated).toLocaleDateString()
                  : "N/A"
              }
              numRoutes={section.num_routes}
              avgGrade={
                section.avg_grade === null
                  ? "?"
                  : section.avg_grade === -1
                    ? "VB"
                    : `${section.avg_grade}`
              }
            />
          ))}
        </div>
      </main>
    </div>
  );
}
