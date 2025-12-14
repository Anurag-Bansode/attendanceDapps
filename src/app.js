const express = require("express");
const { PORT } = require("./config");
const cookieParser = require("cookie-parser");

require("./utils/scheduler");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require("cookie-parser")());
app.use("/admin", require("./routes/admin.routes"));
app.use("/qr", require("./routes/qr.routes"));
app.use("/scan", require("./routes/scan.routes"));
app.use("/debug", require("./routes/debug.routes"));
app.use("/identity", require("./routes/identity.routes"));
app.use("/checkin", require("./routes/checkin.routes"));


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
