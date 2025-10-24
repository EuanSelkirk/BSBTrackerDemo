import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../data/supabaseClient";

export default function CompetitionAscentEditor() {
  const { eventId } = useParams();
  const [ascents, setAscents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchAscents() {
      setLoading(true);
      try {
        // Step 1: Get all route IDs for this event
        const { data: eventRoutes, error: routeErr } = await supabase
          .from("event_route")
          .select("route_id, points")
          .eq("event_id", eventId);

        if (routeErr) throw routeErr;

        const routeIds = eventRoutes.map((r) => r.route_id);
        const pointsMap = Object.fromEntries(
          eventRoutes.map((r) => [r.route_id, r.points])
        );

        // Step 2: Get all valid user IDs for this event
        const { data: teamMembers, error: tmErr } = await supabase
          .from("team_members")
          .select("user_id")
          .eq("event_id", eventId);

        if (tmErr) throw tmErr;

        const userIds = teamMembers.map((tm) => tm.user_id);

        // Step 3: Get ascents for those route IDs and user IDs
        const { data, error } = await supabase
          .from("ascents")
          .select(
            `
            ascent_id,
            user_id,
            attempts,
            created_at,
            video_url,
            is_valid,
            invalid_reason,
            users ( name ),
            routes ( route_id, color, grade )
          `
          )
          .in("route_id", routeIds)
          .in("user_id", userIds);

        if (error) {
          console.error("Failed to fetch ascents", error);
          setError("Could not load ascents.");
        } else {
          // Enrich with points from event_route
          const enriched = data.map((a) => ({
            ...a,
            points: pointsMap[a.route_id] ?? 0,
          }));
          setAscents(enriched);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not load ascents.");
      } finally {
        setLoading(false);
      }
    }

    if (eventId) fetchAscents();
  }, [eventId]);

  const handleValidityChange = (ascentId, newValid, reason = "") => {
    setAscents((prev) =>
      prev.map((a) =>
        a.ascent_id === ascentId
          ? { ...a, is_valid: newValid, invalid_reason: reason }
          : a
      )
    );
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    for (const ascent of ascents) {
      const { error } = await supabase
        .from("ascents")
        .update({
          is_valid: ascent.is_valid,
          invalid_reason: ascent.is_valid ? null : ascent.invalid_reason,
        })
        .eq("ascent_id", ascent.ascent_id);

      if (error) {
        console.error("Error saving ascent update", error);
        setError("Error saving changes.");
        break;
      }
    }
    setSaving(false);
  };

  if (loading) return <p className="p-4">Loading ascents...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Ascent Editor</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-auto border rounded-md">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">User</th>
              <th className="p-2">Route</th>
              <th className="p-2">Attempts</th>
              <th className="p-2">Points</th>
              <th className="p-2">Date</th>
              <th className="p-2">Video</th>
              <th className="p-2">Valid?</th>
              <th className="p-2">Invalid Reason</th>
            </tr>
          </thead>
          <tbody>
            {ascents.map((a) => (
              <tr
                key={a.ascent_id}
                className={a.is_valid === false ? "bg-red-50" : ""}
              >
                <td className="p-2">{a.users?.name || a.user_id}</td>
                <td className="p-2">
                  {a.routes?.color} – {a.routes?.grade}
                </td>
                <td className="p-2">{a.attempts}</td>
                <td className="p-2">{a.is_valid === false ? 0 : a.points}</td>
                <td className="p-2">
                  {new Date(a.created_at).toLocaleString()}
                </td>
                <td className="p-2">
                  {a.video_url ? (
                    <a
                      href={a.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Video
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="p-2">
                  <select
                    value={a.is_valid ? "true" : "false"}
                    onChange={(e) =>
                      handleValidityChange(
                        a.ascent_id,
                        e.target.value === "true",
                        e.target.value === "true" ? "" : a.invalid_reason
                      )
                    }
                    className="border rounded p-1"
                  >
                    <option value="true">Valid</option>
                    <option value="false">Invalid</option>
                  </select>
                </td>
                <td className="p-2">
                  {a.is_valid === false ? (
                    <input
                      type="text"
                      value={a.invalid_reason || ""}
                      onChange={(e) =>
                        handleValidityChange(a.ascent_id, false, e.target.value)
                      }
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleSaveChanges}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow disabled:opacity-50"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
