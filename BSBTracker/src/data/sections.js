import { supabase } from "./supabaseClient";

export async function getAllSections() {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSectionsSummary() {
  const { data, error } = await supabase.from("sectionsview").select("*");

  if (error) throw error;
  return data;
}
