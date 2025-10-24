import { supabase } from "./supabaseClient";

export async function insertSection(section_name) {
  const { data, error } = await supabase
    .from("sections")
    .insert([{ name: section_name }]);

  if (error) {
    console.error("Insert failed:", error);
  }
}

export async function deleteSection(id) {
  const { data, error } = await supabase
    .from("sections")
    .delete()
    .eq("section_id", id);

  if (error) {
    console.error("Delete failed:", error);
  }
}

export async function updateSection(id, newName) {
  const { data, error } = await supabase
    .from("sections")
    .update({ name: newName })
    .eq("section_id", id);

  if (error) {
    console.error("Update failed:", error);
  }
}

// Insert a new event
export async function insertEvent(event) {
  const { name, start_date, end_date, event_logo, event_type } = event;
  const { data, error } = await supabase
    .from("events")
    .insert([{ name, start_date, end_date, event_logo, event_type }]);

  if (error) {
    console.error("Insert failed:", error);
  }

  return data;
}

// Delete an event by ID
export async function deleteEvent(id) {
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("event_id", id); // Assuming the primary key is `id`

  if (error) {
    console.error("Delete failed:", error);
  }

  return data;
}

// Update an event by ID with new details
export async function updateEvent(id, updatedEvent) {
  const { name, start_date, end_date, event_logo, event_type } = updatedEvent;
  const { data, error } = await supabase
    .from("events")
    .update({ name, start_date, end_date, event_logo, event_type })
    .eq("event_id", id);

  if (error) {
    console.error("Update failed:", error);
  }

  return data;
}

// Insert a new set
export async function insertSet(event) {
  const { name, section_id } = event;

  // Step 1: Insert the new set and get the inserted row
  const { data: insertedSets, error: insertError } = await supabase
    .from("sets")
    .insert([{ name, section_id }])
    .select(); // This ensures we get the new set's ID

  if (insertError) {
    console.error("Insert failed:", insertError);
    return null;
  }

  const newSet = insertedSets[0];
  const newSetId = newSet.set_id;

  // Step 2: Update the section's recent_set column
  const { error: updateError } = await supabase
    .from("sections")
    .update({ recent_set: newSetId })
    .eq("section_id", section_id);

  console.log("Updating section", section_id, "with recent_set =", newSetId);

  if (updateError) {
    console.error("Failed to update section with recent_set:", updateError);
    return null;
  }

  return newSet;
}

// Upload image and return the public URL
export async function uploadRouteImage(file) {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("route-images")
    .upload(fileName, file);

  if (error) {
    console.error("Image upload failed:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("route-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

// Insert a route with optional image
export async function insertRoute({ name, grade, color, set_id, image }) {
  let image_url = null;

  if (image) {
    image_url = await uploadRouteImage(image);
  }

  const { data, error } = await supabase
    .from("routes")
    .insert([{ name, grade, color, set_id, image_url }]);

  if (error) {
    console.error("Insert route failed:", error);
    throw error;
  }

  return data;
}

// Delete a route by ID
export async function deleteRoute(routeId) {
  const { error } = await supabase
    .from("routes")
    .delete()
    .eq("route_id", routeId);

  if (error) {
    console.error("Delete route failed:", error);
    throw error;
  }
}

export async function uploadTeamLogo(file) {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("team-logo")
    .upload(fileName, file);

  if (error) {
    console.error("Team logo upload failed:", error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from("team-logo")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}

export async function syncUserToDatabase() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.warn("No user to sync");
    return null;
  }

  const { error: upsertError } = await supabase.from("users").upsert({
    id: user.id,
    email: user.email || "Unknown",
  });

  if (upsertError) {
    console.error("Failed to sync user:", upsertError);
    return null;
  }

  return user;
}

export async function updateRoute(routeId, updatedFields) {
  const formData = new FormData();
  formData.append("route_id", routeId);
  Object.entries(updatedFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const { data, error } = (await supabase.storage)
    ? await supabase.functions.invoke("updateRoute", {
        method: "POST",
        body: formData,
      })
    : {}; // Replace this line with your preferred Supabase update logic

  if (error) throw error;
  return data;
}
