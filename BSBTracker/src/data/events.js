import { supabase } from "./supabaseClient";

export async function getAllEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getEvent(event_id) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("event_id", event_id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
