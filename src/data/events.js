import { events } from "./bsbtracker_mock_data";

const sortByStartDateDesc = (a, b) =>
  new Date(b.start_date).getTime() - new Date(a.start_date).getTime();

export async function getEvent(eventId) {
  if (!eventId) return [];
  const id = String(eventId);
  return events.filter((event) => event.event_id === id);
}

export async function getAllEvents() {
  return [...events].sort(sortByStartDateDesc);
}
