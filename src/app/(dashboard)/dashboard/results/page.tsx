"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

function ResultsContent() {
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scanId");
  
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScan() {
      if (!scanId) {
        setError("No scan ID provided in URL.");
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase_token") || "demo-token";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/scan/${scanId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          throw new Error("Failed to load scan data.");
        }
        
        const data = await res.json();
        setScan(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchScan();
  }, [scanId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
        <p className="text-[#A1A1AA]">Loading scan results...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-[#EF4444]">
        <AlertCircle className="h-8 w-8" />
        <p>{error || "Scan not found."}</p>
        <Link href="/dashboard" className="text-[#06B6D4] hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const issues = scan.issues || [];
  const aiReport = scan.ai_reports?.[0] || {};
  const score = scan.overall_score || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Analysis Results</h1>
          <p className="text-[#A1A1AA]">Latest diagnostics for "{scan.source_value}"</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium rounded-md transition-colors border border-[#222222]">
          <Download className="h-4 w-4" /> Download PDF Report
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1 border-t-4 border-t-[#7C3AED]">
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative h-32 w-32 flex items-center justify-center rounded-full border-8 border-[#222222]">
              <div className="absolute inset-0 rounded-full border-8 border-[#7C3AED] border-l-transparent border-b-transparent transform rotate-45"></div>
              <span className="text-4xl font-bold text-white">{score}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-[#10B981]">
              {score >= 80 ? 'Excellent' : score >= 50 ? 'Moderate Risk' : 'Critical Risk'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Issues Summary</CardTitle>
            <CardDescription>We found {issues.length} issues impacting your backend performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#A1A1AA] uppercase bg-[#111111] border-b border-[#222222]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Issue</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                    <th className="px-4 py-3 font-medium">Est. Impact</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue: any) => (
                    <tr key={issue.id} className="border-b border-[#222222] hover:bg-[#1A1A1A] transition-colors">
                      <td className="px-4 py-4 font-medium text-white max-w-[200px] truncate" title={issue.title}>{issue.title}</td>
                      <td className="px-4 py-4 text-[#A1A1AA]">{issue.category}</td>
                      <td className="px-4 py-4">
                        <Badge variant={issue.severity === 'critical' ? 'danger' : issue.severity === 'high' ? 'warning' : 'default'}>
                          {issue.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-[#10B981]">+{issue.estimated_improvement_pct || 0}%</td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/dashboard/issues/${issue.id}`} className="text-[#06B6D4] hover:underline flex items-center justify-end gap-1">
                          <FileText className="h-4 w-4" /> View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {issues.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#A1A1AA]">
                        No issues found in this scan. Great job!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Improvement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#222222]">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-8 w-8 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-[#A1A1AA]">
                <p>
                  <strong className="text-white">Analysis Complete.</strong> {aiReport.executive_summary || "No AI report generated for this scan."}
                </p>
                {aiReport.detailed_analysis && (
                  <p className="mt-2 text-[#A1A1AA]">{aiReport.detailed_analysis}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#A1A1AA]">Loading interface...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
