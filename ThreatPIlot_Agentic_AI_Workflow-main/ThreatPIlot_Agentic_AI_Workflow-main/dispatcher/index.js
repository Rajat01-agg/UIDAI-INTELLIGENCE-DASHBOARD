const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

// API Key for On-Demand
const API_KEY = process.env.API_KEY;

// Base URL for On-Demand API
const BASE_URL = "https://api.on-demand.io/automation/api/workflow";

// Base headers
const axiosHeaders = {
    "Content-Type": "application/json",
    apikey: API_KEY
};

/**
 * Endpoint: Infra Flow
 * Workflow ID: 696a7a758e6b21cb8aea4d2b
 */
app.post("/infra-flow", async (req, res) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/696a7a758e6b21cb8aea4d2b/execute`,
            req.body,
            { headers: axiosHeaders }
        );
        res.json({ status: "success", data: response.data });
    } catch (err) {
        console.error("Infra Flow Error:", err.response?.data || err.message);
        res.status(500).json({
            status: "error",
            error: err.message,
            details: err.response?.data
        });
    }
});

/**
 * Endpoint: Network Flow
 * Workflow ID: 696a773d8e6b21cb8aea4c99
 */
app.post("/network-flow", async (req, res) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/696a773d8e6b21cb8aea4c99/execute`,
            req.body,
            { headers: axiosHeaders }
        );
        res.json({ status: "success", data: response.data });
    } catch (err) {
        console.error("Network Flow Error:", err.response?.data || err.message);
        res.status(500).json({
            status: "error",
            error: err.message,
            details: err.response?.data
        });
    }
});

/**
 * Endpoint: Auth Flow
 * Workflow ID: 696a7acf8e6b21cb8aea4d56
 */
app.post("/auth-flow", async (req, res) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/696a7acf8e6b21cb8aea4d56/execute`,
            req.body,
            { headers: axiosHeaders }
        );
        res.json({ status: "success", data: response.data });
    } catch (err) {
        console.error("Auth Flow Error:", err.response?.data || err.message);
        res.status(500).json({
            status: "error",
            error: err.message,
            details: err.response?.data
        });
    }
});

// Health check
app.get("/health", (_, res) => res.json({ status: "Dispatcher is working..." }));

// Generic workflow executor for dispatcher agent
app.post("/execute-workflow", async (req, res) => {
    try {
        const { workflowId, payload } = req.body;

        if (!workflowId) {
            return res.status(400).json({
                status: "error",
                error: "workflowId is required"
            });
        }

        const response = await axios.post(
            `${BASE_URL}/${workflowId}/execute`,
            payload || {},
            { headers: axiosHeaders }
        );

        res.json({ status: "success", data: response.data });
    } catch (err) {
        console.error("Workflow Execution Error:", err.response?.data || err.message);
        res.status(500).json({
            status: "error",
            error: err.message,
            details: err.response?.data
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Dispatcher running on port ${PORT}`));
