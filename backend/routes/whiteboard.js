const express = require('express');
const router = express.Router();
const Whiteboard = require('../models/Whiteboard');

// Get whiteboard by eventId
router.get('/:eventId', async (req, res) => {
  try {
    const board = await Whiteboard.findOne({ eventId: req.params.eventId });
    if (!board) return res.status(404).json({ message: 'Whiteboard not found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new whiteboard
router.post('/', async (req, res) => {
  try {
    const board = new Whiteboard(req.body);
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update whiteboard elements
router.put('/:eventId', async (req, res) => {
  try {
    const board = await Whiteboard.findOneAndUpdate(
      { eventId: req.params.eventId },
      { $set: { elements: req.body.elements, users: req.body.users, updatedAt: Date.now() } },
      { new: true }
    );
    if (!board) return res.status(404).json({ message: 'Whiteboard not found' });
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
