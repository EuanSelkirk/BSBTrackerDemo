export default function TeamBreakdown({ team, members = [] }) {
  if (!team) return null;

  return (
    <>
      <section className="sm:bg-white sm:shadow-sm sm:rounded-lg sm:p-6 px-0">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {team.logo_url && (
              <img
                src={team.logo_url}
                alt={`${team.name} logo`}
                className="w-16 h-16 object-cover rounded-full"
              />
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-800">
              {team.name}
            </h2>
          </div>

          <div>
            <ul className="divide-y divide-gray-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Team Members
              </h3>

              {members.map((m) => (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between gap-4 py-2"
                >
                  <div className="flex flex-col items-start text-left min-w-[4rem]">
                    <img
                      src={m.picture || m.avatar_url || "/default-pfp.jpg"}
                      alt={`${m.user_name || m.user_email}'s avatar`}
                      className="w-10 h-10 rounded-full object-cover mb-1"
                    />
                    <span className="text-gray-800 font-medium text-sm sm:text-base max-w-[9rem] truncate">
                      {m.user_name ? m.user_name : m.user_email.split("@")[0]}
                    </span>
                  </div>

                  <div className="flex flex-col items-end text-sm sm:text-base text-gray-700">
                    <div>
                      <strong>Total:</strong> {m.total_score.toLocaleString()}{" "}
                      pts
                    </div>
                    <div className="text-gray-500">
                      <strong>Average:</strong>{" "}
                      {m.average_score.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      pts
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
