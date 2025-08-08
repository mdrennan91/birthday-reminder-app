import Category from "@/models/Category";


// Populates default categories when a new user account is created.
const DEFAULT_CATEGORIES = [
  { name: "Family", color: "#999999" },    
  { name: "Friends", color: "#999999" },   
  { name: "Coworkers", color: "#999999" }, 
  { name: "Pets", color: "#999999" },      
];

export async function createDefaultCategories(userId: string) {
  const existing = await Category.findOne({ userId });
  if (existing) return;

  await Category.insertMany(
    DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId }))
  );
}

