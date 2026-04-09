
import { Router, Request, Response } from "express";
import { generateAdminToken, verifyAdminPassword, verifyAdminToken } from "./adminAuth";

const router = Router();

// POST /api/admin/login - Authenticate with password
router.post("/login", async (req: Request, res: Response) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  const isValid = await verifyAdminPassword(password);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = generateAdminToken();
  res.json({ token });
});

// GET /api/admin/verify - Verify admin token
router.get("/verify", (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const decoded = verifyAdminToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid token" });
  }

  res.json({ valid: true });
});

export default router;
