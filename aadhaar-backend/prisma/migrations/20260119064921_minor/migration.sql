/*
  Warnings:

  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Report` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReportSection" DROP CONSTRAINT "ReportSection_reportId_fkey";

-- AlterTable
ALTER TABLE "Report" DROP CONSTRAINT "Report_pkey",
DROP COLUMN "id",
ADD COLUMN     "reportId" BIGSERIAL NOT NULL,
ADD CONSTRAINT "Report_pkey" PRIMARY KEY ("reportId");

-- AddForeignKey
ALTER TABLE "ReportSection" ADD CONSTRAINT "ReportSection_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("reportId") ON DELETE RESTRICT ON UPDATE CASCADE;
