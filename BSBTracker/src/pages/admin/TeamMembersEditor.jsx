import { useEffect, useState } from "react";
import { supabase } from "../../data/supabaseClient";
import { useParams } from "react-router-dom";

export default function TeamMembersEditor() {
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { teamId, eventId } = useParams();

  // Fetch current members + user info
  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .select(
        `
        user_id,
        created_at,
        users!team_members_user_id_fkey (id, name, email)
      `
      )
      .eq("team_id", teamId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching members:", error);
      setMembers([]);
    } else {
      setMembers(data);
    }
    setLoading(false);
  }

  async function fetchAvailableUsers(search = "") {
    const memberUserIds = members.map((m) => m.user_id);
    const cleanMemberUserIds = memberUserIds.map((id) =>
      id.replace(/^'+|'+$/g, "")
    );

    let query = supabase
      .from("users")
      .select("id, name, email")
      .order("name", { ascending: true });

    if (cleanMemberUserIds.length > 0) {
      const filterValue = `(${cleanMemberUserIds.join(",")})`;
      query = query.filter("id", "not.in", filterValue);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching available users:", error);
      setAvailableUsers([]);
    } else {
      setAvailableUsers(data);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, [teamId]);

  // Refresh available users when members change
  useEffect(() => {
    fetchAvailableUsers();
  }, [members]);

  async function addMember() {
    if (!selectedUserId) return alert("Select a user to add.");

    const { error } = await supabase
      .from("team_members")
      .insert([
        { team_id: teamId, user_id: selectedUserId, event_id: eventId },
      ]);

    if (error) {
      alert("Failed to add member: " + error.message);
    } else {
      setSelectedUserId("");
      fetchMembers();
    }
  }

  async function removeMember(userId) {
    if (!confirm("Remove this member from the team?")) return;

    const { error } = await supabase
      .from("team_members")
      .delete()
      .match({ team_id: teamId, user_id: userId, event_id: eventId });

    if (error) {
      alert("Failed to remove member: " + error.message);
    } else {
      fetchMembers();
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Manage Members for Team {teamId}
      </h1>

      <section className="mb-6">
        <h2 className="font-semibold mb-2">Current Members</h2>
        {loading ? (
          <p>Loading members...</p>
        ) : members.length === 0 ? (
          <p>No members yet.</p>
        ) : (
          <ul className="space-y-2">
            {members.map(({ user_id, created_at, users }) => (
              <li
                key={user_id}
                className="flex justify-between items-center bg-white shadow rounded p-3"
              >
                <div>
                  <p className="font-semibold">
                    {users?.name || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-600">{users?.email}</p>
                  <p className="text-xs text-gray-500">
                    Joined: {new Date(created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => removeMember(user_id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-4">
        <h2 className="font-semibold mb-2">Add New Member</h2>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchAvailableUsers(e.target.value);
          }}
          className="border rounded p-2 mb-2 w-full"
        />
        <div className="flex gap-2">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="border rounded p-2 flex-grow"
          >
            <option value="">Select a user</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <button
            onClick={addMember}
            className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
          >
            Add
          </button>
        </div>
      </section>
    </div>
  );
}
