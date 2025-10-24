import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../data/supabaseClient";
import DatePicker from "react-datepicker";

export default function CompetitionEditor() {
  const { competitionId } = useParams();

  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (competitionId) fetchCompetition();
  }, [competitionId]);

  async function fetchCompetition() {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", competitionId)
      .single();

    if (error) {
      console.error("Error fetching competition:", error);
      alert("Failed to load competition.");
    } else {
      setCompetition({
        ...data,
        start_date: data.start_date ? new Date(data.start_date) : null,
        end_date: data.end_date ? new Date(data.end_date) : null,
      });
    }

    setLoading(false);
  }

  function handleChange(field, value) {
    setCompetition({ ...competition, [field]: value });
  }

  async function handleSave() {
    if (!competitionId) return;
    setSaving(true);

    const { error } = await supabase
      .from("events")
      .update({
        name: competition.name,
        description: competition.description,
        start_date: competition.start_date?.toISOString(),
        end_date: competition.end_date?.toISOString(),
        location: competition.location,
        participant_limit: competition.participant_limit,
        top_num_per_set: competition.top_num_per_set,
        avg_or_cumulative: competition.avg_or_cumulative,
        points_off_per_attempt: competition.points_off_per_attempt,
      })
      .eq("event_id", competitionId);

    if (error) {
      console.error("Error saving:", error);
      alert("Failed to save competition.");
    } else {
      alert("Competition saved!");
    }

    setSaving(false);
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!competition) return <div className="p-6">Competition not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Competition</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            value={competition.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium">Start Date</label>
            <DatePicker
              selected={competition.start_date}
              onChange={(date) => handleChange("start_date", date)}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block font-medium">End Date</label>
            <DatePicker
              selected={competition.end_date}
              onChange={(date) => handleChange("end_date", date)}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium">Participant Limit</label>
          <input
            type="number"
            value={competition.participant_limit ?? ""}
            onChange={(e) =>
              handleChange(
                "participant_limit",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-full border p-2 rounded"
            placeholder="Leave blank for unlimited"
          />
        </div>

        <div>
          <label className="block font-medium">Top Routes Per Set</label>
          <input
            type="number"
            value={competition.top_num_per_set ?? ""}
            onChange={(e) =>
              handleChange(
                "top_num_per_set",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-full border p-2 rounded"
            placeholder="e.g. 3"
          />
        </div>

        <div>
          <label className="block font-medium">Scoring Mode</label>
          <select
            value={competition.avg_or_cumulative ?? ""}
            onChange={(e) =>
              handleChange("avg_or_cumulative", e.target.value || null)
            }
            className="w-full border p-2 rounded"
          >
            <option value="">Select scoring mode</option>
            <option value="average">Average</option>
            <option value="cumulative">Cumulative</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Points Lost per Attempt</label>
          <input
            type="number"
            value={competition.points_off_per_attempt ?? ""}
            onChange={(e) =>
              handleChange(
                "points_off_per_attempt",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-full border p-2 rounded"
            placeholder="e.g. 5"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <Link
          to={`/admin/competitions/${competitionId}/routes`}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Edit Routes
        </Link>

        <Link
          to={`/admin/competitions/${competitionId}/teams`}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Edit Teams
        </Link>
        <Link
          to={`/admin/competitions/${competitionId}/ascents`}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          Edit Ascents
        </Link>
      </div>
    </div>
  );
}
