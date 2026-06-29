"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  UploadCloud,
  CheckSquare,
  AlertCircle,
  TrendingUp,
  Users,
  CreditCard,
  Settings,
  Activity
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Upload", href: "/dashboard/upload", icon: UploadCloud },
  { name: "Results", href: "/dashboard/results", icon: CheckSquare },
  { name: "Issues", href: "/dashboard/issues", icon: AlertCircle },
  { name: "Trends", href: "/dashboard/trends", icon: TrendingUp },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Pricing", href: "/pricing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string; plan: string } | null>(null);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("sb-access-token");
      if (!token || token === "demo-token") {
        setIsDemo(true);
        setUser(null);
        return;
      }
      setIsDemo(false);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex h-full w-64 flex-col bg-[#0A0A0A] border-r border-[#222222]">
      <div className="flex h-16 items-center px-6 border-b border-[#222222]">
        <Activity className="h-6 w-6 text-[#7C3AED] mr-2" />
        <span className="font-bold text-lg tracking-tight text-white">PerfDoctor AI</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-[#111111] text-white border border-[#222222]"
                    : "text-[#A1A1AA] hover:bg-[#111111] hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "flex-shrink-0 -ml-1 mr-3 h-5 w-5",
                    isActive ? "text-[#06B6D4]" : "text-[#A1A1AA] group-hover:text-white"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-[#222222] space-y-3">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] shrink-0" />
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {isDemo ? "Guest Mode" : user?.email || "Loading..."}
            </p>
            <p className="text-xs text-[#A1A1AA] uppercase font-semibold tracking-wider">
              {isDemo ? "Free Mode" : `${user?.plan || "free"} plan`}
            </p>
          </div>
        </div>
        {isDemo ? (
          <Link
            href="/auth"
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold rounded transition-colors text-center"
          >
            Sign In to Sync
          </Link>
        ) : (
          <button
            onClick={() => {
              localStorage.removeItem("sb-access-token");
              localStorage.removeItem("supabase_token");
              window.location.href = "/auth";
            }}
            className="w-full py-1.5 px-3 border border-[#333333] hover:border-[#EF4444] hover:text-[#EF4444] text-[#A1A1AA] text-xs font-semibold rounded transition-colors text-center"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
