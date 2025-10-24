export default function CompetitionCard({ competition }) {
  const { name, start_date, end_date, event_logo } = competition;

  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between hover:shadow-lg transition">
      <div>
        <h2 className="text-xl font-semibold">{name}</h2>
        <p className="text-gray-600 mt-1">
          {new Date(start_date).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}{" "}
          &rarr;{" "}
          {new Date(end_date).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>
      {event_logo && (
        <img
          src={`${event_logo}`}
          alt={`${name} logo`}
          className="w-20 h-20 object-contain ml-4 rounded"
        />
      )}
    </div>
  );
}
