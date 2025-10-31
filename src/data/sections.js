import {
  sections,
  sets,
  routes,
  eventRoutesOriginal,
  events,
} from "./bsbtracker_mock_data";

const gradeToNumber = (grade) => {
  if (!grade) return null;
  const cleaned = grade.trim().toUpperCase();
  if (cleaned === "VB") return -1;
  if (!cleaned.startsWith("V")) return null;
  const num = parseInt(cleaned.slice(1), 10);
  return Number.isNaN(num) ? null : num;
};

const gradeToPoints = (grade) => {
  const numeric = gradeToNumber(grade);
  if (numeric === null) return null;
  const base = 100;
  return base + Math.max(numeric, 0) * 80;
};

const getLatestSetDate = (sectionId) => {
  const relevantSets = sets.filter((set) => set.section_id === sectionId);
  if (relevantSets.length === 0) return null;
  return relevantSets
    .map((set) => new Date(set.created_at))
    .reduce((latest, current) => (current > latest ? current : latest))
    .toISOString();
};

export async function getSectionsSummary() {
  return sections.map((section) => {
    const sectionSetIds = sets
      .filter((set) => set.section_id === section.section_id)
      .map((set) => set.set_id);

    const sectionRoutes = routes.filter((route) =>
      sectionSetIds.includes(route.set_id)
    );

    const avgGradeValues = sectionRoutes
      .map((route) => gradeToNumber(route.grade))
      .filter((value) => value !== null);

    const avgGrade =
      avgGradeValues.length > 0
        ? avgGradeValues.reduce((sum, value) => sum + value, 0) /
          avgGradeValues.length
        : null;

    const lastUpdated = getLatestSetDate(section.section_id);

    return {
      section_id: section.section_id,
      name: section.name,
      num_routes: sectionRoutes.length,
      last_updated: lastUpdated,
      avg_grade:
        avgGrade !== null ? Math.round((avgGrade + Number.EPSILON) * 10) / 10 : null,
    };
  });
}

const determineEventMeta = (routeId) => {
  const eventRoute = eventRoutesOriginal.find(
    (entry) => entry.route_id === routeId
  );
  if (!eventRoute) return { event: null, points: gradeToPoints(null) };
  const event = events.find((evt) => evt.event_id === eventRoute.event_id) || null;
  return { event, points: eventRoute.points ?? gradeToPoints(null), eventRoute };
};

const deterministicAttempts = (routeId) => {
  const seed = parseInt(routeId, 10);
  if (Number.isNaN(seed)) return null;
  return (seed % 3) + 1;
};

export async function getSectionDetails(sectionId) {
  const section = sections.find((sec) => sec.section_id === String(sectionId));
  if (!section) {
    return {
      sectionName: "Unknown Section",
      routes: [],
      userPoints: 0,
      maxPoints: 0,
    };
  }

  const sectionSetIds = sets
    .filter((set) => set.section_id === section.section_id)
    .map((set) => set.set_id);

  const sectionRoutes = routes.filter((route) =>
    sectionSetIds.includes(route.set_id)
  );

  const detailedRoutes = sectionRoutes.map((route) => {
    const { event, points, eventRoute } = determineEventMeta(route.route_id);

    const attempts = event ? deterministicAttempts(route.route_id) : null;
    const completed = attempts !== null;

    const perAttempt = event?.points_off_per_attempt ?? 0;
    const maxOff = event?.max_points_off ?? 0;
    const penalty = completed
      ? Math.min(Math.max(attempts - 1, 0) * perAttempt, maxOff)
      : 0;

    const userEarned = completed ? Math.max((points ?? 0) - penalty, 0) : 0;

    return {
      route_id: route.route_id,
      grade: route.grade,
      color: route.color,
      image_url: route.image_url,
      completed,
      points: points ?? gradeToPoints(route.grade) ?? 0,
      max_points: points ?? gradeToPoints(route.grade) ?? 0,
      userEarned,
      attempts,
      eventId: event?.event_id ?? null,
      compName: event?.name ?? null,
      eventLogo: event?.event_logo ?? null,
      topNum: event?.top_num_per_set ?? null,
      expiry_date: eventRoute?.expiry_date ?? null,
    };
  });

  const routesByEvent = detailedRoutes.reduce((acc, route) => {
    if (!route.eventId) return acc;
    if (!acc[route.eventId]) acc[route.eventId] = [];
    acc[route.eventId].push(route);
    return acc;
  }, {});

  let totalUser = 0;
  let totalMax = 0;

  Object.values(routesByEvent).forEach((routesInEvent) => {
    const topNum = parseInt(routesInEvent[0]?.topNum, 10) || 3;

    const topMax = [...routesInEvent]
      .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
      .slice(0, topNum);
    totalMax += topMax.reduce((sum, route) => sum + (route.points ?? 0), 0);

    const topUser = [...routesInEvent]
      .filter((route) => route.completed)
      .sort((a, b) => (b.userEarned ?? 0) - (a.userEarned ?? 0))
      .slice(0, topNum);
    totalUser += topUser.reduce((sum, route) => sum + (route.userEarned ?? 0), 0);
  });

  return {
    sectionName: section.name,
    routes: detailedRoutes,
    userPoints: totalUser,
    maxPoints: totalMax,
  };
}
