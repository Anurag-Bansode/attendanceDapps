import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session"; 
import { PORT, SESSION_SECRET, NODE_ENV } from "./config.js"; 
import { logger } from "./utils/logger.js"; 

import checkinRoutes from "./routes/checkin.routes.js";
import scanRoutes from "./routes/scan.routes.js";
import identityRoutes from "./routes/identity.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import healthcheck from "./routes/healthcheck.routes.js"; 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({ 
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" } 
  })
);

app.use(express.static("src/public"));

app.use("/checkin", checkinRoutes);
app.use("/scan", scanRoutes);
app.use("/identity", identityRoutes);
app.use("/admin", adminRoutes);
app.use("/qr",qrRoutes);
app.use("/health",healthcheck);

// Global error handling middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error
  logger.error(err.message, { 
    statusCode: err.statusCode, 
    status: err.status, 
    stack: err.stack 
  });

  const errorResponse = {
    status: err.status,
    error: err.message,
  };

  if (NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
  }

  res.status(err.statusCode).json(errorResponse);
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

export default app;
