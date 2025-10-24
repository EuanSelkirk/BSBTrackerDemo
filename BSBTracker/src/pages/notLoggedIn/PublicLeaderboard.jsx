import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Crown, Medal } from "lucide-react";
import {
  getCompetitionLeaderboard,
  getCompetitionLeaderboardScores,
} from "../../data/competitions";
import { getEvent } from "../../data/events";

// ...imports remain unchanged

export default function PublicLeaderboard() {
  const { eventId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [competition, setCompetition] = useState(null);

  useEffect(() => {
    async function fetchCompetition() {
      try {
        const data = await getEvent(eventId);
        const comp = data[0] || null;
        setCompetition(comp);

        if (comp && eventId) {
          const initial = await getCompetitionLeaderboard(eventId);
          const sorted = [...initial].sort((a, b) =>
            comp.avg_or_cumulative === "average"
              ? b.team_average_score - a.team_average_score
              : b.team_total_score - a.team_total_score
          );
          setLeaderboard(sorted);
        }
      } catch (err) {
        console.error("Error loading competition or leaderboard", err);
      }
    }
    fetchCompetition();
  }, [eventId]);

  useEffect(() => {
    if (!eventId || !competition) return;

    const isAvg = competition.avg_or_cumulative === "average";

    const updateLeaderboard = async () => {
      try {
        const scores = await getCompetitionLeaderboardScores(eventId);
        const scoreMap = Object.fromEntries(scores.map((s) => [s.team_id, s]));

        const merged = leaderboard.map((team) => ({
          ...team,
          ...scoreMap[team.team_id],
        }));

        const sorted = [...merged].sort((a, b) =>
          isAvg
            ? b.team_average_score - a.team_average_score
            : b.team_total_score - a.team_total_score
        );

        const hasChanged = sorted.some(
          (team, i) => team.team_id !== leaderboard[i]?.team_id
        );

        if (hasChanged) {
          setLeaderboard(sorted);
        }
      } catch (err) {
        console.error("Error updating leaderboard", err);
      }
    };

    updateLeaderboard();
    const interval = setInterval(updateLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [eventId, competition, leaderboard]);

  if (!competition) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-blue-700 via-purple-700 to-indigo-800">
      <div className="w-[98%] h-[90%] bg-white/90 rounded-xl shadow-2xl p-6 overflow-auto flex flex-col justify-center">
        <table className="w-full text-6xl table-fixed border-separate border-spacing-y-6">
          <thead className="text-gray-800">
            <tr className="bg-gradient-to-r from-indigo-200 to-blue-200">
              <th className="px-8 py-6 text-left w-[10%]"></th>
              <th className="px-8 py-6 text-left w-[50%]">Team</th>
              <th className="px-8 py-6 text-right w-[20%]">Total</th>
              <th className="px-8 py-6 text-right w-[20%]">Avg</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((teamData, index) => {
              let flair = null;
              let rowBg = "";

              switch (index) {
                case 0:
                  rowBg = "bg-yellow-100";
                  flair = <Crown className="w-10 h-10 text-yellow-500" />;
                  break;
                case 1:
                  rowBg = "bg-gray-200";
                  flair = <Medal className="w-10 h-10 text-slate-400" />;
                  break;
                case 2:
                  rowBg = "bg-amber-200";
                  flair = <Medal className="w-10 h-10 text-amber-600" />;
                  break;
                case 3:
                  rowBg = "bg-purple-200";
                  flair = <Medal className="w-10 h-10 text-purple-600" />;
                  break;
                case 4:
                  flair = <Medal className="w-10 h-10 text-purple-600" />;
                  break;
                default:
                  rowBg = "bg-white";
              }

              return (
                <tr key={teamData.team_id} className={`${rowBg} rounded-xl`}>
                  <td className="px-8 py-10 font-black text-blue-800 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {index + 1}.{flair && <span>{flair}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-8 font-extrabold text-gray-900">
                    <div className="flex items-center gap-6">
                      {teamData.logo_url && (
                        <img
                          src={teamData.logo_url}
                          alt={`${teamData.team_name} logo`}
                          className="w-16 h-16 rounded-full object-cover border-4 border-gray-400 shadow-lg"
                        />
                      )}
                      <span className="truncate">{teamData.team_name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-10 text-right text-gray-800 font-bold">
                    {teamData.team_total_score.toLocaleString()}
                  </td>
                  <td className="px-8 py-10 text-right text-gray-600 font-bold">
                    {teamData.team_average_score.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
