import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// Helper to get Cosmos container
function getUserContainer(req) {
  const cosmosClient = req.app.get("cosmosClient");
  const databaseId = req.app.get("cosmosDatabaseId");
  return cosmosClient.database(databaseId).container("ww_users");
}

// Create user API
router.post("/", async (req, res) => {
  try {
    const container = getUserContainer(req);
    const user = req.body;
    // Ensure user has an 'id' field
    if (!user.id) {
      user.id = Date.now().toString();
    }
    // Check if user already exists
    const query = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: user.email }],
    };
    const { resources } = await container.items.query(query).fetchAll();
    if (resources.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    // Create user
    const { resource } = await container.items.create(user);
    res
      .status(201)
      .json({ message: "User created successfully", user: resource });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const container = getUserContainer(req);
    const query = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }],
    };
    const { resources } = await container.items.query(query).fetchAll();
    if (resources.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const user = resources[0];
    // For demo: plain text password check. In production, use hashing.
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "wishwall_secret",
      { expiresIn: "1d" }
    );
    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
