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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const severityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, critical: 0, high: 1, medium: 2, low: 3 };

const categoryIcons: Record<string, React.ElementType> = {
  Database: Database,
  Caching: Zap,
  Memory: MemoryStick,
  CPU: Cpu,
};

const FILTERS = {
  severity: ["All", "Critical", "High", "Medium", "Low"],
  status: ["All", "Open", "Resolved"],
  category: ["All", "Database", "Caching", "Memory", "CPU", "Security", "Architecture", "Other"],
};

export default function IssuesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeSeverity, setActiveSeverity] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"severity" | "timestamp" | "improvement">("severity");

  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIssues() {
      try {
        const token = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase_token") || "demo-token";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/scan`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const scans = await res.json();
          const allIssues = scans.flatMap((scan: any) => 
            (scan.issues || []).map((issue: any) => ({
              ...issue,
              scanId: scan.id,
              scanDate: scan.created_at,
              projectName: scan.source_value
            }))
          );
          setIssues(allIssues);
        }
      } catch (err) {
        console.error("Failed to load issues", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchIssues();
  }, []);

  const stats = useMemo(() => ({
    total: issues.length,
    critical: issues.filter((i) => i.severity?.toLowerCase() === "critical").length,
    open: issues.filter((i) => i.status !== "resolved").length,
    resolved: issues.filter((i) => i.status?.toLowerCase() === "resolved").length,
  }), [issues]);

  const filtered = useMemo(() => {
    return issues
      .filter((issue) => {
        const matchSearch =
          !search ||
          issue.title?.toLowerCase().includes(search.toLowerCase()) ||
          issue.description?.toLowerCase().includes(search.toLowerCase());
        const matchSeverity = activeSeverity === "All" || issue.severity?.toLowerCase() === activeSeverity.toLowerCase();
        const issueStatus = issue.status?.toLowerCase() === "resolved" ? "Resolved" : "Open";
        const matchStatus = activeStatus === "All" || issueStatus === activeStatus;
        const matchCategory = activeCategory === "All" || issue.category === activeCategory;
        return matchSearch && matchSeverity && matchStatus && matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === "severity") return (severityOrder[a.severity?.toLowerCase()] ?? 99) - (severityOrder[b.severity?.toLowerCase()] ?? 99);
        if (sortBy === "timestamp") return new Date(b.scanDate || 0).getTime() - new Date(a.scanDate || 0).getTime();
        if (sortBy === "improvement") return (b.estimated_improvement_pct || 0) - (a.estimated_improvement_pct || 0);
        return 0;
      });
  }, [issues, search, activeSeverity, activeStatus, activeCategory, sortBy]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
        <p className="text-[#A1A1AA]">Loading issues...</p>
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
        <button 
          onClick={() => router.push("/dashboard/upload")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white text-sm font-medium rounded-lg hover:bg-[#6D28D9] transition-colors"
        >
          <Zap className="h-4 w-4" />
          Run New Scan
        </button>
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
              <p className="text-white font-medium text-lg">No issues match your filters</p>
              <p className="text-[#A1A1AA] text-sm mt-1">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((issue) => {
            const CategoryIcon = categoryIcons[issue.category] ?? AlertCircle;
            const isResolved = issue.status?.toLowerCase() === "resolved";
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
                        issue.severity?.toLowerCase() === "critical" ? "bg-[#EF4444]/10" :
                        issue.severity?.toLowerCase() === "high" ? "bg-[#F59E0B]/10" :
                        "bg-[#7C3AED]/10"
                      )}>
                        <CategoryIcon className={cn(
                          "h-5 w-5",
                          issue.severity?.toLowerCase() === "critical" ? "text-[#EF4444]" :
                          issue.severity?.toLowerCase() === "high" ? "text-[#F59E0B]" :
                          "text-[#7C3AED]"
                        )} />
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs text-[#A1A1AA] font-mono">{issue.id.slice(0,8)}</span>
                          <Badge
                            variant={
                              issue.severity?.toLowerCase() === "critical" ? "danger" :
                              issue.severity?.toLowerCase() === "high" ? "warning" :
                              "default"
                            }
                            className="capitalize"
                          >
                            {issue.severity}
                          </Badge>
                          <Badge variant="outline" className="border-[#333333] text-[#A1A1AA]">
                            {issue.category}
                          </Badge>
                          {isResolved && (
                            <Badge variant="success">Resolved</Badge>
                          )}
                          <Badge variant="outline" className="border-[#333333] text-[#A1A1AA]">
                            Scan: {issue.projectName}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-white text-base group-hover:text-[#7C3AED] transition-colors truncate">
                          {issue.title}
                        </h3>
                        <p className="text-sm text-[#A1A1AA] mt-1 line-clamp-1">{issue.description}</p>

                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <span className="text-xs text-[#A1A1AA] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {issue.scanDate ? new Date(issue.scanDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : 'Unknown Date'}
                          </span>
                          <span className="text-xs text-[#10B981] font-medium">
                            +{issue.estimated_improvement_pct || 0}% est. gain
                          </span>
                          {issue.file_path && (
                            <span className="text-xs text-[#A1A1AA]">
                              File: {issue.file_path}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right arrow */}
                      <ChevronRight className="h-4 w-4 text-[#A1A1AA] flex-shrink-0 mt-1 group-hover:text-[#7C3AED] transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p className="text-center text-sm text-[#A1A1AA]">
          Showing <span className="text-white font-medium">{filtered.length}</span> of{" "}
          <span className="text-white font-medium">{issues.length}</span> issues
        </p>
      )}
    </div>
  );
}
