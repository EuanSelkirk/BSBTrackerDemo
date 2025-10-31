import { users } from "./bsbtracker_mock_data";

const demoUser = users[0] || null;

export async function getCurrentUser() {
  return demoUser;
}

export function onAuthStateChange(cb) {
  try {
    cb?.({ user: demoUser });
  } catch {}
  return () => {};
}

export async function signOut() {
  return true;
}
