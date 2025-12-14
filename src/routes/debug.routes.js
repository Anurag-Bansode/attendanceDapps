const express = require("express");
const { summary } = require("../services/attendance.service");

const router = express.Router();

router.get("/attendance", (req, res) => {
  res.json(summary());
});

module.exports = router;
