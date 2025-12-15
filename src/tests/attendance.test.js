import { api } from "./helpers/setup.js";
import { readCSV, clearLogs } from "./helpers/csv.utils.js";
import nonceStore from "../stores/nonce.store.js";
import identityStore from "../stores/identity.store.js";

beforeEach(() => {
  clearLogs();
  nonceStore.clear();
  identityStore.clear();
});

test("records attendance after captcha success", async () => {
  // Create session
  await api.post("/admin/session").send({
    workshop: "WS",
    day: 1,
    session: 1,
    duration_minutes: 10
  });

  // Step 1: Register a device to get a device_id cookie and create an identity
  const registerRes = await api
    .post("/identity/register")
    .send({ name: "Test User", email: "test@example.com" });

  expect(registerRes.statusCode).toBe(200);
  const cookie = registerRes.headers['set-cookie']; // Grab the cookie

  // Step 2: Fake nonce injection (test-only shortcut)
  const nonce = "test-nonce";
  nonceStore.set(nonce, {
    sessionId: "WS-D1-S1",
    expiresAt: Date.now() + 10000
  });

  // Step 3: Scan with the device_id cookie
  const res = await api.post("/scan")
    .set('Cookie', cookie) // Use the cookie from registration
    .send({ nonce });
  expect(res.statusCode).toBe(200);

  const attendance = readCSV("attendance.csv");
  expect(attendance.length).toBe(1);
});
