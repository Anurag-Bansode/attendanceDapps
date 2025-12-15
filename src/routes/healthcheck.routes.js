import express from "express";
import { logger } from "../utils/logger.js"; 
const router = express.Router();
router.get("/", (req, res) => {
    logger.info("Received healthcheck request, redirecting to /index.html", {}); 

    return res.redirect(
    `/index.html`
  );
});
export default router;
