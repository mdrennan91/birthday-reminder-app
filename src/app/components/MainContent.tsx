"use client";

import { useState } from "react";

interface Person {
  name: string;
  // Add more fields as needed (e.g., birthday, email, etc.)
}

export default function MainContent() {
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  return (
    <main className="flex flex-1 overflow-hidden">
      {/* Left Column: Upcoming Birthdays */}
      <section className="w-1/2 p-4 border-r border-teal overflow-y-auto bg-white">
        <h2 className="text-lg font-semibold mb-4 text-black">Upcoming Birthdays</h2>
        <ul className="space-y-3">
          {/* Placeholder items */}
          {["Alice Smith", "Bob Johnson", "Charlie Lee"].map((name, index) => (
            <li
              key={index}
              className="p-3 border text-black border-gray-200 rounded cursor-pointer hover:bg-teal/10"
              onClick={() => setSelectedPerson({ name })}
            >
              {name}
            </li>
          ))}
        </ul>
      </section>

      {/* Right Column: Person Details */}
      <section className="w-1/2 p-4 overflow-y-auto bg-lavender">
        {selectedPerson ? (
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-black">{selectedPerson.name}</h2>
              <div className="space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  Edit
                </button>
                <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">
                  Delete
                </button>
              </div>
            </div>
            <p className="text-gray-700">More details will go here...</p>
          </div>
        ) : (
          <p className="text-gray-600">Select a person to view their details.</p>
        )}
      </section>
    </main>
  );
}
