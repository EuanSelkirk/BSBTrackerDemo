import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import TeamBreakdown from "../../components/TeamBreakdown";
import { getTeamDetails } from "../../data/competitions";

export default function TeamDetails() {
  const { eventId, teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { team: teamData, members: membersData } = await getTeamDetails(
          eventId,
          teamId
        );
        setTeam(teamData);
        setMembers(membersData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (teamId && eventId) {
      fetchData();
    }
  }, [teamId, eventId]);

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-8">
      {loading ? (
        <p className="text-center">Loading team...</p>
      ) : (
        <TeamBreakdown team={team} members={members} />
      )}
    </div>
  );
}
