// Minimal stubs for demo builds
export const supabase = null;

export async function getCurrentUser() {
  return null;
}

export function onAuthStateChange(cb) {
  // Immediately tell the app "no user", and return an unsubscribe
  try {
    cb?.(null);
  } catch {}
  return () => {};
}

export async function signOut() {
  return;
}
