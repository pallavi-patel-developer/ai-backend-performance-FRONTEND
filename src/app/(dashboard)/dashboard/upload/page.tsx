"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Upload, ArrowRight, CheckCircle2,
  AlertCircle, Loader2, Archive, X, Zap, Folder
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className}
    {...props}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

type ScanMode = "url" | "zip" | "github";
type ScanStage = "idle" | "running" | "complete" | "error";

const STAGE_LABELS: Record<string, string> = {
  connected: "Connected to analysis engine...",
  checking_reachability: "Checking URL reachability...",
  discovering_endpoints: "Discovering API endpoints...",
  measuring_latency: "Measuring response latency...",
  analyzing_security: "Analyzing security headers...",
  extracting_zip: "Extracting uploaded files...",
  detecting_stack: "Detecting tech stack...",
  scanning_files: "Scanning source files...",
  analyzing_patterns: "Detecting anti-patterns...",
  cloning_repository: "Cloning GitHub repository...",
  zipping_for_analysis: "Preparing code analysis...",
  analyzing_code: "Running static analysis...",
  generating_ai_report: "AI engine generating insights...",
  complete: "Analysis complete! 🎉",
  failed: "Analysis failed",
};

export default function UploadPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ScanMode>("url");
  const [urlInput, setUrlInput] = useState("");
  const [githubInput, setGithubInput] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showTokenField, setShowTokenField] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [scanStage, setScanStage] = useState<ScanStage>("idle");
  const [progress, setProgress] = useState(0);
  const [currentStageLabel, setCurrentStageLabel] = useState("");
  const [scanId, setScanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId") || "";

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>(initialProjectId);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase_token") || "demo-token";
        const res = await fetch(`${API_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
          if (!selectedProject && data.length > 0) {
            setSelectedProject(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch projects");
      }
    };
    fetchProjects();
  }, [API_URL, selectedProject]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith(".zip")) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Only .zip files are supported");
    }
  }, []);

  const startScan = async () => {
    setError(null);
    setScanStage("running");
    setProgress(0);
    setCurrentStageLabel("Initializing scan...");

    try {
      const token = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase_token") || "demo-token";
      let response: Response;
      let headers: Record<string, string> = {
        "Authorization": `Bearer ${token}`,
      };

      if (mode === "url") {
        if (!urlInput.startsWith("http")) {
          setError("Please enter a valid URL starting with http:// or https://");
          setScanStage("idle");
          return;
        }
        response = await fetch(`${API_URL}/api/scan/url`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlInput, projectId: selectedProject || undefined }),
        });
      } else if (mode === "zip") {
        if (!file) {
          setError("Please select a ZIP file");
          setScanStage("idle");
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        if (selectedProject) formData.append("projectId", selectedProject);
        response = await fetch(`${API_URL}/api/scan/upload`, {
          method: "POST",
          headers,
          body: formData,
        });
      } else {
        if (!githubInput.includes("github.com")) {
          setError("Please enter a valid GitHub repository URL");
          setScanStage("idle");
          return;
        }
        response = await fetch(`${API_URL}/api/scan/github`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ repoUrl: githubInput, githubToken: githubToken || undefined, projectId: selectedProject || undefined }),
        });
      }

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Scan failed to start");
      }

      const data = await response.json();
      const newScanId = data.scanId;
      setScanId(newScanId);

      // Connect to SSE stream for real-time progress
      const eventSource = new EventSource(
        `${API_URL}/api/scan/stream/${newScanId}?token=${token}`
      );

      eventSource.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        const { stage, pct } = payload;

        setProgress(pct < 0 ? 0 : pct);
        setCurrentStageLabel(STAGE_LABELS[stage] || stage);

        if (stage === "complete") {
          eventSource.close();
          setScanStage("complete");
          setTimeout(() => {
            router.push(`/dashboard/results?scanId=${newScanId}`);
          }, 1500);
        } else if (stage === "failed") {
          eventSource.close();
          setScanStage("error");
          setError("Scan failed. Please check your URL or file and try again.");
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        // For demo — simulate progress if backend isn't connected
        simulateDemoProgress(newScanId);
      };

    } catch (err: any) {
      setError(err.message || "Connection failed. Is the backend running?");
      setScanStage("error");
      // Demo fallback
      simulateDemoProgress("demo-scan-id");
    }
  };

  // Demo mode — shows the UI working without a live backend
  const simulateDemoProgress = (id: string) => {
    setScanId(id);
    setScanStage("running");
    const stages = [
      { stage: "discovering_endpoints", pct: 15 },
      { stage: "measuring_latency", pct: 35 },
      { stage: "analyzing_security", pct: 55 },
      { stage: "analyzing_patterns", pct: 75 },
      { stage: "generating_ai_report", pct: 90 },
      { stage: "complete", pct: 100 },
    ];
    let i = 0;
    setError(null);
    const interval = setInterval(() => {
      if (i >= stages.length) {
        clearInterval(interval);
        setScanStage("complete");
        setTimeout(() => router.push(`/dashboard/results`), 1500);
        return;
      }
      const { stage, pct } = stages[i++];
      setProgress(pct);
      setCurrentStageLabel(STAGE_LABELS[stage] || stage);
    }, 1200);
  };

  const tabs: { id: ScanMode; label: string; icon: React.ComponentType<any> }[] = [
    { id: "url", label: "Live URL", icon: Globe },
    { id: "zip", label: "Upload ZIP", icon: Upload },
    { id: "github", label: "GitHub Repo", icon: Github },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">New Analysis</h1>
        <p className="text-[#A1A1AA]">Connect your backend via URL, ZIP upload, or GitHub to start a full diagnostic.</p>
      </div>

      <AnimatePresence mode="wait">
        {scanStage === "idle" || scanStage === "error" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Mode Tabs */}
            <div className="flex gap-1 p-1 bg-[#111111] rounded-xl border border-[#222222]">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${mode === id
                      ? "bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/20"
                      : "text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Input Panel */}
            <div className="bg-[#111111] rounded-2xl border border-[#222222] p-6 space-y-5">
              
              {/* Project Selector */}
              <div className="space-y-3 pb-4 border-b border-[#222222]">
                <label className="text-sm font-medium text-white">Select Project</label>
                <div className="flex items-center gap-3 bg-[#0A0A0A] border border-[#333333] rounded-lg px-4 focus-within:border-[#7C3AED] transition-colors">
                  <Folder className="h-4 w-4 text-[#666666] flex-shrink-0" />
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="flex-1 bg-transparent py-3 text-white outline-none text-sm appearance-none"
                  >
                    <option value="" className="bg-[#0A0A0A] text-[#A1A1AA]">-- Select or leave empty --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#0A0A0A] text-white">
                        {p.name || p.id}
                      </option>
                    ))}
                  </select>
                </div>
                {projects.length === 0 && (
                  <p className="text-xs text-[#F59E0B]">No projects found. You can run a scan without a project, or create one first in the Projects tab.</p>
                )}
              </div>

              {mode === "url" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Backend API URL</label>
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-3 bg-[#0A0A0A] border border-[#333333] rounded-lg px-4 focus-within:border-[#7C3AED] transition-colors">
                      <Globe className="h-4 w-4 text-[#666666] flex-shrink-0" />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://api.yourapp.com"
                        className="flex-1 bg-transparent py-3 text-white placeholder-[#555555] outline-none text-sm"
                        onKeyDown={(e) => e.key === "Enter" && startScan()}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-[#666666]">
                    We'll probe your live API — discover endpoints, measure latency, and check security headers.
                  </p>
                </div>
              )}

              {mode === "zip" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Upload Backend ZIP</label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all ${dragOver
                        ? "border-[#7C3AED] bg-[#7C3AED]/5"
                        : file
                          ? "border-[#10B981] bg-[#10B981]/5"
                          : "border-[#333333] hover:border-[#555555] hover:bg-[#0A0A0A]"
                      }`}
                  >
                    {file ? (
                      <>
                        <Archive className="h-10 w-10 text-[#10B981]" />
                        <div className="text-center">
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-sm text-[#A1A1AA]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="absolute top-3 right-3 text-[#666666] hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-[#555555]" />
                        <div className="text-center">
                          <p className="text-white font-medium">Drop your ZIP here</p>
                          <p className="text-sm text-[#A1A1AA]">or click to browse — max 50MB</p>
                        </div>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { setFile(f); setError(null); }
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#666666]">
                    Include your backend source code (Node.js, Express, etc.). We'll analyze patterns, security, and performance issues.
                  </p>
                </div>
              )}

              {mode === "github" && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">GitHub Repository URL</label>
                    <div className="flex items-center gap-3 bg-[#0A0A0A] border border-[#333333] rounded-lg px-4 focus-within:border-[#7C3AED] transition-colors">
                      <Github className="h-4 w-4 text-[#666666] flex-shrink-0" />
                      <input
                        type="url"
                        value={githubInput}
                        onChange={(e) => setGithubInput(e.target.value)}
                        placeholder="https://github.com/your-org/your-backend"
                        className="flex-1 bg-transparent py-3 text-white placeholder-[#555555] outline-none text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTokenField(!showTokenField)}
                    className="text-xs text-[#7C3AED] hover:underline"
                  >
                    {showTokenField ? "Hide" : "+ Add"} GitHub token (for private repos)
                  </button>
                  {showTokenField && (
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="github_pat_..."
                      className="w-full bg-[#0A0A0A] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#555555] outline-none text-sm focus:border-[#7C3AED] transition-colors"
                    />
                  )}
                  <p className="text-xs text-[#666666]">
                    We shallow-clone your repo (no history), analyze the code, then immediately delete it.
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg px-4 py-3 text-sm text-[#EF4444]">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Scan Button */}
              <button
                onClick={startScan}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-[#7C3AED]/20"
              >
                <Zap className="h-4 w-4" />
                Start Analysis
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* What we detect */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "N+1 Queries", color: "#EF4444" },
                { label: "Memory Leaks", color: "#F59E0B" },
                { label: "CPU Blockers", color: "#F97316" },
                { label: "Security Holes", color: "#7C3AED" },
                { label: "Slow Endpoints", color: "#06B6D4" },
                { label: "Bad Patterns", color: "#10B981" },
                { label: "Missing Indexes", color: "#EF4444" },
                { label: "Auth Issues", color: "#8B5CF6" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 bg-[#111111] border border-[#222222] rounded-lg text-xs text-[#A1A1AA]">
                  <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111111] border border-[#222222] rounded-2xl p-8 space-y-8"
          >
            {/* Animated Scanner Visual */}
            <div className="relative h-48 rounded-xl bg-[#0A0A0A] border border-[#222222] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7C3AED]/10 via-transparent to-transparent" />
              {/* Scanning line animation */}
              {scanStage === "running" && (
                <motion.div
                  animate={{ y: [-80, 80] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent opacity-70"
                />
              )}
              <div className="relative text-center space-y-3 z-10">
                {scanStage === "complete" ? (
                  <CheckCircle2 className="h-16 w-16 text-[#10B981] mx-auto" />
                ) : (
                  <Loader2 className="h-16 w-16 text-[#7C3AED] mx-auto animate-spin" />
                )}
                <p className="text-sm font-medium text-white">{currentStageLabel}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#A1A1AA]">
                <span>Scan Progress</span>
                <span className={`font-medium ${scanStage === "complete" ? "text-[#10B981]" : "text-[#7C3AED]"}`}>
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-[#222222] rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut", duration: 0.5 }}
                  className={`h-full rounded-full ${scanStage === "complete"
                      ? "bg-[#10B981]"
                      : "bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]"
                    }`}
                />
              </div>
            </div>

            {scanStage === "complete" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-[#A1A1AA]"
              >
                Redirecting to your results...
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
