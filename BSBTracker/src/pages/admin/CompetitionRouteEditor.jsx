import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../data/supabaseClient";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CompetitionEditor() {
  const { competitionId } = useParams();
  const [defaultExpiry, setDefaultExpiry] = useState(null);

  const [sections, setSections] = useState([]);
  const [routesBySection, setRoutesBySection] = useState({});
  const [selectedRoutes, setSelectedRoutes] = useState([]); // [{route_id, points, name, section_name}]
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load sections and routes on mount
  useEffect(() => {
    fetchSectionsAndRoutes();
    fetchCompetitionRoutes();
  }, []);

  // Fetch all sections with their recent sets and routes inside recent sets
  async function fetchSectionsAndRoutes() {
    setLoading(true);
    try {
      // Fetch sections with recent_set info
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("sections")
        .select("section_id, name, recent_set")
        .order("created_at", { ascending: false });

      if (sectionsError) throw sectionsError;

      setSections(sectionsData || []);

      // For each section, fetch routes in recent_set, sorted by created_at desc
      const newRoutesBySection = {};
      for (const section of sectionsData) {
        if (!section.recent_set) {
          newRoutesBySection[section.section_id] = [];
          continue;
        }

        const { data: routes, error: routesError } = await supabase
          .from("routes")
          .select("route_id, name, grade, color, created_at")
          .eq("set_id", section.recent_set)
          .order("created_at", { ascending: false });

        if (routesError) throw routesError;

        newRoutesBySection[section.section_id] = routes || [];
      }

      setRoutesBySection(newRoutesBySection);
    } catch (error) {
      console.error("Error fetching sections or routes:", error);
      alert("Failed to load sections or routes");
    } finally {
      setLoading(false);
    }
  }

  // Fetch routes already assigned to this competition
  async function fetchCompetitionRoutes() {
    if (!competitionId) return;

    try {
      const { data: eventRoutes, error } = await supabase
        .from("event_route")
        .select("comp_route_id, route_id, points, event_id, expiry_date")

        .eq("event_id", competitionId);

      if (error) throw error;

      if (!eventRoutes?.length) {
        setSelectedRoutes([]);
        return;
      }

      // Fetch routes with set_id
      const routeIds = eventRoutes.map((er) => er.route_id);
      const { data: routesData, error: routesError } = await supabase
        .from("routes")
        .select("route_id, name, set_id, grade, color")
        .in("route_id", routeIds);

      if (routesError) throw routesError;

      // Fetch sets for those routes to get section_id
      const setIds = [...new Set(routesData.map((r) => r.set_id))];
      const { data: setsData, error: setsError } = await supabase
        .from("sets")
        .select("set_id, section_id")
        .in("set_id", setIds);

      if (setsError) throw setsError;

      // Fetch sections for those sets to get section name
      const sectionIds = [...new Set(setsData.map((s) => s.section_id))];
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("sections")
        .select("section_id, name")
        .in("section_id", sectionIds);

      if (sectionsError) throw sectionsError;

      // Create lookups
      const routeMap = Object.fromEntries(
        routesData.map((r) => [r.route_id, r])
      );
      const setMap = Object.fromEntries(setsData.map((s) => [s.set_id, s]));
      const sectionMap = Object.fromEntries(
        sectionsData.map((s) => [s.section_id, s])
      );

      // Build selected routes with section name
      const detailedSelected = eventRoutes.map((er) => {
        const route = routeMap[er.route_id];
        const set = route ? setMap[route.set_id] : null;
        const section = set ? sectionMap[set.section_id] : null;

        return {
          comp_route_id: er.comp_route_id,
          route_id: er.route_id,
          points: er.points,
          grade: route.grade,
          color: route.color,
          expiry_date: er.expiry_date
            ? new Date(er.expiry_date).toISOString().slice(0, 10)
            : "",

          name: route?.name || "Unknown Route",
          section_id: section?.section_id,
          section_name: section?.name || "Unknown Section",
        };
      });

      setSelectedRoutes(detailedSelected);
    } catch (error) {
      console.error("Error fetching competition routes:", error);
      alert("Failed to load competition routes");
    }
  }

  // Handle selecting a route (add to selectedRoutes)
  function handleAddRoute(sectionId, route) {
    // If already selected, do nothing
    if (selectedRoutes.find((r) => r.route_id === route.route_id)) return;

    const section = sections.find((s) => s.section_id === sectionId);

    setSelectedRoutes([
      ...selectedRoutes,
      {
        route_id: route.route_id,
        points: 0,
        name: route.name,
        grade: route.grade,
        color: route.color,
        section_id: sectionId,
        section_name: section?.name,
      },
    ]);
  }

  function handleAddWholeSet(sectionId) {
    const section = sections.find((s) => s.section_id === sectionId);
    const routes = routesBySection[sectionId] || [];

    const newRoutes = routes
      .filter(
        (route) => !selectedRoutes.some((r) => r.route_id === route.route_id)
      )
      .map((route) => ({
        route_id: route.route_id,
        points: 0,
        name: route.name,
        grade: route.grade,
        color: route.color,
        section_id: sectionId,
        section_name: section?.name,
        expiry_date: defaultExpiry
          ? new Date(defaultExpiry).toISOString().slice(0, 10)
          : "",
      }));

    setSelectedRoutes((prev) => [...prev, ...newRoutes]);
  }

  // Handle removing a selected route
  function handleRemoveRoute(route_id) {
    setSelectedRoutes(selectedRoutes.filter((r) => r.route_id !== route_id));
  }

  // Handle changing points for a selected route
  function handlePointsChange(route_id, points) {
    setSelectedRoutes(
      selectedRoutes.map((r) =>
        r.route_id === route_id ? { ...r, points: Number(points) } : r
      )
    );
  }

  // Save selected routes and points to DB
  async function handleSave() {
    if (!competitionId) {
      alert("No competition ID");
      return;
    }
    setSaving(true);
    try {
      // First: Delete existing event_routes for this competition
      const { error: deleteError } = await supabase
        .from("event_route")
        .delete()
        .eq("event_id", competitionId);

      if (deleteError) throw deleteError;

      // Insert new event_routes from selectedRoutes
      const inserts = selectedRoutes.map((r) => ({
        route_id: r.route_id,
        event_id: competitionId,
        points: r.points,
        expiry_date: r.expiry_date
          ? new Date(r.expiry_date).toISOString()
          : null,
      }));

      const { error: insertError } = await supabase
        .from("event_route")
        .insert(inserts);

      if (insertError) throw insertError;

      alert("Competition routes saved!");
    } catch (error) {
      console.error("Error saving competition routes:", error);
      alert("Failed to save competition routes");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        Edit Competition Routes - ID: {competitionId}
      </h1>

      <div className="mb-6">
        <label className="block mb-1 font-medium">
          Default Expiry Date (for adding whole sets)
        </label>
        <DatePicker
          selected={defaultExpiry}
          onChange={(date) => setDefaultExpiry(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="Pp"
          placeholderText="Select expiry date"
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Sections with dropdowns */}
      {sections.map((section) => (
        <div
          key={section.section_id}
          className="mb-6 border p-4 rounded shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{section.name}</h2>

          {routesBySection[section.section_id]?.length === 0 ? (
            <p className="text-gray-500">
              No routes in this section's recent set.
            </p>
          ) : (
            <>
              <select
                className="border p-2 rounded w-full"
                onChange={(e) => {
                  const routeId = Number(e.target.value);
                  if (!routeId) return;
                  const route = routesBySection[section.section_id].find(
                    (r) => r.route_id === routeId
                  );
                  if (route) handleAddRoute(section.section_id, route);
                  e.target.value = "";
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Select route to add...
                </option>
                {routesBySection[section.section_id]
                  .sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                  )
                  .map((route) => (
                    <option key={route.route_id} value={route.route_id}>
                      {route.name} — {route.grade} — {route.color}
                    </option>
                  ))}
              </select>

              <button
                onClick={() => handleAddWholeSet(section.section_id)}
                className="mt-2 text-sm text-blue-600 underline"
              >
                Add All Routes from This Set
              </button>
            </>
          )}
        </div>
      ))}

      {/* Selected routes list */}
      <div className="border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Selected Routes</h2>
        {selectedRoutes.length === 0 && (
          <p className="text-gray-500">No routes selected yet.</p>
        )}
        {selectedRoutes.map((r) => (
          <div
            key={r.route_id}
            className="flex items-center gap-4 mb-2 border-b pb-2"
          >
            <div className="flex-1">
              <strong>{r.name}</strong> <em>({r.section_name})</em>{" "}
              <em>({r.grade})</em> <em>({r.color})</em>
            </div>
            <input
              type="number"
              min={0}
              value={r.points === 0 ? "" : r.points}
              onChange={(e) => handlePointsChange(r.route_id, e.target.value)}
              className="w-20 border p-1 rounded"
              placeholder="Points"
            />

            <input
              type="date"
              value={r.expiry_date || ""}
              onChange={(e) =>
                setSelectedRoutes((prev) =>
                  prev.map((route) =>
                    route.route_id === r.route_id
                      ? { ...route, expiry_date: e.target.value }
                      : route
                  )
                )
              }
              className="border p-1 rounded"
            />

            <button
              onClick={() => handleRemoveRoute(r.route_id)}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        disabled={saving}
        onClick={handleSave}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Competition Routes"}
      </button>
    </div>
  );
}
