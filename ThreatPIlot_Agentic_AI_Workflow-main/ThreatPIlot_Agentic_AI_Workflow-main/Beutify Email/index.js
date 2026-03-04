import markdownToHtml from "./template.js";
import sendEmail from './mailer.js';

// Example markdown from LLM
const markdownTemplate = `
### SECTION A — MACHINE-READABLE JSON

\`\`\`json
{
  "execution_id": "unknown",
  "analyzed_time_window": {
    "from": 1768408680277,
    "to": 1768412280277
  },
  "findings": [
    {
      "finding_id": "INC-001",
      "domain": "identity",
      "classification": "brute_force",
      "severity": "high",
      "confidence": 0.85,
      "context": {
        "service": "Unknown",
        "app": "Unknown",
        "environment": "Unknown"
      },
      "offender": {
        "type": "ip",
        "value": "Unknown"
      },
      "metrics": {
        "event_count": 1,
        "unique_targets": 1,
        "success_count": 0,
        "failure_count": 1
      },
      "time_window": {
        "from": 1768412280277,
        "to": 1768412280277
      },
      "evidence_samples": ["Failed login attempts"],
      "summary": "Single high-severity failed login attempts event detected from unknown source"
    },
    {
      "finding_id": "INC-002",
      "domain": "http",
      "classification": "resource_exhaustion",
      "severity": "medium",
      "confidence": 0.75,
      "context": {
        "service": "Unknown",
        "app": "Unknown",
        "environment": "Unknown"
      },
      "offender": {
        "type": "ip",
        "value": "Unknown"
      },
      "metrics": {
        "event_count": 1,
        "unique_targets": 1,
        "success_count": 0,
        "failure_count": 1
      },
      "time_window": {
        "from": 1768408680277,
        "to": 1768408680277
      },
      "evidence_samples": ["CPU spike detected"],
      "summary": "CPU resource exhaustion event detected from unknown source"
    }
  ]
}
\`\`\`

### SECTION B — SOC REPORT

**Executive Summary**  
Analysis of the 1-hour observation window (approximately 1768408680 to 1768412280 Unix ms) identified two potential security-relevant events from incident history data. Primary concerns include a high-severity failed login attempts event (INC-001) indicative of possible brute-force activity, and a medium-severity CPU spike (INC-002) suggesting resource exhaustion. No raw log data was available due to multiple Loki query failures, limiting pattern correlation and offender attribution. Confidence in findings is moderate due to lack of supporting log evidence.

**Timeline Overview**  
- ~T-1hr (1768408680277): CPU spike detected (INC-002, medium severity)  
- ~T0 (1768412280277): Failed login attempts detected (INC-001, high severity)  

**Key Findings**  
- **INC-001 (brute_force, identity domain)**: Single "Failed login attempts" event flagged as high severity. No IP, user ID, or target details available. Confidence 0.85.  
- **INC-002 (resource_exhaustion, http domain)**: Single "CPU spike detected" event flagged as medium severity. Confidence 0.75.

**Risk Assessment**  
- **INC-001**: High risk if part of sustained attack.  
- **INC-002**: Medium risk. Overall risk: Elevated due to identity compromise potential.

**Observed Trends**  
Limited to two discrete events with no frequency data. No evidence of concentration or deviation from baseline.

**Known Gaps/Limitations**  
- **Critical**: Loki queries failed (parse errors, HTTP 404). No raw logs available.  
- **Attribution**: Offenders listed as "Unknown".  
- **Scope**: Limited to 2 events in 24h.  
- **Time Precision**: ~1hr window, incidents lack full log context.

**Monitoring Recommendations**  
- Prioritize INC-001: Alert on repeated auth failures.  
- Validate INC-002: Correlate CPU metrics with traffic logs.  
- Resolve data gaps: Fix Loki queries.  
- Escalate if similar events recur within 24h.
`;

(async () => {
    try {
        const html = markdownToHtml(markdownTemplate);

        const recipients = [
            'shahidibrahim6444@gmail.com',
        ];

        await sendEmail({
            to: recipients,
            subject: 'SOC Report & Findings',
            html
        });

        console.log('Emails sent successfully!');
    } catch (err) {
        console.error('Error sending emails:', err);
    }
})();
