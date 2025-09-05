import express from "express";
import pkg from "@azure/communication-email";
const { EmailClient } = pkg;

const COMMUNICATION_SERVICES_CONNECTION_STRING =
  process.env.AZURE_COMMUNICATION_CONNECTION_STRING;

const router = express.Router();

// Helper to get Cosmos container
function getUserContainer(req) {
  const cosmosClient = req.app.get("cosmosClient");
  const databaseId = req.app.get("cosmosDatabaseId");
  return cosmosClient.database(databaseId).container("ww_users");
}

// Change route to root so POST /api/forgot-password works
router.post("/", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  try {
    const container = getUserContainer(req);
    const query = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }],
    };
    const { resources } = await container.items.query(query).fetchAll();
    if (resources.length === 0) {
      return res.status(404).json({ error: "No user found with this email" });
    }
    const user = resources[0];
    const client = new EmailClient(COMMUNICATION_SERVICES_CONNECTION_STRING);
    const emailMessage = {
      senderAddress:
        "DoNotReply@5086a98d-0c75-4bc7-8628-2e2cf90dca53.azurecomm.net", // Azure verified sender
      content: {
        subject: "WishWall Password Reset",
        plainText: `Hello ${
          user.firstName || user.email
        },\nYour WishWall password is: ${user.password}`,
        html: getForgotPasswordHtml(user),
      },
      recipients: {
        to: [{ address: user.email }],
      },
    };
    const poller = await client.beginSend(emailMessage);
    await poller.pollUntilDone();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getForgotPasswordHtml(user) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
      <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #eee; padding: 32px;">
        <h2 style="color: #8B5CF6;">WishWall Password Reset</h2>
        <p>Hello <b>${user.firstName || user.email}</b>,</p>
        <p>We received a request to reset your WishWall password. If you did not request this, you can ignore this email.</p>
        <p style="margin: 24px 0;">Your WishWall account details:</p>
        <ul style="color: #444;">
          <li><b>Email:</b> ${user.email}</li>
          <li><b>Password:</b> ${user.password}</li>
        </ul>
        <p style="margin-top: 32px; color: #888; font-size: 13px;">For security, we recommend changing your password after logging in.</p>
        <p style="margin-top: 24px; font-size: 12px; color: #aaa;">&copy; ${new Date().getFullYear()} WishWall</p>
      </div>
    </div>
  `;
}

export default router;
