"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import CategoryModal from "@/app/components/CategoryModal";
import EditDeleteDialog from "@/app/components/EditDeleteDialog";
import { useSession } from "next-auth/react";

const CATEGORY_FILTER_EVENT = "filter-category";

interface CategoryType {
  _id: string;
  name: string;
  color: string;
}

/**
 * SidebarNav
 * - Desktop (md+): inline panel with original visuals
 * - Mobile: render inside a header drawer via `inDrawer`
 */
export default function SidebarNav({ inDrawer = false }: { inDrawer?: boolean }) {
  const { status } = useSession();
  const [, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [filtersActive, setFiltersActive] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    setFiltersActive(activeCategory !== null);
  }, [activeCategory]);

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

  const openEditDialog = () => setEditDialogOpen(true);

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

  const handleUpdateCategory = async (id: string, name: string, color: string) => {
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

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    }
  };

  if (status === "unauthenticated") return null;
  if (status === "loading") return <div className="p-4 text-center">Loading...</div>;

  // Container variants
  const base = "flex flex-col bg-lavender border-r border-teal";
  const desktop = "hidden md:flex w-64 p-4 h-full min-h-0"; // original look, no sticky/calc height
  const drawer = "md:hidden w-72 h-dvh p-4"; // used by header drawer

  return (
    <aside
      className={`${base} ${inDrawer ? drawer : desktop}`}
      aria-label="Filter categories"
    >
      {/* Header controls — original visuals */}
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

      {/* Scrollable category list — original visuals */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <ul className="space-y-2" role="listbox" aria-label="Categories">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name.toLowerCase();
            return (
              <li key={cat._id}>
                <button
                  style={{ color: cat.color }}
                  role="option"
                  aria-selected={isActive}
                  className={`w-full text-left py-1 px-2 rounded font-medium ${
                    isActive
                      ? "bg-teal/20 border-l-4 border-teal"
                      : "bg-lavender hover:bg-teal/50"
                  }`}
                  onClick={() => {
                    const value = cat.name.toLowerCase();
                    setActiveCategory(value);
                    const event = new CustomEvent(CATEGORY_FILTER_EVENT, { detail: value });
                    window.dispatchEvent(event);
                    setFiltersActive(true);
                  }}
                >
                  {cat.name}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Sticky Clear Filter — original visuals */}
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
              const event = new CustomEvent(CATEGORY_FILTER_EVENT, { detail: null });
              window.dispatchEvent(event);
            }}
          >
            Clear Filter
          </button>
        </div>
      </div>

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
