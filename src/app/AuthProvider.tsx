"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (!session && !pathname.startsWith("/auth")) {
            // Redirect to auth if no session and not already on auth page
            router.push("/auth");
          } else {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (!session && !pathname.startsWith("/auth")) {
          router.push("/auth");
        } else if (session && pathname.startsWith("/auth")) {
          router.push("/dashboard");
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return <>{children}</>;
}
