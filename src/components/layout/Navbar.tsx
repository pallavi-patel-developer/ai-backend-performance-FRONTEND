import Link from "next/link";
import { Activity } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-[#222222] bg-[#0A0A0A]/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-[#7C3AED]" />
              <span className="text-xl font-bold text-white tracking-tight">PerfDoctor AI</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth" className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              Start Analysis
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
