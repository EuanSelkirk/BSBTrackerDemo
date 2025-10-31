import {
  teams,
  teamMembers,
  routes,
  sets,
  sections,
  events,
  eventRoutesOriginal,
} from "./bsbtracker_mock_data";

const byCompetition = (eventId) =>
  teams.filter((team) => team.competition_id === String(eventId));

const formatScore = (value) => Math.round(value * 10) / 10;

const buildLeaderboard = (eventId) => {
  const eventTeams = byCompetition(eventId);
  return eventTeams.map((team, index) => {
    const total = 5200 - index * 320;
    const avg = 1300 - index * 70;
    return {
      team_id: team.team_id,
      team_name: team.name,
      logo_url: team.logo_url,
      team_total_score: Math.max(total, 1800),
      team_average_score: Math.max(formatScore(avg), 450),
    };
  });
};

export async function getCompetitionLeaderboard(eventId) {
  return buildLeaderboard(eventId);
}

export async function getCompetitionLeaderboardScores(eventId) {
  return buildLeaderboard(eventId);
}

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
  if (!eventRoute) return { event: null, points: 0, expiry: null };
  const event = events.find((evt) => evt.event_id === eventRoute.event_id) || null;
  return { event, points: eventRoute.points ?? 0, expiry: eventRoute.expiry_date };
};

export async function getUserEventAscents(eventId) {
  const eventRoutes = eventRoutesOriginal.filter(
    (entry) => entry.event_id === String(eventId)
  );

  return eventRoutes.slice(0, 20).map((entry, index) => {
    const route = routes.find((r) => r.route_id === entry.route_id);
    const { event, points, expiry } = getEventMeta(entry.route_id);
    const hasAscent = index % 2 === 0;
    const attempts = hasAscent ? ((index % 3) + 1) : null;
    const perAttempt = event?.points_off_per_attempt ?? 0;
    const maxOff = event?.max_points_off ?? 0;
    const penalty = hasAscent
      ? Math.min(Math.max(attempts - 1, 0) * perAttempt, maxOff)
      : 0;
    const userScore = hasAscent ? Math.max(points - penalty, 0) : null;

    const isInvalid = hasAscent && index % 7 === 0;

    return {
      route_id: entry.route_id,
      image_url: route?.image_url ?? null,
      grade: route?.grade ?? "V?",
      color: route?.color ?? "Unknown",
      section_name: route ? getSectionName(route) : "Unknown",
      hasAscent,
      userScore,
      points,
      attempts,
      eventId: event?.event_id ?? null,
      compName: event?.name ?? null,
      eventLogo: event?.event_logo ?? null,
      expired: expiry ? new Date(expiry) < new Date() : false,
      expiry_date: expiry,
      is_valid: isInvalid ? false : true,
    };
  });
}

const buildTeamMemberScores = (teamId) => {
  const members = teamMembers.filter((member) => member.team_id === teamId);
  return members.map((member, index) => ({
    user_id: member.user_id,
    user_name: member.name,
    user_email: `${member.user_id}@example.com`,
    picture: member.avatar_url,
    total_score: 1600 - index * 120,
    average_score: formatScore(400 - index * 22),
  }));
};

export async function getUserTeamAndMembers(eventId) {
  const leaderboard = buildLeaderboard(eventId);
  const primaryTeam = leaderboard[0];

  if (!primaryTeam) {
    return { team: null, members: [] };
  }

  const members = buildTeamMemberScores(primaryTeam.team_id);

  return {
    team: {
      team_id: primaryTeam.team_id,
      name: primaryTeam.team_name,
      logo_url: primaryTeam.logo_url,
    },
    members,
  };
}

export async function getTeamDetails(eventId, teamId) {
  const leaderboard = buildLeaderboard(eventId);
  const team = leaderboard.find((entry) => entry.team_id === String(teamId));
  return {
    team: team
      ? {
          team_id: team.team_id,
          name: team.team_name,
          logo_url: team.logo_url,
          team_total_score: team.team_total_score,
          team_average_score: team.team_average_score,
        }
      : null,
    members: buildTeamMemberScores(String(teamId)),
  };
}
