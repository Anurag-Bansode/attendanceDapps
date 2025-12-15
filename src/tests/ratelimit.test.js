import { api } from "./helpers/setup.js";
import { readCSV, clearLogs } from "./helpers/csv.utils.js";

beforeEach(() => {
  clearLogs();
});

test("blocks third scan attempt in same session", async () => {
  const nonce = "rl-nonce";
  global.nonceStore.set(nonce, {
    sessionId: "WS-D1-S1",
    expiresAt: Date.now() + 10000
  });

  await api.post("/scan").send({ nonce });
  await api.post("/scan").send({ nonce });

  const res = await api.post("/scan").send({ nonce });
  expect(res.statusCode).toBe(429);

  const audit = readCSV("audit_log.csv");
  expect(audit.some(r => r.includes("RATE_LIMIT_EXCEEDED"))).toBe(true);
});
