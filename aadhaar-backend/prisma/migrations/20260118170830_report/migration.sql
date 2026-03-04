-- CreateEnum
CREATE TYPE "ReportSectionType" AS ENUM ('cover', 'executive_summary', 'anomaly_summary', 'trend_summary', 'pattern_summary', 'predictive_summary', 'recommendations');

-- CreateEnum
CREATE TYPE "ReportItemType" AS ENUM ('anomaly', 'trend', 'pattern', 'prediction', 'accessibility_gap', 'operational_stress');

-- CreateTable
CREATE TABLE "Report" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "generatedBy" TEXT NOT NULL,
    "state" TEXT,
    "district" TEXT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,
    "pdfPath" TEXT,
    "fileSize" TEXT,
    "totalFindings" INTEGER NOT NULL,
    "criticalCount" INTEGER NOT NULL,
    "highCount" INTEGER NOT NULL,
    "mediumCount" INTEGER NOT NULL,
    "lowCount" INTEGER NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportSection" (
    "id" BIGSERIAL NOT NULL,
    "reportId" BIGINT NOT NULL,
    "sectionType" "ReportSectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "summaryText" TEXT,

    CONSTRAINT "ReportSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportItem" (
    "id" BIGSERIAL NOT NULL,
    "sectionId" BIGINT NOT NULL,
    "itemType" "ReportItemType" NOT NULL,
    "severity" "AlertSeverity",
    "state" TEXT,
    "district" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metricSnapshot" TEXT,
    "confidence" DOUBLE PRECISION,
    "recommendation" TEXT,

    CONSTRAINT "ReportItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_year_month_idx" ON "Report"("year", "month");

-- CreateIndex
CREATE INDEX "Report_state_district_idx" ON "Report"("state", "district");

-- CreateIndex
CREATE INDEX "ReportSection_sectionType_idx" ON "ReportSection"("sectionType");

-- CreateIndex
CREATE INDEX "ReportItem_itemType_idx" ON "ReportItem"("itemType");

-- AddForeignKey
ALTER TABLE "ReportSection" ADD CONSTRAINT "ReportSection_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportItem" ADD CONSTRAINT "ReportItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "ReportSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
