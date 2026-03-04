import express from "express";
const router = express.Router();

// POST /incident_history
router.post("/incident_history", (req, res) => {
    const { entity, timeframe } = req.body;

    // Mock incident history
    const history = [
        { timestamp: Date.now() - 3600000, severity: "High", message: "Failed login attempts", entity: entity || "Unknown" },
        { timestamp: Date.now() - 7200000, severity: "Medium", message: "CPU spike detected", entity: entity || "Unknown" },
    ];

    res.json(history);
});

export default router;
