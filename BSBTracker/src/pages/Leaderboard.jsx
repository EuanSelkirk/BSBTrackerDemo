import { leaderboardTeams } from "../data/sampleData";

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 pt-32 pb-16 text-white">
      <section className="mx-auto max-w-5xl px-6 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-200">Leaderboard Demo</p>
        <h1 className="mt-4 text-4xl font-semibold md:text-5xl">Competition Standings</h1>
        <p className="mt-4 text-indigo-100 md:text-lg">
          This static leaderboard mirrors the live production layout. Update the data in <code>sampleData.js</code> to tell the story of any event without Supabase.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-4">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-blue-900/30">
          <table className="w-full table-fixed">
            <thead className="bg-white/5 text-left text-indigo-100">
              <tr className="text-sm uppercase tracking-[0.2em]">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Team</th>
                <th className="px-6 py-4 text-right">Total Score</th>
                <th className="px-6 py-4 text-right">Average</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardTeams.map((team, index) => (
                <tr
                  key={team.id}
                  className={`border-t border-white/10 bg-gradient-to-r ${team.color} text-slate-900 transition hover:brightness-95`}
                >
                  <td className="px-6 py-5 text-3xl font-black text-slate-800">{String(index + 1).padStart(2, "0")}</td>
                  <td className="px-6 py-5 text-lg font-semibold">{team.name}</td>
                  <td className="px-6 py-5 text-right text-lg font-semibold">{team.totalScore.toLocaleString()}</td>
                  <td className="px-6 py-5 text-right text-lg font-semibold">{team.averageScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-center text-sm text-indigo-200">
          Tip: export graphics, embed this table in decks, or animate transitions for award ceremonies—no backend calls required.
        </p>
      </section>
    </div>
  );
}
