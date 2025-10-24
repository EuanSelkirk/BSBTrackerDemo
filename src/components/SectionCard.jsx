import { Link } from "react-router-dom";

export default function SectionCard({
  id,
  name,
  lastUpdated,
  numRoutes,
  avgGrade,
}) {
  return (
    <Link to={`/section/${id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-blue-500 group">
        <h2 className="text-lg font-bold text-blue-800 mb-2 group-hover:text-blue-600 transition-colors">
          {name}
        </h2>
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <span className="font-medium text-gray-500">Last Set:</span>{" "}
            {lastUpdated}
          </p>
          <p>
            <span className="font-medium text-gray-500">Routes:</span>{" "}
            {numRoutes}
          </p>
          <p>
            <span className="font-medium text-gray-500">Avg Grade:</span>{" "}
            {avgGrade || "N/A"}
          </p>
        </div>
      </div>
    </Link>
  );
}
