import { api } from "./helpers/setup.js";
import { clearLogs, readCSV } from "./helpers/csv.utils.js";

beforeEach(() => {
  clearLogs();
});

test("registers identity on first scan", async () => {
  const res = await api
    .post("/identity/register")
    .send({ name: "Test User", email: "test@example.com" });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);

  const audit = readCSV("audit_log.csv");
  expect(audit.some(row => row.includes("IDENTITY_REGISTERED"))).toBe(true);
});
