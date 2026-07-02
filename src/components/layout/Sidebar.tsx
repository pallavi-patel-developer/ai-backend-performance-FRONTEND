"use client";

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
      {/* <div className="p-4 border-t border-[#222222]">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]" />
          <div className="ml-3">
            <p className="text-sm font-medium text-white">John Doe</p>
            <p className="text-xs text-[#A1A1AA]">Pro Plan</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
