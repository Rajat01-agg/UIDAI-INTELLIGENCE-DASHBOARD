import { lokiClient } from "../config/index.js";

// Wrapper functions for Loki API
export const pushLogs = async (streams) => {
    return lokiClient.post("/loki/api/v1/push", { streams });
};

export const getLabels = async () => {
    const now = Date.now() * 1_000_000;
    const oneHourAgo = (Date.now() - 60 * 60 * 1000) * 1_000_000;

    return lokiClient.get("/loki/api/v1/labels", {
        params: {
            start: oneHourAgo,
            end: now,
        },
    });
};

export const getLabelValues = async (label) => {
    const now = Date.now() * 1_000_000;
    const oneHourAgo = (Date.now() - 60 * 60 * 1000) * 1_000_000;

    return lokiClient.get(`/loki/api/v1/label/${label}/values`, {
        params: {
            start: oneHourAgo,
            end: now,
        },
    });
};


export const queryRange = async (params) => {
    return lokiClient.get("/loki/api/v1/query_range", { params });
};
