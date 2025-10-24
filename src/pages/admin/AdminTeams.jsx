import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../data/supabaseClient";
import CompetitionCard from "../../components/CompetitionCard";

export default function AdminTeams() {
  const [competitions, setCompetitions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCompetitions() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("event_type", "competition");

      if (!error) {
        setCompetitions(data);
      } else {
        console.error(error);
      }
    }

    fetchCompetitions();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Manage Competition Teams</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {competitions.map((comp) => (
          <div
            key={comp.event_id}
            onClick={() =>
              navigate(`/admin/competitions/${comp.event_id}/teams`)
            }
            className="cursor-pointer"
          >
            <CompetitionCard competition={comp} />
          </div>
        ))}
      </div>
    </div>
  );
}
