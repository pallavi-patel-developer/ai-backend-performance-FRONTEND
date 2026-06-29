"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendLineChart, SeverityPieChart } from "@/components/charts/Charts";
import { mockData } from "@/data/mock";
import { Activity, AlertTriangle, ArrowUpRight, Cpu, HardDrive, Timer } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const chartData = mockData.historicalTrends.labels.map((label, i) => ({
    name: label,
    score: mockData.historicalTrends.score[i],
  }));

  const severityData = [
    { name: 'Critical', value: 1 },
    { name: 'High', value: 2 },
    { name: 'Medium', value: 1 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-[#A1A1AA]">Monitor your backend performance and AI diagnostics.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Performance Score</CardTitle>
            <Activity className="h-4 w-4 text-[#7C3AED]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{mockData.dashboard.performanceScore}/100</div>
            <p className="text-xs text-[#F59E0B] mt-1 flex items-center">
              Needs Improvement
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Issues Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{mockData.dashboard.issuesFound}</div>
            <p className="text-xs text-[#10B981] mt-1 flex items-center">
              4 Critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Est. Improvement</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-[#10B981]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">+{mockData.dashboard.estimatedImprovement}%</div>
            <p className="text-xs text-[#A1A1AA] mt-1">If all recommendations are applied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#A1A1AA]">Avg Latency</CardTitle>
            <Timer className="h-4 w-4 text-[#06B6D4]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{mockData.dashboard.averageLatency} ms</div>
            <p className="text-xs text-[#EF4444] mt-1">+120ms since last week</p>
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
            <TrendLineChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Issue Severity</CardTitle>
            <CardDescription>Distribution of detected bottlenecks</CardDescription>
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
            <CardDescription>High impact fixes for your backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.issues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="flex items-start justify-between border-b border-[#222222] pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <Link href={`/dashboard/issues/\${issue.id}`} className="font-medium text-white hover:text-[#7C3AED] transition-colors">
                      {issue.title}
                    </Link>
                    <p className="text-sm text-[#A1A1AA] line-clamp-1">{issue.description}</p>
                  </div>
                  <Badge variant={issue.severity === 'Critical' ? 'danger' : issue.severity === 'High' ? 'warning' : 'default'}>
                    {issue.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Latest scans of your infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="flex items-center justify-between border-b border-[#222222] pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-white">{analysis.project}</p>
                    <p className="text-sm text-[#A1A1AA]">{analysis.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-white">{analysis.score}/100</p>
                      <p className="text-xs text-[#10B981]">{analysis.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
