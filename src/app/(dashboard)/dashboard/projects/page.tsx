"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FolderKanban,
  Search,
  TrendingUp,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  ChevronRight,
  Plus,
  Filter,
  Activity,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, { badge: "default" | "success" | "warning" | "danger" | "outline"; dot: string }> = {
  Active: { badge: "success", dot: "bg-[#10B981]" },
  completed: { badge: "success", dot: "bg-[#10B981]" },
  running: { badge: "warning", dot: "bg-[#F59E0B]" },
  failed: { badge: "danger", dot: "bg-[#EF4444]" },
  Paused: { badge: "outline", dot: "bg-[#A1A1AA]" },
};

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : score > 0 ? "#EF4444" : "#A1A1AA";
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#222222" strokeWidth="4" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>
        {score || 0}
      </span>
    </div>
  );
}

import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [view, setView] = useState<"grid" | "list">("grid");
  
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = typeof window !== 'undefined'
          ? (localStorage.getItem('sb-access-token') || localStorage.getItem('supabase_token') || 'demo-token')
          : 'demo-token';
          
        const res = await fetch(`${API_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (e) {
        // failed
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [API_URL]);

  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.length; // Active means created projects for now
    const criticalScans = 0; // We can't know this from just projects table right now
    const totalScore = 0;
    const avgScore = 0;
    
    return { total, active, critical: criticalScans, avgScore };
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const name = p.name || p.id;
      const matchSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase());
        
      let matchStatus = true;
      return matchSearch && matchStatus;
    });
  }, [search, activeStatus, projects]);

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Projects</h1>
          <p className="text-[#A1A1AA]">Monitor and manage all your backend services in one place.</p>
        </div>
        <Link href="/dashboard/projects/new" className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white text-sm font-medium rounded-lg hover:bg-[#6D28D9] transition-colors">
          <Plus className="h-4 w-4" />
          Add Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total Projects", value: stats.total, icon: FolderKanban, color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10" },
          { label: "Active", value: stats.active, icon: CheckCircle2, color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
          { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10" },
          { label: "Avg Score", value: `${stats.avgScore}/100`, icon: Activity, color: "text-[#06B6D4]", bg: "bg-[#06B6D4]/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover:border-[#333333] transition-colors">
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

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#111111] border border-[#222222] rounded-lg text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#7C3AED] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#A1A1AA]" />
          {["All", "Active", "Critical", "Paused"].map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition-colors font-medium",
                activeStatus === s
                  ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                  : "border-[#333333] text-[#A1A1AA] hover:border-[#555555] hover:text-white"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Grid / List toggle */}
        <div className="flex rounded-lg border border-[#222222] overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors",
              view === "grid" ? "bg-[#222222] text-white" : "text-[#A1A1AA] hover:text-white"
            )}
          >
            Grid
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "px-3 py-2 text-xs font-medium transition-colors",
              view === "list" ? "bg-[#222222] text-white" : "text-[#A1A1AA] hover:text-white"
            )}
          >
            List
          </button>
        </div>
      </div>

      {/* Projects Grid / List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <FolderKanban className="h-12 w-12 text-[#A1A1AA] mb-3 opacity-40" />
            <p className="text-white font-medium text-lg">No projects found</p>
            <p className="text-[#A1A1AA] text-sm mt-1">Try adjusting your search or add a new project.</p>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => {
            const statusCfg = STATUS_COLORS["Active"];
            const TrendIcon = TrendingUp;
            const trendColor = "text-[#A1A1AA]";

            return (
              <Card
                key={project.id}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="group hover:border-[#333333] hover:shadow-xl hover:shadow-black/40 transition-all duration-200 cursor-pointer"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[#A1A1AA] font-mono">{project.id.slice(0,8)}</span>
                      </div>
                      <h3 className="font-semibold text-white text-base group-hover:text-[#7C3AED] transition-colors truncate">
                        {project.name || 'Project'}
                      </h3>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded text-xs bg-[#1A1A1A] border border-[#222222] text-[#A1A1AA]">
                      {project.language || 'Unknown'}
                    </span>
                    {project.framework && (
                      <span className="px-2 py-0.5 rounded text-xs bg-[#1A1A1A] border border-[#222222] text-[#A1A1AA]">
                        {project.framework}
                      </span>
                    )}
                  </div>

                  {/* Last analyzed */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1A1A1A]">
                    <p className="text-xs text-[#A1A1AA] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <Link
                      href={`/dashboard/upload?projectId=${project.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-[#7C3AED] hover:text-[#A78BFA] font-medium flex items-center gap-0.5 transition-colors"
                    >
                      Run Scan <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List view */
        <div className="space-y-2">
          {/* List header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs text-[#A1A1AA] font-medium uppercase tracking-wider">
            <span className="col-span-4">Project</span>
            <span className="col-span-2">Source</span>
            <span className="col-span-1 text-center">Score</span>
            <span className="col-span-2 text-center">Issues</span>
            <span className="col-span-2">Last Analyzed</span>
            <span className="col-span-1" />
          </div>

          {filtered.map((project) => {
            return (
              <Card
                key={project.id}
                onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                className="group hover:border-[#333333] transition-all duration-200 cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs text-[#A1A1AA] font-mono">{project.id.slice(0,8)}</span>
                      </div>
                      <p className="font-medium text-white group-hover:text-[#7C3AED] transition-colors truncate">
                        {project.name || 'Project'}
                      </p>
                    </div>

                    <div className="hidden md:flex col-span-2 items-center">
                      <span className="px-2 py-0.5 rounded text-xs bg-[#1A1A1A] border border-[#222222] text-[#A1A1AA]">
                        {project.language || 'Unknown'}
                      </span>
                    </div>

                    <div className="hidden md:flex col-span-1 justify-center">
                    </div>

                    <div className="hidden md:flex col-span-2 flex-col items-center">
                    </div>

                    <div className="hidden md:flex col-span-2 items-center gap-1 text-xs text-[#A1A1AA]">
                      <Clock className="h-3 w-3" />
                      {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>

                    <div className="hidden md:flex col-span-1 justify-end">
                      <Link href={`/dashboard/upload?projectId=${project.id}`} onClick={(e) => e.stopPropagation()}>
                        <ChevronRight className="h-4 w-4 text-[#A1A1AA] group-hover:text-[#7C3AED] transition-colors" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-center text-sm text-[#A1A1AA]">
        Showing <span className="text-white font-medium">{filtered.length}</span> of{" "}
        <span className="text-white font-medium">{projects.length}</span> projects
      </p>
    </div>
  );
}
