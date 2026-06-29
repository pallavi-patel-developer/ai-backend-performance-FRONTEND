"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Zap, AlertTriangle, Code2, Copy, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  file_path?: string | null;
  line_number?: number | null;
  code_snippet?: string | null;
  ai_fix?: string | null;
  estimated_improvement_pct: number;
  is_resolved: boolean;
}

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getToken = () => {
    if (typeof window === 'undefined') return 'demo-token';
    return localStorage.getItem('sb-access-token') ||
           localStorage.getItem('supabase_token') ||
           'demo-token';
  };

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/report/issues/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIssue(data);
        } else {
          setIssue(null);
        }
      } catch (err) {
        console.error("Failed to load issue details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssue();
  }, [id, API_URL]);

  const handleResolve = async () => {
    if (!issue) return;
    try {
      setResolving(true);
      const res = await fetch(`${API_URL}/api/report/issues/${issue.id}/resolve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setIssue((prev) => prev ? { ...prev, is_resolved: true } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  const copyCode = () => {
    if (!issue?.code_snippet) return;
    navigator.clipboard.writeText(issue.code_snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <Link href="/dashboard/issues" className="inline-flex items-center text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Issues
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            Issue Details
          </h1>
        </div>

        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="h-12 w-12 text-[#F59E0B] mb-3 opacity-60" />
            <p className="text-white font-medium text-lg">Details Not Found</p>
            <p className="text-[#A1A1AA] text-sm mt-1">
              This issue does not exist or has not been loaded from the backend yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sev = issue.severity?.toLowerCase();
  const severityFormatted = sev === 'critical' ? 'Critical' : sev === 'high' ? 'High' : sev === 'medium' ? 'Medium' : 'Low';
  const categoryFormatted = issue.category ? issue.category.toUpperCase() : 'API';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/dashboard/issues" className="inline-flex items-center text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Issues
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            {issue.title}
          </h1>
        </div>
        {!issue.is_resolved ? (
          <button
            onClick={handleResolve}
            disabled={resolving}
            className="flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-[#10B981]/25 disabled:opacity-50"
          >
            {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Mark as Resolved
          </button>
        ) : (
          <Badge variant="success" className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 px-3 py-1.5 text-sm">
            Resolved
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#A1A1AA] text-sm leading-relaxed whitespace-pre-line">
                {issue.description}
              </p>
            </CardContent>
          </Card>

          {issue.code_snippet && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Code2 className="h-5 w-5 text-[#7C3AED]" /> Code Snippet
                </CardTitle>
                <button
                  onClick={copyCode}
                  className="p-1.5 hover:bg-[#222222] rounded transition-colors text-[#A1A1AA] hover:text-white text-xs flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-[#0A0A0A] p-4 rounded-lg border border-[#222222] font-mono text-xs overflow-x-auto text-[#A1A1AA]">
                  <pre>{issue.code_snippet}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {issue.ai_fix && (
            <Card className="border-l-4 border-l-[#7C3AED]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="h-5 w-5 text-[#7C3AED] fill-[#7C3AED]/20" /> AI Suggested Fix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#1A1A1A] p-5 rounded-lg border border-[#222222] text-sm leading-relaxed text-[#A1A1AA] whitespace-pre-line">
                  {issue.ai_fix}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-[#222222]">
                <span className="text-[#A1A1AA]">Severity</span>
                <Badge variant={severityFormatted === 'Critical' ? 'danger' : severityFormatted === 'High' ? 'warning' : 'default'}>
                  {severityFormatted}
                </Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-[#222222]">
                <span className="text-[#A1A1AA]">Category</span>
                <span className="font-semibold text-white">{categoryFormatted}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#222222]">
                <span className="text-[#A1A1AA]">Est. Performance Boost</span>
                <span className="font-semibold text-[#10B981]">+{issue.estimated_improvement_pct}%</span>
              </div>
              {issue.file_path && (
                <div className="space-y-1 py-2">
                  <span className="text-[#A1A1AA] block">File Location</span>
                  <span className="font-mono text-xs text-white break-all block bg-[#1A1A1A] p-2 rounded border border-[#222222]">
                    {issue.file_path}
                    {issue.line_number && ` : L${issue.line_number}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
