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
 * - Desktop (md+): inline panel
 * - Mobile: render inside a header drawer via `inDrawer`
 * - Accessibility: native list semantics (ul/li + buttons), no ARIA listbox/option
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

  useEffect(() => {
    if (status === "authenticated") {
      fetchCategories();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  // keep activeCategory in sync if someone else broadcasts a filter event
  useEffect(() => {
    const onFilter = (e: Event) => {
      const detail = (e as CustomEvent).detail ?? null;
      setActiveCategory(detail);
    };
    window.addEventListener(CATEGORY_FILTER_EVENT, onFilter as EventListener);
    return () => window.removeEventListener(CATEGORY_FILTER_EVENT, onFilter as EventListener);
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
      setActiveCategory((prev) => (prev && !categories.some((c) => c._id === id) ? null : prev));
    }
  };

  if (status === "unauthenticated") return null;
  if (status === "loading") return <div className="p-4 text-center">Loading...</div>;

  // Container variants
  const base = "flex flex-col bg-lavender border-r border-teal";
  const desktop = "hidden md:flex w-64 p-4 h-full min-h-0";
  const drawer = "md:hidden w-72 h-dvh p-4";

  const filtersActive = activeCategory !== null;

  return (
    <aside className={`${base} ${inDrawer ? drawer : desktop}`} aria-label="Filter categories">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-extrabold text-xl" id="filter-categories-heading">
          Filter Categories
        </h2>
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            aria-label="Add category"
            className="p-1 bg-teal text-white rounded hover:bg-teal/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-300"
          >
            <Plus size={18} aria-hidden />
          </button>
          <button
            onClick={openEditDialog}
            aria-label="Edit categories"
            className="p-1 bg-gray-300 text-black rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            <Pencil size={18} aria-hidden />
          </button>
        </div>
      </div>

      {/* Category list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <ul
          className="space-y-2"
          aria-labelledby="filter-categories-heading"
        >
          {categories.map((cat) => {
            const value = cat.name.toLowerCase();
            const isActive = activeCategory === value;
            return (
              <li key={cat._id}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  aria-label={`Filter by ${cat.name}`}
                  data-active={isActive}
                  className={`w-full text-left py-1.5 px-2 rounded font-medium border transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200
                    bg-lavender hover:bg-white/60 border-transparent
                    data-[active=true]:bg-white data-[active=true]:border-blue-400 data-[active=true]:ring-1 data-[active=true]:ring-blue-200`}
                  onClick={() => {
                    setActiveCategory(value);
                    const event = new CustomEvent(CATEGORY_FILTER_EVENT, { detail: value });
                    window.dispatchEvent(event);
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white"
                      style={{ backgroundColor: cat.color }}
                      aria-hidden
                    />
                    <span className="text-gray-900">{cat.name}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Sticky Clear Filter */}
        <div className="sticky bottom-0 bg-lavender pt-3 pb-4 mt-2 border-t border-gray-300">
          <button
            type="button"
            className={`w-full text-left py-1.5 px-2 rounded font-medium border transition focus:outline-none focus:ring-2 focus:ring-offset-2
              ${filtersActive
                ? "bg-white border-blue-400 ring-1 ring-blue-200 focus:ring-blue-200"
                : "bg-lavender hover:bg-white/60 border-transparent focus:ring-blue-200"}`}
            onClick={() => {
              setActiveCategory(null);
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
