import { mockData } from "@/data/mock";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ResultsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Analysis Results</h1>
          <p className="text-[#A1A1AA]">Latest diagnostics for "Payment Gateway API"</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium rounded-md transition-colors border border-[#222222]">
          <Download className="h-4 w-4" /> Download PDF Report
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1 border-t-4 border-t-[#7C3AED]">
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative h-32 w-32 flex items-center justify-center rounded-full border-8 border-[#222222]">
              <div className="absolute inset-0 rounded-full border-8 border-[#7C3AED] border-l-transparent border-b-transparent transform rotate-45"></div>
              <span className="text-4xl font-bold text-white">{mockData.dashboard.performanceScore}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-[#F59E0B]">Moderate Risk</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Issues Summary</CardTitle>
            <CardDescription>We found {mockData.issues.length} issues impacting your backend performance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-[#A1A1AA] uppercase bg-[#111111] border-b border-[#222222]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Issue</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                    <th className="px-4 py-3 font-medium">Est. Impact</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.issues.map((issue) => (
                    <tr key={issue.id} className="border-b border-[#222222] hover:bg-[#1A1A1A] transition-colors">
                      <td className="px-4 py-4 font-medium text-white">{issue.title}</td>
                      <td className="px-4 py-4 text-[#A1A1AA]">{issue.category}</td>
                      <td className="px-4 py-4">
                        <Badge variant={issue.severity === 'Critical' ? 'danger' : issue.severity === 'High' ? 'warning' : 'default'}>
                          {issue.severity}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-[#10B981]">+{issue.estimatedImprovementPercent}%</td>
                      <td className="px-4 py-4 text-right">
                        <Link href={`/dashboard/issues/\${issue.id}`} className="text-[#06B6D4] hover:underline flex items-center justify-end gap-1">
                          <FileText className="h-4 w-4" /> View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Improvement Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#222222]">
            <div className="flex items-start gap-4">
              <div className="mt-1 h-8 w-8 bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-[#A1A1AA]">
                <p>
                  <strong className="text-white">Analysis Complete.</strong> Your application shows significant CPU blocking during cryptographic operations and N+1 query patterns in your database layer.
                </p>
                <p>
                  By addressing the <span className="text-white">Critical</span> blocking synchronous operation in <code>cryptoService.ts</code>, you can expect an immediate ~40% reduction in average latency during peak traffic. Additionally, implementing Redis caching for your configuration routes will reduce database load significantly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
