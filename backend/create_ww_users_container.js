import { CosmosClient } from "@azure/cosmos";
import dotenv from "dotenv";

dotenv.config();

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

const databaseId = process.env.COSMOS_DATABASE_ID;
const containerId = "ww_users";
const partitionKey = "/email";

async function createContainer() {
  try {
    const { database } = await client.databases.createIfNotExists({
      id: databaseId,
    });
    console.log(`Database ready: ${databaseId}`);
    const { container } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: { paths: [partitionKey] },
    });
    console.log(`Container created: ${containerId}`);
  } catch (err) {
    console.error("Error creating container:", err.message);
  }
}

createContainer();
