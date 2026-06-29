import { mockData } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileCode2, Cpu, CheckCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default function IssueDetailsPage({ params }: { params: { id: string } }) {
  const issue = mockData.issues.find(i => i.id === params.id);
  
  if (!issue) {
    // If not found, just use the first issue for demo purposes instead of throwing 404
    // This ensures the demo always works even if navigating directly
    // notFound();
  }
  
  const displayIssue = issue || mockData.issues[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link href="/dashboard/results" className="inline-flex items-center text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">{displayIssue.title}</h1>
            <Badge variant={displayIssue.severity === 'Critical' ? 'danger' : displayIssue.severity === 'High' ? 'warning' : 'default'}>
              {displayIssue.severity}
            </Badge>
            <Badge variant="outline">{displayIssue.category}</Badge>
          </div>
          <p className="text-[#A1A1AA] flex items-center gap-2">
            <Clock className="h-4 w-4" /> Detected on {new Date(displayIssue.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-[#222222] text-white text-sm font-medium rounded-md hover:bg-[#333333] transition-colors border border-[#222222]">
            Ignore Issue
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#10B981]/10 text-[#10B981] text-sm font-medium rounded-md border border-[#10B981]/20 hover:bg-[#10B981]/20 transition-colors">
            <CheckCircle className="h-4 w-4" /> Mark as Resolved
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Root Cause Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-[#A1A1AA] mb-6">
                {displayIssue.description}
              </p>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-[#7C3AED]" /> Affected Files
                </h4>
                <div className="flex flex-wrap gap-2">
                  {displayIssue.affectedFiles.map(file => (
                    <span key={file} className="px-2 py-1 bg-[#1A1A1A] border border-[#222222] rounded text-xs text-[#A1A1AA] font-mono">
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Optimization Recommendation</CardTitle>
              <CardDescription>Automatically generated code fix</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white mb-4">{displayIssue.recommendation}</p>
              <div className="bg-[#0A0A0A] rounded-lg border border-[#222222] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-[#111111] border-b border-[#222222]">
                  <span className="text-xs text-[#A1A1AA] font-mono">Suggested Fix</span>
                  <button className="text-xs text-[#06B6D4] hover:underline">Copy Code</button>
                </div>
                <pre className="p-4 overflow-x-auto text-sm text-[#A1A1AA] font-mono whitespace-pre-wrap">
                  <code dangerouslySetInnerHTML={{ 
                    __html: displayIssue.codeSnippet
                      .replace(/(\/\/ Current Code|\/\/ Recommended Fix|\/\/ Missing cleanup)/g, '<span class="text-yellow-500/70">$1</span>')
                      .replace(/(const|await|let|async|return|if)/g, '<span class="text-[#7C3AED]">$1</span>')
                  }} />
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Impact Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-[#111111] border border-[#222222] rounded-lg">
                <p className="text-xs text-[#A1A1AA] mb-1 uppercase font-semibold">Est. Performance Gain</p>
                <p className="text-2xl font-bold text-[#10B981]">+{displayIssue.estimatedImprovementPercent}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-1">Details</p>
                <p className="text-sm text-[#A1A1AA]">{displayIssue.impact}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
