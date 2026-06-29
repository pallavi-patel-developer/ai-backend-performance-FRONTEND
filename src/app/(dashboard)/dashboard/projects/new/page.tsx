"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, Globe, Code2, Database } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AddProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repositoryUrl: "",
    liveUrl: "",
    language: "Node.js",
    framework: "",
    database: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('sb-access-token') || localStorage.getItem('supabase_token') || 'demo-token')
        : 'demo-token';
        
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push("/dashboard/projects");
      } else {
        alert("Failed to create project.");
      }
    } catch (err) {
      alert("Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/projects" className="inline-flex items-center text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white">Add New Project</h1>
        <p className="text-[#A1A1AA]">Create a new project to start tracking its performance.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Provide basic information about your backend application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-white block mb-1">Project Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required
                  placeholder="e.g. Payment Gateway API" 
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#7C3AED] transition-colors" 
                />
              </div>

              <div>
                <label htmlFor="description" className="text-sm font-medium text-white block mb-1">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows={3}
                  placeholder="Briefly describe what this service does..." 
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#7C3AED] transition-colors resize-none" 
                />
              </div>
            </div>

            {/* URLs */}
            <div className="space-y-4 pt-4 border-t border-[#222222]">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#A1A1AA]" /> Source & Environments
              </h3>
              
              <div>
                <label htmlFor="repositoryUrl" className="text-sm font-medium text-[#A1A1AA] block mb-1">GitHub Repository URL</label>
                <input 
                  type="url" 
                  id="repositoryUrl" 
                  name="repositoryUrl" 
                  placeholder="https://github.com/your-org/your-repo" 
                  value={formData.repositoryUrl}
                  onChange={handleChange}
                  className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#7C3AED] transition-colors" 
                />
              </div>

              <div>
                <label htmlFor="liveUrl" className="text-sm font-medium text-[#A1A1AA] block mb-1">Live API URL (Optional)</label>
                <input 
                  type="url" 
                  id="liveUrl" 
                  name="liveUrl" 
                  placeholder="https://api.yourdomain.com" 
                  value={formData.liveUrl}
                  onChange={handleChange}
                  className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#7C3AED] transition-colors" 
                />
              </div>
            </div>

            {/* Technology Stack */}
            <div className="space-y-4 pt-4 border-t border-[#222222]">
              <h3 className="text-sm font-medium text-white flex items-center gap-2">
                <Code2 className="h-4 w-4 text-[#A1A1AA]" /> Technology Stack
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="language" className="text-sm font-medium text-[#A1A1AA] block mb-1">Primary Language</label>
                  <select 
                    id="language" 
                    name="language" 
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors appearance-none"
                  >
                    <option value="Node.js">Node.js</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="Python">Python</option>
                    <option value="Go">Go</option>
                    <option value="Rust">Rust</option>
                    <option value="Java">Java</option>
                    <option value="C#">C# / .NET</option>
                    <option value="Ruby">Ruby</option>
                    <option value="PHP">PHP</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="framework" className="text-sm font-medium text-[#A1A1AA] block mb-1">Framework</label>
                  <input 
                    type="text" 
                    id="framework" 
                    name="framework" 
                    placeholder="e.g. Express, Django, Spring Boot" 
                    value={formData.framework}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#7C3AED] transition-colors" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="database" className="text-sm font-medium text-[#A1A1AA] block mb-1 flex items-center gap-1">
                    <Database className="h-3 w-3" /> Database
                  </label>
                  <input 
                    type="text" 
                    id="database" 
                    name="database" 
                    placeholder="e.g. PostgreSQL, MongoDB, Redis" 
                    value={formData.database}
                    onChange={handleChange}
                    className="w-full bg-[#111111] border border-[#222222] rounded-md px-3 py-2 text-sm text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#7C3AED] transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-[#222222] flex justify-end gap-3">
              <Link 
                href="/dashboard/projects" 
                className="px-4 py-2 bg-transparent text-white text-sm font-medium rounded-lg hover:bg-[#222222] transition-colors border border-transparent"
              >
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-2 bg-[#7C3AED] text-white text-sm font-medium rounded-lg hover:bg-[#6D28D9] transition-colors",
                  loading && "opacity-70 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Project
              </button>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  );
}
