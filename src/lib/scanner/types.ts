export interface RedFlag {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  evidence: string;
}

export interface ScoreBreakdown {
  reason: string;
  points: number;
}

export interface ScanResult {
  score: number;
  verdict: "APPLY" | "CONSIDER" | "SKIP";
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  redFlags: RedFlag[];
  strengths: string[];
  breakdown: ScoreBreakdown[];
}
