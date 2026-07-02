"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sb-access-token") || localStorage.getItem("supabase_token");
    if (!token) {
      router.push("/auth");
    } else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  );
}
