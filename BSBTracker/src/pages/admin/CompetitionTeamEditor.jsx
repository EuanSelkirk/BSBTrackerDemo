import { useEffect, useState } from "react";
import { supabase } from "../../data/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import { uploadTeamLogo } from "../../data/admin";

export default function CompetitionTeamEditor() {
  const [teams, setTeams] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamLogoFile, setNewTeamLogoFile] = useState(null);
  const [creating, setCreating] = useState(false);

  const { competitionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .eq("competition_id", competitionId)
      .order("team_id", { ascending: true });

    if (error) {
      console.error("Error fetching teams:", error);
    } else {
      setTeams(data);
    }
  }

  async function deleteTeam(teamId) {
    if (!confirm("Are you sure you want to delete this team?")) return;

    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("team_id", teamId);

    if (error) {
      console.error("Delete failed:", error);
    } else {
      setTeams((prev) => prev.filter((t) => t.team_id !== teamId));
    }
  }

  async function saveTeam(teamId) {
    let logo_url = formData.logo_url;

    if (formData.logo_file) {
      try {
        logo_url = await uploadTeamLogo(formData.logo_file);
      } catch (err) {
        return;
      }
    }

    const { error } = await supabase
      .from("teams")
      .update({ name: formData.name, logo_url })
      .eq("team_id", teamId);

    if (error) {
      console.error("Update failed:", error);
    } else {
      await fetchTeams();
      setEditingId(null);
      setFormData({});
    }
  }

  // NEW: Create a new team
  async function createTeam() {
    if (!newTeamName.trim()) {
      alert("Please enter a team name.");
      return;
    }

    setCreating(true);
    let logo_url = null;
    if (newTeamLogoFile) {
      try {
        logo_url = await uploadTeamLogo(newTeamLogoFile);
      } catch (err) {
        setCreating(false);
        return;
      }
    }

    const { data, error } = await supabase
      .from("teams")
      .insert([
        { name: newTeamName.trim(), competition_id: competitionId, logo_url },
      ]);

    setCreating(false);

    if (error) {
      alert("Failed to create team: " + error.message);
    } else {
      setNewTeamName("");
      setNewTeamLogoFile(null);
      await fetchTeams();
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        Teams for Competition {competitionId}
      </h1>

      {/* NEW: Add New Team Form */}
      <section className="bg-white shadow rounded-xl p-4 space-y-4">
        <h2 className="text-xl font-semibold">Add New Team</h2>
        <input
          type="text"
          placeholder="Team name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewTeamLogoFile(e.target.files[0])}
          className="block"
        />
        <button
          onClick={createTeam}
          disabled={creating}
          className={`px-4 py-2 rounded text-white ${
            creating ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {creating ? "Creating..." : "Create Team"}
        </button>
      </section>

      {/* Existing Teams List */}
      {teams.map((team) => (
        <div
          key={team.team_id}
          className="bg-white shadow rounded-xl p-4 space-y-2 cursor-pointer"
          onClick={() => {
            if (editingId === team.team_id) return;
            navigate(
              `/admin/competitions/${competitionId}/teams/${team.team_id}/`
            );
          }}
        >
          {editingId === team.team_id ? (
            <>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, logo_file: e.target.files[0] })
                }
                className="block mt-2"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveTeam(team.team_id);
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded-xl"
                >
                  Save
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(null);
                    setFormData({});
                  }}
                  className="bg-gray-400 text-white px-3 py-1 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{team.name}</h2>
                <p className="text-sm text-gray-600">Team ID: {team.team_id}</p>
                {team.logo_url && (
                  <img
                    src={team.logo_url}
                    alt={`${team.name} logo`}
                    className="w-16 h-16 object-contain mt-2 rounded"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(team.team_id);
                    setFormData({
                      name: team.name,
                      logo_url: team.logo_url,
                    });
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-xl"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTeam(team.team_id);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
