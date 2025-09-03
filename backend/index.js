import express from "express";
import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import profileRouter from "./routes/profile.js";
import whiteboardRouter from "./routes/whiteboard.js";
import http from "http";
import { Server as SocketIO } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Cosmos DB connection

const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});
app.set("cosmosClient", cosmosClient);
app.set("cosmosDatabaseId", process.env.COSMOS_DATABASE_ID);

// Test Cosmos DB connection
async function testCosmosConnection() {
  try {
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: process.env.COSMOS_DATABASE_ID,
    });
    console.log(`Connected to Cosmos DB: ${database.id}`);
  } catch (err) {
    console.error("Cosmos DB connection error:", err.message);
  }
}
testCosmosConnection();

// User API
app.use("/api/users", userRouter);

// Profile image upload and update API
app.use("/api/profile", profileRouter);

// Whiteboard API
app.use("/api/whiteboard", whiteboardRouter);

// Sample wishes API
app.get("/api/wishes", (req, res) => {
  res.json([
    { id: 1, text: "Wish for world peace" },
    { id: 2, text: "Wish for good health" },
  ]);
});

// Socket.io for real-time whiteboard sync
io.on("connection", (socket) => {
  console.log("User connected to whiteboard", socket.id);

  socket.on("joinBoard", (eventId) => {
    socket.join(eventId);
  });

  socket.on("elementUpdate", ({ eventId, elements, users }) => {
    socket.to(eventId).emit("elementUpdate", { elements, users });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected from whiteboard", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`WishWall backend running on port ${PORT}`);
});
