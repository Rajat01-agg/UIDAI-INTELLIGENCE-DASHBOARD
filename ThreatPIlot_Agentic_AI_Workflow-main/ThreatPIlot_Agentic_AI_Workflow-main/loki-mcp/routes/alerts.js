import express from "express";
const router = express.Router();


router.post("/alert_trigger", (req, res) => {
    const { severity, message, target } = req.body;

    if (!severity || !message) {
        return res.status(400).json({ error: "severity and message are required" });
    }

    console.log(`[ALERT] Severity: ${severity}, Message: ${message}, Target: ${target || "N/A"}`);

    res.json({ status: "alert logged", message: `[ALERT] Severity: ${severity}, Message: ${message}, Target: ${target || "N/A"}` });
});

export default router;
