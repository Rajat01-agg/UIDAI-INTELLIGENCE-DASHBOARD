import express from "express";
import bodyParser from "body-parser";
import { PORT } from "./config/index.js";

import logsRouter from "./routes/logs.js";
import labelsRouter from "./routes/labels.js";
import alertsRouter from "./routes/alerts.js";
import metadataRouter from "./routes/metadata.js";
import incidentsRouter from "./routes/incidents.js";

const app = express();
app.use(bodyParser.json());


app.get('/health', (req, res) => {
    res.send("Loki APIs are listening...");
})
app.use("/", logsRouter);
app.use("/", labelsRouter);
app.use("/", alertsRouter);
app.use("/", metadataRouter);
app.use("/", incidentsRouter);

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Loki MCP running on :${PORT}`);
});
