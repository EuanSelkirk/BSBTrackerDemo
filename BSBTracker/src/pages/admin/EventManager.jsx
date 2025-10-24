import React, { useEffect, useState } from "react";
import { insertEvent, deleteEvent, updateEvent } from "../../data/admin";
import { getAllEvents } from "../../data/events";
import { supabase } from "../../data/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EventManager() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEvent, setEditEvent] = useState(null);

  const [newEvent, setNewEvent] = useState({
    name: "",
    start_date: new Date(),
    end_date: new Date(),
    event_type: "competition",
    event_logo: null,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
      alert("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const uploadEventLogo = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("event-logos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Image upload failed:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from("event-logos")
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  };

  const handleAddEvent = async () => {
    const { name, start_date, end_date, event_type, event_logo } = newEvent;
    if (!name.trim()) return alert("Event name is required");
    if (start_date > end_date)
      return alert("Start date cannot be after end date");

    try {
      const logoUrl = event_logo ? await uploadEventLogo(event_logo) : null;
      await insertEvent({
        name,
        start_date,
        end_date,
        event_type,
        event_logo: logoUrl,
      });

      setNewEvent({
        name: "",
        start_date: new Date(),
        end_date: new Date(),
        event_type: "competition",
        event_logo: null,
      });

      fetchEvents();
    } catch (err) {
      console.error("Failed to add event", err);
      alert("Failed to add event");
    }
  };

  const startEdit = (event) => {
    if (editEvent && editEvent.event_id === event.event_id) {
      setEditEvent(null);
    } else {
      setEditEvent({
        ...event,
        image: null,
        start_date: new Date(event.start_date),
        end_date: new Date(event.end_date),
      });
    }
  };

  const handleUpdate = async () => {
    try {
      const logoUrl = editEvent.image
        ? await uploadEventLogo(editEvent.image)
        : editEvent.event_logo;

      await updateEvent(editEvent.event_id, {
        name: editEvent.name,
        start_date: editEvent.start_date,
        end_date: editEvent.end_date,
        event_type: editEvent.event_type,
        event_logo: logoUrl,
      });

      setEditEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("Failed to update event", err);
      alert("Failed to update event");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteEvent(id);
      fetchEvents();
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Manage Events</h2>

      {/* Create New Event Form */}
      <div className="border p-4 rounded shadow space-y-4">
        <h3 className="font-semibold">Create New Event</h3>

        <input
          type="text"
          placeholder="Event Name"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          className="border p-2 rounded w-full"
        />

        <div className="flex gap-4">
          <div>
            <label className="block mb-1 font-medium">Start Date</label>
            <DatePicker
              selected={newEvent.start_date}
              onChange={(date) =>
                setNewEvent({ ...newEvent, start_date: date })
              }
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className="border p-2 rounded w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">End Date</label>
            <DatePicker
              selected={newEvent.end_date}
              onChange={(date) => setNewEvent({ ...newEvent, end_date: date })}
              showTimeSelect
              dateFormat="yyyy-MM-dd HH:mm"
              className="border p-2 rounded w-full"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Event Type</label>
          <select
            value={newEvent.event_type}
            onChange={(e) =>
              setNewEvent({ ...newEvent, event_type: e.target.value })
            }
            className="border p-2 rounded w-full"
          >
            <option value="competition">Competition</option>
            <option value="clinic">Clinic</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Event Logo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setNewEvent({ ...newEvent, event_logo: e.target.files[0] })
            }
            className="border p-2 rounded w-full"
          />
          {newEvent.event_logo && (
            <p className="mt-1 text-sm text-gray-600">
              {newEvent.event_logo.name}
            </p>
          )}
        </div>

        <button
          onClick={handleAddEvent}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Event
        </button>
      </div>

      {/* Existing Events */}
      <div>
        <h3 className="font-semibold mb-2">Existing Events</h3>
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li
                key={event.event_id}
                className="p-2 border rounded mb-2 cursor-pointer hover:bg-gray-50 transition"
                onClick={(e) => {
                  if (editEvent?.event_id === event.event_id) return;

                  const tag = e.target.tagName.toLowerCase();
                  if (
                    tag === "button" ||
                    tag === "svg" ||
                    tag === "path" ||
                    e.target.closest("button")
                  )
                    return;
                  const path =
                    event.event_type === "competition"
                      ? `/admin/competitions/${event.event_id}`
                      : `/admin/events/${event.event_id}`;
                  navigate(path);
                }}
              >
                <h3 className="font-bold">{event.name}</h3>
                <p>
                  {event.event_type} •{" "}
                  {new Date(event.start_date).toLocaleString()} →{" "}
                  {new Date(event.end_date).toLocaleString()}
                </p>
                {event.event_logo && (
                  <img
                    src={event.event_logo}
                    alt={event.name}
                    className="h-32 mt-2 object-cover rounded"
                  />
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(event);
                    }}
                  >
                    {editEvent?.event_id === event.event_id
                      ? "Close Edit"
                      : "Edit"}
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(event.event_id);
                    }}
                  >
                    Delete
                  </button>
                </div>
                {/* Inline Edit Form */}
                {editEvent?.event_id === event.event_id && (
                  <div className="mt-4 p-4 border rounded bg-gray-50">
                    <input
                      type="text"
                      value={editEvent.name}
                      onChange={(e) =>
                        setEditEvent({ ...editEvent, name: e.target.value })
                      }
                      className="border p-1 rounded w-full mb-2"
                    />
                    <select
                      value={editEvent.event_type}
                      onChange={(e) =>
                        setEditEvent({
                          ...editEvent,
                          event_type: e.target.value,
                        })
                      }
                      className="border p-1 rounded w-full mb-2"
                    >
                      <option value="competition">Competition</option>
                      <option value="clinic">Clinic</option>
                    </select>

                    <div className="flex gap-2 mb-2">
                      <DatePicker
                        selected={editEvent.start_date}
                        onChange={(date) =>
                          setEditEvent({ ...editEvent, start_date: date })
                        }
                        showTimeSelect
                        dateFormat="yyyy-MM-dd HH:mm"
                        className="border p-2 rounded w-full"
                      />
                      <DatePicker
                        selected={editEvent.end_date}
                        onChange={(date) =>
                          setEditEvent({ ...editEvent, end_date: date })
                        }
                        showTimeSelect
                        dateFormat="yyyy-MM-dd HH:mm"
                        className="border p-2 rounded w-full"
                      />
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setEditEvent({ ...editEvent, image: e.target.files[0] })
                      }
                      className="mb-2"
                    />

                    <div className="flex gap-2">
                      <button
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        onClick={handleUpdate}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-400 text-black px-3 py-1 rounded hover:bg-gray-500"
                        onClick={() => setEditEvent(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
