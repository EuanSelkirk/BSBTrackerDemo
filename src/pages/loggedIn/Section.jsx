import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RouteCard from "../../components/RouteCard";
import { getSectionDetails } from "../../data/sections";

export default function Section() {
  const { sectionId } = useParams();
  const [routes, setRoutes] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [userPoints, setUserPoints] = useState(0);
  const [maxPoints, setMaxPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await getSectionDetails(sectionId);
        setSectionName(data.sectionName);
        setRoutes(data.routes);
        setUserPoints(data.userPoints);
        setMaxPoints(data.maxPoints);
      } catch (err) {
        console.error(err);
        setError("Failed to load section data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sectionId]);

  if (loading)
    return <p className="p-6 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">
        {sectionName} — Routes
      </h1>

      {maxPoints > 0 && (
        <div className="text-center mb-6">
          <div className="inline-block bg-green-100 text-green-900 text-sm font-medium px-3 py-1 rounded-full">
            You’ve earned {userPoints} / {maxPoints} points
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-[1px]">
        {routes.map((route) => (
          <RouteCard
            key={route.route_id}
            route={route}
            completed={route.completed}
            userScore={route.userEarned}
            eventId={route.eventId}
            compName={route.compName}
            eventLogo={route.eventLogo}
          />
        ))}
      </div>
    </div>
  );
}
