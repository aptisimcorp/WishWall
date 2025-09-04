import mongoose from "mongoose";

const WhiteboardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  elements: { type: Array, default: [] },
  owner: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Whiteboard = mongoose.model("Whiteboard", WhiteboardSchema);
export default Whiteboard;
