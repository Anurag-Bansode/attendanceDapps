import express from "express";
import {
  beginRegistration,
  finishRegistration,
  beginAuthentication,
  finishAuthentication
} from "../services/webauthn.service.js";

const router = express.Router();

/* Registration */
router.post("/register/begin", (req, res) => {
  const user = req.session.user; // name, email, id
  res.json(beginRegistration(user));
});

router.post("/register/finish", async (req, res) => {
  try {
    await finishRegistration(req.session.user, req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/* Authentication */
router.post("/auth/begin", (req, res) => {
  res.json(beginAuthentication(req.session.user.id));
});

router.post("/auth/finish", async (req, res) => {
  try {
    await finishAuthentication(req.session.user.id, req.body);
    res.json({ success: true });
  } catch {
    res.status(401).json({ error: "Authentication failed" });
  }
});

export default router;
