import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/sections"
          className="p-4 bg-blue-100 rounded shadow hover:bg-blue-200 transition"
        >
          <h2 className="text-xl font-semibold">Manage Sections</h2>
          <p className="text-sm text-gray-600">
            Add, delete, or update gym sections
          </p>
        </Link>

        <Link
          to="/admin/sets"
          className="p-4 bg-green-100 rounded shadow hover:bg-green-200 transition"
        >
          <h2 className="text-xl font-semibold">Manage Sets</h2>
          <p className="text-sm text-gray-600">
            View and manage route sets per section
          </p>
        </Link>
        <Link
          to="/admin/teams"
          className="p-4 bg-red-100 rounded shadow hover:bg-green-200 transition"
        >
          <h2 className="text-xl font-semibold">Manage Teams</h2>
          <p className="text-sm text-gray-600">View and manage teams</p>
        </Link>
        <Link
          to="/admin/events"
          className="p-4 bg-orange-100 rounded shadow hover:bg-green-200 transition"
        >
          <h2 className="text-xl font-semibold">Manage Events</h2>
          <p className="text-sm text-gray-600">View and manage events</p>
        </Link>
      </div>
    </div>
  );
}
