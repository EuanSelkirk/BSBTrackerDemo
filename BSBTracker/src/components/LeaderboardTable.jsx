import { Crown, Medal } from "lucide-react";

export default function LeaderboardTable({
  leaderboard,
  eventId,
  navigate,
  scoringMode,
  large = false,
}) {
  if (!leaderboard || leaderboard.length === 0) {
    return <p className="text-gray-500 italic">No teams scored yet.</p>;
  }

  const isAverage = scoringMode === "average";

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block">
        <table className={`min-w-full ${large ? "text-base" : "text-sm"}`}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Rank</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Avg</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((teamData, index) => {
              let rowStyles = "transition-colors duration-300 cursor-pointer";
              let flair = null;

              if (index === 0) {
                rowStyles +=
                  " bg-gradient-to-r from-yellow-100 to-white hover:from-yellow-300 hover:to-gray-100";
                flair = <Crown className="w-4 h-4 text-yellow-500" />;
              } else if (index === 1) {
                rowStyles +=
                  " bg-gradient-to-r from-gray-100 to-white hover:from-gray-300 hover:to-gray-100";
                flair = <Medal className="w-4 h-4 text-gray-400" />;
              } else if (index === 2) {
                rowStyles +=
                  " bg-gradient-to-r from-amber-100 to-white hover:from-amber-300 hover:to-gray-100";
                flair = <Medal className="w-4 h-4 text-amber-600" />;
              } else {
                rowStyles += " hover:bg-gray-100";
              }

              return (
                <tr
                  key={teamData.team_id}
                  className={rowStyles}
                  onClick={() =>
                    navigate(`/competition/${eventId}/team/${teamData.team_id}`)
                  }
                >
                  <td className="px-4 py-3 font-semibold text-blue-600 flex items-center gap-1">
                    {index + 1}.{flair && <span className="ml-1">{flair}</span>}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                    {teamData.logo_url && (
                      <img
                        src={teamData.logo_url}
                        alt={`${teamData.team_name} logo`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    {teamData.team_name}
                  </td>
                  <td
                    className={`px-4 py-3 text-right text-gray-700 ${large ? "text-lg" : ""}`}
                  >
                    {teamData.team_total_score.toLocaleString()} pts
                  </td>
                  <td
                    className={`px-4 py-3 text-right text-gray-500 ${large ? "text-lg" : ""}`}
                  >
                    {teamData.team_average_score.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}{" "}
                    pts
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-2">
        {leaderboard.map((teamData, index) => {
          let flair = null;
          let bgClass = "bg-white";

          if (index === 0) {
            bgClass = "bg-gradient-to-r from-yellow-100 to-white";
            flair = <Crown className="w-4 h-4 text-yellow-500" />;
          } else if (index === 1) {
            bgClass = "bg-gradient-to-r from-gray-100 to-white";
            flair = <Medal className="w-4 h-4 text-gray-400" />;
          } else if (index === 2) {
            bgClass = "bg-gradient-to-r from-amber-100 to-white";
            flair = <Medal className="w-4 h-4 text-amber-600" />;
          }

          return (
            <div
              key={teamData.team_id}
              className={`w-full rounded-lg px-4 py-3 ${bgClass} shadow-sm cursor-pointer`}
              onClick={() =>
                navigate(`/competition/${eventId}/team/${teamData.team_id}`)
              }
            >
              <div className="flex justify-between items-center w-full min-w-0">
                <div>
                  <div className="font-semibold text-blue-600 flex items-center gap-1">
                    {index + 1}.{flair && <span>{flair}</span>}
                  </div>
                  <div className="font-medium text-gray-800">
                    {teamData.team_name}
                  </div>
                </div>
                {!isAverage ? (
                  <div className="flex flex-col items-end text-sm text-gray-700">
                    <div>
                      Total {teamData.team_total_score.toLocaleString()} pts
                    </div>
                    <div className="text-gray-500">
                      Avg:{" "}
                      {teamData.team_average_score.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      pts
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end text-sm text-gray-700">
                    <div>
                      Avg:{" "}
                      {teamData.team_average_score.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      pts
                    </div>
                    <div className="text-gray-500">
                      Total {teamData.team_total_score.toLocaleString()} pts
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
