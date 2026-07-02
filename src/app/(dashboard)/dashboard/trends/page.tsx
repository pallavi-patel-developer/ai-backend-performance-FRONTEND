"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";

export default function TrendsPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScans() {
      try {
        const token = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase_token") || "demo-token";
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/scan`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          // Sort ascending for chronological chart
          setScans(data.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
        }
      } catch (err) {
        console.error("Failed to load scans", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchScans();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
        <p className="text-[#A1A1AA]">Loading historical trends...</p>
      </div>
    );
  }

  // Map real data: Use overall_score and avg_latency_ms
  const chartData = scans.map((scan) => ({
    name: new Date(scan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: scan.overall_score || 0,
    latency: scan.avg_latency_ms || 0,
  }));

  if (chartData.length === 0) {
    chartData.push(
      { name: 'Mon', score: 0, latency: 0 },
      { name: 'Tue', score: 0, latency: 0 }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Historical Trends</h1>
        <p className="text-[#A1A1AA]">Monitor your scan scores and API latency over time.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Score & Latency Trends</CardTitle>
            <CardDescription>Performance metrics across your recent scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#10B981" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#EF4444" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111111', borderColor: '#222222', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="score" name="Performance Score" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} />
                  <Line yAxisId="right" type="monotone" dataKey="latency" name="Avg Latency (ms)" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
