const { v4: uuidv4 } = require("uuid");

function getDeviceId(req, res) {
  let deviceId = req.cookies.device_id;

  if (!deviceId) {
    deviceId = uuidv4();
    res.cookie("device_id", deviceId, {
      httpOnly: true,
      sameSite: "Lax"
    });
  }

  return deviceId;
}

module.exports = { getDeviceId };
