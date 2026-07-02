"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileCode2, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function IssueDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [issue, setIssue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIssue() {
      try {
        const token = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase_token") || "demo-token";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        // Fetch all scans and find the issue
        const res = await fetch(`${API_URL}/api/scan`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error("Failed to load data.");
        
        const scans = await res.json();
        const allIssues = scans.flatMap((scan: any) => 
          (scan.issues || []).map((i: any) => ({
            ...i,
            scanId: scan.id,
            scanDate: scan.created_at,
            projectName: scan.source_value
          }))
        );
        
        const found = allIssues.find((i: any) => i.id === id);
        if (found) {
          setIssue(found);
        } else {
          setError("Issue not found.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchIssue();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
        <p className="text-[#A1A1AA]">Loading issue details...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-[#EF4444]">
        <AlertCircle className="h-8 w-8" />
        <p>{error || "Issue not found."}</p>
        <Link href="/dashboard/issues" className="text-[#06B6D4] hover:underline">Return to Issues</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/dashboard/issues" className="inline-flex items-center text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Issues
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">{issue.title}</h1>
            <Badge variant={issue.severity?.toLowerCase() === 'critical' ? 'danger' : issue.severity?.toLowerCase() === 'high' ? 'warning' : 'default'} className="capitalize">
              {issue.severity}
            </Badge>
            <Badge variant="outline">{issue.category}</Badge>
            <Badge variant="outline" className="border-[#333333] text-[#A1A1AA]">Scan: {issue.projectName}</Badge>
          </div>
          <p className="text-[#A1A1AA] flex items-center gap-2">
            <Clock className="h-4 w-4" /> Detected on {issue.scanDate ? new Date(issue.scanDate).toLocaleString() : 'Unknown'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#222222] text-white text-sm font-medium rounded-md hover:bg-[#333333] transition-colors border border-[#222222]">
            Ignore Issue
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 text-[#10B981] text-sm font-medium rounded-md border border-[#10B981]/20 hover:bg-[#10B981]/20 transition-colors">
            <CheckCircle className="h-4 w-4" /> Mark as Resolved
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Root Cause Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-[#A1A1AA] mb-6 whitespace-pre-wrap">
                {issue.description}
              </p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-[#7C3AED]" /> Affected Files
                </h4>
                <div className="flex flex-wrap gap-2">
                  {issue.file_path ? (
                    <span className="px-2 py-1 bg-[#1A1A1A] border border-[#222222] rounded text-xs text-[#A1A1AA] font-mono">
                      {issue.file_path}{issue.line_number ? `:${issue.line_number}` : ''}
                    </span>
                  ) : (
                    <span className="text-sm text-[#A1A1AA]">No specific files identified.</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {issue.ai_fix_code ? (
            <Card>
              <CardHeader>
                <CardTitle>AI Optimization Recommendation</CardTitle>
                <CardDescription>Automatically generated code fix</CardDescription>
              </CardHeader>
              <CardContent>
                {issue.ai_fix_explanation && (
                  <p className="text-sm text-white mb-4">{issue.ai_fix_explanation}</p>
                )}
                <div className="bg-[#0A0A0A] rounded-lg border border-[#222222] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#111111] border-b border-[#222222]">
                    <span className="text-xs text-[#A1A1AA] font-mono">Suggested Fix</span>
                  </div>
                  <pre className="p-4 overflow-x-auto text-sm text-[#10B981] font-mono whitespace-pre-wrap">
                    <code>{issue.ai_fix_code}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
             <Card>
              <CardHeader>
                <CardTitle>AI Optimization Recommendation</CardTitle>
                <CardDescription>Recommended Action</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white">{issue.recommendation || "No specific fix provided."}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impact Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-[#111111] border border-[#222222] rounded-lg">
                <p className="text-xs text-[#A1A1AA] mb-1 uppercase font-semibold">Est. Performance Gain</p>
                <p className="text-2xl font-bold text-[#10B981]">+{issue.estimated_improvement_pct || 0}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">Details</p>
                <p className="text-sm text-[#A1A1AA]">{issue.impact || "General performance improvement expected."}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
