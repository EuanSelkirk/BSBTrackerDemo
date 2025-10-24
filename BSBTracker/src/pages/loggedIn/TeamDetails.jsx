import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../data/supabaseClient";
import TeamBreakdown from "../../components/TeamBreakdown";

export default function TeamDetails() {
  const { eventId, teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select("*")
        .eq("team_id", teamId)
        .eq("competition_id", eventId)
        .single();

      if (!teamError) {
        setTeam(teamData);
      }

      const { data: membersData, error: membersError } = await supabase
        .from("team_member_scores")
        .select(
          `
          user_id,
          user_name,
          average_score,
          total_score,
          user_email,
          picture
        `
        )
        .eq("team_id", teamId)
        .eq("event_id", eventId);

      if (!membersError) {
        setMembers(membersData);
      }

      setLoading(false);
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
