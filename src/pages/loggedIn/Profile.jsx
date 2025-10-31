import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AscentsTab from "../../components/AscentsTab";
import TeamsTab from "../../components/TeamsTab";

const SAMPLE_USER = {
  name: "Taylor Rivers",
  picture:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=240&q=80",
  bio: "Community setter and weekend crusher.",
};

const SAMPLE_ASCENTS = [
  {
    ascent_id: "a-1",
    route_id: "route-101",
    image_url:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80",
    grade: "V6",
    color: "Teal",
    section_name: "North Wall",
  },
  {
    ascent_id: "a-2",
    route_id: "route-205",
    image_url:
      "https://images.unsplash.com/photo-1526481280695-3c46917b9d5d?auto=format&fit=crop&w=400&q=80",
    grade: "V4",
    color: "Purple",
    section_name: "Prow Room",
  },
  {
    ascent_id: "a-3",
    route_id: "route-330",
    image_url:
      "https://images.unsplash.com/photo-1521151716396-bc1a2b349482?auto=format&fit=crop&w=400&q=80",
    grade: "V7",
    color: "Orange",
    section_name: "Training Board",
  },
];

const SAMPLE_TEAMS = [
  {
    teams: {
      team_id: "team-44",
      competition_id: "comp-boulder-brawl",
      name: "Gravity Gals",
      logo_url:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=160&q=80",
      events: {
        name: "Boulder Brawl Finals",
        start_date: "2024-05-10",
        end_date: "2024-05-12",
      },
    },
  },
  {
    teams: {
      team_id: "team-77",
      competition_id: "comp-summer-slam",
      name: "Campus Crushers",
      logo_url:
        "https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=160&q=80",
      events: {
        name: "Summer Slam Showdown",
        start_date: "2024-08-02",
        end_date: "2024-08-04",
      },
    },
  },
];

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
  const [displayName, setDisplayName] = useState(SAMPLE_USER.name);
  const [avatarUrl, setAvatarUrl] = useState(SAMPLE_USER.picture);
  const [avatarFileName, setAvatarFileName] = useState(null);
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  const ascentStats = useMemo(() => {
    const numericGrades = SAMPLE_ASCENTS.map((ascent) =>
      parseVGrade(ascent.grade)
    ).filter((grade) => grade !== null);

    if (numericGrades.length === 0) {
      return { count: 0, max: "–", avg: "–" };
    }

    const max = Math.max(...numericGrades);
    const avg = (
      numericGrades.reduce((sum, grade) => sum + grade, 0) /
      numericGrades.length
    ).toFixed(1);

    return { count: SAMPLE_ASCENTS.length, max: `V${max}`, avg: `V${avg}` };
  }, []);

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
            <p className="text-gray-600 text-sm mt-1">{SAMPLE_USER.bio}</p>
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
          {activeTab === "ascents" && <AscentsTab ascents={SAMPLE_ASCENTS} />}
          {activeTab === "teams" && (
            <TeamsTab teams={SAMPLE_TEAMS} navigate={navigate} />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Grades
                </label>
                <div className="flex flex-wrap gap-2">
                  {["V3-V4", "V5-V6", "Endurance"]?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
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
