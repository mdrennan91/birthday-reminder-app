import mongoose, { Schema } from "mongoose";

const BirthdaySchema = new Schema({
  name: String,
  birthday: String,
  phone: String,
  email: String,
  address: String,
  notes: String,
  avatarUrl: String,
  userId: String, 
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  pinned: { type: Boolean, default: false },
});

export default mongoose.models.Birthday || mongoose.model("Birthday", BirthdaySchema);
