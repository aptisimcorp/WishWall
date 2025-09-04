import mongoose from "mongoose";

const WhiteboardObjectSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'note', 'image', 'drawing', 'shape'
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // {text, color, position, ...}
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('WhiteboardObject', WhiteboardObjectSchema);
