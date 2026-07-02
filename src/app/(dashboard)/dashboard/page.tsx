"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendLineChart, SeverityPieChart } from "@/components/charts/Charts";
import { Activity, AlertTriangle, ArrowUpRight, Timer, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScans() {
      try {
        const token = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase_token") || "demo-token";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/scan`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setScans(data);
        }
      } catch (err) {
        console.error("Failed to load scans", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchScans();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
        <p className="text-[#A1A1AA]">Loading dashboard...</p>
      </div>
    );
  }

  const latestScan = scans.length > 0 ? scans[0] : null;
  const avgScore = scans.length > 0 ? Math.round(scans.reduce((acc, s) => acc + (s.overall_score || 0), 0) / scans.length) : 0;
  
  // Use mock charts if no real trend data
  const chartData = scans.length > 0 
    ? scans.slice(0, 7).reverse().map(s => ({
        name: new Date(s.created_at).toLocaleDateString(undefined, { weekday: 'short' }),
        score: s.overall_score || 0
      }))
    : [ { name: 'Mon', score: 0 }, { name: 'Tue', score: 0 } ];

  const severityData = [
    { name: 'Critical', value: latestScan?.critical_count || 0 },
    { name: 'High', value: Math.max(0, (latestScan?.issues_count || 0) - (latestScan?.critical_count || 0)) },
    { name: 'Medium', value: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-[#A1A1AA]">Monitor your backend performance and AI diagnostics.</p>
        </div>
        {scans.length === 0 && (
          <Link href="/dashboard/upload" className="px-4 py-2 bg-[#7C3AED] text-white rounded-md text-sm font-medium hover:bg-[#6D28D9] transition-colors">
            Run First Scan
          </Link>
        )}
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Latest Score</CardTitle>
            <Activity className="h-4 w-4 text-[#7C3AED]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{latestScan?.overall_score || 0}/100</div>
            <p className="text-xs text-[#F59E0B] mt-1 flex items-center">
              {latestScan ? 'Current' : 'No scans yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Issues Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{latestScan?.issues_count || 0}</div>
            <p className="text-xs text-[#10B981] mt-1 flex items-center">
              {latestScan?.critical_count || 0} Critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Est. Improvement</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-[#10B981]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">+{latestScan?.estimated_improvement || 0}%</div>
            <p className="text-xs text-[#A1A1AA] mt-1">If all recommendations are applied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Avg Latency</CardTitle>
            <Timer className="h-4 w-4 text-[#06B6D4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{latestScan?.avg_latency_ms || 0} ms</div>
            <p className="text-xs text-[#EF4444] mt-1">From URL scans</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your backend score over recent scans</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendLineChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Issue Severity</CardTitle>
            <CardDescription>Distribution of detected bottlenecks (Latest)</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <SeverityPieChart data={severityData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses and Recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top AI Recommendations</CardTitle>
            <CardDescription>View full report in Results</CardDescription>
          </CardHeader>
          <CardContent>
            {latestScan ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <p className="text-[#A1A1AA] text-center">View the full AI report and specific code fixes.</p>
                <Link href={`/dashboard/results?scanId=${latestScan.id}`} className="px-4 py-2 bg-[#222222] hover:bg-[#333333] border border-[#333] rounded-lg text-white text-sm transition-colors">
                  View Full Report
                </Link>
              </div>
            ) : (
              <p className="text-[#A1A1AA] text-center py-8">No recommendations available.</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Latest scans of your infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scans.slice(0, 5).map((scan) => (
                <div key={scan.id} className="flex items-center justify-between border-b border-[#222222] pb-4 last:border-0 last:pb-0">
                  <div className="cursor-pointer hover:text-[#7C3AED]" onClick={() => router.push(`/dashboard/results?scanId=${scan.id}`)}>
                    <p className="font-medium text-white">{scan.source_value || "Unknown Source"}</p>
                    <p className="text-sm text-[#A1A1AA]">{new Date(scan.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-white">{scan.overall_score || 0}/100</p>
                      <p className="text-xs text-[#10B981] capitalize">{scan.status}</p>
                    </div>
                  </div>
                </div>
              ))}
              {scans.length === 0 && (
                <p className="text-[#A1A1AA] text-center py-4">No scans found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
