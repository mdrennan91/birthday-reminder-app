"use client";

import { useState } from "react";

export default function CategoryActions({ onAdd }: { onAdd: (name: string, color: string) => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#90bede");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), color);
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <input
        type="text"
        placeholder="New category"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-1 text-sm"
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-full h-8"
      />
      <button type="submit" className="w-full bg-teal text-white py-1 text-sm rounded">
        Add Category
      </button>
    </form>
  );
}
