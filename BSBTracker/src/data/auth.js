import { supabase } from "./supabaseClient";

export const signInWithEmail = async (email) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
  });
  if (error) throw error;
};

export const signInWithProvider = async (provider) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
  });
  if (error) throw error;
};
