const crypto = require("crypto");

function getDeviceId(req) {
  const ua = req.headers["user-agent"] || "";
  const lang = req.headers["accept-language"] || "";
  const ip =
    (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
      .split(",")[0]
      .trim();

  return crypto
    .createHash("sha256")
    .update(`${ua}|${lang}|${ip}`)
    .digest("hex");
}

module.exports = { getDeviceId };
