const mongoose = require('mongoose');

const ElementSchema = new mongoose.Schema({
  id: String,
  type: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  content: String,
  color: String,
  author: {
    name: String,
    profilePhoto: String
  },
  timestamp: String
}, { _id: false });

const WhiteboardSchema = new mongoose.Schema({
  eventId: { type: String, required: true },
  elements: [ElementSchema],
  users: [{
    id: String,
    name: String,
    profilePhoto: String,
    color: String,
    cursor: {
      x: Number,
      y: Number
    }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Whiteboard', WhiteboardSchema);
