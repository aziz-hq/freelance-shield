import type { RedFlag, ScoreBreakdown, ScanResult } from "./types";

const RED_FLAG_PATTERNS: Array<{ type: string; regex: RegExp }> = [
  { type: "Telegram", regex: /telegram|t\.me/i },
  { type: "WhatsApp", regex: /whatsapp|wa\.me/i },
  { type: "Remote Desktop", regex: /anydesk|teamviewer|rustdesk/i },
  { type: "Upfront Fee", regex: /upfront fee|registration fee|pay.*before.*start|security deposit/i },
  { type: "Crypto Payment", regex: /crypto|bitcoin|usdt/i },
];

const URGENCY_REGEX = /urgent|asap|immediately|24 hours/i;

const EXEMPTION_REGEXES: RegExp[] = [
  /after (the )?contract (starts|begins|is signed|is in place)/i,
  /once hired/i,
  /after we begin/i,
  /post-?contract/i,
  /after (the )?project is awarded/i,
  /once (the )?contract is in place/i,
  /after signing/i,
];

function extractSentence(text: string, index: number): string {
  const before = text.slice(0, index);
  const after = text.slice(index);
  const startMatch = before.match(/[.!?]\s+[^.!?]*$/);
  const start = startMatch ? before.length - startMatch[0].length + 1 : 0;
  const endMatch = after.match(/[.!?](\s|$)/);
  const end = endMatch && endMatch.index !== undefined
    ? index + endMatch.index + 1
    : text.length;
  return text.slice(start, end).trim();
}

export function detectRedFlags(text: string): RedFlag[] {
  const flags: RedFlag[] = [];
  for (const { type, regex } of RED_FLAG_PATTERNS) {
    const match = text.match(regex);
    if (match && match.index !== undefined) {
      flags.push({
        type,
        severity: "HIGH",
        evidence: extractSentence(text, match.index),
      });
    }
  }
  return flags;
}

export function checkExemptions(text: string): boolean {
  return EXEMPTION_REGEXES.some((rx) => rx.test(text));
}

export function scanJob(text: string): ScanResult {
  let score = 50;
  const breakdown: ScoreBreakdown[] = [];
  const strengths: string[] = [];

  let redFlags = detectRedFlags(text);
  const exempt = checkExemptions(text);
  if (exempt) {
    redFlags = redFlags.filter(
      (f) => f.type !== "Telegram" && f.type !== "WhatsApp" && f.type !== "Remote Desktop"
    );
  }

  for (const flag of redFlags) {
    const penalty = -35;
    score += penalty;
    breakdown.push({ reason: "Red flag: " + flag.type, points: penalty });
  }

  if (URGENCY_REGEX.test(text)) {
    score -= 10;
    breakdown.push({ reason: "Panic urgency", points: -10 });
  }

  if (/\$\d+/.test(text)) {
    score += 15;
    strengths.push("Clear budget");
    breakdown.push({ reason: "Clear budget", points: 15 });
  }
  if (/deliverable|milestone|requirement/i.test(text)) {
    score += 10;
    strengths.push("Clear deliverables");
    breakdown.push({ reason: "Clear deliverables", points: 10 });
  }
  if (/verified|payment verified|long-term/i.test(text)) {
    score += 10;
    strengths.push("Verified client signals");
    breakdown.push({ reason: "Verified client signals", points: 10 });
  }
  if (/\d+[-\s]*(day|days|week|weeks|month|months)/i.test(text)) {
    score += 5;
    strengths.push("Realistic timeline");
    breakdown.push({ reason: "Realistic timeline", points: 5 });
  }

  score = Math.max(0, Math.min(100, score));

  const verdict: ScanResult["verdict"] =
    score >= 70 ? "APPLY" : score >= 40 ? "CONSIDER" : "SKIP";

  const highCount = redFlags.filter((f) => f.severity === "HIGH").length;
  const riskLevel: ScanResult["riskLevel"] =
    highCount === 0 ? "LOW" : highCount === 1 ? "MEDIUM" : "HIGH";

  return { score, verdict, riskLevel, redFlags, strengths, breakdown };
}
