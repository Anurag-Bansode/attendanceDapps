import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createSession } from "../services/session.service.js";
import { summary as getAttendanceSummary, getFullLog } from "../services/attendance.service.js";
import { getAllIdentities } from "../services/identity.service.js";
import { logger } from "../utils/logger.js";
import asyncHandler from "../utils/asyncHandler.js";
import { stringify } from "csv-stringify";
import Attendance from "../models/attendance.model.js";

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

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance-log.csv"');

  // 1. Use MongoDB aggregation to join attendance with identities efficiently.
  const attendanceWithIdentities = await Attendance.aggregate([
    { $sort: { scannedAt: 1 } },
    {
      $lookup: {
        from: 'identities', // The name of the identities collection
        localField: 'deviceId',
        foreignField: '_id',
        as: 'identityInfo'
      }
    },
    {
      $unwind: { // Deconstruct the identityInfo array
        path: '$identityInfo',
        preserveNullAndEmptyArrays: true // Keep attendance records even if no identity is found
      }
    },
    {
      $project: { // Shape the final output
        _id: 0,
        sessionId: '$sessionId',
        deviceId: '$deviceId',
        name: { $ifNull: ['$identityInfo.name', 'N/A'] },
        email: { $ifNull: ['$identityInfo.email', 'N/A'] },
        timestamp: '$scannedAt'
      }
    }
  ]);

  // 2. Use a robust CSV library to generate the output and stream it.
  const stringifier = stringify({ header: true, columns: ['sessionId', 'deviceId', 'name', 'email', 'timestamp'] });
  stringifier.pipe(res);
  attendanceWithIdentities.forEach(row => stringifier.write(row));
  stringifier.end();
}));

router.get("/attendance/summary-csv", asyncHandler(async (req, res) => {
  logger.info("Request received for attendance summary CSV download");

  const allIdentities = await getAllIdentities();
  const detailedLog = await getFullLog();

  // 1. Use an aggregation to get all unique, sorted session IDs directly from the DB.
  const sessionIdsResult = await Attendance.aggregate([
    { $group: { _id: '$sessionId' } },
    { $sort: { _id: 1 } },
    { $group: { _id: null, ids: { $push: '$_id' } } }
  ]);
  const allSessionIds = sessionIdsResult.length > 0 ? sessionIdsResult[0].ids : [];

  // 2. Use aggregation to create the attendance lookup map efficiently.
  const attendanceByDevice = await Attendance.aggregate([
    { $group: { _id: '$deviceId', sessions: { $addToSet: '$sessionId' } } }
  ]);
  const attendanceLookup = new Map(attendanceByDevice.map(item => [item._id, new Set(item.sessions)]));

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance-summary.csv"');

  // 3. Create the dynamic CSV header and initialize the stringifier.
  const columns = ["name", "email", "deviceId", ...allSessionIds];
  const stringifier = stringify({ header: true, columns });
  stringifier.pipe(res);

  // 4. Build and stream a row for each registered user.
  for (const [deviceId, identity] of Object.entries(allIdentities)) {
    const attendedSessions = attendanceLookup.get(deviceId) || new Set();
    const row = {
      name: identity.name,
      email: identity.email,
      deviceId: deviceId
    };

    allSessionIds.forEach(sessionId => row[sessionId] = attendedSessions.has(sessionId) ? 'P' : '');
    stringifier.write(row);
  }
  stringifier.end();
}));

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin.html"));
});

export default router;
