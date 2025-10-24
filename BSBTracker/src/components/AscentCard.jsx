import React from "react";

function capitalizeFirstLetter(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export default function AscentCard({ ascent }) {
  return (
    <div className="border p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-xl font-semibold">
        {capitalizeFirstLetter(ascent.route_name)}
      </h3>
      <p className="text-sm text-gray-500">
        {capitalizeFirstLetter(ascent.route_color)} -{" "}
        {ascent.route_grade.toUpperCase()}
      </p>
      <p className="text-sm text-gray-500">
        Date: {new Date(ascent.timestamp).toLocaleDateString()}
      </p>
      <p className="text-sm text-gray-500">Attempts: {ascent.attempts}</p>
      {ascent.instagram_link && (
        <a
          href={ascent.instagram_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 text-sm"
        >
          Instagram Link
        </a>
      )}
    </div>
  );
}
