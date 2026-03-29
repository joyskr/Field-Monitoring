"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setMobileToken, getMobileToken } from "@/lib/mobileWebAuth";

export default function MobileLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getMobileToken()) router.replace("/mobile/sites");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mobile/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      setMobileToken(data.token);
      router.push("/mobile/sites");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-[#e63946] px-6 pt-16 pb-12">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
          <span className="text-white font-bold text-lg">FM</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Field Monitor</h1>
        <p className="text-red-200 text-sm mt-1">OOH Campaign Monitoring</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946] focus:border-transparent bg-white"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#e63946] focus:border-transparent bg-white"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e63946] text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-60 active:bg-red-700 transition-colors mt-2"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
