import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getEvent } from "../../data/events";
import {
  getCompetitionLeaderboard,
  getUserTeamAndMembers,
  getUserEventAscents,
} from "../../data/competitions";
import { useNavigate } from "react-router-dom";
import TeamBreakdown from "../../components/TeamBreakdown";
import LeaderboardTable from "../../components/LeaderboardTable";
import AscentLogSection from "../../components/AscentLogSection";

function formatCountdown(diff) {
  if (diff <= 0) return "0s";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

export default function Competition() {
  const { eventId } = useParams();
  const [competition, setCompetition] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [team, setTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [ascentLog, setAscentLog] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCompetition() {
      const data = await getEvent(eventId);
      setCompetition(data[0] || null);
    }
    fetchCompetition();
  }, [eventId]);

  useEffect(() => {
    if (!competition) return;

    const start = new Date(competition.start_date);
    const end = new Date(competition.end_date);

    const updateCountdown = () => {
      const now = new Date();
      if (now < start) {
        setCountdown("Starts in " + formatCountdown(start - now));
      } else if (now >= start && now <= end) {
        setCountdown("Ends in " + formatCountdown(end - now));
      } else {
        setCountdown("Competition ended");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [competition]);

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getCompetitionLeaderboard(eventId);

        // console.log(data);
        setLeaderboard(data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      }
    }

    if (eventId && competition) fetchLeaderboard();
  }, [eventId, competition]);

  // Fetch current user's team and team members with their scores
  useEffect(() => {
    async function fetchUserTeamAndMembersData() {
      try {
        const { team, members } = await getUserTeamAndMembers(eventId);
        setTeam(team);
        setTeamMembers(members);
      } catch (err) {
        console.error("Error fetching team info:", err);
      }
    }

    if (eventId) fetchUserTeamAndMembersData();
  }, [eventId]);

  useEffect(() => {
    async function fetchUserAscents() {
      try {
        const result = await getUserEventAscents(eventId);
        setAscentLog(result);
      } catch (err) {
        console.error("Error fetching ascents:", err);
      }
    }

    if (eventId) fetchUserAscents();
  }, [eventId]);

  if (!competition) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 sm:max-w-5xl sm:mx-auto w-full space-y-8">
      {/* --- Header --- */}
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col sm:flex-row items-center gap-6">
        {competition.event_logo && (
          <img
            src={competition.event_logo}
            alt="Event Logo"
            className="w-32 h-32 object-cover rounded-full"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{competition.name}</h1>
          <p className="text-gray-600 mt-2">
            {new Date(competition.start_date).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}{" "}
            →{" "}
            {new Date(competition.end_date).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <p className="text-blue-600 mt-2 font-semibold">{countdown}</p>
        </div>
      </div>

      {/* --- General Info Section --- */}
      {(competition.description ||
        competition.location ||
        competition.team_size ||
        competition.scoring_rules) && (
        <section className="bg-white shadow-sm p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">About the Competition</h2>
          {competition.description && <p>{competition.description}</p>}
          <ul className="mt-4 text-gray-600 space-y-1">
            {competition.location && (
              <li>
                <strong>Location:</strong> {competition.location}
              </li>
            )}
            {competition.team_size && (
              <li>
                <strong>Team Size:</strong> {competition.team_size}
              </li>
            )}
            {competition.scoring_rules && (
              <li>
                <strong>Scoring:</strong> {competition.scoring_rules}
              </li>
            )}
          </ul>
        </section>
      )}

      <div className="h-px bg-gray-300 sm:hidden mx-4" />

      {/* --- Leaderboard Section --- */}
      <section className="sm:bg-white sm:shadow-sm sm:rounded-lg sm:p-6 px-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4">
          Leaderboard
        </h2>
        <LeaderboardTable
          leaderboard={leaderboard}
          eventId={eventId}
          navigate={navigate}
          scoringMode={competition.avg_or_cumulative}
        />
      </section>

      <div className="h-px bg-gray-300 sm:hidden mx-4" />

      {/* --- Your Team Section --- */}
      {team && (
        <TeamBreakdown
          team={team}
          members={teamMembers}
          ascentLog={ascentLog}
        />
      )}

      <div className="h-px bg-gray-300 sm:hidden mx-4" />

      {/* --- Your Team Section --- */}
      {team && <AscentLogSection ascentLog={ascentLog} />}
    </div>
  );
}
