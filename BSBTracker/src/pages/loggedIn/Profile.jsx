import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeamsTab from "../../components/TeamsTab";
import AscentsTab from "../../components/AscentsTab";

import {
  getCurrentUser,
  signOut as supaSignOut,
} from "../../data/supabaseClient";
import {
  fetchUserProfile,
  fetchUserAscents,
  fetchUserTeams,
  updateUserProfile,
  uploadAvatar,
  syncUserToDatabase,
} from "../../data/users";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ascents");

  const [editName, setEditName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [ascentCount, setAscentCount] = useState(0);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const [maxGrade, setMaxGrade] = useState(null);
  const [avgGrade, setAvgGrade] = useState(null);

  const [ascents, setAscents] = useState([]);
  const [teams, setTeams] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      const user = await getCurrentUser();
      const userError = null;

      if (userError || !user) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      const userId = user.id;

      try {
        // 1. Sync user to DB and fetch profile
        await syncUserToDatabase();
        const profileData = await fetchUserProfile(userId);
        setUserData(profileData);
        setEditName(profileData.name || "");
        setEditAvatarUrl(profileData.picture || null);

        // 2. Fetch valid ascents from view
        const ascentsData = await fetchUserAscents(userId);

        setAscents(ascentsData);
        setAscentCount(ascentsData.length);

        const numericGrades = ascentsData
          .map((a) => parseVGrade(a.grade))
          .filter((g) => g !== null);

        if (numericGrades.length > 0) {
          const max = Math.max(...numericGrades);
          const avg =
            numericGrades.reduce((sum, g) => sum + g, 0) / numericGrades.length;
          setMaxGrade(max);
          setAvgGrade(avg.toFixed(1));
        }

        // 3. Fetch team memberships and comp info
        const teamsData = await fetchUserTeams(userId);
        setTeams(teamsData);
      } catch (err) {
        console.error(err);
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    let newAvatarUrl = userData.picture;

    if (avatarFile) {
      const uploadedUrl = await uploadAvatar(userData.id, avatarFile);
      if (!uploadedUrl) {
        setSaving(false);
        return;
      }
      newAvatarUrl = uploadedUrl;
    }

    try {
      await updateUserProfile(userData.id, {
        name: editName,
        picture: newAvatarUrl,
      });
    } catch (updateError) {
      console.error("Update error:", updateError);
      setSaving(false);
      return;
    }

    setUserData({
      ...userData,
      name: editName,
      picture: `${newAvatarUrl}?t=${Date.now()}`,
    });

    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 3000);
    setSaving(false);
  };

  const handleLogout = async () => {
    await supaSignOut();
    navigate("/");
  };

  const tabButtonClass = (tab) =>
    `flex-1 flex justify-center py-3 text-sm font-medium transition`;

  const parseVGrade = (gradeStr) => {
    if (!gradeStr || typeof gradeStr !== "string") return null;
    const trimmed = gradeStr.trim().toUpperCase();
    if (!trimmed.startsWith("V")) return null;

    const num = parseInt(trimmed.slice(1), 10);
    return isNaN(num) ? null : num;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-white pb-20 px-4 pt-6 md:pt-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          {showSavedNotification && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
              Changes saved!
            </div>
          )}
          {userData?.picture ? (
            <img
              src={userData.picture}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
              ?
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {userData?.name || "Unnamed User"}
            </h2>
            <div className="text-gray-500 text-sm">
              Ascents: {ascentCount} | Max: V{maxGrade ?? "–"} | Avg: V
              {avgGrade ?? "–"}
            </div>
          </div>
        </div>

        <div className="flex -mb-1 -mx-4">
          {["ascents", "teams", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={tabButtonClass(tab)}
            >
              <span
                className={`pb-1 border-b-2 ${
                  activeTab === tab ? "border-black" : "border-transparent"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </span>
            </button>
          ))}
        </div>

        <div className="-mx-4">
          {activeTab === "ascents" && <AscentsTab ascents={ascents} />}
          {activeTab === "teams" && (
            <TeamsTab teams={teams} navigate={navigate} />
          )}
          {activeTab === "settings" && (
            <div className="bg-white rounded-b-lg shadow p-6 max-w-md mx-auto space-y-6">
              <div className="flex justify-center">
                <label className="relative w-28 h-28 cursor-pointer group">
                  <img
                    src={editAvatarUrl || "/default-pfp.jpg"}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full border border-gray-300 shadow-sm group-hover:opacity-90 transition"
                  />
                  <div className="absolute bottom-1 right-1 bg-blue-600 group-hover:bg-blue-700 text-white p-1 rounded-full shadow-md transition-all">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536M9 13l6.364-6.364a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-1.414a2 2 0 01.586-1.414z"
                      />
                    </svg>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAvatarFile(file);
                        setEditAvatarUrl(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Change Name Here"
                />
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-full font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-full font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
