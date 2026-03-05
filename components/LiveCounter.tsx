"use client";

import { useEffect, useState } from "react";

export default function LiveCounter({ size = "sm" }: { size?: "sm" | "lg" }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/testers/count")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => setCount(0));

    const interval = setInterval(() => {
      fetch("/api/testers/count")
        .then((r) => r.json())
        .then((d) => setCount(d.count))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === null) return null;

  if (size === "lg") {
    return (
      <div className="inline-flex items-center gap-3 bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-full px-6 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
        </span>
        <span className="text-[14px] text-white/70">
          <span className="text-white font-semibold tabular-nums">{count.toLocaleString()}</span> verified humans ready
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-3 py-1.5">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
      </span>
      <span className="text-[11px] text-white/50">
        <span className="text-white/80 font-medium tabular-nums">{count.toLocaleString()}</span> testers
      </span>
    </div>
  );
}
