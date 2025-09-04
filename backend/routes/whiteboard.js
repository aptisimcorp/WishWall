import express from "express";
const router = express.Router();
import WhiteboardObject from '../models/WhiteboardObject.js';

// Get all objects
router.get('/', async (req, res) => {
  try {
    const objects = await WhiteboardObject.find();
    res.json(objects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create object
router.post('/', async (req, res) => {
  try {
    const object = new WhiteboardObject(req.body);
    await object.save();
    res.status(201).json(object);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update object
router.put('/:id', async (req, res) => {
  try {
    const object = await WhiteboardObject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(object);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete object
router.delete('/:id', async (req, res) => {
  try {
    await WhiteboardObject.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
