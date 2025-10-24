import { supabase } from "./supabaseClient";

export async function getSetWithRoutes(set_id) {
  const { data, error } = await supabase
    .from("set_with_routes")
    .select("*")
    .eq("set_id", set_id);

  if (error) throw error;
  return data;
}
