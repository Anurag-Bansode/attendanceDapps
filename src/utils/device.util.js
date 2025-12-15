import crypto from "crypto";

export function getDeviceId(req, res) {
  let id = req.cookies.device_id;

  if (!id) {
    id = crypto.randomUUID();
    res.cookie("device_id", id, {
      // Secure cookie settings
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax" 
    });
  }

  return id;
}
