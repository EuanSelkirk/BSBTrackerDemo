export default function TeamsTab({ teams, navigate }) {
  const formatDateRange = (start, end) => {
    if (!start || !end) return "No date set";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const opts = { year: "numeric", month: "short", day: "numeric" };
    return `${startDate.toLocaleDateString(undefined, opts)} – ${endDate.toLocaleDateString(undefined, opts)}`;
  };

  return (
    <div className="bg-white rounded-b-lg shadow p-0 space-y-px">
      {teams.length === 0 ? (
        <p className="text-gray-500 text-sm p-4">
          You're not on any teams yet.
        </p>
      ) : (
        teams.map(({ teams: team }) => (
          <div
            key={team.team_id}
            className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow hover:bg-blue-100 transition cursor-pointer"
            onClick={() => navigate(`/competition/${team.competition_id}`)}
          >
            <div>
              <h3 className="text-lg font-bold">{team.name}</h3>
              <p className="text-sm font-medium text-blue-900">
                {team.events?.name || "Unnamed Event"}
              </p>
              <p className="text-sm text-gray-700">
                {formatDateRange(
                  team.events?.start_date,
                  team.events?.end_date
                )}
              </p>
            </div>
            {team.logo_url && (
              <img
                src={team.logo_url}
                alt="Team"
                className="w-16 h-16 object-cover rounded-md ml-4"
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
