import cron from "node-cron";
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';

if (process.env.NODE_ENV != "production") {
    dotenv.config();
}

const WORKFLOW_URL = process.env.WORKFLOW_URL;
const API_KEY = process.env.API_KEY;

cron.schedule("*/10 * * * *", async () => {
    try {
        const executionId = `cmd - ${uuid()}`;
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - 10 * 60 * 1000);

        console.log(`${startTime} - ${endTime} :: ${executionId} `)

        const prompt = `Analyze the security logs from the past 10 minutes across all domains (Identity, HTTP, Infrastructure). 

                        Use the Loki MCP API to:
                        1. Discover all available services and log labels
                        2. Query ALL logs from the last 10 minutes
                        3. Detect any security incidents or anomalies
                        4. Apply SOC detection patterns and thresholds
                        5. Generate a comprehensive security analysis

                        Provide both:
                        - Machine-readable JSON findings output
                        - Professional security analyst report (300-500 words)

                        Focus on identifying brute force attacks, credential stuffing, DDoS patterns, service crashes, and any other security-relevant events.`;

        const response = await fetch(WORKFLOW_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: API_KEY,
            },
            body: JSON.stringify({
                prompt: prompt,
            }),
        });

        const data = await response.json();

        console.log("Workflow triggered successfully:", data);
    } catch (error) {
        console.error("Failed to trigger workflow:", error);
    }
});

console.log("Cron job started: workflow will run every 10 minutes");