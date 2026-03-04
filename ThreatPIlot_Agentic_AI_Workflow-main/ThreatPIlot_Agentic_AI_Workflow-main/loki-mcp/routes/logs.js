import express from "express";
import { pushLogs, queryRange } from "../services/loki.js";
const router = express.Router();

// Push Logs
router.post("/push_logs", async (req, res) => {
    const { streams } = req.body;
    if (!streams || !Array.isArray(streams))
        return res.status(400).json({ error: "streams array is required" });

    try {
        await pushLogs(streams);
        res.json({ status: "success", ingested_streams: streams.length });
    } catch (err) {
        res.status(500).json({ error: err.response?.data || err.message });
    }
});

// Query Logs
// router.post("/query_loki", async (req, res) => {
//     const { query, from, to, limit, forward } = req.body;
//     if (!query)
//         return res.status(400).json({ error: "query is required" });

//     const now = Date.now() * 1000000; // nanoseconds
//     const fifteenMinutesAgo = (Date.now() - 15 * 60 * 1000) * 1000000; // nanoseconds

//     try {
//         const r = await queryRange({
//             query: query || '{service=~".+"}',
//             start: from || fifteenMinutesAgo,
//             end: to || now,
//             limit: limit || 1000,
//             direction: forward ? "FORWARD" : "BACKWARD",
//         });
//         res.json(r.data);
//     } catch (err) {
//         res.status(500).json({ error: err.response?.data || err.message });
//     }
// });

router.post("/query_loki", async (req, res) => {
    let { query, from, to, limit, forward } = req.body;
    const FALLBACK_WINDOW_HOURS = 2;
    const now = Date.now() * 1_000_000;        // nanoseconds
    const oneHourAgo = (Date.now() - FALLBACK_WINDOW_HOURS * 60 * 60 * 1000) * 1_000_000;

    from = from || oneHourAgo;
    to = to || now;
    limit = limit || 1000;

    // Default query if none provided
    if (!query) query = '{service=~".+"}';

    try {
        // 🔹 Primary query
        const r = await queryRange({
            query,
            start: from,
            end: to,
            limit,
            direction: forward ? "FORWARD" : "BACKWARD",
        });

        return res.json({
            status: "success",
            data: r.data
        });

    } catch (err) {
        console.error("Query failed. Falling back to ALL logs (last 1 hour).");
        console.error(err.response?.data || err.message);

        try {
            // 🔁 Fallback query (ALWAYS succeeds unless Loki is down)
            const fallback = await queryRange({
                query: '{service=~".+"}',
                start: oneHourAgo,
                end: now,
                limit,
                direction: "BACKWARD",
            });

            return res.json({
                status: "success",
                fallback: true,
                message: "Query failed. Showing all logs from last 1 hour.",
                data: fallback.data
            });

        } catch (fallbackErr) {
            // 🚨 Only if Loki itself is broken
            return res.status(500).json({
                error: "Loki query failed",
                details: fallbackErr.response?.data || fallbackErr.message
            });
        }
    }
});

// Tail Logs
router.post("/tail_logs", async (req, res) => {
    const { query, batch } = req.body;
    if (!query) return res.status(400).json({ error: "query is required" });

    try {
        const now = Date.now() * 1000000; // nanoseconds
        const oneMinuteAgo = (Date.now() - 5 * 60 * 1000) * 1000000; // nanoseconds

        const r = await queryRange({
            query,
            start: oneMinuteAgo,
            end: now,
            limit: batch || 50,
            direction: "FORWARD",
        });
        res.json(r.data);
    } catch (err) {
        res.status(500).json({ error: err.response?.data || err.message });
    }
});

// Log Summary
router.post("/log_summary", async (req, res) => {
    const { query, group_by, time_window } = req.body;
    if (!query || !group_by)
        return res.status(400).json({ error: "query and group_by are required" });

    const now = Date.now() * 1000000; // nanoseconds
    const windowStart = (Date.now() - (time_window || 15) * 60 * 1000) * 1000000; // nanoseconds

    try {
        const r = await queryRange({
            query: query || '{service=~".+"}',
            start: windowStart,
            end: now,
            limit: 1000
        });
        const logs = r.data?.data?.result || [];
        const summary = {};
        logs.forEach(stream => {
            const labelValue = stream.stream[group_by] || "unknown";
            summary[labelValue] = (summary[labelValue] || 0) + stream.values.length;
        });
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.response?.data || err.message });
    }
});

export default router;