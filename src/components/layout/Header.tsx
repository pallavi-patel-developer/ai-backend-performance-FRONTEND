"use client";

import { useEffect, useState } from "react";
import { Bell, Search, User } from "lucide-react";

interface UserProfile {
  email: string;
  scans_used: number;
  scans_limit: number;
  plan: string;
}

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function Header() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase_token");
        if (!token) {
          setLoading(false);
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          // If 401 Unauthorized, token might be invalid/expired, we could auto sign-out
          if (res.status === 401) {
            handleSignOut();
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("sb-access-token");
    localStorage.removeItem("supabase_token");
    router.push("/auth");
  };

  const userName = profile?.email ? profile.email.split("@")[0] : "User";

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-[#222222] bg-[#0A0A0A]/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-[#A1A1AA]"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white placeholder:text-[#A1A1AA] focus:ring-0 sm:text-sm"
            placeholder="Search projects, issues, or reports..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {!loading && profile && (
            <div className="hidden sm:flex items-center gap-3 mr-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white capitalize">{userName}</span>
                <span className="text-xs text-[#A1A1AA]">
                  Scans: <span className={profile.scans_used >= profile.scans_limit && profile.scans_limit !== -1 ? "text-red-400 font-semibold" : "text-[#06B6D4]"}>
                    {profile.scans_used}
                  </span> / {profile.scans_limit === -1 ? '∞' : profile.scans_limit}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white shadow-lg shadow-[#7C3AED]/20">
                <User className="h-4 w-4" />
              </div>
            </div>
          )}

          <div className="h-6 w-px bg-[#222222]" aria-hidden="true" />

          <button type="button" className="-m-2.5 p-2.5 text-[#A1A1AA] hover:text-white">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          <button
            onClick={handleSignOut}
            className="ml-2 text-sm text-[#EF4444] hover:text-[#DC2626] transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
