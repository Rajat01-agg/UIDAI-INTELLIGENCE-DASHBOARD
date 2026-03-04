/*
  Warnings:

  - The values [predictive_warning,framework_trigger] on the enum `AlertType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AlertType_new" AS ENUM ('anomaly', 'trend', 'pattern', 'accessibility_gap', 'operational_stress');
ALTER TABLE "Alerts" ALTER COLUMN "alertType" TYPE "AlertType_new" USING ("alertType"::text::"AlertType_new");
ALTER TYPE "AlertType" RENAME TO "AlertType_old";
ALTER TYPE "AlertType_new" RENAME TO "AlertType";
DROP TYPE "public"."AlertType_old";
COMMIT;
