import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const sourceBatchId = "seed_batch_001";

    console.log("Cleaning up database...");
    await prisma.reportItem.deleteMany();
    await prisma.reportSection.deleteMany();
    await prisma.report.deleteMany();
    await prisma.alerts.deleteMany();
    await prisma.solutionFrameworks.deleteMany();
    await prisma.predictiveIndicators.deleteMany();
    await prisma.patternResults.deleteMany();
    await prisma.trendResults.deleteMany();
    await prisma.anomalyResults.deleteMany();
    await prisma.derivedMetrics.deleteMany();
    await prisma.baselineData.deleteMany();
    await prisma.aggregatedAadhaarMetric.deleteMany();
    await prisma.cleanedAadhaarRawData.deleteMany();
    await prisma.mLJobRun.deleteMany();
    await prisma.user.deleteMany();
    console.log("Database cleaned.");

    /* =========================
       USER
    ========================= */
    const user = await prisma.user.create({
        data: {
            email: "rajataggarwal20820@gmail.com",
            name: "System Admin",
            role: "admin",
            twoFactorEnabled: true,
        },
    });

    /* =========================
       CLEANED RAW DATA
    ========================= */
    await prisma.cleanedAadhaarRawData.create({
        data: {
            date: new Date("2024-01-01"),
            year: 2024,
            month: 1,
            state: "Delhi",
            district: "Central Delhi",
            pincode: "110001",
            metricCategory: "enrolment",
            ageGroup: "age_18_plus",
            count: 12000,
            sourceBatchId,
        },
    });

    /* =========================
       AGGREGATED METRIC
    ========================= */
    await prisma.aggregatedAadhaarMetric.create({
        data: {
            year: 2024,
            month: 1,
            state: "Delhi",
            district: "Central Delhi",
            metricCategory: "enrolment",
            ageGroup: "age_18_plus",
            totalCount: 12000,
            sourceBatchId,
        },
    });

    /* =========================
       BASELINE DATA
    ========================= */
    await prisma.baselineData.create({
        data: {
            state: "Delhi",
            district: "Central Delhi",
            metricCategory: "enrolment",
            ageGroup: "age_18_plus",
            baselineValue: 10000,
            lastUpdatedYear: 2024,
            lastUpdatedMonth: 1,
            baselineVersion: "v1",
        },
    });

    /* =========================
       DERIVED METRICS
    ========================= */
    await prisma.derivedMetrics.create({
        data: {
            year: 2024,
            month: 1,
            state: "Delhi",
            district: "Central Delhi",
            metricCategory: "enrolment",
            ageGroup: "age_18_plus",
            growthRate: 0.12,
            deviationFromBaseline: 2000,
            spikeRatio: 1.2,
            volatility: 0.15,
            demandPressureIndex: 0.7,
            operationalStressIndex: 0.6,
            updateAccessibilityGap: 0.2,
            compositeRiskScore: 0.63,
            sourceBatchId,
        },
    });

    /* =========================
       ANOMALY RESULT
    ========================= */
    await prisma.anomalyResults.create({
        data: {
            year: 2024,
            month: 1,
            state: "Delhi",
            district: "Central Delhi",
            metricCategory: "enrolment",
            ageGroup: "age_18_plus",
            isAnomaly: true,
            anomalyScore: 0.82,
            anomalySeverity: "high",
            anomalyConfidence: 0.91,
            sourceBatchId,
        },
    });

    /* =========================
       TREND RESULT
    ========================= */
    await prisma.trendResults.create({
        data: {
            year: 2024,
            month: 1,
            state: "Delhi",
            district: "Central Delhi",
            metricCategory: "enrolment",
            ageGroup: "age_18_plus",
            trendDirection: "increasing",
            trendSlope: 0.18,
            trendStrength: 0.85,
            trendConfidence: 0.88,
            sourceBatchId,
        },
    });

    /* =========================
       PATTERN RESULT
    ========================= */
    await prisma.patternResults.create({
        data: {
            year: 2024,
            month: 1,
            state: "Delhi",
            district: "Central Delhi",
            metricCategory: "enrolment",
            ageGroup: "age_18_plus",
            hasPattern: true,
            dominantPatternType: "seasonal",
            patternStrength: 0.79,
            patternConfidence: 0.83,
            sourceBatchId,
        },
    });

    /* =========================
       PREDICTIVE INDICATOR
    ========================= */
    await prisma.predictiveIndicators.create({
        data: {
            year: 2024,
            month: 1,
            state: "Delhi",
            district: "Central Delhi",
            metricCategory: "enrolment",
            ageGroup: "age_18_plus",
            riskSignal: "risk_building",
            riskScore: 0.72,
            predictionConfidence: 0.81,
            contributingFactors: "High enrolment surge",
            sourceBatchId,
        },
    });

    /* =========================
       SOLUTION FRAMEWORK
    ========================= */
    await prisma.solutionFrameworks.create({
        data: {
            year: 2024,
            month: 1,
            state: "Delhi",
            district: "Central Delhi",
            metricCategory: "enrolment",
            ageGroup: "age_18_plus",
            frameworkType: "capacity_augmentation",
            frameworkConfidence: 0.87,
            rationale: "Sustained demand pressure detected",
            drivingIndexes: "DPI, OSI",
            predictiveSignal: "risk_building",
            sourceBatchId,
        },
    });

    /* =========================
       ALERT
    ========================= */
    await prisma.alerts.create({
        data: {
            year: 2024,
            month: 1,
            state: "Delhi",
            district: "Central Delhi",
            alertType: "anomaly",
            severity: "high",
            title: "Critical enrolment anomaly",
            message: "Unexpected spike detected in enrolment volume",
            confidenceScore: 0.9,
            sourceBatchId,
        },
    });


    /* =========================
       ML JOB RUN
    ========================= */
    await prisma.mLJobRun.create({
        data: {
            triggeredBy: "sync_button",
            status: "completed",
            startedAt: new Date(),
            completedAt: new Date(),
        },
    });

    console.log("✅ Database seeded successfully");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
