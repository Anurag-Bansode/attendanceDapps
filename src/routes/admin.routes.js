import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createSession } from "../services/session.service.js";
import { summary as getAttendanceSummary, getFullLog } from "../services/attendance.service.js";
import { getAllIdentities } from "../services/identity.service.js";
import { getIdentity } from "../services/identity.service.js";
import { logger } from "../utils/logger.js";
import asyncHandler from "../utils/asyncHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post("/session", asyncHandler(async (req, res) => {
  const { workshop, day, session, duration_minutes } = req.body;
  const sessionId = `${workshop}-D${day}-S${session}`;

  logger.info("Received request to create session", { workshop, day, session, duration_minutes }); 

  await createSession(sessionId, duration_minutes);
  logger.info("Session created successfully", { sessionId });
  res.json({ success: true, sessionId });
}));

router.get("/attendance", asyncHandler(async (req, res) => {
  logger.info("Request received for attendance log");
  const summary = await getAttendanceSummary();
  const detailed = await getFullLog();
  res.json({ summary, detailed });
}));

router.get("/attendance/csv", asyncHandler(async (req, res) => {
  logger.info("Request received for attendance log CSV download");
  const detailedLog = await getFullLog();
  
  const csvRows = [];
  // CSV Header
  csvRows.push("Session ID,Device ID,Name,Email,Timestamp");

  // Process each session and its attendance records
  for (const [sessionId, records] of Object.entries(detailedLog)) {
    for (const record of records) {
      const identity = await getIdentity(record.deviceId) || { name: 'N/A', email: 'N/A' };
      const timestamp = new Date(record.at || record.scannedAt).toISOString();

      // Sanitize data to prevent CSV injection by escaping quotes
      const sanitizedSessionId = `"${sessionId.replace(/"/g, '""')}"`;
      const sanitizedDeviceId = `"${record.deviceId.replace(/"/g, '""')}"`;
      const sanitizedName = `"${identity.name.replace(/"/g, '""')}"`;

      csvRows.push([sanitizedSessionId, sanitizedDeviceId, sanitizedName, identity.email, timestamp].join(','));
    }
  }

  const csvString = csvRows.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance-log.csv"');
  res.status(200).end(csvString);
}));

router.get("/attendance/summary-csv", asyncHandler(async (req, res) => {
  logger.info("Request received for attendance summary CSV download");

  const allIdentities = await getAllIdentities();
  const detailedLog = await getFullLog();

  // 1. Find all unique session IDs from the log and sort them to ensure consistent column order.
  const allSessionIds = Object.keys(detailedLog).sort();

  // 2. Create an efficient lookup map of which devices attended which sessions.
  const attendanceLookup = new Map(); // Map<deviceId, Set<sessionId>>
  for (const [sessionId, records] of Object.entries(detailedLog)) {
    for (const record of records) {
      if (!attendanceLookup.has(record.deviceId)) {
        attendanceLookup.set(record.deviceId, new Set());
      }
      attendanceLookup.get(record.deviceId).add(sessionId);
    }
  }

  const csvRows = [];
  // 3. Create the dynamic CSV header.
  const header = ["Name", "Email", "Device ID", ...allSessionIds];
  csvRows.push(header.join(','));

  // 4. Build a row for each registered user.
  for (const [deviceId, identity] of Object.entries(allIdentities)) {
    const attendedSessions = attendanceLookup.get(deviceId) || new Set();
    const row = [
      `"${identity.name.replace(/"/g, '""')}"`,
      `"${identity.email.replace(/"/g, '""')}"`,
      `"${deviceId.replace(/"/g, '""')}"`
    ];

    // For each session column, mark 'P' for present or leave blank.
    allSessionIds.forEach(sessionId => row.push(attendedSessions.has(sessionId) ? 'P' : ''));
    csvRows.push(row.join(','));
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance-summary.csv"');
  res.status(200).end(csvRows.join('\n'));
}));

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin.html"));
});

export default router;
