import express from "express";
import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import profileRouter from "./routes/profile.js";

dotenv.config();

const app = express();
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

// Sample wishes API
app.get("/api/wishes", (req, res) => {
  res.json([
    { id: 1, text: "Wish for world peace" },
    { id: 2, text: "Wish for good health" },
  ]);
});

app.listen(PORT, () => {
  console.log(`WishWall backend running on port ${PORT}`);
});
