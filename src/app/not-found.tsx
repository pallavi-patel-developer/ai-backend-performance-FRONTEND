"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <Activity className="h-16 w-16 text-[#7C3AED]" />
        </div>
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]">
          404
        </h1>
        <p className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Endpoint Not Found
        </p>
        <p className="mt-4 text-[#A1A1AA] max-w-md mx-auto">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/dashboard"
            className="rounded-md bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            Go back to Dashboard
          </Link>
          <Link href="/" className="text-sm font-semibold text-[#A1A1AA] hover:text-white transition-colors">
            Return Home <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
