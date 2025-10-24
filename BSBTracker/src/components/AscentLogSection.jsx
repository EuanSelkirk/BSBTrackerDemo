import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AscentLogSection({ ascentLog = [] }) {
  const navigate = useNavigate();

  if (!ascentLog) return null;

  return (
    <section className="sm:bg-white sm:shadow-sm sm:rounded-lg sm:p-6 px-0">
      <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4">
        Your Ascent Log
      </h2>
      {ascentLog.length === 0 ? (
        <p className="text-gray-500 italic">No routes available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {ascentLog.map((route) => {
            const isExpired = route.expired === true;
            const isInvalid = route.hasAscent && route.is_valid === false;
            const completed =
              route.hasAscent && !isExpired && route.is_valid !== false;

            return (
              <div
                key={route.route_id}
                className={`relative aspect-[2/3] overflow-hidden cursor-pointer transition-transform hover:scale-[1.01] rounded shadow ${
                  isInvalid
                    ? "bg-red-100 opacity-80"
                    : isExpired
                      ? "grayscale-[0.6] opacity-70"
                      : ""
                }`}
                onClick={() => navigate(`/route/${route.route_id}`)}
              >
                <img
                  src={route.image_url || "/default-route.jpg"}
                  loading="lazy"
                  alt={route.grade || "Route"}
                  className="w-full h-full object-cover block"
                />

                {route.hasAscent && (
                  <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                    {isInvalid ? (
                      <div className="w-4 h-4 bg-red-500 rounded-full" />
                    ) : completed ? (
                      <CheckCircle
                        className="text-green-500 w-4 h-4"
                        strokeWidth={2.5}
                      />
                    ) : null}
                  </div>
                )}

                {route.eventId && (
                  <div
                    className={`absolute top-1 left-1 backdrop-blur-sm border rounded-md px-1.5 py-0.5 flex items-center gap-1 text-xs shadow-sm ${
                      isInvalid
                        ? "bg-red-100 border-red-500"
                        : completed
                          ? "bg-green-100 border-green-400"
                          : "bg-white/90 border-gray-300"
                    }`}
                  >
                    <img
                      src={route.eventLogo || "/default-comp-logo.png"}
                      alt={route.compName || "Competition"}
                      className="w-4 h-4 object-contain"
                    />
                    <span
                      className={`font-semibold ${
                        isInvalid ? "text-red-700" : "text-gray-800"
                      }`}
                    >
                      {completed && route.userScore != null
                        ? `${route.userScore} pts`
                        : `${route.points ?? 0} pts`}
                    </span>
                  </div>
                )}

                {!route.hasAscent && route.expiry_date && (
                  <div className="absolute top-7 left-1 mt-1 backdrop-blur-sm border border-gray-300 bg-white/90 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 shadow-sm">
                    Expires{" "}
                    {new Date(route.expiry_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1">
                  <div className="text-white text-[11px] font-medium opacity-90 capitalize leading-tight">
                    {route.section_name}
                  </div>
                  <div className="text-white text-sm font-bold leading-tight">
                    {route.color} – {route.grade}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
