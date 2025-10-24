import { useNavigate } from "react-router-dom";

export default function AscentsTab({ ascents }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white">
      {ascents.length === 0 ? (
        <p className="text-gray-500 text-sm p-4">No ascents logged yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-0 bg-white">
          {ascents.map((ascent) => (
            <div
              key={ascent.ascent_id}
              className="relative aspect-[2/3] overflow-hidden cursor-pointer transition-transform hover:scale-[1.01]"
              onClick={() => navigate(`/route/${ascent.route_id}`)}
            >
              <img
                src={ascent.image_url || "/default-route.jpg"}
                loading="lazy"
                alt={ascent.grade || "Route"}
                className="w-full h-full object-cover block"
              />

              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 flex flex-col justify-end">
                <div className="text-white text-[11px] font-medium leading-tight">
                  <span className="capitalize opacity-90">
                    {ascent.section_name || "Unknown"}
                  </span>
                </div>
                <div className="text-white text-sm font-bold leading-tight">
                  {ascent.color || "Unknown"} – {ascent.grade || "?"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
