import express from "express";
const router = express.Router();

/* Registration */
router.get("/", (req, res) => {

    return res.redirect(
    `/index.html`
  );
});




export default router;
