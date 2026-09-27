import { scanJob } from "./src/lib/scanner/engine";

const tests = [
  {
    name: "Scam (should SKIP)",
    text: "URGENT! Need developer ASAP. Contact me on Telegram @user. Budget $200. Must start immediately.",
  },
  {
    name: "Legit (should APPLY)",
    text: "We need a React developer for a 3-month project. Budget is $3000. Payment verified. Clear deliverables and milestones defined. Please apply with portfolio.",
  },
  {
    name: "Exemption (should APPLY)",
    text: "We will discuss details on Telegram after the contract starts. Budget $1500. Verified client, clear requirements.",
  },
];

for (const t of tests) {
  console.log("\n==== " + t.name + " ====");
  const r = scanJob(t.text);
  console.log("Score:", r.score, "| Verdict:", r.verdict, "| Risk:", r.riskLevel);
  console.log("Red Flags:", r.redFlags.map((f) => f.type).join(", ") || "none");
  console.log("Strengths:", r.strengths.join(", ") || "none");
  console.log("Breakdown:", r.breakdown.map((b) => b.reason + " " + b.points).join(" | "));
}