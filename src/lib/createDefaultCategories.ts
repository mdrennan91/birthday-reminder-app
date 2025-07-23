import Category from "@/models/Category";

const DEFAULT_CATEGORIES = [
  { name: "Family", color: "#999999" },    // lavender
  { name: "Friends", color: "#999999" },   // mint
  { name: "Coworkers", color: "#999999" }, // teal
  { name: "Pets", color: "#999999" },      // gray
];

export async function createDefaultCategories(userId: string) {
  const existing = await Category.findOne({ userId });
  if (existing) return;

  await Category.insertMany(
    DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId }))
  );
}

