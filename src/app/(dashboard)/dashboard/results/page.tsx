"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle2, Loader2, ArrowLeft, FolderKanban } from "lucide-react";
import Link from "next/link";

interface ScanResult {
  id: string;
  status: string;
  overall_score?: number;
  issues_count?: number;
  source_value?: string;
  ai_reports?: { executive_summary?: string; estimated_total_improvement?: number }[];
  issues?: { title: string; category: string; severity: string; estimated_improvement_pct: number }[];
  project_id?: string;
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const scanId = searchParams.get("scanId");
  const router = useRouter();
  
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(!!scanId);

  // Projects logic
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const getToken = () => {
    if (typeof window === 'undefined') return 'demo-token';
    return localStorage.getItem('sb-access-token') ||
           localStorage.getItem('supabase_token') ||
           'demo-token';
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    fetchProjects();
  }, [API_URL]);

  useEffect(() => {
    if (!scanId) {
      setLoading(false);
      return;
    }
    const fetchResult = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const res = await fetch(`${API_URL}/api/scan/${scanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
          if (data.project_id) {
            setSelectedProjectId(data.project_id);
          }
        } else {
          setResult(null);
        }
      } catch {
        /* handle error silently */
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [scanId, API_URL]);

  // When project changes (and we don't already have a scan for it, or user manually changed it)
  // We need to fetch the latest scan for this project.
  const handleProjectChange = async (projectId: string) => {
    setSelectedProjectId(projectId);
    setLoading(true);
    setResult(null);
    try {
      const token = getToken();
      // Fetch scans for this project (we can just fetch all scans and filter, since we don't have a specific API route)
      const res = await fetch(`${API_URL}/api/scan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const allScans = await res.json();
        const projectScans = allScans.filter((s: any) => s.project_id === projectId);
        if (projectScans.length > 0) {
          // Get latest
          const latestScan = projectScans.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          router.push(`/dashboard/results?scanId=${latestScan.id}`);
        } else {
          setLoading(false);
          // No scans for this project
        }
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  if (!result && !loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Analysis Results</h1>
          <p className="text-[#A1A1AA]">Select a project to view its latest scan results.</p>
        </div>
        
        <div className="bg-[#111111] rounded-2xl border border-[#222222] p-6 space-y-4 max-w-3xl">
          <label className="text-sm font-medium text-white block">Select Project</label>
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
          >
            <option value="" disabled>Choose a project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {selectedProjectId && (
          <Card className="max-w-3xl">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <FolderKanban className="h-12 w-12 text-[#A1A1AA] mb-3 opacity-40" />
              <p className="text-white font-medium text-lg">No Scans Found</p>
              <p className="text-[#A1A1AA] text-sm mt-1 mb-6">This project hasn't been scanned yet.</p>
              <Link
                href={`/dashboard/upload?projectId=${selectedProjectId}`}
                className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Run First Analysis
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const score = result?.overall_score ?? 0;
  const issuesList = result?.issues ?? [];
  const projectName = projects.find(p => p.id === result?.project_id)?.name || result?.source_value || "Unknown Project";
  const aiSummary =
    result?.ai_reports?.[0]?.executive_summary ??
    "No AI summary generated for this scan yet.";
  const improvement =
    result?.ai_reports?.[0]?.estimated_total_improvement ?? 0;

  const scoreColor =
    score >= 80 ? "border-t-[#10B981]" : score >= 60 ? "border-t-[#F59E0B]" : score > 0 ? "border-t-[#EF4444]" : "border-t-[#A1A1AA]";
  const scoreRisk =
    score >= 80 ? "Low Risk" : score >= 60 ? "Moderate Risk" : score > 0 ? "High Risk" : "No Data";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Analysis Results</h1>
          <p className="text-[#A1A1AA]">Latest diagnostics for &quot;{projectName}&quot;</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="w-48 bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
          >
            <option value="" disabled>Switch Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium rounded-md transition-colors border border-[#222222]">
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className={`md:col-span-1 border-t-4 ${scoreColor}`}>
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative h-32 w-32 flex items-center justify-center rounded-full border-8 border-[#222222]">
              <div className="absolute inset-0 rounded-full border-8 border-[#7C3AED] border-l-transparent border-b-transparent transform rotate-45"></div>
              <span className="text-4xl font-bold text-white">{score}</span>
            </div>
            <p className={`mt-4 text-sm font-medium ${
              score >= 80 ? "text-[#10B981]" : score >= 60 ? "text-[#F59E0B]" : score > 0 ? "text-[#EF4444]" : "text-[#A1A1AA]"
            }`}>{scoreRisk}</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Issues Summary</CardTitle>
            <CardDescription>We found {issuesList.length} issues impacting your backend performance.</CardDescription>
          </CardHeader>
          <CardContent>
            {issuesList.length > 0 ? (
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
                    {issuesList.map((issue: any, idx: number) => (
                      <tr key={issue.id ?? idx} className="border-b border-[#222222] hover:bg-[#1A1A1A] transition-colors">
                        <td className="px-4 py-4 font-medium text-white">{issue.title}</td>
                        <td className="px-4 py-4 text-[#A1A1AA]">{issue.category}</td>
                        <td className="px-4 py-4">
                          <Badge variant={
                            issue.severity?.toLowerCase() === 'critical' ? 'danger' :
                            issue.severity?.toLowerCase() === 'high' ? 'warning' : 'default'
                          }>
                            {issue.severity}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-[#10B981]">
                          +{issue.estimatedImprovementPercent ?? issue.estimated_improvement_pct ?? 0}%
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            href={`/dashboard/issues/${issue.id ?? idx}`}
                            className="text-[#06B6D4] hover:underline flex items-center justify-end gap-1"
                          >
                            <FileText className="h-4 w-4" /> View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-[#A1A1AA] text-sm">
                No issues detected. Looking good!
              </div>
            )}
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
                  <strong className="text-white">Analysis Complete.</strong>{" "}
                  {aiSummary}
                </p>
                {improvement > 0 && (
                  <p>
                    Applying all recommendations could improve performance by{" "}
                    <span className="text-[#10B981] font-semibold">+{improvement}%</span>.
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
