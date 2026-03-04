import PDFDocument from 'pdfkit';

/**
 * Report Finding Data Interface
 */
export interface ReportFindingData {
  id: string;
  findingType: 'anomaly' | 'pattern' | 'trend' | 'prediction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  confidence: number;
  recommendation: string;
  detectedAt: string;
  metrics: {
    value1?: number;
    value2?: number;
    value3?: number;
    label1?: string;
    label2?: string;
    label3?: string;
  };
}

/**
 * Complete Report Data Structure
 */
export interface ReportGenerationData {
  year: number;
  month: number;
  state: string;
  district: string;
  metricCategory?: string;
  findings: ReportFindingData[];
  summary: {
    totalFindings: number;
    anomalies: number;
    patterns: number;
    trends: number;
    predictions: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * PDFGenerator: Professional Aadhaar Intelligence Report Generation
 * Pure PDF generation - NO database calls, NO API logic
 * Input: ReportGenerationData → Output: PDF Buffer
 */
export class PDFGenerator {
  private readonly colors = {
    primary: '#1e3a8a',
    secondary: '#3b82f6',
    critical: '#dc2626',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e',
    text: '#1f2937',
    textLight: '#6b7280',
    border: '#e5e7eb',
    background: '#f9fafb',
    white: '#ffffff',
  }; 

  private doc!: PDFKit.PDFDocument;
  private pageCount: number = 0;

  /**
   * Generate complete report as PDF buffer
   * @param reportData - Report content and findings
   * @returns Promise<Buffer> containing PDF bytes
   */
  async generateReport(reportData: ReportGenerationData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        this.pageCount = 0;

        this.doc = new PDFDocument({
          margin: 60,
          size: 'A4',
          info: {
            Title: `Aadhaar Report - ${reportData.state} ${reportData.district} ${reportData.year}-${String(reportData.month).padStart(2, '0')}`,
            Author: 'Aadhaar Intelligence System',
            Subject: 'Policy Decision Support Report',
            CreationDate: new Date(),
          },
          autoFirstPage: false,
        });

        const buffers: Buffer[] = [];
        this.doc.on('data', (chunk: Buffer) => buffers.push(chunk));
        this.doc.on('end', () => resolve(Buffer.concat(buffers)));
        this.doc.on('error', (err: Error) => reject(err));

        this.generateCoverPage(reportData);
        this.generateExecutiveSummary(reportData);
        this.generateDetailedFindings(reportData);
        this.generateConclusion(reportData);

        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add new page with optional header/footer
   */
  private addNewPage(includeHeader: boolean = true): void {
    this.doc.addPage();
    this.pageCount++;

    if (includeHeader) {
      this.addPageHeader();
      this.addPageFooter();
    }
  }

  /**
   * Add consistent page header
   */
  private addPageHeader(): void {
    const pageWidth = this.doc.page.width;

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.colors.textLight)
      .text('Aadhaar Intelligence System', 60, 40, { width: pageWidth - 120, align: 'left' });

    this.doc
      .moveTo(60, 60)
      .lineTo(pageWidth - 60, 60)
      .lineWidth(0.5)
      .strokeColor(this.colors.border)
      .stroke();
  }

  /**
   * Add consistent page footer
   */
  private addPageFooter(): void {
    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    this.doc
      .moveTo(60, pageHeight - 60)
      .lineTo(pageWidth - 60, pageHeight - 60)
      .lineWidth(0.5)
      .strokeColor(this.colors.border)
      .stroke();

    // Page number removed as per request
    /*
    this.doc
      .fontSize(8)
      .fillColor(this.colors.textLight)
      .text(`Page ${this.pageCount}`, 60, pageHeight - 50, {
        width: pageWidth - 120,
        align: 'center',
      });
    */
  }

  /**
   * PAGE 1: Cover page with report metadata and findings summary
   */
  private generateCoverPage(reportData: ReportGenerationData): void {
    this.addNewPage(false);

    const pageWidth = this.doc.page.width;
    const pageHeight = this.doc.page.height;

    // Blue header band
    this.doc.rect(0, 0, pageWidth, 200).fill(this.colors.primary);

    // Title
    this.doc
      .fontSize(32)
      .font('Helvetica-Bold')
      .fillColor(this.colors.white)
      .text('UIDAI INTELLIGENCE SYSTEM', 60, 40, {
        align: 'center',
        width: pageWidth - 120,
      });

    // Subtitle
    this.doc
      .fontSize(18)
      .fillColor('#93c5fd')
      .text('Policy Decision Support Report', 60, 110, {
        align: 'center',
        width: pageWidth - 120,
      });

    // Report Details Section
    this.doc
      .fontSize(15)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Report Details', 60, 250);

    const monthName = new Date(reportData.year, reportData.month - 1).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });

    const details = [
      {
        label: 'Report ID:',
        value: `${reportData.year}-${String(reportData.month).padStart(2, '0')}-${reportData.state}-${reportData.district}`,
      },
      { label: 'Period:', value: monthName },
      { label: 'Location:', value: `${reportData.district}, ${reportData.state}` },
      { label: 'Metric:', value: reportData.metricCategory || 'All Metrics' },
      { label: 'Generated:', value: new Date().toLocaleDateString('en-IN') },
      { label: 'Time:', value: new Date().toLocaleTimeString('en-IN') },
      { label: 'Total Findings:', value: reportData.summary.totalFindings.toString() },
    ];

    let currentY = 285;
    details.forEach((detail) => {
      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(this.colors.textLight)
        .text(detail.label, 80, currentY);

      this.doc
        .font('Helvetica')
        .fillColor(this.colors.text)
        .text(detail.value, 180, currentY);

      currentY += 20;
    });

    // Findings Summary Box
    const summaryBoxY = 530;
    const boxWidth = pageWidth - 120;

    this.doc
      .roundedRect(60, summaryBoxY, boxWidth, 110, 8)
      .fillAndStroke(this.colors.background, this.colors.border);

    this.doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Summary', 80, summaryBoxY + 12);

    const badges = [
      {
        label: 'Critical',
        count: reportData.summary.critical,
        color: this.colors.critical,
        bgColor: '#fee2e2',
      },
      {
        label: 'High',
        count: reportData.summary.high,
        color: this.colors.high,
        bgColor: '#ffedd5',
      },
      {
        label: 'Medium',
        count: reportData.summary.medium,
        color: this.colors.medium,
        bgColor: '#fef9c3',
      },
      {
        label: 'Low',
        count: reportData.summary.low,
        color: this.colors.low,
        bgColor: '#dcfce7',
      },
    ];

    const badgeWidth = (boxWidth - 40) / 4;
    badges.forEach((badge, index) => {
      const badgeX = 70 + index * badgeWidth;

      this.doc
        .roundedRect(badgeX, summaryBoxY + 42, badgeWidth - 10, 50, 5)
        .fillAndStroke(badge.bgColor, badge.color);

      this.doc
        .fontSize(22)
        .font('Helvetica-Bold')
        .fillColor(badge.color)
        .text(badge.count.toString(), badgeX, summaryBoxY + 48, {
          width: badgeWidth - 10,
          align: 'center',
        });

      this.doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor(this.colors.text)
        .text(badge.label, badgeX, summaryBoxY + 75, {
          width: badgeWidth - 10,
          align: 'center',
        });
    });

    // Confidentiality notice
    this.doc
      .fontSize(7)
      .fillColor(this.colors.textLight)
      .text('CONFIDENTIAL - FOR AUTHORIZED PERSONNEL ONLY', 60, pageHeight - 75, {
        align: 'center',
        width: pageWidth - 120,
      });

    // Footer line
    this.doc
      .moveTo(60, pageHeight - 60)
      .lineTo(pageWidth - 60, pageHeight - 60)
      .lineWidth(0.5)
      .strokeColor(this.colors.border)
      .stroke();
  }

  /**
   * PAGE 2: Executive summary with key findings and recommendations
   */
  private generateExecutiveSummary(reportData: ReportGenerationData): void {
    this.addNewPage(true);

    const monthName = new Date(reportData.year, reportData.month - 1).toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });

    // Title
    this.doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Executive Summary', 60, 100);

    // Underline
    this.doc
      .moveTo(60, 130)
      .lineTo(250, 130)
      .lineWidth(2)
      .strokeColor(this.colors.secondary)
      .stroke();

    // Summary text
    this.doc
      .fontSize(11)
      .font('Helvetica')
      .fillColor(this.colors.text)
      .text(
        `This report analyzes Aadhaar enrolment and update patterns for ${reportData.district}, ${reportData.state} during ${monthName}. ` +
        `The analysis identified ${reportData.summary.totalFindings} key findings, comprising ${reportData.summary.anomalies} anomalies, ` +
        `${reportData.summary.patterns} patterns, ${reportData.summary.trends} trends, and ${reportData.summary.predictions} predictive indicators. ` +
        `All findings are categorized by severity and include confidence scores for reliability assessment.`,
        60,
        150,
        {
          width: this.doc.page.width - 120,
          align: 'justify',
          lineGap: 4,
        }
      );

    this.doc.moveDown(2);

    // Risk Distribution Chart
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Risk Distribution', 60, this.doc.y);

    this.doc.moveDown(1);

    const severities = [
      { label: 'Critical', count: reportData.summary.critical, color: this.colors.critical },
      { label: 'High', count: reportData.summary.high, color: this.colors.high },
      { label: 'Medium', count: reportData.summary.medium, color: this.colors.medium },
      { label: 'Low', count: reportData.summary.low, color: this.colors.low },
    ];

    const maxCount = Math.max(...severities.map((s) => s.count), 1);
    const chartWidth = 300;
    const chartStartX = 120;
    const barHeight = 20;

    severities.forEach((sev) => {
      const barWidth = (sev.count / maxCount) * chartWidth;

      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(this.colors.text)
        .text(sev.label, 60, this.doc.y, { width: 55, align: 'right' });

      const barY = this.doc.y - 15;

      this.doc.rect(chartStartX, barY, barWidth, barHeight).fill(sev.color);

      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(this.colors.white)
        .text(sev.count.toString(), chartStartX + 5, barY + 5);

      this.doc.moveDown(0.8);
    });

    this.doc.moveDown(2);

    // Key Findings
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Key Findings', 60, this.doc.y);

    this.doc.moveDown(1);

    const criticalFindings = reportData.findings
      .filter((f) => f.severity === 'critical')
      .slice(0, 3);

    if (criticalFindings.length > 0) {
      criticalFindings.forEach((finding, index) => {
        this.doc
          .fontSize(10)
          .font('Helvetica')
          .fillColor(this.colors.text)
          .text(`${index + 1}. ${finding.title}`, 70, this.doc.y, {
            width: this.doc.page.width - 130,
          });

        this.doc.moveDown(0.5);
      });
    } else {
      this.doc
        .fontSize(10)
        .font('Helvetica-Oblique')
        .fillColor(this.colors.textLight)
        .text('No critical findings identified in this reporting period.', 70, this.doc.y);
    }

    this.doc.moveDown(2);

    // Recommended Actions
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Recommended Actions', 60, this.doc.y);

    this.doc.moveDown(1);

    const recommendations = [
      'Review critical findings within 24 hours and initiate corrective measures',
      'Investigate root causes for high-severity anomalies and recurring patterns',
      'Plan resource allocation based on predictive indicators',
    ];

    recommendations.forEach((rec, index) => {
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(this.colors.text)
        .text(`${index + 1}. ${rec}`, 70, this.doc.y, {
          width: this.doc.page.width - 130,
        });

      this.doc.moveDown(0.5);
    });

    this.doc.moveDown(2);

    // Confidence Note
    this.doc
      .fontSize(9)
      .font('Helvetica-Oblique')
      .fillColor(this.colors.textLight)
      .text(
        'This analysis combines anomaly detection, pattern recognition, trend analysis, and predictive modeling. ' +
        'All findings include confidence scores to support informed decision-making.',
        60,
        this.doc.y,
        {
          width: this.doc.page.width - 120,
          align: 'justify',
        }
      );
  }

  /**
   * PAGE 3+: Detailed findings with recommendations
   */
  private generateDetailedFindings(reportData: ReportGenerationData): void {
    if (reportData.findings.length === 0) {
      this.addNewPage(true);

      this.doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .fillColor(this.colors.primary)
        .text('Detailed Findings', 60, 100);

      this.doc
        .fontSize(11)
        .font('Helvetica-Oblique')
        .fillColor(this.colors.textLight)
        .text('No findings identified for this reporting period.', 60, 150);

      return;
    }

    this.addNewPage(true);

    this.doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Detailed Findings', 60, 100);

    this.doc.moveDown(2);

    reportData.findings.forEach((finding, index) => {
      if (this.doc.y > 650) {
        this.addNewPage(true);
      }

      this.renderFinding(finding, index + 1);
      this.doc.moveDown(1.5);
    });
  }

  /**
   * Render individual finding card
   */
  private renderFinding(finding: ReportFindingData, index: number): void {
    const startY = this.doc.y;

    // Finding number and title
    this.doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text(`${index}. ${finding.title}`, 60, this.doc.y, {
        width: this.doc.page.width - 120,
      });

    this.doc.moveDown(0.5);

    // Metadata badges
    const badgeY = this.doc.y;
    let badgeX = 70;

    // Severity badge
    const severityColor = this.getSeverityColor(finding.severity);
    this.doc
      .roundedRect(badgeX, badgeY, 60, 18, 3)
      .fillAndStroke(severityColor, severityColor);

    this.doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(this.colors.white)
      .text(finding.severity.toUpperCase(), badgeX, badgeY + 5, {
        width: 60,
        align: 'center',
      });

    badgeX += 65;

    // Type badge
    this.doc
      .roundedRect(badgeX, badgeY, 60, 18, 3)
      .fillAndStroke(this.colors.secondary, this.colors.secondary);

    this.doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor(this.colors.white)
      .text(finding.findingType.toUpperCase(), badgeX, badgeY + 5, {
        width: 60,
        align: 'center',
      });

    badgeX += 65;

    // Date
    this.doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(this.colors.textLight)
      .text(`Detected: ${new Date(finding.detectedAt).toLocaleDateString('en-IN')}`, badgeX, badgeY + 5);

    this.doc.moveDown(1.5);

    // Description
    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(this.colors.text)
      .text('Description:', 70, this.doc.y);

    this.doc.moveDown(0.3);

    this.doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor(this.colors.text)
      .text(finding.description, 70, this.doc.y, {
        width: this.doc.page.width - 130,
        align: 'justify',
      });

    this.doc.moveDown(1);

    // Key Metrics
    if (finding.metrics.value1 != null) {
      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(this.colors.text)
        .text('Key Metrics:', 70, this.doc.y);

      this.doc.moveDown(0.3);

      const metrics = [];
      if (finding.metrics.value1 != null) {
        metrics.push(
          `${finding.metrics.label1 || 'Value 1'}: ${finding.metrics.value1.toFixed(2)}`
        );
      }
      if (finding.metrics.value2 != null) {
        metrics.push(
          `${finding.metrics.label2 || 'Value 2'}: ${finding.metrics.value2.toFixed(2)}`
        );
      }
      if (finding.metrics.value3 != null) {
        metrics.push(
          `${finding.metrics.label3 || 'Value 3'}: ${finding.metrics.value3.toFixed(2)}`
        );
      }
      metrics.push(`Confidence: ${(finding.confidence * 100).toFixed(1)}%`);

      metrics.forEach((metric) => {
        this.doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor(this.colors.text)
          .text(`• ${metric}`, 80, this.doc.y);

        this.doc.moveDown(0.3);
      });

      this.doc.moveDown(0.5);
    }

    // Recommendations
    if (finding.recommendation) {
      this.doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor(this.colors.text)
        .text('Recommendations:', 70, this.doc.y);

      this.doc.moveDown(0.3);

      const recommendations = finding.recommendation.split('\n').filter((r) => r.trim());
      recommendations.forEach((rec, idx) => {
        this.doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor(this.colors.text)
          .text(`${idx + 1}. ${rec.trim()}`, 80, this.doc.y, {
            width: this.doc.page.width - 140,
          });

        this.doc.moveDown(0.3);
      });
    }

    // Separator line
    this.doc.moveDown(0.5);
    this.doc
      .moveTo(60, this.doc.y)
      .lineTo(this.doc.page.width - 60, this.doc.y)
      .lineWidth(0.5)
      .strokeColor(this.colors.border)
      .stroke();
  }

  /**
   * LAST PAGE: Conclusion and next steps
   */
  private generateConclusion(reportData: ReportGenerationData): void {
    this.addNewPage(true);

    this.doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Conclusion', 60, 100);

    this.doc
      .moveTo(60, 130)
      .lineTo(180, 130)
      .lineWidth(2)
      .strokeColor(this.colors.secondary)
      .stroke();

    this.doc.moveDown(2);

    // Summary Statistics Table
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Summary Statistics', 60, this.doc.y);

    this.doc.moveDown(1);

    const tableY = this.doc.y;
    const col1X = 80;
    const col2X = 300;
    const rowHeight = 25;

    // Table header
    this.doc
      .rect(col1X, tableY, 220, rowHeight)
      .fillAndStroke(this.colors.primary, this.colors.primary);

    this.doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(this.colors.white)
      .text('Metric', col1X + 10, tableY + 8);

    this.doc.text('Count', col2X + 10, tableY + 8);

    // Table rows
    const rows = [
      { label: 'Total Anomalies', value: reportData.summary.anomalies },
      { label: 'Total Patterns', value: reportData.summary.patterns },
      { label: 'Total Trends', value: reportData.summary.trends },
      { label: 'Total Predictions', value: reportData.summary.predictions },
    ];

    let currentY = tableY + rowHeight;

    rows.forEach((row, index) => {
      const bgColor = index % 2 === 0 ? this.colors.background : this.colors.white;

      this.doc.rect(col1X, currentY, 220, rowHeight).fillAndStroke(bgColor, this.colors.border);

      this.doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(this.colors.text)
        .text(row.label, col1X + 10, currentY + 8);

      this.doc.text(row.value.toString(), col2X + 10, currentY + 8);

      currentY += rowHeight;
    });

    this.doc.moveDown(3);

    // Next Steps
    this.doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(this.colors.primary)
      .text('Next Steps', 60, this.doc.y);

    this.doc.moveDown(1);

    const nextSteps = [
      'Review critical findings within 24 hours',
      'Investigate root causes for recurring patterns',
      'Plan interventions based on predictions',
      'Monitor progress after policy implementation',
    ];

    nextSteps.forEach((step) => {
      this.doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(this.colors.text)
        .text(`• ${step}`, 70, this.doc.y);

      this.doc.moveDown(0.5);
    });

    this.doc.moveDown(3);

    // Footer information
    this.doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(this.colors.textLight)
      .text(
        `Generated by: Aadhaar Intelligence System\nReport Date: ${new Date().toLocaleString('en-IN')}\nFor Questions: Contact support@aadhaar-intelligence.gov.in`,
        60,
        this.doc.y,
        {
          width: this.doc.page.width - 120,
          align: 'center',
        }
      );

    this.doc.moveDown(2);

    this.doc
      .fontSize(7)
      .fillColor(this.colors.textLight)
      .text('CONFIDENTIAL - FOR AUTHORIZED PERSONNEL ONLY', 60, this.doc.y, {
        align: 'center',
        width: this.doc.page.width - 120,
      });
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      critical: this.colors.critical,
      high: this.colors.high,
      medium: this.colors.medium,
      low: this.colors.low,
    };

    return colors[severity.toLowerCase()] || this.colors.textLight;
  }
}