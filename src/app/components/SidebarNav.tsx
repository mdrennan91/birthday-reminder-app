"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import CategoryModal from "@/app/components/CategoryModal";
import EditDeleteDialog from "@/app/components/EditDeleteDialog";
import { useSession } from "next-auth/react";

// Constant for the custom event name
const CATEGORY_FILTER_EVENT = "filter-category";

// Define the structure for category data
interface CategoryType {
  _id: string;
  name: string;
  color: string;
}

export default function Sidebar() {
  const { status } = useSession();
  const [, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filtersActive, setFiltersActive] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories(); // reuse your helper that includes setLoading(false)
    } else if (status === "unauthenticated") {
      setLoading(false); // ensure we stop showing "Loading..." if not logged in
    }
  }, [status]);

  useEffect(() => {
    if (activeCategory === null) {
      setFiltersActive(false);
    } else {
      setFiltersActive(true);
    }
  }, [activeCategory]);

  // Fetch user categories from API
  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    if (res.ok) {
      const data = await res.json();
      setCategories(data);
    }
    setLoading(false);
  };

  // Open modal to add category
  const openAddModal = () => {
    setSelectedCategory(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  // Open dialog to edit/delete categories
  const openEditDialog = () => {
    setEditDialogOpen(true);
  };

  // Save category to database (create or update)
  const handleSaveCategory = async (name: string, color: string) => {
    if (modalMode === "add") {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });

      if (res.ok) {
        await fetchCategories();
        window.dispatchEvent(new Event("categoryUpdated"));
      }
    } else if (modalMode === "edit" && selectedCategory) {
      const res = await fetch(`/api/categories/${selectedCategory._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });

      if (res.ok) {
        await fetchCategories();
        window.dispatchEvent(new Event("categoryUpdated"));
      }
    }
  };

  // Update category directly from dialog
  const handleUpdateCategory = async (
    id: string,
    name: string,
    color: string
  ) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });

    if (res.ok) {
      fetchCategories();
      window.dispatchEvent(new Event("categoryUpdated"));
    }
  };

  // Delete category from database
  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    }
  };

  if (status === "unauthenticated") {
    return null;
  }
  if (status === "loading") {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <aside className="w-64 p-4 border-r border-teal bg-lavender flex flex-col ">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="font-extrabold text-xl">Filter Categories</div>
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            aria-label="Add Category"
            title="Add Category"
            className="p-1 bg-teal text-white rounded hover:bg-teal/80"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={openEditDialog}
            aria-label="Edit Categories"
            title="Edit Categories"
            className="p-1 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            <Pencil size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable category list */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat._id}>
              <button
                style={{ color: cat.color }}
                className={`w-full text-left py-1 px-2 rounded font-medium ${
                  activeCategory === cat.name.toLowerCase()
                    ? "bg-teal/20 border-l-4 border-teal"
                    : "bg-lavender hover:bg-teal/50"
                }`}
                onClick={() => {
                  const event = new CustomEvent(CATEGORY_FILTER_EVENT, {
                    detail: cat.name.toLowerCase(),
                  });
                  window.dispatchEvent(event);
                  setFiltersActive(true);
                }}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
        <div className="sticky bottom-0 bg-lavender pt-3 pb-4 mt-2 border-t border-gray-300">
          <button
            className={`w-full text-left py-1 px-2 rounded font-medium ${
              filtersActive
                ? "bg-lavender hover:bg-teal/50"
                : "bg-teal/20 border-l-4 border-teal"
            }`}
            onClick={() => {
              setActiveCategory(null);
              setFiltersActive(false);
              const event = new CustomEvent(CATEGORY_FILTER_EVENT, {
                detail: null,
              });
              window.dispatchEvent(event);
            }}
          >
            Clear Filter
          </button>
        </div>
      </div>

      {/* Sticky "Clear Filters" button at bottom */}

      {/* Modals */}
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
