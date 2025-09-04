import jwt from "jsonwebtoken";

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log("[JWT] Authorization header:", authHeader);
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    console.log("[JWT] Token:", token);
    jwt.verify(
      token,
      process.env.JWT_SECRET || "wishwall_secret",
      (err, user) => {
        if (err) {
          console.log("[JWT] Verification error:", err);
          return res.status(403).json({ error: "Invalid token" });
        }
        console.log("[JWT] Decoded user:", user);
        req.user = user;
        next();
      }
    );
  } else {
    console.log("[JWT] No or invalid Authorization header");
    res.status(401).json({ error: "Unauthorized" });
  }
}

export const requireAuth = authenticateJWT;
