import { useEffect, useState } from "react";
import { getAllSections } from "../../data/sections";
import { deleteSection, insertSection, updateSection } from "../../data/admin";

export default function SectionManager() {
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const data = await getAllSections();
      setSections(data);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    }
  };

  const handleAdd = async () => {
    insertSection(newSectionName.trim());

    setNewSectionName("");
    fetchSections();
  };

  const handleEdit = async (id) => {
    try {
      updateSection(id, editingName);

      fetchSections();
    } catch (error) {
      console.error("Unexpected error editing section:", error);
    }
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this section?"
    );
    if (!confirmed) return;

    try {
      const { error } = deleteSection(id);

      if (error) {
        console.error("Failed to delete section:", error);
      }
    } catch (error) {
      console.error("Unexpected error deleting section:", error);
    }
    fetchSections();
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white shadow-lg rounded">
      <h2 className="text-2xl font-bold mb-4">Section Manager</h2>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New Section Name"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {sections.map((section) => (
          <li
            key={section.section_id}
            className="border p-3 flex items-center justify-between"
          >
            {editingId === section.section_id ? (
              <>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 p-1 border mr-2"
                />
                <button
                  onClick={() => handleEdit(section.section_id)}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-1"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">{section.name}</span>
                <button
                  onClick={() => {
                    setEditingId(section.section_id);
                    setEditingName(section.name);
                  }}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 mr-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(section.section_id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
