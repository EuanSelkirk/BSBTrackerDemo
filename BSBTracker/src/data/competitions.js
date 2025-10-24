import { supabase } from "./supabaseClient";

export async function getCompetitionLeaderboard(eventId) {
  // Step 1: Get scoring mode from event
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("avg_or_cumulative")
    .eq("event_id", eventId)
    .single();

  if (eventError)
    throw new Error(`Failed to fetch event: ${eventError.message}`);

  const scoringMode = eventData.avg_or_cumulative;
  const orderColumn =
    scoringMode === "average" ? "team_average_score" : "team_total_score";

  // Step 2: Fetch and sort leaderboard
  const { data, error } = await supabase
    .from("team_comp_scores")
    .select("*")
    .eq("event_id", eventId)
    .order(orderColumn, { ascending: false });

  if (error) throw error;

  return data.filter(
    (team) =>
      team.display_on_leaderboard === true ||
      team.display_on_leaderboard === null
  );
}

export async function getUserTeamAndMembers(eventId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { team: null, members: [] };

  const userId = user.id;

  const { data: userTeamData, error: userTeamError } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId)
    .limit(1);
  if (userTeamError || !userTeamData || userTeamData.length === 0) {
    return { team: null, members: [] };
  }

  const teamId = userTeamData[0].team_id;

  const { data: teamData, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("team_id", teamId)
    .eq("competition_id", eventId)
    .single();
  if (teamError) return { team: null, members: [] };

  const { data: membersData, error: membersError } = await supabase
    .from("team_member_scores")
    .select(
      `
      user_id,
      user_name,
      average_score,
      total_score,
      user_email,
      picture
    `
    )
    .eq("team_id", teamId)
    .eq("event_id", eventId);

  if (membersError) return { team: teamData, members: [] };

  return { team: teamData, members: membersData };
}

export async function getCompetitionLeaderboardScores(eventId) {
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("avg_or_cumulative")
    .eq("event_id", eventId)
    .single();
  if (eventError)
    throw new Error(`Failed to fetch event: ${eventError.message}`);

  const scoringMode = eventData.avg_or_cumulative;
  const orderColumn =
    scoringMode === "average" ? "team_average_score" : "team_total_score";

  const { data, error } = await supabase
    .from("team_comp_scores")
    .select(
      "team_id, team_total_score, team_average_score, display_on_leaderboard"
    )
    .eq("event_id", eventId)
    .order(orderColumn, { ascending: false });
  if (error) throw error;

  return data.filter(
    (team) =>
      team.display_on_leaderboard === true ||
      team.display_on_leaderboard === null
  );
}

export async function getUserEventAscents(eventId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return [];
  const userId = user.id;

  const { data, error } = await supabase
    .from("user_event_routes_view")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .order("ascent_created_at", { ascending: false });
  if (error) throw error;

  return data.map((entry) => {
    const hasAscent = entry.attempts != null;
    const isExpired =
      hasAscent &&
      entry.expiry_date &&
      new Date(entry.ascent_created_at) > new Date(entry.expiry_date);
    const isValid = entry.is_valid !== false;
    let userScore = null;
    if (hasAscent && isValid && !isExpired && entry.points != null) {
      userScore = Math.max(0, entry.points - (entry.attempts - 1));
    }

    return {
      route_id: entry.route_id,
      image_url: entry.image_url,
      grade: entry.grade,
      color: entry.color,
      section_name: entry.section_name || "Unknown",
      hasAscent,
      attempts: entry.attempts ?? null,
      points: entry.points,
      userScore,
      eventId: entry.event_id,
      compName: entry.event_name || null,
      eventLogo: entry.event_logo || null,
      expired: isExpired,
      is_valid: entry.is_valid ?? true,
      invalid_reason: entry.invalid_reason || null,
      expiry_date: entry.expiry_date,
    };
  });
}
