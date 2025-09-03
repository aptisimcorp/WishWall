import express from "express";
import cors from "cors";
import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import multer from "multer";
import { BlobServiceClient } from "@azure/storage-blob";

import userRouter from "./routes/user.js";
import profileRouter from "./routes/profile.js";
import dashboardRouter from "./routes/dashboard.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for now
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors());
app.use(express.json());

// Cosmos setup
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});
const databaseId = process.env.COSMOS_DATABASE_ID || "hackathon-db";
const containerId = "ww_whiteboard";
let whiteboardContainer;

// 🔹 Ensure DB & Container exist
async function initCosmos() {
  try {
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: databaseId,
    });
    console.log(`✅ Cosmos DB: ${database.id}`);

    const { container } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: { paths: ["/id"], kind: "Hash" },
    });
    console.log(`✅ Cosmos Container: ${container.id}`);
    whiteboardContainer = container;

    // Optional: Seed a welcome note if board is empty
    const { resources } = await container.items
      .query("SELECT * FROM c")
      .fetchAll();
    if (resources.length === 0) {
      await container.items.create({
        id: "welcome-note",
        text: "👋 Welcome to the Whiteboard!",
        x: 100,
        y: 100,
      });
      console.log("📝 Seeded welcome note");
    }
  } catch (err) {
    console.error("❌ Cosmos initialization failed:", err);
  }
}
initCosmos();

app.set("cosmosClient", cosmosClient);
app.set("cosmosDatabaseId", databaseId);

// Azure Blob setup
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// --- Azure Image Upload Route ---
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const blobName = Date.now() + "-" + req.file.originalname;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });

    const imageUrl = blockBlobClient.url;
    res.json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send("Image upload failed");
  }
});

// --- Socket.io Whiteboard Logic ---
const getAllNotes = async () => {
  if (!whiteboardContainer) {
    throw new Error("whiteboardContainer is not initialized");
  }
  const query = { query: "SELECT * FROM c" };
  const { resources } = await whiteboardContainer.items.query(query).fetchAll();
  return resources;
};

const saveOrUpdateNote = async (note) => {
  await whiteboardContainer.items.upsert(note);
};

const deleteNote = async (id) => {
  await whiteboardContainer.item(id, id).delete();
};

io.on("connection", async (socket) => {
  console.log(`🔗 Client connected: ${socket.id}`);

  try {
    const notes = await getAllNotes();
    socket.emit("loadNotes", notes);
  } catch (err) {
    socket.emit("loadNotes", []);
    console.error("Error loading notes:", err.message);
  }

  socket.on("addNote", async (note) => {
    await saveOrUpdateNote(note);
    io.emit("noteAdded", note);
  });

  socket.on("updateNote", async (note) => {
    await saveOrUpdateNote(note);
    io.emit("noteUpdated", note);
  });

  socket.on("deleteNote", async (noteId) => {
    await deleteNote(noteId);
    io.emit("noteDeleted", noteId);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Existing APIs
app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/dashboard", dashboardRouter);

// Server start is now delayed until Cosmos DB is initialized

// Delay server start until Cosmos DB is ready
initCosmos().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
  });
});
