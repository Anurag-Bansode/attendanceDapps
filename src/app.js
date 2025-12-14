const express = require("express");
const { PORT } = require("./config");
require("./utils/scheduler");

const app = express();
app.use(express.json());

app.use("/admin", require("./routes/admin.routes"));
app.use("/qr", require("./routes/qr.routes"));
app.use("/scan", require("./routes/scan.routes"));
app.use("/debug", require("./routes/debug.routes"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
