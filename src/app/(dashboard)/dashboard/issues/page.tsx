"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ChevronRight,
  Zap,
  Database,
  Cpu,
  MemoryStick,
  ArrowUpDown,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const severityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

const categoryIcons: Record<string, React.ElementType> = {
  Database: Database,
  Caching: Zap,
  Memory: MemoryStick,
  CPU: Cpu,
};

const FILTERS = {
  severity: ["All", "Critical", "High", "Medium", "Low"],
  status: ["All", "Open", "Resolved"],
  category: ["All", "Database", "Caching", "Memory", "CPU"],
};

export default function IssuesPage() {
  const [search, setSearch] = useState("");
  const [activeSeverity, setActiveSeverity] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"severity" | "timestamp" | "improvement">("severity");
  
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("sb-access-token") || "demo-token";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        
        // Fetch issues
        const res = await fetch(`${API_URL}/api/report/issues/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const rawIssues = await res.json();
          
          // Also fetch projects to get project names
          const projRes = await fetch(`${API_URL}/api/projects`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const projectsData = projRes.ok ? await projRes.json() : [];
          
          // Also fetch scans to link issue to project
          const scanRes = await fetch(`${API_URL}/api/scan`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const scansData = scanRes.ok ? await scanRes.json() : [];

          const mapped = rawIssues.map((issue: any) => {
            const scan = scansData.find((s: any) => s.id === issue.scan_id);
            const project = scan ? projectsData.find((p: any) => p.id === scan.project_id) : null;
            
            // Format category
            let categoryFormatted = 'API';
            const cat = issue.category?.toLowerCase();
            if (cat === 'database') categoryFormatted = 'Database';
            else if (cat === 'memory') categoryFormatted = 'Memory';
            else if (cat === 'cpu') categoryFormatted = 'CPU';
            else if (cat === 'security') categoryFormatted = 'Caching'; // Default mapping to match chip rules
            else if (cat === 'architecture') categoryFormatted = 'CPU';

            // Format severity
            let severityFormatted = 'Low';
            const sev = issue.severity?.toLowerCase();
            if (sev === 'critical') severityFormatted = 'Critical';
            else if (sev === 'high') severityFormatted = 'High';
            else if (sev === 'medium') severityFormatted = 'Medium';

            return {
              id: issue.id,
              title: issue.title,
              description: issue.description || '',
              severity: severityFormatted,
              category: categoryFormatted,
              status: issue.is_resolved ? 'Resolved' : 'Open',
              project: project?.name || 'Unknown Project',
              estimatedImprovementPercent: issue.estimated_improvement_pct || 0,
              file: issue.file_path || 'url-scan',
              lineNumber: issue.line_number || 0,
              timestamp: issue.created_at,
            };
          });
          setIssues(mapped);
        }
      } catch (err) {
        console.error("Failed to load issues", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const stats = useMemo(() => ({
    total: issues.length,
    critical: issues.filter((i) => i.severity === "Critical").length,
    open: issues.filter((i) => i.status === "Open").length,
    resolved: issues.filter((i) => i.status === "Resolved").length,
  }), [issues]);

  const filtered = useMemo(() => {
    return issues
      .filter((issue) => {
        const matchSearch =
          !search ||
          issue.title.toLowerCase().includes(search.toLowerCase()) ||
          issue.description.toLowerCase().includes(search.toLowerCase());
        const matchSeverity = activeSeverity === "All" || issue.severity === activeSeverity;
        const matchStatus = activeStatus === "All" || issue.status === activeStatus;
        const matchCategory = activeCategory === "All" || issue.category === activeCategory;
        return matchSearch && matchSeverity && matchStatus && matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === "severity") return (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99);
        if (sortBy === "timestamp") return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        if (sortBy === "improvement") return (b.estimatedImprovementPercent || 0) - (a.estimatedImprovementPercent || 0);
        return 0;
      });
  }, [issues, search, activeSeverity, activeStatus, activeCategory, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Issues</h1>
          <p className="text-[#A1A1AA]">All detected performance bottlenecks and AI recommendations.</p>
        </div>
        <Link href="/dashboard/upload" className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white text-sm font-medium rounded-lg hover:bg-[#6D28D9] transition-colors">
          <Zap className="h-4 w-4" />
          Run New Scan
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Issues", value: stats.total, icon: AlertCircle, color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10" },
          { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
          { label: "Open", value: stats.open, icon: Clock, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
          { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="group hover:border-[#333333] transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#A1A1AA] mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-xl", stat.bg)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
            <input
              type="text"
              placeholder="Search issues by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0A0A0A] border border-[#222222] rounded-lg text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          {/* Filter chips row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <span className="text-xs text-[#A1A1AA] font-medium uppercase tracking-wider">Severity</span>
              <div className="flex gap-1">
                {FILTERS.severity.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSeverity(s)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-full border transition-colors font-medium",
                      activeSeverity === s
                        ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                        : "border-[#333333] text-[#A1A1AA] hover:border-[#555555] hover:text-white"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A1A1AA] font-medium uppercase tracking-wider">Status</span>
              <div className="flex gap-1">
                {FILTERS.status.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveStatus(s)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-full border transition-colors font-medium",
                      activeStatus === s
                        ? "bg-[#06B6D4] border-[#06B6D4] text-white"
                        : "border-[#333333] text-[#A1A1AA] hover:border-[#555555] hover:text-white"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A1A1AA] font-medium uppercase tracking-wider">Category</span>
              <div className="flex gap-1">
                {FILTERS.category.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveCategory(s)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-full border transition-colors font-medium",
                      activeCategory === s
                        ? "bg-[#10B981] border-[#10B981] text-white"
                        : "border-[#333333] text-[#A1A1AA] hover:border-[#555555] hover:text-white"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sort row */}
          <div className="flex items-center gap-2 pt-1 border-t border-[#1A1A1A]">
            <ArrowUpDown className="h-3.5 w-3.5 text-[#A1A1AA]" />
            <span className="text-xs text-[#A1A1AA] font-medium uppercase tracking-wider mr-1">Sort by</span>
            {(["severity", "timestamp", "improvement"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-full border transition-colors font-medium capitalize",
                  sortBy === s
                    ? "bg-[#1A1A1A] border-[#444444] text-white"
                    : "border-transparent text-[#A1A1AA] hover:text-white"
                )}
              >
                {s === "improvement" ? "Est. Improvement" : s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-12 w-12 text-[#10B981] mb-3 opacity-60" />
              <p className="text-white font-medium text-lg">No issues found</p>
              <p className="text-[#A1A1AA] text-sm mt-1">Run a scan to detect backend bottlenecks.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((issue) => {
            const CategoryIcon = categoryIcons[issue.category] ?? AlertCircle;
            const isResolved = issue.status === "Resolved";
            return (
              <Link key={issue.id} href={`/dashboard/issues/${issue.id}`}>
                <Card className={cn(
                  "group cursor-pointer transition-all duration-200 hover:border-[#333333] hover:shadow-lg hover:shadow-black/30",
                  isResolved && "opacity-70"
                )}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Category icon */}
                      <div className={cn(
                        "flex-shrink-0 p-2.5 rounded-lg mt-0.5",
                        issue.severity === "Critical" ? "bg-[#EF4444]/10" :
                        issue.severity === "High" ? "bg-[#F59E0B]/10" :
                        "bg-[#7C3AED]/10"
                      )}>
                        <CategoryIcon className={cn(
                          "h-5 w-5",
                          issue.severity === "Critical" ? "text-[#EF4444]" :
                          issue.severity === "High" ? "text-[#F59E0B]" :
                          "text-[#7C3AED]"
                        )} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <h3 className="font-semibold text-white text-base group-hover:text-[#7C3AED] transition-colors line-clamp-1">
                            {issue.title}
                          </h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={issue.severity === "Critical" ? "danger" : issue.severity === "High" ? "warning" : "default"}>
                              {issue.severity}
                            </Badge>
                            {isResolved && (
                              <Badge variant="success" className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20">
                                Resolved
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-[#A1A1AA] line-clamp-2 mb-3">
                          {issue.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <span className="flex items-center gap-1.5 text-[#A1A1AA]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#333333]" />
                            {issue.project}
                          </span>
                          <span className="text-[#333333]">•</span>
                          <span className="flex items-center gap-1 text-[#10B981] font-medium">
                            <Zap className="h-3.5 w-3.5" />
                            +{issue.estimatedImprovementPercent}% boost
                          </span>
                          <span className="text-[#333333]">•</span>
                          <span className="text-[#A1A1AA] font-mono">
                            {issue.file}:{issue.lineNumber}
                          </span>
                          <span className="flex-1" />
                          <span className="text-[#A1A1AA] flex items-center gap-1 group-hover:text-white transition-colors">
                            View Solution <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
