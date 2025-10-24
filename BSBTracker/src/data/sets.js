import { supabase } from "./supabaseClient";

export async function getAllSets() {
  const { data, error } = await supabase
    .from("sets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSetsInSection(section_id) {
  const { data, error } = await supabase
    .from("sets_in_sections")
    .select("*")
    .eq("section_id", section_id);

  if (error) throw error;
  return data;
}
