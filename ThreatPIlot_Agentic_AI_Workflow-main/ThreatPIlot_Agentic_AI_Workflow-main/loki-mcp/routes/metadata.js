import express from "express";
const router = express.Router();

router.post("/metadata_lookup", (req, res) => {
    const { key, type } = req.body;

    if (!key) return res.status(400).json({ error: "key is required" });

    // Mock metadata enrichment
    const metadata = {
        key,
        type: type || "unknown",
        location: "US-East",
        owner: "Unknown",
    };

    res.json(metadata);
});

export default router;
