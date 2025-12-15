import express from "express";
import nonceStore from "../stores/nonce.store.js";
import { getDeviceId } from "../utils/device.util.js";
import { getIdentity } from "../services/identity.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  const { nonce } = req.query;

  if (!nonce || !nonceStore.has(nonce)) {
    return res.sendFile("error.html", { root: "src/public" });
  }

  const { sessionId } = nonceStore.get(nonce);
  const deviceId = getDeviceId(req, res);
  const identity = getIdentity(deviceId);

  if (!identity) {
    return res.redirect(
      `/register.html?nonce=${nonce}&session=${sessionId}`
    );
  }

  return res.redirect(
    `/captcha.html?nonce=${nonce}&session=${sessionId}`
  );
});

export default router;
