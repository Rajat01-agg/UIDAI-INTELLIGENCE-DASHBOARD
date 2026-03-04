-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'officer', 'analyst', 'viewer');

-- CreateEnum
CREATE TYPE "MetricCategory" AS ENUM ('enrolment', 'biometric_update', 'demographic_update');

-- CreateEnum
CREATE TYPE "AgeGroup" AS ENUM ('age_0_5', 'age_6_17', 'age_18_plus');

-- CreateEnum
CREATE TYPE "AnomalySeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('increasing', 'decreasing', 'stable');

-- CreateEnum
CREATE TYPE "PatternType" AS ENUM ('none', 'seasonal', 'cyclical', 'reccurring_spikes');

-- CreateEnum
CREATE TYPE "RiskSignal" AS ENUM ('stable', 'risk_building', 'likely_spike');

-- CreateEnum
CREATE TYPE "FrameworkType" AS ENUM ('monitor_only', 'capacity_augmentation', 'operational_stabilisation', 'inclusion_outreach', 'mixed_attention');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('anomaly', 'predictive_warning', 'framework_trigger');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "mobileNumber" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'viewer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleanedAadhaarRawData" (
    "id" BIGSERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "metricCategory" "MetricCategory" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "count" INTEGER NOT NULL,
    "sourceBatchId" TEXT NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CleanedAadhaarRawData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AggregatedAadhaarMetric" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "metricCategory" "MetricCategory" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "sourceBatchId" TEXT NOT NULL,
    "aggregatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AggregatedAadhaarMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaselineData" (
    "id" BIGSERIAL NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "metricCategory" "MetricCategory" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "baselineValue" DOUBLE PRECISION NOT NULL,
    "lastUpdatedYear" INTEGER NOT NULL,
    "lastUpdatedMonth" INTEGER NOT NULL,
    "baselineVersion" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BaselineData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DerivedMetrics" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "metricCategory" "MetricCategory" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "growthRate" DOUBLE PRECISION NOT NULL,
    "deviationFromBaseline" DOUBLE PRECISION NOT NULL,
    "spikeRatio" DOUBLE PRECISION NOT NULL,
    "volatility" DOUBLE PRECISION NOT NULL,
    "demandPressureIndex" DOUBLE PRECISION NOT NULL,
    "operationalStressIndex" DOUBLE PRECISION NOT NULL,
    "updateAccessibilityGap" DOUBLE PRECISION NOT NULL,
    "compositeRiskScore" DOUBLE PRECISION NOT NULL,
    "sourceBatchId" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DerivedMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnomalyResults" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "metricCategory" "MetricCategory" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "isAnomaly" BOOLEAN NOT NULL,
    "anomalyScore" DOUBLE PRECISION NOT NULL,
    "anomalySeverity" "AnomalySeverity" NOT NULL,
    "anomalyConfidence" DOUBLE PRECISION NOT NULL,
    "sourceBatchId" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnomalyResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendResults" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "metricCategory" "MetricCategory" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "trendDirection" "TrendDirection" NOT NULL,
    "trendSlope" DOUBLE PRECISION NOT NULL,
    "trendStrength" DOUBLE PRECISION NOT NULL,
    "trendConfidence" DOUBLE PRECISION NOT NULL,
    "sourceBatchId" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatternResults" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "metricCategory" "MetricCategory" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "hasPattern" BOOLEAN NOT NULL,
    "dominantPatternType" "PatternType" NOT NULL,
    "patternStrength" DOUBLE PRECISION NOT NULL,
    "patternConfidence" DOUBLE PRECISION NOT NULL,
    "sourceBatchId" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatternResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PredictiveIndicators" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "metricCategory" "MetricCategory" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "riskSignal" "RiskSignal" NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "predictionConfidence" DOUBLE PRECISION NOT NULL,
    "contributingFactors" TEXT,
    "sourceBatchId" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PredictiveIndicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolutionFrameworks" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "metricCategory" "MetricCategory" NOT NULL,
    "ageGroup" "AgeGroup" NOT NULL,
    "frameworkType" "FrameworkType" NOT NULL,
    "frameworkConfidence" DOUBLE PRECISION NOT NULL,
    "rationale" TEXT NOT NULL,
    "drivingIndexes" TEXT,
    "predictiveSignal" "RiskSignal",
    "sourceBatchId" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SolutionFrameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerts" (
    "id" BIGSERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL,
    "sourceBatchId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobileNumber_key" ON "User"("mobileNumber");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "CleanedAadhaarRawData_state_district_idx" ON "CleanedAadhaarRawData"("state", "district");

-- CreateIndex
CREATE INDEX "CleanedAadhaarRawData_year_month_idx" ON "CleanedAadhaarRawData"("year", "month");

-- CreateIndex
CREATE INDEX "CleanedAadhaarRawData_metricCategory_ageGroup_idx" ON "CleanedAadhaarRawData"("metricCategory", "ageGroup");

-- CreateIndex
CREATE INDEX "AggregatedAadhaarMetric_state_district_idx" ON "AggregatedAadhaarMetric"("state", "district");

-- CreateIndex
CREATE INDEX "AggregatedAadhaarMetric_year_month_idx" ON "AggregatedAadhaarMetric"("year", "month");

-- CreateIndex
CREATE INDEX "AggregatedAadhaarMetric_metricCategory_ageGroup_idx" ON "AggregatedAadhaarMetric"("metricCategory", "ageGroup");

-- CreateIndex
CREATE UNIQUE INDEX "AggregatedAadhaarMetric_year_month_state_district_metricCat_key" ON "AggregatedAadhaarMetric"("year", "month", "state", "district", "metricCategory", "ageGroup");

-- CreateIndex
CREATE INDEX "BaselineData_state_district_idx" ON "BaselineData"("state", "district");

-- CreateIndex
CREATE INDEX "BaselineData_metricCategory_ageGroup_idx" ON "BaselineData"("metricCategory", "ageGroup");

-- CreateIndex
CREATE UNIQUE INDEX "BaselineData_state_district_metricCategory_ageGroup_key" ON "BaselineData"("state", "district", "metricCategory", "ageGroup");

-- CreateIndex
CREATE INDEX "DerivedMetrics_state_district_idx" ON "DerivedMetrics"("state", "district");

-- CreateIndex
CREATE INDEX "DerivedMetrics_year_month_idx" ON "DerivedMetrics"("year", "month");

-- CreateIndex
CREATE INDEX "DerivedMetrics_metricCategory_ageGroup_idx" ON "DerivedMetrics"("metricCategory", "ageGroup");

-- CreateIndex
CREATE UNIQUE INDEX "DerivedMetrics_year_month_state_district_metricCategory_age_key" ON "DerivedMetrics"("year", "month", "state", "district", "metricCategory", "ageGroup");

-- CreateIndex
CREATE INDEX "AnomalyResults_state_district_idx" ON "AnomalyResults"("state", "district");

-- CreateIndex
CREATE INDEX "AnomalyResults_year_month_idx" ON "AnomalyResults"("year", "month");

-- CreateIndex
CREATE INDEX "AnomalyResults_isAnomaly_idx" ON "AnomalyResults"("isAnomaly");

-- CreateIndex
CREATE UNIQUE INDEX "AnomalyResults_year_month_state_district_metricCategory_age_key" ON "AnomalyResults"("year", "month", "state", "district", "metricCategory", "ageGroup");

-- CreateIndex
CREATE INDEX "TrendResults_state_district_idx" ON "TrendResults"("state", "district");

-- CreateIndex
CREATE INDEX "TrendResults_year_month_idx" ON "TrendResults"("year", "month");

-- CreateIndex
CREATE INDEX "TrendResults_trendDirection_idx" ON "TrendResults"("trendDirection");

-- CreateIndex
CREATE UNIQUE INDEX "TrendResults_year_month_state_district_metricCategory_ageGr_key" ON "TrendResults"("year", "month", "state", "district", "metricCategory", "ageGroup");

-- CreateIndex
CREATE INDEX "PatternResults_state_district_idx" ON "PatternResults"("state", "district");

-- CreateIndex
CREATE INDEX "PatternResults_year_month_idx" ON "PatternResults"("year", "month");

-- CreateIndex
CREATE INDEX "PatternResults_hasPattern_idx" ON "PatternResults"("hasPattern");

-- CreateIndex
CREATE UNIQUE INDEX "PatternResults_year_month_state_district_metricCategory_age_key" ON "PatternResults"("year", "month", "state", "district", "metricCategory", "ageGroup");

-- CreateIndex
CREATE INDEX "PredictiveIndicators_state_district_idx" ON "PredictiveIndicators"("state", "district");

-- CreateIndex
CREATE INDEX "PredictiveIndicators_year_month_idx" ON "PredictiveIndicators"("year", "month");

-- CreateIndex
CREATE INDEX "PredictiveIndicators_riskSignal_idx" ON "PredictiveIndicators"("riskSignal");

-- CreateIndex
CREATE UNIQUE INDEX "PredictiveIndicators_year_month_state_district_metricCatego_key" ON "PredictiveIndicators"("year", "month", "state", "district", "metricCategory", "ageGroup");

-- CreateIndex
CREATE INDEX "SolutionFrameworks_state_district_idx" ON "SolutionFrameworks"("state", "district");

-- CreateIndex
CREATE INDEX "SolutionFrameworks_frameworkType_idx" ON "SolutionFrameworks"("frameworkType");

-- CreateIndex
CREATE UNIQUE INDEX "SolutionFrameworks_year_month_state_district_metricCategory_key" ON "SolutionFrameworks"("year", "month", "state", "district", "metricCategory", "ageGroup");

-- CreateIndex
CREATE INDEX "Alerts_state_district_idx" ON "Alerts"("state", "district");

-- CreateIndex
CREATE INDEX "Alerts_alertType_idx" ON "Alerts"("alertType");

-- CreateIndex
CREATE INDEX "Alerts_severity_idx" ON "Alerts"("severity");

-- CreateIndex
CREATE INDEX "Alerts_isRead_idx" ON "Alerts"("isRead");

-- CreateIndex
CREATE INDEX "Alerts_isResolved_idx" ON "Alerts"("isResolved");
