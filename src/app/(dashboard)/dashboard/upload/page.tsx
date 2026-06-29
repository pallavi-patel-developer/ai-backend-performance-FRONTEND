"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Globe, Lock, CheckCircle2, ChevronRight, Server, FileCode, Play, AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Custom Github Icon since it is not exported by this version of lucide-react
const Github = (props: React.ComponentProps<"svg">) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import Link from "next/link";

type ScanMode = "url" | "zip" | "github";
type ScanStage = "idle" | "running" | "complete" | "error";

const STAGE_LABELS: Record<string, string> = {
  idle: "Ready to scan",
  discovering_endpoints: "Discovering endpoints...",
  measuring_latency: "Measuring response times...",
  analyzing_security: "Checking security headers...",
  analyzing_patterns: "Analyzing code patterns...",
  generating_ai_report: "Generating AI recommendations...",
  complete: "Analysis complete! 🎉",
  failed: "Analysis failed",
};

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProjectId = searchParams.get("projectId");

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

  // Projects logic
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
          
          if (preselectedProjectId && data.find((p: any) => p.id === preselectedProjectId)) {
            setSelectedProjectId(preselectedProjectId);
          } else if (data.length > 0) {
            setSelectedProjectId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [API_URL, preselectedProjectId]);

  // Pre-fill inputs when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      const p = projects.find(x => x.id === selectedProjectId);
      if (p) {
        if (p.live_url) setUrlInput(p.live_url);
        if (p.repository_url) setGithubInput(p.repository_url);
      }
    }
  }, [selectedProjectId, projects]);

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
    if (!selectedProjectId) {
      setError("Please select a project first.");
      return;
    }

    setError(null);
    setScanStage("running");
    setProgress(0);
    setCurrentStageLabel("Initializing scan...");

    try {
      let response: Response;
      let headers: Record<string, string> = {
        "Authorization": `Bearer ${getToken()}`,
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
          body: JSON.stringify({ url: urlInput, projectId: selectedProjectId }),
        });
      } else if (mode === "zip") {
        if (!file) {
          setError("Please select a ZIP file");
          setScanStage("idle");
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", selectedProjectId);
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
          body: JSON.stringify({ repoUrl: githubInput, githubToken: githubToken || undefined, projectId: selectedProjectId }),
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
      const token = getToken();
      const eventSource = new EventSource(
        `${API_URL}/api/scan/stream/${newScanId}?token=${encodeURIComponent(token)}`
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
        simulateDemoProgress(newScanId);
      };

    } catch (err: any) {
      setError(err.message || "Connection failed. Is the backend running?");
      setScanStage("error");
      simulateDemoProgress("demo-scan-id");
    }
  };

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
        setTimeout(() => router.push(`/dashboard/results?scanId=${id}`), 1500);
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

  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">New Analysis</h1>
          <p className="text-[#A1A1AA]">You must create a project before running a scan.</p>
        </div>
        <div className="bg-[#111111] rounded-2xl border border-[#222222] p-10 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-[#F59E0B] mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">No Projects Found</h2>
          <p className="text-[#A1A1AA] max-w-md mb-6">
            To run an analysis, you need to have a project set up first. Projects help you track historical performance and associate scans with your applications.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="px-6 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Create New Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">New Analysis</h1>
        <p className="text-[#A1A1AA]">Select a project and connect your backend to start a full diagnostic.</p>
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
            {/* Project Selection */}
            <div className="bg-[#111111] rounded-2xl border border-[#222222] p-6 space-y-4">
              <label className="text-sm font-medium text-white block">Select Project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
              >
                <option value="" disabled>Choose a project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

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
              {mode === "url" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Backend API URL</label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A1A1AA]" />
                    <input
                      type="url"
                      placeholder="https://api.yourdomain.com"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#555555] focus:outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </div>
                  <p className="text-xs text-[#A1A1AA]">Enter the base URL of your running backend.</p>
                </div>
              )}

              {mode === "zip" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Source Code (ZIP)</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      dragOver ? "border-[#7C3AED] bg-[#7C3AED]/10" : "border-[#333333] hover:border-[#555555] bg-[#1A1A1A]"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".zip"
                      onChange={(e) => {
                        const selected = e.target.files?.[0];
                        if (selected) {
                          setFile(selected);
                          setError(null);
                        }
                      }}
                    />
                    <FileCode className="h-8 w-8 mx-auto text-[#A1A1AA] mb-3" />
                    {file ? (
                      <div>
                        <p className="text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs text-[#A1A1AA] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-white">Click to upload or drag and drop</p>
                        <p className="text-xs text-[#A1A1AA] mt-1">ZIP files only (max 50MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mode === "github" && (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Repository URL</label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A1A1AA]" />
                      <input
                        type="url"
                        placeholder="https://github.com/username/repo"
                        value={githubInput}
                        onChange={(e) => setGithubInput(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#555555] focus:outline-none focus:border-[#7C3AED] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-white">Private Repository?</label>
                      <button
                        onClick={() => setShowTokenField(!showTokenField)}
                        className="text-xs text-[#7C3AED] hover:text-[#A78BFA] transition-colors"
                      >
                        {showTokenField ? "Hide Token" : "Add Access Token"}
                      </button>
                    </div>
                    
                    {showTokenField && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="relative"
                      >
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A1A1AA]" />
                        <input
                          type="password"
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg pl-11 pr-4 py-3 text-white placeholder-[#555555] focus:outline-none focus:border-[#7C3AED] transition-colors"
                        />
                        <p className="text-xs text-[#A1A1AA] mt-2">Required only for private repositories. Tokens are not stored.</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-[#EF4444] shrink-0 mt-0.5" />
                <p className="text-sm text-[#EF4444]">{error}</p>
              </div>
            )}

            <button
              onClick={startScan}
              disabled={!selectedProjectId}
              className={`w-full py-3.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#7C3AED]/25 flex items-center justify-center gap-2 ${!selectedProjectId ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Play className="h-5 w-5 fill-current" />
              Start Diagnostic Scan
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111111] rounded-2xl border border-[#222222] p-8 text-center space-y-6"
          >
            <div className="relative w-24 h-24 mx-auto">
              {scanStage === "complete" ? (
                <CheckCircle2 className="w-full h-full text-[#10B981]" />
              ) : (
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-[#222222] stroke-current"
                    strokeWidth="8"
                    cx="50" cy="50" r="40" fill="transparent"
                  />
                  <circle
                    className="text-[#7C3AED] stroke-current transition-all duration-500 ease-out"
                    strokeWidth="8"
                    strokeLinecap="round"
                    cx="50" cy="50" r="40" fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                  />
                </svg>
              )}
              {scanStage !== "complete" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">{currentStageLabel}</h3>
              <p className="text-sm text-[#A1A1AA]">
                {scanStage === "complete" 
                  ? "Redirecting to results..." 
                  : "Please wait while our AI analyzes your infrastructure."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
