"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import CategoryModal from "@/app/components/CategoryModal";
import EditDeleteDialog from "@/app/components/EditDeleteDialog";

interface CategoryType {
  _id: string;
  name: string;
  color: string;
}

export default function Sidebar() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setSelectedCategory(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditDialog = () => {
    setEditDialogOpen(true);
  };

  const handleSaveCategory = async (name: string, color: string) => {
    if (modalMode === "add") {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });

      if (res.ok) {
        const created = await res.json();
        setCategories((prev) => [...prev, created]);
      }
    } else if (modalMode === "edit" && selectedCategory) {
      const res = await fetch(`/api/categories/${selectedCategory._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === selectedCategory._id ? { ...cat, name, color } : cat
          )
        );
      }
    }
  };

  const handleUpdateCategory = async (id: string, name: string, color: string) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (res.ok) {
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    }
  };

  if (loading) {
    return <aside className="w-64 p-4 border-r border-teal bg-lavender">Loading...</aside>;
  }

  return (
    <aside className="w-64 p-4 border-r border-teal bg-lavender">
      <div className="flex justify-between items-center mb-4">
        <div></div>
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            className="p-1 bg-teal text-white rounded hover:bg-teal/80"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={openEditDialog}
            className="p-1 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            <Pencil size={18} />
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat._id}>
            <button
              style={{ color: cat.color }}
              className="w-full text-left py-1 px-2 rounded bg-lavender font-medium hover:bg-teal/25"
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>

      {/* These components will be rewritten without shadcn-ui next */}
      <CategoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveCategory}
        mode={modalMode}
        initialName={selectedCategory?.name}
        initialColor={selectedCategory?.color}
      />

      <EditDeleteDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        categories={categories}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />
    </aside>
  );
}
