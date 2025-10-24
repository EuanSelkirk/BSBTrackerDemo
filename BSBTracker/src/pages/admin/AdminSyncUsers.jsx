import { useState } from "react";
import { supabase } from "../../data/supabaseClient";

export default function AdminSyncUsers() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const syncUsers = async () => {
    setLoading(true);
    setStatus("");

    try {
      // Get all users from Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.listUsers();

      if (authError) {
        console.error("Error listing auth users:", authError);
        setStatus("❌ Failed to retrieve users");
        setLoading(false);
        return;
      }

      let insertedCount = 0;

      for (const user of authData.users) {
        const { id, email, user_metadata } = user;

        // Check if user already exists in users table
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("id", id)
          .maybeSingle();

        if (checkError) {
          console.error(`Error checking user ${id}:`, checkError);
          continue;
        }

        if (!existingUser) {
          const { error: insertError } = await supabase.from("users").insert({
            id,
            email,
            name: user_metadata?.name || "",
            avatar_url: user_metadata?.avatar_url || null,
            is_admin: false,
          });

          if (!insertError) insertedCount++;
          else console.error(`Failed to insert user ${email}:`, insertError);
        }
      }

      setStatus(`✅ Sync complete: ${insertedCount} new users added`);
    } catch (e) {
      console.error("Unexpected error:", e);
      setStatus("❌ An unexpected error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg mt-10 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Sync Users</h2>
      <p className="text-gray-600">
        Pulls all users from Supabase Auth and inserts them into your `users`
        table if missing.
      </p>

      <button
        onClick={syncUsers}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
      >
        {loading ? "Syncing..." : "Sync Users"}
      </button>

      {status && (
        <p
          className={`text-sm ${
            status.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
