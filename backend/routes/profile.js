import express from "express";
import multer from "multer";
import { BlobServiceClient } from "@azure/storage-blob";

const router = express.Router();
const upload = multer();

// Helper to get Cosmos container
function getUserContainer(req) {
  const cosmosClient = req.app.get("cosmosClient");
  const databaseId = req.app.get("cosmosDatabaseId");
  return cosmosClient.database(databaseId).container("ww_users");
}

// Upload profile picture to Azure Blob Storage
router.post("/upload", upload.single("profilepicture"), async (req, res) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    const containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME
    );
    const blobName = `${Date.now()}-${req.file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });
    const blobUrl = blockBlobClient.url;
    res.json({ url: blobUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user's profilepicture URL in Cosmos DB
router.post("/set-profile-picture", async (req, res) => {
  const { email, profilepicture } = req.body;
  try {
    const container = getUserContainer(req);
    const query = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }],
    };
    const { resources } = await container.items.query(query).fetchAll();
    if (resources.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = resources[0];
    user.profilepicture = profilepicture;
    await container.item(user.id, user.id).replace(user);
    res.json({ message: "Profile picture updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
