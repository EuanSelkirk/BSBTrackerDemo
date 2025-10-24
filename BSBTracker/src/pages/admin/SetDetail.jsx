import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../data/supabaseClient";
import { compressImage } from "../../data/users";

export default function RouteManager() {
  const { setId } = useParams();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRoute, setEditRoute] = useState(null);

  const [newRoute, setNewRoute] = useState({
    name: "",
    grade: "",
    color: "",
    image: null,
  });

  useEffect(() => {
    fetchRoutes();
  }, [setId]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("routes")
        .select("*")
        .eq("set_id", setId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRoutes(data);
    } catch (err) {
      console.error("Failed to fetch routes", err);
      alert("Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  };

  const uploadRouteImage = async (file) => {
    if (!file) return null;
    const compressed = await compressImage(file, 800);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("route-images")
      .upload(filePath, compressed);

    if (uploadError) {
      console.error("Image upload failed:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from("route-images")
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  };

  const handleAddRoute = async () => {
    const { name, grade, color, image } = newRoute;
    if (!name.trim() || !grade.trim() || !color.trim())
      return alert("All fields required");

    try {
      const imageUrl = image ? await uploadRouteImage(image) : null;
      const { error } = await supabase.from("routes").insert({
        name,
        grade,
        color,
        set_id: setId,
        image_url: imageUrl,
      });

      if (error) throw error;

      setNewRoute({ name: "", grade: "", color: "", image: null });
      fetchRoutes();
    } catch (err) {
      console.error("Failed to add route", err);
      alert("Failed to add route");
    }
  };

  const handleUpdate = async () => {
    try {
      let imageUrl = editRoute.image_url;

      if (editRoute.image instanceof File) {
        imageUrl = await uploadRouteImage(editRoute.image);
      }

      const { error } = await supabase
        .from("routes")
        .update({
          name: editRoute.name,
          grade: editRoute.grade,
          color: editRoute.color,
          image_url: imageUrl,
        })
        .eq("route_id", editRoute.route_id);

      if (error) throw error;

      setEditRoute(null);
      fetchRoutes();
    } catch (err) {
      console.error("Failed to update route", err);
      alert("Failed to update route");
    }
  };

  const handleDelete = async (routeId) => {
    if (!confirm("Delete this route?")) return;

    try {
      const { error } = await supabase
        .from("routes")
        .delete()
        .eq("route_id", routeId);

      if (error) throw error;

      fetchRoutes();
    } catch (err) {
      console.error("Failed to delete route", err);
    }
  };

  const startEdit = (route) => {
    if (editRoute?.route_id === route.route_id) {
      setEditRoute(null);
    } else {
      setEditRoute({ ...route, image: null });
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Manage Routes for Set {setId}</h2>

      {/* New Route Form */}
      <div className="border p-4 rounded shadow space-y-4">
        <h3 className="font-semibold">Create New Route</h3>

        <input
          type="text"
          placeholder="Route Name"
          value={newRoute.name}
          onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
          className="border p-2 rounded w-full"
        />

        <input
          type="text"
          placeholder="Grade"
          value={newRoute.grade}
          onChange={(e) => setNewRoute({ ...newRoute, grade: e.target.value })}
          className="border p-2 rounded w-full"
        />

        <input
          type="text"
          placeholder="Color"
          value={newRoute.color}
          onChange={(e) => setNewRoute({ ...newRoute, color: e.target.value })}
          className="border p-2 rounded w-full"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewRoute({ ...newRoute, image: e.target.files[0] })
          }
          className="border p-2 rounded w-full"
        />
        {newRoute.image && (
          <p className="text-sm text-gray-600">{newRoute.image.name}</p>
        )}

        <button
          onClick={handleAddRoute}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Route
        </button>
      </div>

      {/* Existing Routes */}
      <div>
        <h3 className="font-semibold mb-2">Existing Routes</h3>
        {loading ? (
          <p>Loading...</p>
        ) : routes.length === 0 ? (
          <p className="text-gray-500">No routes in this set yet.</p>
        ) : (
          <ul className="space-y-2">
            {routes.map((route) => (
              <li
                key={route.route_id}
                className="p-2 border rounded hover:bg-gray-50 transition"
              >
                <h3 className="font-bold">{route.name}</h3>
                <p>
                  {route.grade} – {route.color}
                </p>
                {route.image_url && (
                  <img
                    src={route.image_url}
                    alt={route.name}
                    className="h-32 mt-2 object-cover rounded"
                  />
                )}

                <div className="flex gap-2 mt-2">
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => startEdit(route)}
                  >
                    {editRoute?.route_id === route.route_id
                      ? "Close Edit"
                      : "Edit"}
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDelete(route.route_id)}
                  >
                    Delete
                  </button>
                </div>

                {editRoute?.route_id === route.route_id && (
                  <div className="mt-4 p-4 border rounded bg-gray-50">
                    <input
                      type="text"
                      value={editRoute.name}
                      onChange={(e) =>
                        setEditRoute({ ...editRoute, name: e.target.value })
                      }
                      className="border p-1 rounded w-full mb-2"
                    />
                    <input
                      type="text"
                      value={editRoute.grade}
                      onChange={(e) =>
                        setEditRoute({ ...editRoute, grade: e.target.value })
                      }
                      className="border p-1 rounded w-full mb-2"
                    />
                    <input
                      type="text"
                      value={editRoute.color}
                      onChange={(e) =>
                        setEditRoute({ ...editRoute, color: e.target.value })
                      }
                      className="border p-1 rounded w-full mb-2"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditRoute({
                          ...editRoute,
                          image: e.target.files[0],
                        })
                      }
                      className="mb-2"
                    />

                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        onClick={handleUpdate}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-black px-3 py-1 rounded hover:bg-gray-500"
                        onClick={() => setEditRoute(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
