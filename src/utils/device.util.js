import crypto from "crypto";

export function getDeviceId(req, res) {
  let id = req.cookies.device_id;

  if (!id) {
    id = crypto.randomUUID();
    res.cookie("device_id", id, {
      httpOnly: true,
      sameSite: "Lax"
    });
  }

  return id;
}
