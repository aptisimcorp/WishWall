import express from "express";
import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";
dotenv.config();
import { authenticateJWT } from "../middleware/auth.js";

const router = express.Router();

// Public test route to confirm dashboard.js is loaded
router.get("/test", (req, res) => {
  res.json({ message: "Dashboard test route works!" });
});

// Cosmos DB setup
const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE_ID;
const containerId = "ww_users";
const wishesContainerId = "ww_wishes";

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const usersContainer = database.container(containerId);
const wishesContainer = database.container(wishesContainerId);

// GET /api/dashboard - returns user info and recent wishes
router.get("/", async (req, res) => {
  try {
    // Assume user id is available via req.user (set by auth middleware)
    // If no userId, return mock user and wishes
    const userId = req.user?.userId;
    if (!userId) {
      return res.json({
        user: {
          id: "demo",
          firstName: "Demo",
          lastName: "User",
          email: "demo@wishwall.com",
          profilePhoto: "",
        },
        wishes: [
          { id: 1, text: "Demo wish 1", createdAt: new Date().toISOString() },
          { id: 2, text: "Demo wish 2", createdAt: new Date().toISOString() },
        ],
      });
    }

    // Get user info
    const { resource: user } = await usersContainer.item(userId, userId).read();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get recent wishes (limit 5)
    const wishesQuery = {
      query:
        "SELECT TOP 5 * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
      parameters: [{ name: "@userId", value: userId }],
    };
    const { resources: wishes } = await wishesContainer.items
      .query(wishesQuery)
      .fetchAll();

    res.json({ user, wishes });
  } catch (err) {
    console.error("Dashboard API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
