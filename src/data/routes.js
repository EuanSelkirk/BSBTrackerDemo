import {
  routes,
  eventRoutesOriginal,
  events,
  sets,
  sections,
} from "./bsbtracker_mock_data";

const getSectionName = (route) => {
  const set = sets.find((entry) => entry.set_id === route.set_id);
  if (!set) return "Unknown";
  const section = sections.find((sec) => sec.section_id === set.section_id);
  return section?.name ?? "Unknown";
};

const getEventMeta = (routeId) => {
  const eventRoute = eventRoutesOriginal.find(
    (entry) => entry.route_id === routeId
  );
  if (!eventRoute) return { event: null, points: null };
  const event = events.find((evt) => evt.event_id === eventRoute.event_id) || null;
  return { event, points: eventRoute.points ?? null, eventRoute };
};

const deterministicAttempts = (routeId) => {
  const numeric = parseInt(routeId, 10);
  if (Number.isNaN(numeric)) return null;
  return (numeric % 4) + 1;
};

export async function getRouteDetails(routeId) {
  const route = routes.find((entry) => entry.route_id === String(routeId));
  if (!route) return null;

  const { event, points, eventRoute } = getEventMeta(route.route_id);

  return {
    route_id: route.route_id,
    grade: route.grade,
    color: route.color,
    image_url: route.image_url,
    points: points ?? 0,
    event_id: event?.event_id ?? null,
    event_name: event?.name ?? null,
    event_logo: event?.event_logo ?? null,
    points_off_per_attempt: event?.points_off_per_attempt ?? 0,
    max_points_off: event?.max_points_off ?? 0,
    avg_or_cumulative: event?.avg_or_cumulative ?? null,
    expiry_date: eventRoute?.expiry_date ?? null,
    section_name: getSectionName(route),
  };
}

export async function getUserRouteAscent(routeId) {
  const details = await getRouteDetails(routeId);
  if (!details || !details.event_id) return null;

  const attempts = deterministicAttempts(routeId);
  const perAttempt = details.points_off_per_attempt || 0;
  const maxOff = details.max_points_off || 0;
  const penalty = Math.min(Math.max(attempts - 1, 0) * perAttempt, maxOff);

  return {
    attempts,
    video_url: "https://example.com/demo-ascent",
    created_at: new Date().toISOString(),
    is_valid: attempts % 5 !== 0,
    invalid_reason: attempts % 5 === 0 ? "Demo review pending" : null,
    points_earned: Math.max((details.points ?? 0) - penalty, 0),
  };
}

export async function createUserRouteAscent(routeId, { attempts, video_url }) {
  return {
    attempts,
    video_url: video_url || null,
    created_at: new Date().toISOString(),
    is_valid: true,
    invalid_reason: null,
  };
}

export async function updateUserRouteAscent(routeId, { video_url }) {
  return {
    video_url: video_url || null,
  };
}

export async function deleteUserRouteAscent() {
  return true;
}
