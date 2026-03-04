import express from "express";
import { getLabels, getLabelValues } from "../services/loki.js";
const router = express.Router();

router.get("/get_labels", async (req, res) => {
    try {
        const r = await getLabels();
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: err.response?.data || err.message });
    }
});

router.post("/get_label_values", async (req, res) => {
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: "label is required" });

    try {
        const r = await getLabelValues(label);
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: err.response?.data || err.message });
    }
});

export default router;
