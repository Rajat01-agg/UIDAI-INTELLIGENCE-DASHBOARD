import dotenv from "dotenv";
import axios from "axios";

if (process.env.NODE_ENV !== "production") dotenv.config();

export const PORT = process.env.PORT || 3000;
export const LOKI_ADDR = process.env.LOKI_ADDR;
export const LOKI_AUTH = {
    username: process.env.LOKI_USERNAME,
    password: process.env.LOKI_PASSWORD,
};

export const lokiClient = axios.create({
    baseURL: LOKI_ADDR,
    auth: LOKI_AUTH,
    headers: { "Content-Type": "application/json" },
    timeout: 10000,
});
