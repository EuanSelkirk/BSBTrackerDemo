import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AscentsTab from "../../components/AscentsTab";
import TeamsTab from "../../components/TeamsTab";

import {
  events,
  routes,
  sections,
  sets,
  teams,
  users,
} from "../../data/bsbtracker_mock_data";

const DEFAULT_PROFILE_USER = {
  name: "Taylor Rivers",
  picture:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=240&q=80",
  bio: "Community setter and weekend crusher.",
};

const PROFILE_USER = (() => {
  if (Array.isArray(users) && users.length > 0) {
    const user = users[0];
    return {
      name: user.name || DEFAULT_PROFILE_USER.name,
      picture: user.avatar_url || DEFAULT_PROFILE_USER.picture,
      bio: `${
        user.name || "This climber"
      } is ready for the 2025 Bouldering League demo!`,
    };
  }

  return DEFAULT_PROFILE_USER;
})();

const SECTION_LOOKUP = new Map(
  sections.map((section) => [section.section_id, section])
);
const SET_LOOKUP = new Map(sets.map((set) => [set.set_id, set]));
const EVENT_LOOKUP = new Map(events.map((event) => [event.event_id, event]));

const PREFERRED_ROUTE_IDS = ["224", "223", "222", "221", "220", "219"];
const MAX_PROFILE_ASCENTS = 6;
const MAX_PROFILE_TEAMS = 4;

const getSectionNameForRoute = (route) => {
  const parentSet = SET_LOOKUP.get(route.set_id);
  if (!parentSet) return "Unknown";

  const section = SECTION_LOOKUP.get(parentSet.section_id);
  return section?.name ?? "Unknown";
};

const buildProfileAscents = () => {
  if (!Array.isArray(routes)) return [];

  const routeLookup = new Map(routes.map((route) => [route.route_id, route]));

  const prioritizedRoutes = PREFERRED_ROUTE_IDS.map((routeId) =>
    routeLookup.get(routeId)
  ).filter(Boolean);

  const fallbackRoutes = routes.filter(
    (route) => route.image_url && !PREFERRED_ROUTE_IDS.includes(route.route_id)
  );

  const combinedRoutes = [...prioritizedRoutes, ...fallbackRoutes].slice(
    0,
    MAX_PROFILE_ASCENTS
  );

  return combinedRoutes.map((route) => ({
    ascent_id: `ascent-${route.route_id}`,
    route_id: route.route_id,
    image_url: route.image_url,
    grade: route.grade,
    color: route.color,
    section_name: getSectionNameForRoute(route),
  }));
};

const buildProfileTeams = () => {
  if (!Array.isArray(teams)) return [];

  return teams
    .filter((team) => team.display_on_leaderboard !== false)
    .slice(0, MAX_PROFILE_TEAMS)
    .map((team) => {
      const event = EVENT_LOOKUP.get(team.competition_id);
      return {
        teams: {
          ...team,
          events: event
            ? {
                name: event.name,
                start_date: event.start_date,
                end_date: event.end_date,
              }
            : null,
        },
      };
    });
};

const PROFILE_ASCENTS = buildProfileAscents();
const PROFILE_TEAMS = buildProfileTeams();

const parseVGrade = (gradeStr) => {
  if (!gradeStr || typeof gradeStr !== "string") return null;
  const trimmed = gradeStr.trim().toUpperCase();
  if (!trimmed.startsWith("V")) return null;

  const num = parseInt(trimmed.slice(1), 10);
  return Number.isNaN(num) ? null : num;
};
export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ascents");
  const [displayName, setDisplayName] = useState(PROFILE_USER.name);
  const [avatarUrl, setAvatarUrl] = useState(PROFILE_USER.picture);
  const [avatarFileName, setAvatarFileName] = useState(null);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const profileAscents = PROFILE_ASCENTS;
  const profileTeams = PROFILE_TEAMS;

  const ascentStats = useMemo(() => {
    const numericGrades = profileAscents
      .map((ascent) => parseVGrade(ascent.grade))
      .filter((grade) => grade !== null);

    if (numericGrades.length === 0) {
      return { count: 0, max: "–", avg: "–" };
    }

    const max = Math.max(...numericGrades);
    const avg = (
      numericGrades.reduce((sum, grade) => sum + grade, 0) /
      numericGrades.length
    ).toFixed(1);

    return { count: profileAscents.length, max: `V${max}`, avg: `V${avg}` };
  }, [profileAscents]);

  const handleSave = () => {
    setShowSavedNotification(true);
    setTimeout(() => setShowSavedNotification(false), 2500);
  };

  const tabButtonClass = (tab) =>
    `flex-1 flex justify-center py-3 text-sm font-medium transition`;
  return (
    <div className="min-h-screen bg-white pb-20 px-4 pt-6 md:pt-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          {showSavedNotification && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
              Profile updated (demo only)
            </div>
          )}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-500">
              ?
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <div className="text-gray-500 text-sm">
              Ascents: {ascentStats.count} | Max: {ascentStats.max} | Avg:{" "}
              {ascentStats.avg}
            </div>
            <p className="text-gray-600 text-sm mt-1">{PROFILE_USER.bio}</p>
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
          {activeTab === "ascents" && <AscentsTab ascents={profileAscents} />}
          {activeTab === "teams" && (
            <TeamsTab teams={profileTeams} navigate={navigate} />
          )}
          {activeTab === "settings" && (
            <div className="bg-white rounded-b-lg shadow p-6 max-w-md mx-auto space-y-6">
              <div className="flex justify-center">
                <label className="relative w-28 h-28 cursor-pointer group">
                  <img
                    src={avatarUrl || "/default-pfp.jpg"}
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
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        setAvatarFileName(file.name);
                        const blobUrl = URL.createObjectURL(file);
                        setAvatarUrl(blobUrl);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center text-sm text-gray-500">
                {avatarFileName
                  ? `Uploaded: ${avatarFileName}`
                  : "Click the avatar to pick a new photo."}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Change Name Here"
                />
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-full font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition"
                >
                  Save Changes (Sample)
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-full font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition"
                >
                  Return Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
