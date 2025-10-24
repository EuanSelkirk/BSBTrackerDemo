import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../data/supabaseClient";
import RouteCard from "../../components/RouteCard";

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
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("User not authenticated");

        // 1. Fetch section name
        const { data: section, error: sectionErr } = await supabase
          .from("sections")
          .select("name")
          .eq("section_id", sectionId)
          .single();
        if (sectionErr) throw sectionErr;
        setSectionName(section.name);

        // 2. Load route data for this user in this section from the view
        const { data: viewData, error: viewErr } = await supabase
          .from("user_section_event_scores")
          .select(
            `
          route_id,
          grade,
          color,
          image_url,
          event_id,
          max_points,
          event_logo,
          user_earned,
          attempts,
          top_num_per_set,
          event_name
        `
          )
          .eq("section_id", sectionId)
          .eq("user_id", user.id);
        if (viewErr) throw viewErr;

        // 3. Process scored route data
        const scoredRoutes = viewData.map((r) => ({
          route_id: r.route_id,
          grade: r.grade,
          color: r.color,
          image_url: r.image_url,
          completed: r.attempts != null,
          points: r.max_points || 0,
          userEarned: r.user_earned || 0,
          eventId: r.event_id,
          compName: r.event_name || null,
          eventLogo: r.event_logo || null,
          topNum: r.top_num_per_set || null,
        }));

        // 4. Group by event and calculate score totals
        const routesByEvent = {};
        for (const r of scoredRoutes) {
          if (!r.eventId) continue;
          if (!routesByEvent[r.eventId]) routesByEvent[r.eventId] = [];
          routesByEvent[r.eventId].push(r);
        }

        let totalUser = 0;
        let totalMax = 0;

        for (const eventId in routesByEvent) {
          const group = routesByEvent[eventId];
          const topNum = parseInt(group[0]?.topNum, 10) || 3;

          // Top 3 by max possible points
          const topMaxRoutes = [...group]
            .sort((a, b) => b.points - a.points)
            .slice(0, topNum);
          totalMax += topMaxRoutes.reduce((sum, r) => sum + (r.points || 0), 0);

          // Top 3 by earned points
          const topUserRoutes = [...group]
            .filter((r) => r.completed)
            .sort((a, b) => (b.userEarned || 0) - (a.userEarned || 0))
            .slice(0, topNum);

          totalUser += topUserRoutes.reduce(
            (sum, r) => sum + (r.userEarned || 0),
            0
          );
        }

        setUserPoints(totalUser);
        setMaxPoints(totalMax);
        setRoutes(scoredRoutes);
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
