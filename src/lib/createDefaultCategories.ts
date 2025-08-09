import Category from "@/models/Category";


// Populates default categories when a new user account is created.
const DEFAULT_CATEGORIES = [
  { name: "Family", color: "#000000" },    
  { name: "Friends", color: "#000000" },   
  { name: "Coworkers", color: "#000000" }, 
  { name: "Pets", color: "#000000" },      
];

export async function createDefaultCategories(userId: string) {
  const existing = await Category.findOne({ userId });
  if (existing) return;

  await Category.insertMany(
    DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId }))
  );
}

