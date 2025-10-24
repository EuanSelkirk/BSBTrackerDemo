import { Trophy, CheckCircle } from "lucide-react";

/**
 * @param {{
 *   teamName: string;
 *   eventName: string;
 *   eventLogoUrl?: string;
 *   totalCompRoutes: number;
 *   completedRoutes: number;
 *   totalPoints: number;
 * }} props
 */
export default function TeamStatsCard({
  teamName,
  eventName,
  eventLogoUrl,
  totalCompRoutes,
  completedRoutes,
  totalPoints,
}) {
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex items-center gap-4">
        {eventLogoUrl && (
          <img
            src={eventLogoUrl}
            alt="Comp Logo"
            className="h-12 w-12 object-contain rounded-md"
          />
        )}
        <div>
          <h2 className="text-lg font-bold text-blue-800">{eventName}</h2>
          <p className="text-sm text-gray-500">Team: {teamName}</p>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-blue-900 font-medium">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          {completedRoutes} / {totalCompRoutes} Routes Sent
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          {totalPoints} Points
        </div>
      </div>
    </div>
  );
}
