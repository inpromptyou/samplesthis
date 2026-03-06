"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Job {
  id: number;
  app_url: string;
  app_type: string | null;
  description: string | null;
  testers_count: number;
  price_per_tester_cents: number;
  applications_count: number;
  accepted_count: number;
  created_at: string;
}

interface Tester {
  id: number;
  name: string;
  email: string;
  stripe_onboarded: boolean;
}

const SIDEBAR = [
  { key: "explore", label: "Explore", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", href: "/explore" },
  { key: "referrals", label: "Referrals", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", href: "/referrals" },
  { key: "earnings", label: "Earnings", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", href: "/dashboard?tab=payouts" },
  { key: "profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", href: "/dashboard?tab=profile" },
];

const SORT_OPTIONS = ["Newest", "Highest pay", "Most spots"];
const TYPE_FILTERS = ["All", "Web App", "Mobile App", "SaaS", "E-commerce", "Other"];

function dom(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

function timeAgo(d: string) {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 60) return "just now";
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  if (mins < 10080) return `${Math.floor(mins / 1440)}d ago`;
  return new Date(d).toLocaleDateString("en-AU", { month: "short", day: "numeric" });
}

// Generate avatar colors from string
function avatarColor(s: string) {
  const colors = ["#F97316", "#EF4444", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899", "#6366F1"];
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ExplorePage() {
  const router = useRouter();
  const [tester, setTester] = useState<Tester | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [applying, setApplying] = useState<number | null>(null);
  const [applied, setApplied] = useState<Set<number>>(new Set());
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    fetch("/api/testers/me").then(r => r.json()).then(d => {
      if (d.authenticated) {
        // Logged in — send them to dashboard explore tab
        router.push("/dashboard?tab=explore");
        return;
      }
    }).catch(() => {});
    fetch("/api/orders").then(r => r.json()).then(d => {
      setJobs(d.jobs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = jobs
    .filter(j => {
      const q = search.toLowerCase();
      if (q && !dom(j.app_url).toLowerCase().includes(q) && !(j.description || "").toLowerCase().includes(q) && !(j.app_type || "").toLowerCase().includes(q)) return false;
      if (typeFilter !== "All" && (j.app_type || "").toLowerCase() !== typeFilter.toLowerCase()) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "Highest pay") return (b.price_per_tester_cents || 0) - (a.price_per_tester_cents || 0);
      if (sort === "Most spots") return (b.testers_count - b.accepted_count) - (a.testers_count - a.accepted_count);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const applyToJob = async (jobId: number) => {
    if (!tester) { router.push("/become-a-tester"); return; }
    setApplying(jobId);
    setApplyError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: jobId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplied(prev => new Set(prev).add(jobId));
    } catch (e: unknown) {
      setApplyError(e instanceof Error ? e.message : "Failed to apply");
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[72px] bg-white border-r border-black/[0.04] items-center py-6 shrink-0 fixed left-0 top-0 bottom-0">
        <Link href="/" className="mb-8">
          <Image src="/logo.png" alt="Flinchify" width={28} height={28} />
        </Link>
        <nav className="flex-1 flex flex-col items-center gap-1">
          {SIDEBAR.map(item => (
            <Link key={item.key} href={item.href}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors ${
                item.key === "explore" ? "bg-black/[0.04] text-[var(--text)]" : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-black/[0.02]"
              }`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        {!tester ? (
          <Link href="/become-a-tester" className="w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[var(--text-dim)] hover:text-[var(--text)] transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
            <span className="text-[9px] font-medium">Sign in</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ backgroundColor: avatarColor(tester.name) }}>
            {tester.name.charAt(0).toUpperCase()}
          </Link>
        )}
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/[0.04] px-4 h-[50px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Flinchify" width={24} height={24} />
        </Link>
        <div className="flex items-center gap-2">
          {SIDEBAR.slice(0, 2).map(item => (
            <Link key={item.key} href={item.href}
              className={`p-2 rounded-lg ${item.key === "explore" ? "bg-black/[0.04]" : ""}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={item.key === "explore" ? "#111" : "#999"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
            </Link>
          ))}
          {tester ? (
            <Link href="/dashboard" className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: avatarColor(tester.name) }}>
              {tester.name.charAt(0).toUpperCase()}
            </Link>
          ) : (
            <Link href="/become-a-tester" className="text-[12px] font-medium text-[var(--accent)]">Sign in</Link>
          )}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 md:ml-[72px] px-5 md:px-10 pt-16 md:pt-10 pb-20">
        <div className="max-w-[1100px] mx-auto">
          <h1 className="h text-[22px] md:text-[28px] font-bold text-[var(--text)] mb-6">Explore opportunities</h1>

          {/* Search + filters bar */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setShowFilters(!showFilters)} className="w-10 h-10 rounded-xl border border-black/[0.08] flex items-center justify-center shrink-0 hover:bg-black/[0.02] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            </button>
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text" placeholder="Type to search" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full h-10 rounded-xl border border-black/[0.08] pl-10 pr-4 text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-black/[0.15] transition-colors"
              />
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="h-10 rounded-xl border border-black/[0.08] px-3 text-[13px] text-[var(--text-muted)] bg-white focus:outline-none shrink-0">
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <Link href="/referrals"
              className="hidden sm:flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[var(--accent)] text-white text-[13px] font-semibold shrink-0 hover:opacity-90 transition-opacity">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
              Refer & earn
            </Link>
          </div>

          {/* Filter chips */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {TYPE_FILTERS.map(f => (
                <button key={f} onClick={() => setTypeFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                    typeFilter === f ? "bg-black text-white border-black" : "bg-white text-[var(--text-muted)] border-black/[0.08] hover:border-black/[0.15]"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Jobs grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="rounded-xl border border-black/[0.06] p-5 animate-pulse">
                  <div className="h-4 bg-black/[0.04] rounded w-2/3 mb-2" />
                  <div className="h-3 bg-black/[0.03] rounded w-1/3 mb-6" />
                  <div className="h-3 bg-black/[0.03] rounded w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--text-muted)] text-[15px]">
                {search || typeFilter !== "All" ? "No jobs match your filters." : "No active test jobs right now."}
              </p>
              <p className="text-[13px] text-[var(--text-dim)] mt-1">Check back soon or post your own test.</p>
            </div>
          ) : (
            <>
              {applyError && <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3 mb-4">{applyError}</div>}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(job => {
                  const pay = (job.price_per_tester_cents || 0) / 100;
                  const spots = job.testers_count - job.accepted_count;
                  const hostname = dom(job.app_url);
                  const hasApplied = applied.has(job.id);
                  return (
                    <div key={job.id} className="rounded-xl border border-black/[0.06] p-5 hover:border-black/[0.12] hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="h text-[14px] font-semibold text-[var(--text)] line-clamp-1">{hostname}</h3>
                          {job.app_type ? <span className="text-[11px] text-[var(--text-dim)]">{job.app_type}</span> : null}
                        </div>
                        <p className="h text-[16px] font-bold text-[var(--text)] shrink-0">${pay.toFixed(0)}</p>
                      </div>
                      {job.description ? <p className="text-[12px] text-[var(--text-dim)] line-clamp-2 mb-3">{job.description}</p> : null}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-1.5">
                            {Array.from({ length: Math.min(job.applications_count, 3) }).map((_, i) => (
                              <div key={i} className="w-5 h-5 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center"
                                style={{ backgroundColor: avatarColor(`${job.id}-${i}`) }} />
                            ))}
                          </div>
                          <span className="text-[11px] text-[var(--text-dim)] ml-1">{job.applications_count} applied</span>
                        </div>
                        <span className="text-[11px] text-[var(--text-dim)]">{spots > 0 ? `${spots} spots` : "Full"}</span>
                      </div>
                      {tester ? (
                        hasApplied ? (
                          <button disabled className="w-full py-2 rounded-lg border border-black/[0.06] text-[12px] font-medium text-[var(--text-dim)] cursor-default">Applied</button>
                        ) : spots <= 0 ? (
                          <button disabled className="w-full py-2 rounded-lg border border-black/[0.06] text-[12px] font-medium text-[var(--text-dim)] cursor-default">Full</button>
                        ) : (
                          <button onClick={() => applyToJob(job.id)} disabled={applying === job.id}
                            className="w-full py-2 rounded-lg bg-black text-white text-[12px] font-semibold hover:bg-black/90 transition-colors disabled:opacity-50">
                            {applying === job.id ? "Applying..." : "Apply"}
                          </button>
                        )
                      ) : (
                        <Link href="/become-a-tester" className="block w-full py-2 rounded-lg bg-black text-white text-[12px] font-semibold text-center hover:bg-black/90 transition-colors">
                          Sign up to apply
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
