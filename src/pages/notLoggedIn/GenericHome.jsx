import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Blue Swan Tracker
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Track everything Blue Swan — progress, performance, and precision.
        </p>

        <div className="bg-white py-8 px-6 shadow-xl rounded-lg sm:px-10 mt-8 space-y-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          >
            View Demo Dashboard
          </button>
          <p className="text-xs text-gray-500">
            (Authentication disabled for demo)
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Blue Swan Tracker. All rights reserved.
        </p>
      </div>
    </div>
  );
}
