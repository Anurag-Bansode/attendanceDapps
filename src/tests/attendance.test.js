import { api } from "./helpers/setup.js";
import { readCSV, clearLogs } from "./helpers/csv.utils.js";

beforeEach(() => {
  clearLogs();
});

test("records attendance after captcha success", async () => {
  // Create session
  await api.post("/admin/session").send({
    workshop: "WS",
    day: 1,
    session: 1,
    duration_minutes: 10
  });

  // Fake nonce injection (test-only shortcut)
  const nonce = "test-nonce";
  global.nonceStore.set(nonce, {
    sessionId: "WS-D1-S1",
    expiresAt: Date.now() + 10000
  });

  // Scan
  const res = await api.post("/scan").send({ nonce });
  expect(res.statusCode).toBe(200);

  const attendance = readCSV("attendance.csv");
  expect(attendance.length).toBe(1);
});
