import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import "react-datepicker/dist/react-datepicker.css";

import { insertSet } from "../../data/admin";

import { getSetsInSection } from "../../data/sets";
import { getAllSections } from "../../data/sections";

const SetManager = () => {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [sets, setSets] = useState([]);
  const [newSetName, setNewSetName] = useState("");

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchSetsForSection(selectedSection);
    }
  }, [selectedSection]);

  const fetchSections = async () => {
    try {
      const data = await getAllSections();
      setSections(data);
      if (data.length > 0) {
        setSelectedSection(data[0].section_id);
      }
    } catch (err) {
      console.error("Error fetching sections:", err);
    }
  };

  const fetchSetsForSection = async (sectionId) => {
    try {
      const data = await getSetsInSection(sectionId);
      setSets(data);
    } catch (err) {
      console.error("Error fetching sets:", err);
    }
  };

  const handleAddSet = async () => {
    if (!newSetName.trim()) return;

    try {
      await insertSet({
        name: newSetName,
        section_id: selectedSection,
      });

      setNewSetName("");
      fetchSetsForSection(selectedSection);
    } catch (err) {
      console.error("Failed to add set:", err);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Manage Sets</h2>

      <div className="flex gap-2 items-center">
        <label className="font-medium">Select Section:</label>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="border p-2 rounded"
        >
          {sections.map((s) => (
            <option key={s.section_id} value={s.section_id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Create New Set</h3>
        <input
          type="text"
          placeholder="Set name"
          value={newSetName}
          onChange={(e) => setNewSetName(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleAddSet}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Set
        </button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Sets for Selected Section</h3>
        {sets.length === 0 ? (
          <p className="text-gray-500">No sets found.</p>
        ) : (
          <ul className="space-y-2">
            {sets.map((set) => (
              <Link
                to={`/admin/sets/${set.set_id}`}
                key={set.set_id}
                className={`block p-4 rounded shadow mb-2 ${
                  set.deprecated ? "bg-gray-200 text-gray-500" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{set.set_name}</h3>
                    <p className="text-sm">
                      {new Date(set.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {set.deprecated && (
                    <span className="text-xs italic">Deprecated</span>
                  )}
                </div>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SetManager;
