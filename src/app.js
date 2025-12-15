import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./config.js";

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

app.use(express.static("src/public"));

app.use("/checkin", checkinRoutes);
app.use("/scan", scanRoutes);
app.use("/identity", identityRoutes);
app.use("/admin", adminRoutes);
app.use("/qr",qrRoutes);
app.use("/qr",qrRoutes);


app.listen(PORT, () => {
  alert(process.env.PORT)
  alert(process.env.RP_NAME)
  alert(process.env.RP_ID)
});

//export default app;