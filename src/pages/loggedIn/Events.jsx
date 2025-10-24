import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import CompetitionCard from "../../components/CompetitionCard";
import ClinicCard from "../../components/ClinicCard";

import { getAllEvents } from "../../data/events";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEvents()
      .then((data) => {
        setEvents(data);
      })
      .catch((err) => console.error("Failed to fetch events:", err));

    setLoading(false);
  }, []);

  if (loading) return <p className="text-center">Loading events...</p>;

  return (
    <>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Competitions</h1>
        <div className="grid gap-4">
          {events.map((event) =>
            event.event_type === "competition" ? (
              <Link to={`/competition/${event.event_id}`} key={event.event_id}>
                <CompetitionCard competition={event} />
              </Link>
            ) : null
          )}
        </div>
      </div>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Clinics</h1>
        <div className="grid gap-4">
          {events.map((event) =>
            event.event_type === "clinic" ? (
              <ClinicCard key={event.event_id} clinic={event} />
            ) : null
          )}
        </div>
      </div>
    </>
  );
}
