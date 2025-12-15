import express from "express";
import { createSession } from "../services/session.service.js";
import { summary as getAttendanceSummary, getFullLog } from "../services/attendance.service.js";
import { getIdentity } from "../services/identity.service.js";
import { logger } from "../utils/logger.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/session", asyncHandler((req, res) => {
  const { workshop, day, session, duration_minutes } = req.body;
  const sessionId = `${workshop}-D${day}-S${session}`;

  logger.info("Received request to create session", { workshop, day, session, duration_minutes }); 

  createSession(sessionId, duration_minutes);
  logger.info("Session created successfully", { sessionId });
  res.json({ success: true, sessionId });
}));

router.get("/attendance", (req, res) => {
  logger.info("Request received for attendance log");
  const summary = getAttendanceSummary();
  const detailed = getFullLog();
  res.json({ summary, detailed });
});

router.get("/attendance/csv", (req, res) => {
  logger.info("Request received for attendance log CSV download");
  const detailedLog = getFullLog();
  
  const csvRows = [];
  // CSV Header
  csvRows.push("Session ID,Device ID,Name,Email (Hashed),Timestamp");

  // Process each session and its attendance records
  for (const [sessionId, records] of Object.entries(detailedLog)) {
    for (const record of records) {
      const identity = getIdentity(record.deviceId) || { name: 'N/A', emailHash: 'N/A' };
      const timestamp = new Date(record.scannedAt).toISOString();

      // Sanitize data to prevent CSV injection by escaping quotes
      const sanitizedSessionId = `"${sessionId.replace(/"/g, '""')}"`;
      const sanitizedDeviceId = `"${record.deviceId.replace(/"/g, '""')}"`;
      const sanitizedName = `"${identity.name.replace(/"/g, '""')}"`;

      csvRows.push([sanitizedSessionId, sanitizedDeviceId, sanitizedName, identity.emailHash, timestamp].join(','));
    }
  }

  const csvString = csvRows.join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance-log.csv"');
  res.status(200).end(csvString);
});

router.get("/", (req, res) => {
  res.sendFile("admin.html", { root: "src/public" });
});

export default router;
