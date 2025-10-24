import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react"; // Optional: for a sleek icon look

/**
 * @param {{
 *   route: {
 *     route_id: number;
 *     image_url: string;
 *     color?: string;
 *     grade?: string | number;
 *     eventId?: number | null;
 *     points?: number | null;
 *     compName?: string | null;
 *     eventLogo?: string | null;
 *   };
 *   completed?: boolean;
 *   userScore?: number | null;
 * }} props
 */
export default function RouteCard({ route, completed, userScore }) {
  const navigate = useNavigate();

  return (
    <div
      className="relative aspect-[2/3] overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
      onClick={() => navigate(`/route/${route.route_id}`)}
    >
      <img
        src={route.image_url || "/default-route.jpg"}
        alt={route.grade || "Route"}
        loading="lazy"
        className="w-full h-full object-cover block"
      />

      {/* Checkmark for completed */}
      {completed && (
        <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
          <CheckCircle className="text-green-500 w-4 h-4" strokeWidth={2.5} />
        </div>
      )}

      {/* Comp overlay badge */}
      {route.eventId && (
        <div
          className={`absolute top-1 left-1 backdrop-blur-sm border rounded-md px-1.5 py-0.5 flex items-center gap-1 text-xs shadow-sm ${
            completed
              ? "bg-green-100 border-green-400"
              : "bg-white/90 border-gray-300"
          }`}
        >
          <img
            src={route.eventLogo || "/default-comp-logo.png"}
            alt={route.compName || "Competition"}
            className="w-4 h-4 object-contain"
          />
          <span className="font-semibold text-gray-800">
            {completed && userScore != null
              ? `${userScore} pts`
              : `${route.points ?? 0} pts`}
          </span>
        </div>
      )}

      {/* Bottom gradient with color + grade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 flex flex-col justify-end">
        <div className="text-white text-sm font-bold leading-tight">
          {route.color || "Unknown"} – {route.grade || "?"}
        </div>
      </div>
    </div>
  );
}
