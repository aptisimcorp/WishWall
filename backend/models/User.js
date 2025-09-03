import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthday: { type: Date },
    workanniversary: { type: Date },
    weddinganniversary: { type: Date },
    department: { type: String },
    team: { type: String },
    profilepicture: { type: String }, // URL or base64
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
