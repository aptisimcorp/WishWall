import express from "express";
import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";
dotenv.config();
import { authenticateJWT } from "../middleware/auth.js";
import { BlobServiceClient } from "@azure/storage-blob";
import multer from "multer";

const router = express.Router();

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const socialContainerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_NAME
);
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/socialfeed - fetch all social feed posts
router.get("/socialfeed", async (req, res) => {
  try {
    const { socialFeedContainer } = req.app.settings;
    if (!socialFeedContainer) {
      return res
        .status(500)
        .json({ error: "Social feed container not initialized" });
    }
    const { resources: posts } = await socialFeedContainer.items
      .query({ query: "SELECT * FROM c", parameters: [] })
      .fetchAll();
    // Sort by newest first
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: posts });
  } catch (err) {
    console.error("Fetch social feed error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});
// --- Social Feed Post API ---
// PATCH /api/socialfeed/:postId/like - update likes for a post
router.patch("/socialfeed/:postId/like", async (req, res) => {
  try {
    const { socialFeedContainer } = req.app.settings;
    if (!socialFeedContainer) {
      return res
        .status(500)
        .json({ error: "Social feed container not initialized" });
    }
    const postId = req.params.postId;
    const { like } = req.body; // true to like, false to unlike
    const { resource: post } = await socialFeedContainer
      .item(postId, postId)
      .read();
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    post.likes = typeof post.likes === "number" ? post.likes : 0;
    if (like) {
      post.likes += 1;
    } else {
      post.likes = Math.max(0, post.likes - 1);
    }
    await socialFeedContainer.items.upsert(post);
    res.json({ success: true, likes: post.likes });
  } catch (err) {
    console.error("Update like error:", err);
    res.status(500).json({ error: "Failed to update like" });
  }
});
// --- Social Feed Comments API ---

// POST /api/socialfeed/:postId/comment - add a comment to a post
router.post("/socialfeed/:postId/comment", async (req, res) => {
  try {
    const { socialFeedContainer } = req.app.settings;
    if (!socialFeedContainer) {
      return res
        .status(500)
        .json({ error: "Social feed container not initialized" });
    }
    const postId = req.params.postId;
    const { userId, userName, userProfilePhoto, text } = req.body;
    if (!text || !userId) {
      return res
        .status(400)
        .json({ error: "Missing comment text or user info" });
    }
    // Fetch post
    const { resource: post } = await socialFeedContainer
      .item(postId, postId)
      .read();
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    // Add comment
    const comment = {
      id: Date.now().toString(),
      userId,
      userName,
      userProfilePhoto,
      text,
      createdAt: new Date().toISOString(),
    };
    post.comments = post.comments || [];
    post.comments.push(comment);
    await socialFeedContainer.items.upsert(post);
    res.json({ success: true, data: comment });
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// GET /api/socialfeed/:postId/comments - fetch comments for a post
router.get("/socialfeed/:postId/comments", async (req, res) => {
  try {
    const { socialFeedContainer } = req.app.settings;
    if (!socialFeedContainer) {
      return res
        .status(500)
        .json({ error: "Social feed container not initialized" });
    }
    const postId = req.params.postId;
    const { resource: post } = await socialFeedContainer
      .item(postId, postId)
      .read();
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ success: true, data: post.comments || [] });
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/socialfeed - create a new social feed post (with image/gif upload)
router.post("/socialfeed", upload.array("files"), async (req, res) => {
  try {
    // Save images/gifs to Azure Blob if files are present
    let mediaUrls = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const blobName = Date.now() + "-" + file.originalname;
        const blockBlobClient =
          socialContainerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadData(file.buffer, {
          blobHTTPHeaders: { blobContentType: file.mimetype },
        });
        mediaUrls.push(blockBlobClient.url);
      }
    }

    // Save post in Cosmos DB
    const post = {
      id: Date.now().toString(),
      userId: req.body.userId,
      userName: req.body.userName || "User",
      userProfilePhoto: req.body.userProfilePhoto || "",
      userDepartment: req.body.userDepartment || "",
      text: req.body.text,
      mediaUrls, // array of image/gif urls
      mediaType: req.files && req.files[0] ? req.files[0].mimetype : "",
      createdAt: new Date().toISOString(),
      tags: req.body.tags
        ? Array.isArray(req.body.tags)
          ? req.body.tags
          : [req.body.tags]
        : [],
    };
    // Use socialFeedContainer from index.js
    const { socialFeedContainer } = req.app.settings;
    if (!socialFeedContainer) {
      return res
        .status(500)
        .json({ error: "Social feed container not initialized" });
    }
    await socialFeedContainer.items.create(post);
    res.json({ success: true, data: post });
  } catch (err) {
    console.error("Social feed post error:", err);
    res.status(500).json({ error: "Failed to save post" });
  }
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

// Public test route
router.get("/test", (req, res) => {
  res.json({ message: "Dashboard test route works!" });
});

// GET /api/dashboard/upcoming-milestones
router.get("/upcoming-milestones", async (req, res) => {
  try {
    const now = new Date();
    // Use YYYY-MM-DD format for comparison
    const nowDate = now.toISOString().slice(0, 10);

    const { resources: users } = await usersContainer.items
      .query({
        query: `SELECT c.id, c.firstName, c.lastName, c.profilePhoto, c.department, 
                       c.birthday, c.workAnniversary, c.personalAnniversary
                FROM c
                `,
        parameters: [],
      })
      .fetchAll();

    const milestones = [];

    users.forEach((user) => {
      [
        { type: "birthday", date: user.birthday },
        { type: "work_anniversary", date: user.workAnniversary },
        { type: "personal_anniversary", date: user.personalAnniversary },
      ].forEach((event) => {
        if (!event.date) return;

        const eventDate = new Date(event.date);
        const thisYear = now.getFullYear();

        // Normalize event date to this year
        let upcoming = new Date(
          thisYear,
          eventDate.getMonth(),
          eventDate.getDate()
        );

        // If it already passed this year, set to next year
        if (upcoming < now) {
          upcoming.setFullYear(thisYear + 1);
        }

        const daysUntil = Math.ceil((upcoming - now) / (1000 * 60 * 60 * 24));

        milestones.push({
          id: `${user.id}-${event.type}`,
          type: event.type,
          date: event.date, // Original date
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            profilePhoto: user.profilePhoto,
            department: user.department,
          },
          daysUntil,
        });
      });
    });

    milestones.sort((a, b) => a.daysUntil - b.daysUntil);
    res.json({ success: true, data: milestones.slice(0, 5) });
  } catch (err) {
    console.error("Upcoming milestones API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/dashboard/counters
// GET /api/dashboard/counters
router.get("/counters", async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const yearEnd = new Date(now.getFullYear(), 11, 31); // End of this year

    // Team Members
    let teamMembers = 0;
    try {
      const { resources } = await usersContainer.items
        .query({ query: "SELECT VALUE COUNT(1) FROM c" })
        .fetchAll();
      teamMembers = resources[0] || 0;
    } catch {}

    // Whiteboards
    let whiteboards = 0;
    try {
      const whiteboardsContainer = database.container("ww_whiteboards");
      const { resources } = await whiteboardsContainer.items
        .query({ query: "SELECT VALUE COUNT(1) FROM c" })
        .fetchAll();
      whiteboards = resources[0] || 0;
    } catch {
      whiteboards = 8; // fallback
    }

    // Get all users
    const { resources: users } = await usersContainer.items
      .query({
        query:
          "SELECT c.id, c.birthday, c.workAnniversary, c.personalAnniversary FROM c",
      })
      .fetchAll();

    // Normalize and check events
    let celebrations = 0;
    let milestones = 0;

    users.forEach((user) => {
      const events = [
        user.birthday,
        user.workAnniversary,
        user.personalAnniversary,
      ].filter(Boolean);

      events.forEach((date) => {
        const d = new Date(date);
        let normalized = new Date(now.getFullYear(), d.getMonth(), d.getDate());

        // If already passed this year, push to next year
        if (normalized < now) normalized.setFullYear(now.getFullYear() + 1);

        // Celebrations = This Month
        if (normalized >= monthStart && normalized <= monthEnd) {
          celebrations++;
        }

        // Milestones = From today until Dec 31 of current year
        if (normalized >= now && normalized <= yearEnd) {
          milestones++;
        }
      });
    });

    res.json({ celebrations, teamMembers, whiteboards, milestones });
  } catch (err) {
    console.error("Dashboard counters API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/dashboard
router.get("/", async (req, res) => {
  try {
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

    const { resource: user } = await usersContainer.item(userId, userId).read();
    if (!user) return res.status(404).json({ error: "User not found" });

    const { resources: wishes } = await wishesContainer.items
      .query({
        query:
          "SELECT TOP 5 * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC",
        parameters: [{ name: "@userId", value: userId }],
      })
      .fetchAll();

    res.json({ user, wishes });
  } catch (err) {
    console.error("Dashboard API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
