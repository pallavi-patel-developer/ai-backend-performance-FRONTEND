"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Calendar, Loader2, Play, Globe, Archive, Zap, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProjectAndScans = async () => {
      try {
        const token = localStorage.getItem('sb-access-token') || localStorage.getItem('supabase_token') || 'demo-token';
        
        const projRes = await fetch(`${API_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (projRes.ok) {
          const projects = await projRes.json();
          const found = projects.find((p: any) => p.id === projectId);
          setProject(found || { id: projectId, name: 'Unknown Project' });
        }

        const scansRes = await fetch(`${API_URL}/api/scan/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (scansRes.ok) {
          const scansData = await scansRes.json();
          setScans(scansData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId) {
      fetchProjectAndScans();
    }
  }, [projectId, API_URL]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard/projects")}
            className="p-2 bg-[#111111] border border-[#222222] rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              {project?.name || "Project Details"}
              <span className="text-xs font-normal text-[#A1A1AA] bg-[#111111] px-2 py-1 rounded-md border border-[#222222]">
                {projectId.slice(0, 8)}
              </span>
            </h1>
            <p className="text-[#A1A1AA] mt-1">View historical analysis and performance trends.</p>
          </div>
        </div>
        
        <Link 
          href={`/dashboard/upload?projectId=${projectId}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white text-sm font-medium rounded-lg shadow-lg hover:opacity-90 transition-opacity"
        >
          <Play className="h-4 w-4" />
          Run New Scan
        </Link>
      </div>

      {/* Scans List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-[#222222] pb-2">Analysis History</h2>
        
        {scans.length === 0 ? (
          <Card className="bg-[#111111] border-[#222222]">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <Activity className="h-12 w-12 text-[#A1A1AA] mb-3 opacity-40" />
              <p className="text-white font-medium text-lg">No scans yet</p>
              <p className="text-[#A1A1AA] text-sm mt-1">Run an analysis to see performance results here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {scans.map((scan) => {
              const SourceIcon = scan.source_type === 'url' ? Globe : scan.source_type === 'zip' ? Archive : Zap;
              const isCompleted = scan.status === 'completed';
              
              return (
                <Card 
                  key={scan.id} 
                  className={cn(
                    "group transition-all duration-200 border-[#222222] bg-[#0A0A0A]",
                    isCompleted && "hover:border-[#7C3AED] cursor-pointer"
                  )}
                  onClick={() => isCompleted && router.push(`/dashboard/results?scanId=${scan.id}`)}
                >
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#111111] border border-[#222222] flex items-center justify-center">
                        <SourceIcon className="h-6 w-6 text-[#A1A1AA] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{scan.source_type.toUpperCase()} Scan</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider",
                            scan.status === 'completed' ? "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20" :
                            scan.status === 'failed' ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20" :
                            "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 animate-pulse"
                          )}>
                            {scan.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#A1A1AA] mt-1 truncate max-w-xs sm:max-w-md">
                          {scan.source_value}
                        </p>
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="flex items-center gap-6 self-stretch sm:self-auto w-full sm:w-auto border-t border-[#222222] sm:border-0 pt-4 sm:pt-0">
                        <div className="text-center">
                          <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-semibold mb-1">Score</p>
                          <p className={cn(
                            "text-xl font-bold",
                            scan.overall_score >= 80 ? "text-[#10B981]" :
                            scan.overall_score >= 50 ? "text-[#F59E0B]" : "text-[#EF4444]"
                          )}>
                            {scan.overall_score || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-semibold mb-1">Issues</p>
                          <p className="text-xl font-bold text-white">
                            {scan.issues_count || 0}
                          </p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-medium text-white group-hover:text-[#7C3AED] transition-colors">
                            View Report &rarr;
                          </p>
                          <p className="text-xs text-[#A1A1AA] flex items-center gap-1 justify-end mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(scan.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
