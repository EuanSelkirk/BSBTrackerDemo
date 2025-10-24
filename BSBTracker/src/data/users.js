import { supabase } from "./supabaseClient";
import imageCompression from "browser-image-compression";

const pfpImageSize = 512;

async function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    img.onerror = (err) => {
      reject(err);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export async function compressImage(file, compressedImageSize) {
  let maxWidthOrHeight = compressedImageSize;

  try {
    const { width, height } = await getImageDimensions(file);
    const longestSide = Math.max(width, height);
    if (longestSide > 2000) {
      maxWidthOrHeight = 1200;
    } else if (longestSide > 1000) {
      maxWidthOrHeight = 800;
    } else {
      maxWidthOrHeight = longestSide;
    }
  } catch (err) {
    console.error("Failed to read image dimensions:", err);
  }

  try {
    return await imageCompression(file, {
      maxSizeMB: 0.8,
      maxWidthOrHeight,
      useWebWorker: true,
    });
  } catch (err) {
    console.error("Image compression failed:", err);
    return file;
  }
}

export async function syncUserToDatabase() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { error: upsertError } = await supabase.from("users").upsert({
    id: user.id,
    email: user.email || "Unknown",
  });

  if (upsertError) throw upsertError;
  return user;
}

export async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId, updates) {
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId);
  if (error) throw error;
}

export async function uploadAvatar(userId, file) {
  const compressed = await compressImage(file, pfpImageSize);
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/avatar.${fileExt}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, compressed, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
  return data?.publicUrl || null;
}

export async function fetchUserAscents(userId) {
  const { data, error } = await supabase
    .from("user_ascents_view")
    .select("*")
    .eq("user_id", userId)
    .order("ascent_created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchUserTeams(userId) {
  const { data, error } = await supabase
    .from("team_members")
    .select(
      `
      team_id,
      teams (
        team_id,
        name,
        logo_url,
        competition_id,
        events ( name, start_date, end_date )
      )
    `
    )
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}
