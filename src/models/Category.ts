import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: String,
  color: String,
  userId: String,
});

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
