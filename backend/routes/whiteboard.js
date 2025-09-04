import express from "express";
// import Whiteboard from "../models/Whiteboard.js"; // Removed for Cosmos DB migration
const router = express.Router();

// Get all whiteboards (Cosmos DB)
router.get("/", async (req, res) => {
  try {
    const whiteboardContainer = req.app.get("whiteboardContainer");
    if (!whiteboardContainer) {
      console.error("whiteboardContainer not found in app context");
      return res
        .status(500)
        .json({ error: "Cosmos container not initialized" });
    }
    const querySpec = { query: "SELECT * FROM c ORDER BY c.updatedAt DESC" };
    const { resources } = await whiteboardContainer.items
      .query(querySpec)
      .fetchAll();
    res.json(resources);
  } catch (err) {
    console.error("Error in GET /api/whiteboard:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch whiteboards", details: err.message });
  }
});

// Get a single whiteboard by ID
router.get("/:id", async (req, res) => {
  try {
    const whiteboardContainer = req.app.get("whiteboardContainer");
    if (!whiteboardContainer) {
      console.error("whiteboardContainer not found in app context");
      return res
        .status(500)
        .json({ error: "Cosmos container not initialized" });
    }
    const { resource } = await whiteboardContainer
      .item(req.params.id, req.params.id)
      .read();
    if (!resource)
      return res.status(404).json({ error: "Whiteboard not found" });
    res.json(resource);
  } catch (err) {
    console.error("Error in GET /api/whiteboard/:id:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch whiteboard", details: err.message });
  }
});

// Create a new whiteboard
router.post("/", async (req, res) => {
  try {
    const whiteboardContainer = req.app.get("whiteboardContainer");
    if (!whiteboardContainer) {
      console.error("whiteboardContainer not found in app context");
      return res
        .status(500)
        .json({ error: "Cosmos container not initialized" });
    }
    const { title, elements, owner } = req.body;
    console.log("POST /api/whiteboard payload:", req.body);
    const board = {
      id: Date.now().toString(),
      title,
      elements: elements || [],
      owner: owner || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const { resource } = await whiteboardContainer.items.create(board);
    res.status(201).json(resource);
  } catch (err) {
    console.error("Error in POST /api/whiteboard:", err);
    res
      .status(500)
      .json({ error: "Failed to create whiteboard", details: err.message });
  }
});

// Update a whiteboard
// Update a whiteboard (title/elements)
router.put("/:id", async (req, res) => {
  try {
    const whiteboardContainer = req.app.get("whiteboardContainer");
    if (!whiteboardContainer) {
      console.error("whiteboardContainer not found in app context");
      return res
        .status(500)
        .json({ error: "Cosmos container not initialized" });
    }
    const { title, elements } = req.body;
    console.log(
      "PUT /api/whiteboard/:id payload:",
      JSON.stringify(req.body, null, 2)
    );
    if (Array.isArray(req.body.elements)) {
      req.body.elements.forEach((el, idx) => {
        console.log(`Element ${idx}: id=${el.id}, x=${el.x}, y=${el.y}`);
      });
    }
    // Read existing board
    const { resource: board } = await whiteboardContainer
      .item(req.params.id, req.params.id)
      .read();
    if (!board) return res.status(404).json({ error: "Whiteboard not found" });
    board.title = title;
    board.elements = elements;
    board.updatedAt = new Date().toISOString();
    const { resource: updated } = await whiteboardContainer.items.upsert(board);
    res.json(updated);
  } catch (err) {
    console.error("Error in PUT /api/whiteboard/:id:", err);
    res
      .status(500)
      .json({ error: "Failed to update whiteboard", details: err.message });
  }
});

// Add an element to a whiteboard
router.post("/:id/elements", async (req, res) => {
  try {
    const whiteboardContainer = req.app.get("whiteboardContainer");
    if (!whiteboardContainer) {
      console.error("whiteboardContainer not found in app context");
      return res
        .status(500)
        .json({ error: "Cosmos container not initialized" });
    }
    const { element } = req.body;
    console.log("POST /api/whiteboard/:id/elements payload:", req.body);
    const { resource: board } = await whiteboardContainer
      .item(req.params.id, req.params.id)
      .read();
    if (!board) return res.status(404).json({ error: "Whiteboard not found" });
    board.elements = board.elements || [];
    board.elements.push(element);
    board.updatedAt = new Date().toISOString();
    const { resource: updated } = await whiteboardContainer.items.upsert(board);
    res.json(updated);
  } catch (err) {
    console.error("Error in POST /api/whiteboard/:id/elements:", err);
    res
      .status(500)
      .json({ error: "Failed to add element", details: err.message });
  }
});

// Update an element (move, edit, etc.)
router.put("/:id/elements/:elementId", async (req, res) => {
  try {
    const whiteboardContainer = req.app.get("whiteboardContainer");
    if (!whiteboardContainer) {
      console.error("whiteboardContainer not found in app context");
      return res
        .status(500)
        .json({ error: "Cosmos container not initialized" });
    }
    const { element } = req.body;
    console.log(
      "PUT /api/whiteboard/:id/elements/:elementId payload:",
      req.body
    );
    const { resource: board } = await whiteboardContainer
      .item(req.params.id, req.params.id)
      .read();
    if (!board) return res.status(404).json({ error: "Whiteboard not found" });
    const idx = board.elements.findIndex((e) => e.id === req.params.elementId);
    if (idx === -1) return res.status(404).json({ error: "Element not found" });
    board.elements[idx] = element;
    board.updatedAt = new Date().toISOString();
    const { resource: updated } = await whiteboardContainer.items.upsert(board);
    res.json(updated);
  } catch (err) {
    console.error("Error in PUT /api/whiteboard/:id/elements/:elementId:", err);
    res
      .status(500)
      .json({ error: "Failed to update element", details: err.message });
  }
});

// Delete an element
router.delete("/:id/elements/:elementId", async (req, res) => {
  try {
    const whiteboardContainer = req.app.get("whiteboardContainer");
    if (!whiteboardContainer) {
      console.error("whiteboardContainer not found in app context");
      return res
        .status(500)
        .json({ error: "Cosmos container not initialized" });
    }
    console.log(
      "DELETE /api/whiteboard/:id/elements/:elementId params:",
      req.params
    );
    const { resource: board } = await whiteboardContainer
      .item(req.params.id, req.params.id)
      .read();
    if (!board) return res.status(404).json({ error: "Whiteboard not found" });
    board.elements = board.elements.filter(
      (e) => e.id !== req.params.elementId
    );
    board.updatedAt = new Date().toISOString();
    const { resource: updated } = await whiteboardContainer.items.upsert(board);
    res.json(updated);
  } catch (err) {
    console.error(
      "Error in DELETE /api/whiteboard/:id/elements/:elementId:",
      err
    );
    res
      .status(500)
      .json({ error: "Failed to delete element", details: err.message });
  }
});

// Delete a whiteboard
router.delete("/:id", async (req, res) => {
  try {
    const whiteboardContainer = req.app.get("whiteboardContainer");
    if (!whiteboardContainer) {
      console.error("whiteboardContainer not found in app context");
      return res
        .status(500)
        .json({ error: "Cosmos container not initialized" });
    }
    console.log("DELETE /api/whiteboard/:id params:", req.params);
    await whiteboardContainer.item(req.params.id, req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    console.error("Error in DELETE /api/whiteboard/:id:", err);
    res
      .status(500)
      .json({ error: "Failed to delete whiteboard", details: err.message });
  }
});

export default router;
