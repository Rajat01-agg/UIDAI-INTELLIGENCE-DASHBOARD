import type { Request, Response } from 'express';
import { PrismaClient, MetricCategory } from '@prisma/client';
import { PDFGenerator } from '../utils/generator.ts';
import type { ReportGenerationData, ReportFindingData } from '../utils/generator.ts';
import { uploadPDF, downloadPDF, deletePDF, extractFileName } from '../utils/supabaseStorage.ts';

const prisma = new PrismaClient();
const pdfGenerator = new PDFGenerator();

// Helper to handle BigInt serialization
const serializeBigInt = (data: any): any => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
};

/**
 * Report Controller: All business logic for report generation
 * Handles database operations, PDF generation, and file management
 */
export class ReportController {
  /**
   * Generate new report for specified location and time period
   * POST /api/reports/generate
   */
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { year: yearRaw, month: monthRaw, state, district, metricCategory, createdBy } = req.body;

      // Validation — state & district are optional (national / state-level reports allowed)
      if (!yearRaw || !monthRaw) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: year, month',
        });
        return;
      }

      const year = parseInt(yearRaw as string, 10);
      const month = parseInt(monthRaw as string, 10);

      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 2020 || year > currentYear) {
        res.status(400).json({
          success: false,
          error: `Invalid year. Must be between 2020 and ${currentYear}`,
        });
        return;
      }

      if (isNaN(month) || month < 1 || month > 12) {
        res.status(400).json({
          success: false,
          error: 'Invalid month. Must be between 1 and 12',
        });
        return;
      }

      // Build a unique title that includes all scope dimensions
      const stateLabel = state || 'National';
      const districtLabel = district || 'All Districts';
      const categoryLabel = metricCategory ? ` [${metricCategory}]` : '';
      const reportTitle = `Aadhaar Intelligence Report - ${stateLabel} ${districtLabel}${categoryLabel}`;

      // Check if report already exists for this exact scope (including category)
      const existingWhere: any = { year, month };
      // Use null matching for unscoped (national/all-district) reports
      existingWhere.state = state || null;
      existingWhere.district = district || null;
      existingWhere.title = reportTitle;

      const existingReport = await prisma.report.findFirst({
        where: existingWhere,
      });

      if (existingReport) {
        res.status(409).json(serializeBigInt({
          success: false,
          error: 'Report already exists for this combination',
          reportId: existingReport.id,
        }));
        return;
      }

      // Step 1: Gather findings from all ML pipeline tables
      let findings = await this.gatherFindings(year, month, state || 'National', district || 'All', metricCategory);

      // If no findings for requested period, try to find the latest period with data
      if (findings.length === 0) {
        const latestAnomaly = await prisma.anomalyResults.findFirst({
          where: { isAnomaly: true },
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          select: { year: true, month: true },
        });
        const latestPrediction = await prisma.predictiveIndicators.findFirst({
          where: { riskSignal: { not: 'stable' } },
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          select: { year: true, month: true },
        });

        // Pick the latest period that has data
        let bestYear: number | null = null;
        let bestMonth: number | null = null;
        for (const row of [latestAnomaly, latestPrediction]) {
          if (row && (bestYear === null || row.year > bestYear || (row.year === bestYear && row.month > (bestMonth || 0)))) {
            bestYear = row.year;
            bestMonth = row.month;
          }
        }

        if (bestYear && bestMonth && (bestYear !== year || bestMonth !== month)) {
          console.log(`No findings for ${month}/${year}, falling back to latest available: ${bestMonth}/${bestYear}`);
          findings = await this.gatherFindings(bestYear, bestMonth, state || 'National', district || 'All', metricCategory);
        }
      }

      if (findings.length === 0) {
        res.status(404).json({
          success: false,
          error: 'No findings available for the specified criteria. Ensure the ML pipeline has been run.',
        });
        return;
      }

      // Step 2: Calculate summary statistics
      const summary = this.calculateSummary(findings);

      // Step 3: Prepare data for PDF generation
      const reportData: ReportGenerationData = {
        year,
        month,
        state: stateLabel,
        district: districtLabel,
        metricCategory,
        findings: findings.map(this.mapFindingToPDFFormat.bind(this)),
        summary,
      };

      // Step 4: Generate PDF
      const pdfBuffer = await pdfGenerator.generateReport(reportData);

      // Step 5: Upload PDF to Supabase Storage
      const filename = `report_${year}_${String(month).padStart(2, '0')}_${stateLabel.replace(/\s+/g, '_')}_${districtLabel.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      const publicUrl = await uploadPDF(filename, pdfBuffer);

      const fileSize = this.formatFileSize(pdfBuffer.length);

      // Step 6: Create report record in database
      const report = await prisma.$transaction(async (tx) => {
        // Create the main Report record
        let newReport = await tx.report.create({
          data: {
            title: reportTitle,
            reportType: district ? 'district' : state ? 'state' : 'national',
            generatedBy: createdBy || 'system',
            year,
            month,
            state: state || null,
            district: district || null,
            status: 'generated',
            pdfUrl: publicUrl,
            pdfPath: filename,  // Store just the filename for Supabase operations
            fileSize,
            totalFindings: summary.totalFindings,
            criticalCount: summary.critical,
            highCount: summary.high,
            mediumCount: summary.medium,
            lowCount: summary.low,
          },
        });

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        newReport = await tx.report.update({
          where: { id: newReport.id },
          data: {
            pdfUrl: publicUrl,  // Use Supabase public URL directly
          },
        });


        // Create a Section for Detailed Findings
        const section = await tx.reportSection.create({
          data: {
            reportId: newReport.id,
            sectionType: 'executive_summary', // Mapping to an available enum type
            title: 'Detailed Findings',
            orderIndex: 1,
            summaryText: `Analysis of ${summary.totalFindings} findings including ${summary.anomalies} anomalies and ${summary.patterns} patterns.`,
          },
        });

        // Map findings to ReportItems
        // Note: reportFinding does not exist in schema, we use ReportItem
        const reportItems = findings.map((finding) => ({
          sectionId: section.id,
          itemType: this.mapFindingTypeToReportItemType(finding.findingType),
          severity: finding.severity, // This should match AlertSeverity enum
          state: finding.state,
          district: finding.district,
          title: finding.title,
          description: finding.description,
          metricSnapshot: JSON.stringify({
            metricCategory: finding.metricCategory,
            ageGroup: finding.ageGroup,
            value1: finding.value1,
            value2: finding.value2,
            value3: finding.value3,
            sourceTable: finding.sourceTable,
            sourceId: finding.sourceId
          }),
          confidence: finding.confidence,
          recommendation: finding.recommendation,
        }));

        await tx.reportItem.createMany({
          data: reportItems,
        });

        return newReport;
      });

      res.status(201).json(serializeBigInt({
        success: true,
        reportId: report.id,
        pdfUrl: report.pdfUrl,
        fileSize: report.fileSize,
        status: report.status,
        generatedAt: report.generatedAt,
        findingsSummary: summary,
      }));
    } catch (error) {
      console.error('Error generating report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get report by ID
   * GET /api/reports/:id
   */
  async getReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id: BigInt(id as string) },
        include: {
          sections: {
            include: {
              items: {
                orderBy: { severity: 'desc' }, // Secondary sort unsupported in basic relational query without map
              }
            },
            orderBy: { orderIndex: 'asc' }
          }
        },
      });

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found',
        });
        return;
      }

      res.json(serializeBigInt({
        success: true,
        report,
      }));
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch report',
      });
    }
  }

  /**
   * List reports with filters
   * GET /api/reports
   */
  async listReports(req: Request, res: Response): Promise<void> {
    try {
      const {
        year,
        month,
        state,
        district,
        // metricCategory, // Not on Report model
        status,
        page = '1',
        limit = '10',
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const where: any = {};

      if (year) where.year = parseInt(year as string, 10);
      if (month) where.month = parseInt(month as string, 10);
      if (state) where.state = state;
      if (district) where.district = district;
      if (status) where.status = status;

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          skip: (pageNum - 1) * limitNum,
          take: limitNum,
          orderBy: { generatedAt: 'desc' },
          // _count on findings not possible directly as they are in sections -> items
        }),
        prisma.report.count({ where }),
      ]);

      res.json(serializeBigInt({
        success: true,
        reports,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      }));
    } catch (error) {
      console.error('Error listing reports:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list reports',
      });
    }
  }

  /**
   * Download report PDF
   * GET /api/reports/:id/download
   */
  async downloadReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id: BigInt(id as string) },
        select: { pdfPath: true, pdfUrl: true, title: true },
      });

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found or PDF not available',
        });
        return;
      }

      // If we have a Supabase public URL, redirect to it for direct download
      if (report.pdfUrl) {
        res.redirect(report.pdfUrl);
        return;
      }

      // Fallback: download from Supabase via API and stream to client
      if (report.pdfPath) {
        try {
          const fileBuffer = await downloadPDF(report.pdfPath);
          const filename = report.pdfPath.split('/').pop() || 'report.pdf';
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
          res.send(fileBuffer);
          return;
        } catch (downloadError) {
          console.error('Supabase download failed:', downloadError);
        }
      }

      res.status(404).json({
        success: false,
        error: 'PDF file not found in storage',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download report',
      });
    }
  }

  /**
   * Delete report
   * DELETE /api/reports/:id
   */
  async deleteReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bigIntId = BigInt(id as string);

      const report = await prisma.report.findUnique({
        where: { id: bigIntId },
        select: { pdfPath: true },
      });

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found',
        });
        return;
      }

      // Delete PDF from Supabase Storage
      if (report.pdfPath) {
        try {
          await deletePDF(report.pdfPath);
        } catch (error) {
          console.warn('Failed to delete PDF from Supabase:', error);
        }
      }

      // Delete related sections and items first (if cascade is not set in DB)
      // Assuming cascade might not be set in Prisma client without @relation(onDelete: Cascade) which I don't see for Items
      // Ideally we check schema, but manual delete is safer if unsure.
      // Schema: section -> report, item -> section.

      const sections = await prisma.reportSection.findMany({
        where: { reportId: bigIntId },
        select: { id: true }
      });

      const sectionIds = sections.map(s => s.id);

      if (sectionIds.length > 0) {
        await prisma.reportItem.deleteMany({
          where: { sectionId: { in: sectionIds } }
        });

        await prisma.reportSection.deleteMany({
          where: { reportId: bigIntId }
        });
      }

      // Delete report record
      await prisma.report.delete({
        where: { id: bigIntId },
      });

      res.json({
        success: true,
        message: 'Report deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete report',
      });
    }
  }

  /**
   * Get report statistics
   * GET /api/reports/stats
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { year, state } = req.query;

      const where: any = {};
      if (year) where.year = parseInt(year as string, 10);
      if (state) where.state = state;

      const [
        totalReports,
        completedReports,
        // Detailed finding stats are harder to get efficiently with current schema structure
        // without complex joins, so we simplify for now
      ] = await Promise.all([
        prisma.report.count({ where }),
        prisma.report.count({ where: { ...where, status: 'COMPLETED' } }),
      ]);

      // Calculate findings counts from reports (aggregated fields)
      const aggregations = await prisma.report.aggregate({
        where,
        _sum: {
          totalFindings: true,
          criticalCount: true,
          highCount: true
        }
      });

      res.json(serializeBigInt({
        success: true,
        statistics: {
          totalReports,
          completedReports,
          totalFindings: aggregations._sum.totalFindings || 0,
          criticalFindings: aggregations._sum.criticalCount || 0,
          highFindings: aggregations._sum.highCount || 0,
        },
      }));
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
      });
    }
  }

  /**
   * PRIVATE: Gather findings from all ML pipeline tables
   */
  private async gatherFindings(
    year: number,
    month: number,
    state: string,
    district: string,
    metricCategory?: string
  ): Promise<any[]> {
    const baseWhere: any = { year, month };
    if (state && state !== 'National') baseWhere.state = state;
    if (district && district !== 'All') baseWhere.district = district;
    if (metricCategory) baseWhere.metricCategory = metricCategory as MetricCategory;

    const [anomalies, patterns, trends, predictions] = await Promise.all([
      // Anomalies
      prisma.anomalyResults.findMany({
        where: {
          ...baseWhere,
          isAnomaly: true,
        },
        orderBy: { anomalyScore: 'desc' },
        take: 50,
      }),

      // Patterns
      prisma.patternResults.findMany({
        where: {
          ...baseWhere,
          hasPattern: true,
        },
        orderBy: { patternStrength: 'desc' },
        take: 50,
      }),

      // Trends
      prisma.trendResults.findMany({
        where: {
          ...baseWhere,
          trendDirection: { not: 'stable' },
        },
        orderBy: { trendStrength: 'desc' },
        take: 50,
      }),

      // Predictions
      prisma.predictiveIndicators.findMany({
        where: {
          ...baseWhere,
          riskSignal: { not: 'stable' },
        },
        orderBy: { riskScore: 'desc' },
        take: 50,
      }),
    ]);

    const findings: any[] = [];

    // Map anomalies
    anomalies.forEach((anomaly: any) => {
      findings.push({
        findingType: 'anomaly',
        sourceId: anomaly.id.toString(),
        sourceTable: 'anomaly_results',
        state: anomaly.state,
        district: anomaly.district,
        metricCategory: anomaly.metricCategory,
        ageGroup: anomaly.ageGroup,
        title: `Anomaly Detected: ${anomaly.metricCategory} - ${anomaly.ageGroup}`,
        description: `Anomalous activity detected in ${anomaly.metricCategory} for age group ${anomaly.ageGroup}. Anomaly score: ${anomaly.anomalyScore.toFixed(2)}.`,
        severity: anomaly.anomalySeverity || this.calculateSeverity(anomaly.anomalyScore),
        confidence: anomaly.anomalyConfidence,
        value1: anomaly.anomalyScore,
        value2: anomaly.anomalyConfidence,
        value3: null,
        recommendation: this.generateAnomalyRecommendation(anomaly),
        detectedAt: anomaly.detectedAt,
      });
    });

    // Map patterns
    patterns.forEach((pattern: any) => {
      findings.push({
        findingType: 'pattern',
        sourceId: pattern.id.toString(),
        sourceTable: 'pattern_results',
        state: pattern.state,
        district: pattern.district,
        metricCategory: pattern.metricCategory,
        ageGroup: pattern.ageGroup,
        title: `Pattern Identified: ${pattern.dominantPatternType}`,
        description: `${pattern.dominantPatternType} pattern detected in ${pattern.metricCategory} for ${pattern.ageGroup}. Pattern strength: ${pattern.patternStrength.toFixed(2)}.`,
        severity: this.calculateSeverity(pattern.patternStrength),
        confidence: pattern.patternConfidence,
        value1: pattern.patternStrength,
        value2: pattern.patternConfidence,
        value3: null,
        recommendation: this.generatePatternRecommendation(pattern),
        detectedAt: pattern.detectedAt,
      });
    });

    // Map trends
    trends.forEach((trend: any) => {
      findings.push({
        findingType: 'trend',
        sourceId: trend.id.toString(),
        sourceTable: 'trend_results',
        state: trend.state,
        district: trend.district,
        metricCategory: trend.metricCategory,
        ageGroup: trend.ageGroup,
        title: `Trend: ${trend.trendDirection} in ${trend.metricCategory}`,
        description: `${trend.trendDirection} trend observed with slope ${trend.trendSlope.toFixed(2)} and strength ${trend.trendStrength.toFixed(2)}.`,
        severity: this.calculateSeverity(trend.trendStrength),
        confidence: trend.trendConfidence,
        value1: trend.trendSlope,
        value2: trend.trendStrength,
        value3: null,
        recommendation: this.generateTrendRecommendation(trend),
        detectedAt: trend.detectedAt,
      });
    });

    // Map predictions
    predictions.forEach((prediction: any) => {
      findings.push({
        findingType: 'prediction',
        sourceId: prediction.id.toString(),
        sourceTable: 'predictive_indicators',
        state: prediction.state,
        district: prediction.district,
        metricCategory: prediction.metricCategory,
        ageGroup: prediction.ageGroup,
        title: `Prediction: ${prediction.riskSignal}`,
        description: `Risk signal: ${prediction.riskSignal}. Risk score: ${prediction.riskScore.toFixed(2)}. Factors: ${prediction.contributingFactors}.`,
        severity: this.calculateSeverity(prediction.riskScore),
        confidence: prediction.predictionConfidence,
        value1: prediction.riskScore,
        value2: prediction.predictionConfidence,
        value3: null,
        recommendation: this.generatePredictionRecommendation(prediction),
        detectedAt: prediction.detectedAt,
      });
    });

    return findings;
  }

  /**
   * Calculate summary statistics from findings
   */
  private calculateSummary(findings: any[]) {
    return {
      totalFindings: findings.length,
      anomalies: findings.filter((f) => f.findingType === 'anomaly').length,
      patterns: findings.filter((f) => f.findingType === 'pattern').length,
      trends: findings.filter((f) => f.findingType === 'trend').length,
      predictions: findings.filter((f) => f.findingType === 'prediction').length,
      critical: findings.filter((f) => f.severity === 'critical').length,
      high: findings.filter((f) => f.severity === 'high').length,
      medium: findings.filter((f) => f.severity === 'medium').length,
      low: findings.filter((f) => f.severity === 'low').length,
    };
  }

  /**
   * Helper to map finding type string to ReportItemType enum
   */
  private mapFindingTypeToReportItemType(findingType: string): 'anomaly' | 'pattern' | 'trend' | 'prediction' {
    const map: Record<string, any> = {
      'anomaly': 'anomaly',
      'pattern': 'pattern',
      'trend': 'trend',
      'prediction': 'prediction'
    };
    return map[findingType] || 'anomaly';
  }

  /**
   * Map database finding to PDF format
   */
  private mapFindingToPDFFormat(finding: any): ReportFindingData {
    const labels = this.getMetricLabels(finding.findingType);

    return {
      id: finding.sourceId,
      findingType: finding.findingType,
      severity: finding.severity,
      title: finding.title,
      description: finding.description,
      confidence: finding.confidence,
      recommendation: finding.recommendation,
      detectedAt: finding.detectedAt.toISOString(),
      metrics: {
        value1: finding.value1,
        value2: finding.value2,
        value3: finding.value3,
        label1: labels.label1,
        label2: labels.label2,
        label3: labels.label3,
      },
    };
  }

  /**
   * Get appropriate metric labels based on finding type
   */
  private getMetricLabels(findingType: string) {
    const labels: Record<string, any> = {
      anomaly: {
        label1: 'Anomaly Score',
        label2: 'Expected Value',
        label3: 'Observed Value',
      },
      pattern: {
        label1: 'Pattern Strength',
        label2: 'Confidence',
        label3: null,
      },
      trend: {
        label1: 'Trend Slope',
        label2: 'Trend Strength',
        label3: null,
      },
      prediction: {
        label1: 'Risk Score',
        label2: 'Confidence',
        label3: null,
      },
    };

    return labels[findingType] || { label1: 'Value 1', label2: 'Value 2', label3: 'Value 3' };
  }

  /**
   * Calculate severity based on score.
   * Handles both 0-1 scale (trendStrength, confidence) and 0-10 scale (riskScore, anomalyScore).
   */
  private calculateSeverity(score: number): string {
    // Normalize to 0-1 if score is on 0-10 scale
    const normalized = score > 1 ? score / 10 : score;
    if (normalized >= 0.8) return 'critical';
    if (normalized >= 0.6) return 'high';
    if (normalized >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendation for anomaly
   */
  private generateAnomalyRecommendation(anomaly: any): string {
    return `Investigate root cause of anomaly in ${anomaly.district}\nReview operational procedures for ${anomaly.metricCategory}\nVerify data accuracy and reporting mechanisms`;
  }

  /**
   * Generate recommendation for pattern
   */
  private generatePatternRecommendation(pattern: any): string {
    return `Monitor ${pattern.dominantPatternType} pattern continuation\nPlan resource allocation accordingly\nDocument pattern for future reference`;
  }

  /**
   * Generate recommendation for trend
   */
  private generateTrendRecommendation(trend: any): string {
    if (trend.trendDirection === 'increasing') {
      return `Prepare for continued growth in ${trend.metricCategory}\nIncrease operational capacity\nMonitor sustainability`;
    } else {
      return `Investigate causes of decline\nImplement corrective measures\nEnhance awareness campaigns`;
    }
  }

  /**
   * Generate recommendation for prediction
   */
  private generatePredictionRecommendation(prediction: any): string {
    return `Monitor ${prediction.riskSignal} indicators closely\nPrepare contingency plans\nAddress contributing factors: ${prediction.contributingFactors}`;
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

export const reportController = new ReportController();