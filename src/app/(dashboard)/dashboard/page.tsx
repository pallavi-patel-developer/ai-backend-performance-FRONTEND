"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendLineChart, SeverityPieChart } from "@/components/charts/Charts";
import { Activity, AlertTriangle, ArrowUpRight, Timer, Zap, Loader2 } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  performanceScore: number;
  issuesFound: number;
  criticalIssues: number;
  estimatedImprovement: number;
  averageLatency: number;
  totalScans: number;
  trend: { date: string; score: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = typeof window !== 'undefined'
          ? (localStorage.getItem('sb-access-token') || localStorage.getItem('supabase_token') || 'demo-token')
          : 'demo-token';
          
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, scansRes] = await Promise.all([
          fetch(`${API_URL}/api/report/dashboard/stats`, { headers }),
          fetch(`${API_URL}/api/scan`, { headers })
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        } else {
          setStats({
            performanceScore: 0,
            issuesFound: 0,
            criticalIssues: 0,
            estimatedImprovement: 0,
            averageLatency: 0,
            totalScans: 0,
            trend: []
          });
        }

        if (scansRes.ok) {
          const scansData = await scansRes.json();
          setScans(scansData);
        }

      } catch (err) {
        setStats({
          performanceScore: 0,
          issuesFound: 0,
          criticalIssues: 0,
          estimatedImprovement: 0,
          averageLatency: 0,
          totalScans: 0,
          trend: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  const displayStats = stats!;

  const chartData = displayStats.trend.map(t => ({
    name: t.date,
    score: t.score,
  }));

  const severityData = [
    { name: 'Critical', value: displayStats.criticalIssues },
    { name: 'High', value: Math.max(0, Math.floor((displayStats.issuesFound - displayStats.criticalIssues) * 0.4)) },
    { name: 'Medium', value: Math.max(0, Math.floor((displayStats.issuesFound - displayStats.criticalIssues) * 0.4)) },
    { name: 'Low', value: Math.max(0, displayStats.issuesFound - displayStats.criticalIssues - Math.floor((displayStats.issuesFound - displayStats.criticalIssues) * 0.8)) },
  ].filter(d => d.value > 0);

  const scoreColor = displayStats.performanceScore >= 80 ? "text-[#10B981]"
    : displayStats.performanceScore >= 60 ? "text-[#F59E0B]"
    : displayStats.performanceScore > 0 ? "text-[#EF4444]"
    : "text-[#A1A1AA]";

  const scoreLabel = displayStats.performanceScore >= 80 ? "Healthy"
    : displayStats.performanceScore >= 60 ? "Needs Improvement"
    : displayStats.performanceScore > 0 ? "Critical Issues"
    : "No Data";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-[#A1A1AA]">Monitor your backend performance and AI diagnostics.</p>
        </div>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#7C3AED]/20"
        >
          <Zap className="h-4 w-4" />
          New Analysis
        </Link>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Performance Score</CardTitle>
            <Activity className="h-4 w-4 text-[#7C3AED]" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${scoreColor}`}>{displayStats.performanceScore}/100</div>
            <p className={`text-xs mt-1 flex items-center ${scoreColor}`}>
              {scoreLabel}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Issues Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{displayStats.issuesFound}</div>
            <p className="text-xs text-[#EF4444] mt-1 flex items-center">
              {displayStats.criticalIssues} Critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Est. Improvement</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-[#10B981]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">+{displayStats.estimatedImprovement}%</div>
            <p className="text-xs text-[#A1A1AA] mt-1">If all recommendations are applied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Avg Latency</CardTitle>
            <Timer className="h-4 w-4 text-[#06B6D4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{displayStats.averageLatency} ms</div>
            <p className="text-xs text-[#A1A1AA] mt-1">{displayStats.totalScans} total scans</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Your backend score over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <TrendLineChart data={chartData} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-[#A1A1AA] text-sm">
                No trend data available. Run some scans!
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Issue Severity</CardTitle>
            <CardDescription>Distribution of detected bottlenecks</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            {severityData.length > 0 ? (
              <SeverityPieChart data={severityData} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-[#A1A1AA] text-sm">
                No issues detected yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Latest scans of your infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scans.length > 0 ? scans.slice(0, 5).map((scan) => (
                <div key={scan.id} className="flex items-center justify-between border-b border-[#222222] pb-4 last:border-0 last:pb-0">
                  <div>
                    <Link href={`/dashboard/results?scanId=${scan.id}`} className="font-medium text-white hover:text-[#7C3AED] transition-colors">
                      {scan.source_value || "Unknown Project"}
                    </Link>
                    <p className="text-sm text-[#A1A1AA]">{new Date(scan.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-white">{scan.overall_score || 0}/100</p>
                      <p className={`text-xs ${scan.status === 'completed' ? 'text-[#10B981]' : scan.status === 'failed' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>
                        {scan.status}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-[#A1A1AA] py-4 text-center">
                  No recent analyses found. Click "New Analysis" to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
