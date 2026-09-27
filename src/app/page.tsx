"use client";

import { useState } from "react";
import { Clock, FileText, Mail, Search, Shield, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { scanJob } from "@/lib/scanner/engine";
import type { ScanResult } from "@/lib/scanner/types";
import { useScanHistory } from "@/store/scanHistory";

type Tab = "Scanner" | "Proposal Writer" | "Client Emails" | "History";

const NAV_ITEMS: { label: Tab; icon: LucideIcon }[] = [
  { label: "Scanner", icon: Shield },
  { label: "Proposal Writer", icon: FileText },
  { label: "Client Emails", icon: Mail },
  { label: "History", icon: Clock },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("Scanner");
  const [jobText, setJobText] = useState<string>("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const { scans, addScan, clearHistory } = useScanHistory();

  const handleScan = () => {
    if (!jobText) return;
    const scan = scanJob(jobText);
    setResult(scan);
    addScan({
      title: jobText.slice(0, 50),
      score: scan.score,
      verdict: scan.verdict,
      riskLevel: scan.riskLevel,
      fullResult: scan,
    });
  };

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="w-64 bg-slate-900 text-white p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-6">Freelance Shield</h1>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => setActiveTab(label)}
              className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 ${
                activeTab === label ? "bg-slate-700" : "hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8 bg-slate-50">
        {activeTab === "Scanner" ? (
          <>
            <h1 className="text-3xl font-bold mb-2">Job Scanner</h1>
            <p className="text-slate-500 mb-6">
              Paste a job post. Get an instant verdict.
            </p>
            <Textarea
              className="min-h-[200px] mb-4"
              placeholder="Paste the Upwork job description here..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
            <Button type="button" onClick={handleScan}>
              <Search className="h-4 w-4" />
              Scan Job
            </Button>
            {result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 space-y-4"
              >
                <div
                  className={`flex w-24 h-24 rounded-full items-center justify-center text-white text-4xl font-bold ${
                    result.score >= 70
                      ? "bg-green-600"
                      : result.score >= 40
                        ? "bg-amber-500"
                        : "bg-red-600"
                  }`}
                >
                  {result.score}
                </div>

                <Card>
                  <CardContent>
                    <p
                      className={`text-2xl font-bold ${
                        result.verdict === "APPLY"
                          ? "text-green-600"
                          : result.verdict === "CONSIDER"
                            ? "text-amber-500"
                            : "text-red-600"
                      }`}
                    >
                      {result.verdict}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Risk: {result.riskLevel}
                    </p>
                  </CardContent>
                </Card>

                {result.redFlags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>🚩 Red Flags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.redFlags.map((flag) => (
                        <div key={flag.type}>
                          <p className="font-bold">{flag.type}</p>
                          <p className="italic text-slate-600">{flag.evidence}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {result.strengths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>✅ Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {result.strengths.map((strength) => (
                          <li key={strength}>{strength}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reason</TableHead>
                      <TableHead>Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.breakdown.map((row) => (
                      <TableRow key={row.reason}>
                        <TableCell>{row.reason}</TableCell>
                        <TableCell>{row.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell>Total</TableCell>
                      <TableCell>{result.score}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </motion.div>
            )}

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent Scans</h2>
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  Clear History
                </Button>
              </div>

              {scans.length === 0 ? (
                <p className="text-sm text-muted-foreground">No scans yet.</p>
              ) : (
                <div className="space-y-2">
                  {scans.map((scan) => (
                    <Card
                      key={scan.id}
                      className="cursor-pointer hover:bg-slate-100"
                      onClick={() => {
                        setResult(scan.fullResult);
                        setJobText(scan.title);
                      }}
                    >
                      <CardContent>
                        <p className="font-bold">{scan.title}</p>
                        <p className="text-sm text-slate-600">
                          Score: {scan.score} · {scan.verdict} ·{" "}
                          {new Date(scan.timestamp).toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <h1 className="text-4xl font-bold text-slate-900">{activeTab}</h1>
        )}
      </main>
    </div>
  );
}
