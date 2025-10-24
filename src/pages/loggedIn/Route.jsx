import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../data/supabaseClient";
import { CheckCircle } from "lucide-react";

export default function RoutePage() {
  const { routeId } = useParams();
  const [userId, setUserId] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [ascentDetails, setAscentDetails] = useState(null);
  const [tries, setTries] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isValidVideoUrl = (url) =>
    /^(https?:\/\/)?(www\.)?(instagram\.com|youtu\.be|youtube\.com|tiktok\.com)\/.+$/.test(
      url.trim()
    );

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const uid = user.id;
        setUserId(uid);

        // --- Fetch route + event info ---
        const { data: routeData, error: routeError } = await supabase
          .from("route_with_event_info")
          .select("*")
          .eq("route_id", routeId)
          .maybeSingle();

        if (routeError) throw routeError;

        setRouteDetails({
          route_id: routeData.route_id,
          grade: routeData.grade,
          color: routeData.color,
          image_url: routeData.image_url,
          points: routeData.points,
          event_id: routeData.event_id,
          event_name: routeData.event_name,
          event_logo: routeData.event_logo,
          points_off_per_attempt: routeData.points_off_per_attempt,
          max_points_off: routeData.max_points_off,
          avg_or_cumulative: routeData.avg_or_cumulative,
        });

        // --- Fetch latest user ascent (if exists) ---
        const { data: ascentData, error: ascentError } = await supabase
          .from("latest_user_ascent")
          .select("*")
          .eq("user_id", uid)
          .eq("route_id", routeId)
          .maybeSingle();

        if (ascentError) throw ascentError;

        if (ascentData) {
          setAscentDetails({
            tries: ascentData.attempts || 0,
            videoLink: ascentData.video_url || "",
            created_at: ascentData.ascent_created_at || null,
            is_valid: ascentData.is_valid,
            invalid_reason: ascentData.invalid_reason,
          });
        } else {
          setAscentDetails(null);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [routeId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogAscent = async () => {
    if (!tries || tries < 1) {
      setError("Please provide a valid number of tries.");
      return;
    }

    if (videoLink.trim() && !isValidVideoUrl(videoLink)) {
      setError(
        "Please provide a valid video link from Instagram, YouTube, or TikTok."
      );
      return;
    }

    try {
      const { error: insertError } = await supabase.from("ascents").insert({
        user_id: userId,
        route_id: routeId,
        attempts: tries,
        video_url: videoLink.trim() || null,
      });

      if (insertError) throw insertError;

      setAscentDetails({
        tries,
        videoLink: videoLink.trim(),
        created_at: new Date().toISOString(),
        is_valid: true,
        invalid_reason: null,
      });
    } catch (err) {
      console.error("Failed to log ascent:", err);
      setError("Failed to log ascent.");
    }
  };

  const handleUpdateVideoLink = async () => {
    if (videoLink.trim() && !isValidVideoUrl(videoLink)) {
      setError(
        "Please enter a valid video link from Instagram, YouTube, or TikTok."
      );
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("ascents")
        .update({ video_url: videoLink.trim() || null })
        .eq("user_id", userId)
        .eq("route_id", routeId);

      if (updateError) throw updateError;

      setAscentDetails((prev) => ({
        ...prev,
        videoLink: videoLink.trim(),
      }));
      setIsEditingLink(false);
    } catch (err) {
      console.error("Failed to update video link:", err);
      setError("Failed to update video link.");
    }
  };

  const handleDeleteAscent = async () => {
    try {
      const { error: deleteError } = await supabase
        .from("ascents")
        .delete()
        .eq("user_id", userId)
        .eq("route_id", routeId);

      if (deleteError) throw deleteError;

      setAscentDetails(null);
    } catch (err) {
      console.error("Failed to delete ascent:", err);
      setError("Failed to delete ascent.");
    }
  };

  const getPointsEarned = () => {
    if (!routeDetails || !ascentDetails) return null;
    if (ascentDetails.is_valid === false) return 0;

    const { points, points_off_per_attempt, max_points_off } = routeDetails;

    const penalty = Math.min(
      (ascentDetails.tries - 1) * (points_off_per_attempt || 0),
      max_points_off || 0
    );

    return Math.max(points - penalty, 0);
  };

  const isInvalid = ascentDetails?.is_valid === false;

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      {loading ? (
        <p className="text-center text-gray-500">Loading route details...</p>
      ) : (
        <div className="max-w-2xl mx-auto">
          {routeDetails && (
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              {isInvalid && (
                <div className="bg-red-100 border border-red-400 text-red-700 p-3 text-sm">
                  <strong>This ascent has been marked invalid.</strong>
                  {ascentDetails?.invalid_reason && (
                    <p>Reason: {ascentDetails.invalid_reason}</p>
                  )}
                </div>
              )}
              {routeDetails.image_url && (
                <img
                  src={routeDetails.image_url}
                  alt="Route"
                  className="w-full aspect-[2/3] object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-gray-600 text-sm">
                  <strong>Grade:</strong> {routeDetails.grade || "Unknown"}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Color:</strong> {routeDetails.color || "N/A"}
                </p>
              </div>
            </div>
          )}

          {!ascentDetails ? (
            <div className="bg-white shadow p-4 rounded-lg">
              {/* <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-3 mb-4 text-sm rounded">
                <strong>Note:</strong> To have your ascent verified by an admin,
                please provide a video link (Instagram or YouTube).
                <br />
                You can still submit your ascent now and add the video later.
              </div> */}

              <h2 className="text-lg font-semibold mb-2">Log Your Ascent</h2>
              <label className="block text-sm font-medium">Tries</label>
              <input
                type="number"
                min={1}
                value={tries}
                placeholder="e.g. 2"
                onChange={(e) => setTries(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
              />
              <label className="block text-sm font-medium">
                Video Link (optional)
              </label>
              <input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
              />
              <button
                onClick={handleLogAscent}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition"
              >
                Submit Ascent
              </button>
            </div>
          ) : (
            <div className="bg-white shadow p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Your Ascent</h2>
                {isInvalid ? (
                  <div className="text-red-500 font-bold text-xl">✕</div>
                ) : (
                  <CheckCircle className="text-green-500 w-5 h-5" />
                )}
              </div>
              <p className="text-gray-700">
                <strong>Tries:</strong> {ascentDetails.tries}
              </p>
              <p className="text-gray-700">
                <strong>Logged:</strong>{" "}
                {new Date(ascentDetails.created_at).toLocaleString()}
              </p>
              {getPointsEarned() !== null && (
                <p
                  className={`text-sm ${isInvalid ? "text-red-600" : "text-gray-700"}`}
                >
                  <strong>Points Earned:</strong>{" "}
                  {isInvalid ? 0 : getPointsEarned()}
                </p>
              )}
              {routeDetails?.event_name && (
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={routeDetails.event_logo || "/default-comp-logo.png"}
                    alt="Comp Logo"
                    className="w-6 h-6 object-contain"
                  />
                  <p className="text-gray-700">
                    <strong>Competition:</strong> {routeDetails.event_name}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {isEditingLink ? (
                  <>
                    <input
                      type="url"
                      value={videoLink}
                      onChange={(e) => setVideoLink(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={handleUpdateVideoLink}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm transition w-full"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingLink(false);
                          setVideoLink(ascentDetails.videoLink || "");
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md shadow-sm transition w-full"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {ascentDetails.videoLink && (
                      <p className="text-sm text-blue-600 break-words">
                        <a
                          href={ascentDetails.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {ascentDetails.videoLink}
                        </a>
                      </p>
                    )}
                    {/* {!ascentDetails.videoLink && (
                      <p className="text-yellow-700 text-sm mt-1">
                        No video link provided yet — add one to have your ascent
                        reviewed.
                      </p>
                    )} */}

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setVideoLink(ascentDetails.videoLink || "");
                          setIsEditingLink(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition"
                      >
                        Edit Video Link
                      </button>
                      <button
                        onClick={handleDeleteAscent}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-sm transition"
                      >
                        Delete Ascent
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
      )}
    </div>
  );
}
