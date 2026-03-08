"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import PostTestForm from "@/components/PostTestForm";

interface Tester {
  id: number;
  name: string;
  email: string;
  age_range: string | null;
  location: string | null;
  devices: string;
  interests: string;
  tech_comfort: number;
  bio: string | null;
  tests_completed: number;
  total_earned_cents: number;
  avg_rating: number;
  stripe_onboarded: boolean;
  created_at: string;
}

interface MyApp {
  id: number;
  order_id: number;
  status: string;
  app_url: string;
  app_type: string | null;
  job_description: string | null;
  price_per_tester_cents: number;
  feedback: string | null;
  screen_recording_url: string | null;
  payout_cents: number;
  payout_transfer_id: string | null;
  created_at: string;
  submitted_at: string | null;
}

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "explore", label: "Explore Jobs", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
  { key: "myjobs", label: "My Jobs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { key: "bookings", label: "Bookings", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "posttest", label: "Post a Test", icon: "M12 4v16m8-8H4" },
  { key: "payouts", label: "Payouts", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "referrals", label: "Referrals", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "howit", label: "How it Works", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "pricing", label: "Pricing", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" },
  { key: "profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

const SORT_OPTIONS = ["Newest", "Highest pay", "Most spots"];
const TYPE_FILTERS = ["All", "Web App", "Mobile App", "SaaS", "E-commerce", "Other"];

function dom(url: string) {
  try { return new URL(url).hostname.replace("www.", ""); } catch { return url; }
}

function avatarColor(s: string) {
  const colors = ["#F97316", "#EF4444", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899", "#6366F1"];
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

interface Booking {
  id: number;
  order_id: number;
  tester_id: number | null;
  scheduled_date: string;
  scheduled_time: string;
  timezone: string;
  duration_minutes: number;
  status: string;
  app_ready: boolean;
  app_ready_deadline: string | null;
  notes: string | null;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  app_url: string;
  app_type: string | null;
  job_description: string | null;
  tester_name?: string;
  tester_email?: string;
}

interface ExploreJob {
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-[var(--text-dim)]">Loading...</div></div>}>
      <Dashboard />
    </Suspense>
  );
}

function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tester, setTester] = useState<Tester | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(searchParams.get("tab") || "overview");
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectStatus, setConnectStatus] = useState<{ onboarded: boolean; hasAccount: boolean } | null>(null);
  const [myApps, setMyApps] = useState<MyApp[]>([]);
  const [myAppsLoading, setMyAppsLoading] = useState(false);
  const [submitForm, setSubmitForm] = useState<{ id: number; feedback: string; recording: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Explore tab state
  const [exploreJobs, setExploreJobs] = useState<ExploreJob[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreSearch, setExploreSearch] = useState("");
  const [exploreSort, setExploreSort] = useState("Newest");
  const [exploreFilter, setExploreFilter] = useState("All");
  const [applying, setApplying] = useState<number | null>(null);
  const [appliedSet, setAppliedSet] = useState<Set<number>>(new Set());
  const [applyError, setApplyError] = useState("");
  // Bookings tab state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingAction, setBookingAction] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/testers/me")
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) { router.push("/"); return; }
        setTester(d.tester);
        setLoading(false);
      })
      .catch(() => router.push("/"));

    // Check Stripe Connect status
    fetch("/api/connect/status").then(r => r.json()).then(d => setConnectStatus(d)).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (tab === "myjobs") {
      setMyAppsLoading(true);
      fetch("/api/applications/mine").then(r => r.json()).then(d => { setMyApps(d.applications || []); setMyAppsLoading(false); }).catch(() => setMyAppsLoading(false));
    }
    if (tab === "explore") {
      setExploreLoading(true);
      fetch("/api/orders").then(r => r.json()).then(d => { setExploreJobs(d.jobs || []); setExploreLoading(false); }).catch(() => setExploreLoading(false));
    }
    if (tab === "bookings") {
      setBookingsLoading(true);
      fetch("/api/bookings").then(r => r.json()).then(d => { setBookings(d.bookings || []); setBookingsLoading(false); }).catch(() => setBookingsLoading(false));
    }
  }, [tab]);

  const applyToJob = async (jobId: number) => {
    setApplying(jobId); setApplyError("");
    try {
      const res = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order_id: jobId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAppliedSet(prev => new Set(prev).add(jobId));
    } catch (e: unknown) { setApplyError(e instanceof Error ? e.message : "Failed to apply"); }
    setApplying(null);
  };

  const submitResults = async () => {
    if (!submitForm || !submitForm.feedback) return;
    setSubmitting(true);
    try {
      const r = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: submitForm.id,
          feedback: submitForm.feedback,
          screen_recording_url: submitForm.recording || null,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSubmitForm(null);
      // Refresh
      const apps = await fetch("/api/applications/mine").then(r2 => r2.json());
      setMyApps(apps.applications || []);
      if (d.payout?.paid) {
        alert(`Submitted! You earned $${(d.payout.amount / 100).toFixed(2)}`);
      } else {
        alert("Submitted! " + (d.payout?.error || "Payout will process once you set up Stripe."));
      }
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to submit");
    }
    setSubmitting(false);
  };

  const handleBookingAction = async (bookingId: number, action: string) => {
    setBookingAction(bookingId);
    try {
      const r = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      // Refresh bookings
      const res = await fetch("/api/bookings").then(r2 => r2.json());
      setBookings(res.bookings || []);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Action failed");
    }
    setBookingAction(null);
  };

  const setupPayouts = async () => {
    setConnectLoading(true);
    try {
      const r = await fetch("/api/connect/onboard", { method: "POST" });
      const d = await r.json();
      if (d.url) {
        window.location.href = d.url;
        return; // Don't reset loading — we're navigating away
      }
      alert(d.error || "Failed to start payout setup");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Something went wrong connecting to Stripe");
    }
    setConnectLoading(false);
  };

  if (loading || !tester) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-dim)]">Loading...</div>
      </div>
    );
  }

  const devices = (() => { try { return JSON.parse(tester.devices); } catch { return []; } })();
  const interests = (() => { try { return JSON.parse(tester.interests); } catch { return []; } })();
  const earned = (tester.total_earned_cents || 0) / 100;
  const memberSince = new Date(tester.created_at).toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-[var(--bg-2)] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] bg-white border-r border-black/[0.04] p-6 shrink-0">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Image src="/logo.png" alt="Flinchify" width={28} height={28} />
          <span className="h text-[15px] font-bold text-[var(--text)]">Flinchify</span>
        </Link>

        {/* Tester identity */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-full grad-warm-bg flex items-center justify-center text-white text-[18px] font-bold mb-3">
            {tester.name.charAt(0).toUpperCase()}
          </div>
          <p className="h text-[14px] font-semibold text-[var(--text)]">{tester.name}</p>
          <p className="text-[12px] text-[var(--text-dim)]">{tester.email}</p>
          {tester.location && <p className="text-[12px] text-[var(--text-dim)] mt-0.5">{tester.location}</p>}
        </div>

        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map(item => (
            "href" in item && item.href ? (
              <Link key={item.key} href={item.href}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/[0.02] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                {item.label}
              </Link>
            ) : (
              <button key={item.key} onClick={() => setTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                  tab === item.key ? "bg-black/[0.04] text-[var(--text)]" : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/[0.02]"
                }`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                {item.label}
              </button>
            )
          ))}
        </nav>

        <Link href="/" className="text-[12px] text-[var(--text-dim)] hover:text-[var(--text)] transition-colors mt-4">← Back to site</Link>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/[0.04] px-4 h-[56px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Flinchify" width={24} height={24} />
          <span className="h text-[14px] font-bold">Flinchify</span>
        </Link>
        <div className="flex gap-1">
          {NAV_ITEMS.map(item => (
            "href" in item && item.href ? (
              <Link key={item.key} href={item.href} className="p-2 rounded-lg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5"><path d={item.icon} /></svg>
              </Link>
            ) : (
              <button key={item.key} onClick={() => setTab(item.key)}
                className={`p-2 rounded-lg ${tab === item.key ? "bg-black/[0.04]" : ""}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={tab === item.key ? "#111" : "#999"} strokeWidth="1.5"><path d={item.icon} /></svg>
              </button>
            )
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 p-6 md:p-10 pt-20 md:pt-10 overflow-y-auto">
        {tab === "overview" && (
          <div>
            <h1 className="h text-xl font-bold text-[var(--text)] mb-6">Welcome back, {tester.name}</h1>

            {/* Payout setup banner */}
            {connectStatus && !connectStatus.onboarded && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="h text-[14px] font-semibold text-orange-800">Set up payouts to get paid</p>
                  <p className="text-[12px] text-orange-600 mt-0.5">Connect your bank account so you can receive payments when you complete tests.</p>
                </div>
                <button onClick={setupPayouts} disabled={connectLoading}
                  className="shrink-0 px-4 py-2 rounded-xl bg-orange-500 text-white text-[13px] font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">
                  {connectLoading ? "Loading..." : "Set up"}
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Tests Completed", value: tester.tests_completed, color: "text-[var(--text)]" },
                { label: "Total Earned", value: `$${earned}`, color: "text-[var(--accent)]" },
                { label: "Avg Rating", value: tester.avg_rating > 0 ? `${tester.avg_rating}/5` : "—", color: "text-[var(--text)]" },
                { label: "Member Since", value: memberSince, color: "text-[var(--text)]" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-black/[0.04] p-5">
                  <p className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1 font-medium">{s.label}</p>
                  <p className={`h text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/explore" className="bg-white rounded-2xl border border-black/[0.04] p-6 text-left hover:border-black/[0.08] transition-colors block">
                <h3 className="h text-[14px] font-semibold text-[var(--text)] mb-1">Explore jobs</h3>
                <p className="text-[13px] text-[var(--text-muted)]">Find test jobs matched to your profile and start earning.</p>
              </Link>
              <button onClick={() => setTab("profile")} className="bg-white rounded-2xl border border-black/[0.04] p-6 text-left hover:border-black/[0.08] transition-colors">
                <h3 className="h text-[14px] font-semibold text-[var(--text)] mb-1">Update your profile</h3>
                <p className="text-[13px] text-[var(--text-muted)]">Keep your info current to get matched to better jobs.</p>
              </button>
            </div>
          </div>
        )}

        {tab === "explore" && (() => {
          const filtered = exploreJobs
            .filter(j => {
              const q = exploreSearch.toLowerCase();
              if (q && !dom(j.app_url).toLowerCase().includes(q) && !(j.description || "").toLowerCase().includes(q) && !(j.app_type || "").toLowerCase().includes(q)) return false;
              if (exploreFilter !== "All" && (j.app_type || "").toLowerCase() !== exploreFilter.toLowerCase()) return false;
              return true;
            })
            .sort((a, b) => {
              if (exploreSort === "Highest pay") return (b.price_per_tester_cents || 0) - (a.price_per_tester_cents || 0);
              if (exploreSort === "Most spots") return (b.testers_count - b.accepted_count) - (a.testers_count - a.accepted_count);
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
          return (
            <div>
              <h1 className="h text-xl font-bold text-[var(--text)] mb-6">Explore jobs</h1>
              {/* Search + sort */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Search jobs..." value={exploreSearch} onChange={e => setExploreSearch(e.target.value)}
                    className="w-full h-10 rounded-xl border border-black/[0.08] pl-10 pr-4 text-[13px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-black/[0.15]" />
                </div>
                <select value={exploreSort} onChange={e => setExploreSort(e.target.value)}
                  className="h-10 rounded-xl border border-black/[0.08] px-3 text-[13px] text-[var(--text-muted)] bg-white focus:outline-none shrink-0">
                  {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              {/* Filter chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {TYPE_FILTERS.map(f => (
                  <button key={f} onClick={() => setExploreFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                      exploreFilter === f ? "bg-black text-white border-black" : "bg-white text-[var(--text-muted)] border-black/[0.08] hover:border-black/[0.15]"
                    }`}>{f}</button>
                ))}
              </div>
              {applyError && <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3 mb-4">{applyError}</div>}
              {exploreLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="rounded-xl border border-black/[0.06] p-5 animate-pulse">
                      <div className="h-4 bg-black/[0.04] rounded w-2/3 mb-2" /><div className="h-3 bg-black/[0.03] rounded w-1/3 mb-6" /><div className="h-3 bg-black/[0.03] rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-[var(--text-muted)] text-[15px]">{exploreSearch || exploreFilter !== "All" ? "No jobs match your filters." : "No active test jobs right now."}</p>
                  <p className="text-[13px] text-[var(--text-dim)] mt-1">Check back soon.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(job => {
                    const pay = (job.price_per_tester_cents || 0) / 100;
                    const spots = job.testers_count - job.accepted_count;
                    const hostname = dom(job.app_url);
                    const hasApplied = appliedSet.has(job.id);
                    return (
                      <div key={job.id} className="rounded-xl border border-black/[0.06] p-5 hover:border-black/[0.12] hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="h text-[14px] font-semibold text-[var(--text)] line-clamp-1">{hostname}</h3>
                            {job.app_type && <span className="text-[11px] text-[var(--text-dim)]">{job.app_type}</span>}
                          </div>
                          <p className="h text-[16px] font-bold text-[var(--text)] shrink-0">${pay.toFixed(0)}</p>
                        </div>
                        {job.description && <p className="text-[12px] text-[var(--text-dim)] line-clamp-2 mb-3">{job.description}</p>}
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
                        {hasApplied ? (
                          <button disabled className="w-full py-2 rounded-lg border border-black/[0.06] text-[12px] font-medium text-[var(--text-dim)]">Applied</button>
                        ) : spots <= 0 ? (
                          <button disabled className="w-full py-2 rounded-lg border border-black/[0.06] text-[12px] font-medium text-[var(--text-dim)]">Full</button>
                        ) : (
                          <button onClick={() => applyToJob(job.id)} disabled={applying === job.id}
                            className="w-full py-2 rounded-lg bg-black text-white text-[12px] font-semibold hover:bg-black/90 transition-colors disabled:opacity-50">
                            {applying === job.id ? "Applying..." : "Apply"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {tab === "myjobs" && (
          <div>
            <h1 className="h text-xl font-bold text-[var(--text)] mb-6">My Jobs</h1>
            {myAppsLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-black/[0.04] p-6 animate-pulse"><div className="h-4 bg-black/[0.03] rounded w-1/3" /></div>)}</div>
            ) : myApps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/[0.04] p-10 text-center">
                <p className="text-[var(--text-muted)]">No jobs yet.</p>
                <p className="text-[13px] text-[var(--text-dim)] mt-1"><Link href="/explore" className="text-[var(--accent)] hover:underline">Explore jobs</Link> and apply to start earning.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myApps.map(a => {
                  const pay = (a.price_per_tester_cents || 0) / 100;
                  const hostname = (() => { try { return new URL(a.app_url).hostname.replace("www.", ""); } catch { return a.app_url; } })();
                  const statusColors: Record<string, string> = {
                    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
                    accepted: "bg-blue-50 text-blue-700 border-blue-200",
                    submitted: "bg-purple-50 text-purple-700 border-purple-200",
                    completed: "bg-green-50 text-green-700 border-green-200",
                    rejected: "bg-red-50 text-red-700 border-red-200",
                  };
                  return (
                    <div key={a.id} className="bg-white rounded-2xl border border-black/[0.04] p-6">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="h text-[14px] font-semibold text-[var(--text)]">{hostname}</h3>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[a.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>{a.status}</span>
                            {a.app_type ? <span className="text-[11px] text-[var(--text-dim)]">{a.app_type}</span> : null}
                          </div>
                          {a.job_description ? <p className="text-[12px] text-[var(--text-muted)] mt-1 line-clamp-2">{a.job_description}</p> : null}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="h text-[16px] font-bold">${pay.toFixed(0)}</p>
                          {a.payout_cents > 0 ? <p className="text-[10px] text-green-600">Earned ${(a.payout_cents / 100).toFixed(2)}</p> : null}
                        </div>
                      </div>

                      {/* Accepted = show submit button */}
                      {a.status === "accepted" && !submitForm && (
                        <button onClick={() => setSubmitForm({ id: a.id, feedback: "", recording: "" })}
                          className="w-full py-2.5 rounded-xl bg-black text-white text-[13px] font-semibold hover:bg-black/90 transition-colors">
                          Submit test results
                        </button>
                      )}

                      {/* Submit form inline */}
                      {submitForm && submitForm.id === a.id && (
                        <div className="mt-3 space-y-3 border-t border-black/[0.04] pt-4">
                          <div>
                            <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Your feedback *</label>
                            <textarea className="w-full rounded-xl border border-black/[0.08] p-3 text-[13px] min-h-[120px] resize-none focus:outline-none focus:border-black/[0.15]"
                              placeholder="What worked, what was confusing, what broke? Be specific — mention exact pages, buttons, flows..."
                              value={submitForm.feedback}
                              onChange={e => setSubmitForm({ ...submitForm, feedback: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Screen recording URL (optional)</label>
                            <input className="w-full rounded-xl border border-black/[0.08] px-3 py-2.5 text-[13px] focus:outline-none focus:border-black/[0.15]"
                              placeholder="Loom, YouTube, or any video link"
                              value={submitForm.recording}
                              onChange={e => setSubmitForm({ ...submitForm, recording: e.target.value })} />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setSubmitForm(null)} className="flex-1 py-2.5 rounded-xl border border-black/[0.08] text-[13px] font-medium text-[var(--text-muted)] hover:bg-black/[0.02] transition-colors">Cancel</button>
                            <button onClick={submitResults} disabled={submitting || submitForm.feedback.length < 20}
                              className="flex-1 py-2.5 rounded-xl bg-black text-white text-[13px] font-semibold hover:bg-black/90 transition-colors disabled:opacity-40">
                              {submitting ? "Submitting..." : "Submit & get paid"}
                            </button>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] text-center">Payment is automatic once you submit. Min 20 characters.</p>
                        </div>
                      )}

                      {/* Already submitted */}
                      {(a.status === "submitted" || a.status === "completed") && a.feedback ? (
                        <div className="mt-3 bg-black/[0.02] rounded-xl p-3">
                          <p className="text-[11px] font-medium text-[var(--text-dim)] mb-1">Your feedback</p>
                          <p className="text-[12px] text-[var(--text-muted)] line-clamp-3">{a.feedback}</p>
                        </div>
                      ) : null}

                      {a.status === "pending" && (
                        <p className="text-[12px] text-[var(--text-dim)] mt-2">Waiting for review. You&apos;ll be notified when accepted.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "bookings" && (
          <div>
            <h1 className="h text-xl font-bold text-[var(--text)] mb-6">Bookings</h1>
            {bookingsLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border border-black/[0.04] p-6 animate-pulse"><div className="h-4 bg-black/[0.03] rounded w-1/3" /></div>)}</div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/[0.04] p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-[var(--text-muted)]">No bookings yet.</p>
                <p className="text-[13px] text-[var(--text-dim)] mt-1">Scheduled test sessions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => {
                  const hostname = dom(b.app_url);
                  const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
                    pending: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Pending" },
                    confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Confirmed" },
                    completed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Completed" },
                    cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Cancelled" },
                    no_show: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: "No Show" },
                  };
                  const st = statusConfig[b.status] || statusConfig.pending;
                  const dateStr = new Date(b.scheduled_date).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
                  const isUpcoming = b.status === "pending" || b.status === "confirmed";

                  return (
                    <div key={b.id} className={`bg-white rounded-2xl border p-6 ${isUpcoming ? "border-black/[0.06]" : "border-black/[0.04] opacity-75"}`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="h text-[14px] font-semibold text-[var(--text)]">{hostname}</h3>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>{st.label}</span>
                            {b.app_type && <span className="text-[11px] text-[var(--text-dim)]">{b.app_type}</span>}
                          </div>
                          {b.job_description && <p className="text-[12px] text-[var(--text-muted)] mt-1 line-clamp-2">{b.job_description}</p>}
                        </div>
                      </div>

                      {/* Schedule details */}
                      <div className="bg-[var(--bg-2)] rounded-xl p-3 mb-3">
                        <div className="grid grid-cols-3 gap-3 text-[12px]">
                          <div>
                            <span className="text-[var(--text-dim)]">Date</span>
                            <p className="font-medium text-[var(--text)] mt-0.5">{dateStr}</p>
                          </div>
                          <div>
                            <span className="text-[var(--text-dim)]">Time</span>
                            <p className="font-medium text-[var(--text)] mt-0.5">{b.scheduled_time}</p>
                          </div>
                          <div>
                            <span className="text-[var(--text-dim)]">Duration</span>
                            <p className="font-medium text-[var(--text)] mt-0.5">{b.duration_minutes}m</p>
                          </div>
                        </div>
                      </div>

                      {/* Tester info (shown to businesses) */}
                      {b.tester_name && (
                        <p className="text-[12px] text-[var(--text-muted)] mb-3">Tester: <span className="font-medium text-[var(--text)]">{b.tester_name}</span></p>
                      )}

                      {/* App ready badge */}
                      {isUpcoming && b.app_ready && (
                        <div className="flex items-center gap-1.5 mb-3">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                          <span className="text-[11px] text-green-600 font-medium">App marked as ready</span>
                        </div>
                      )}
                      {isUpcoming && !b.app_ready && b.app_ready_deadline && (
                        <p className="text-[11px] text-orange-600 mb-3">App must be ready by {new Date(b.app_ready_deadline).toLocaleString("en-AU", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                      )}

                      {/* Tester actions */}
                      {b.status === "pending" && b.tester_id && (
                        <div className="flex gap-2">
                          <button onClick={() => handleBookingAction(b.id, "confirm")} disabled={bookingAction === b.id}
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                            {bookingAction === b.id ? "..." : "Confirm"}
                          </button>
                          <button onClick={() => handleBookingAction(b.id, "cancel")} disabled={bookingAction === b.id}
                            className="flex-1 py-2.5 rounded-xl border border-black/[0.08] text-[13px] font-medium text-[var(--text-muted)] hover:bg-black/[0.02] transition-colors disabled:opacity-50">
                            Decline
                          </button>
                        </div>
                      )}

                      {b.notes && (
                        <div className="mt-3 bg-black/[0.02] rounded-xl p-3">
                          <p className="text-[11px] font-medium text-[var(--text-dim)] mb-1">Notes</p>
                          <p className="text-[12px] text-[var(--text-muted)]">{b.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "profile" && (
          <div>
            <h1 className="h text-xl font-bold text-[var(--text)] mb-6">Your profile</h1>

            <div className="bg-white rounded-2xl border border-black/[0.04] p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-black/[0.04]">
                <div className="w-16 h-16 rounded-full grad-warm-bg flex items-center justify-center text-white text-[24px] font-bold">
                  {tester.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="h text-lg font-bold text-[var(--text)]">{tester.name}</h2>
                  <p className="text-[13px] text-[var(--text-muted)]">{tester.email}</p>
                  {tester.location && <p className="text-[12px] text-[var(--text-dim)]">{tester.location}</p>}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                {tester.age_range && (
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-1">Age Range</p>
                    <p className="text-[14px] text-[var(--text)]">{tester.age_range}</p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-1">Tech Comfort</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className={`w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center ${
                        n <= tester.tech_comfort ? "grad-warm-bg text-white" : "bg-black/[0.03] text-[var(--text-dim)]"
                      }`}>{n}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Devices */}
              {devices.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2">Devices</p>
                  <div className="flex flex-wrap gap-2">
                    {devices.map((d: string) => (
                      <span key={d} className="px-3 py-1 rounded-full text-[12px] bg-black/[0.03] text-[var(--text-muted)] font-medium">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {interests.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((i: string) => (
                      <span key={i} className="px-3 py-1 rounded-full text-[12px] bg-orange-50 text-orange-700 border border-orange-100 font-medium">{i}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {tester.bio && (
                <div className="mt-6">
                  <p className="text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-1">About</p>
                  <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">{tester.bio}</p>
                </div>
              )}

              {/* Sign out */}
              <div className="mt-8 pt-6 border-t border-black/[0.04]">
                <button onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }} className="text-[13px] text-red-500 hover:text-red-600 font-medium transition-colors">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "payouts" && (
          <div>
            <h1 className="h text-xl font-bold text-[var(--text)] mb-6">Payouts</h1>

            {connectStatus && !connectStatus.onboarded ? (
              <div className="bg-white rounded-2xl border border-black/[0.04] p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="h text-[16px] font-bold text-[var(--text)] mb-2">Set up your bank account</h2>
                <p className="text-[13px] text-[var(--text-muted)] mb-6 max-w-sm mx-auto">
                  Connect your bank account through Stripe to receive automatic payments when you complete test jobs.
                </p>
                <button onClick={setupPayouts} disabled={connectLoading}
                  className="px-6 py-3 rounded-xl bg-black text-white text-[14px] font-semibold hover:bg-black/90 transition-colors disabled:opacity-50">
                  {connectLoading ? "Setting up..." : "Connect bank account"}
                </button>
                <p className="text-[11px] text-[var(--text-dim)] mt-4">Powered by Stripe. Your details are secure.</p>
              </div>
            ) : (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-green-800">Payouts active</p>
                    <p className="text-[11px] text-green-600">Your bank account is connected. Payments arrive automatically.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-2xl border border-black/[0.04] p-5">
                    <p className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1 font-medium">Total Earned</p>
                    <p className="h text-xl font-bold text-[var(--accent)]">${earned.toFixed(2)}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-black/[0.04] p-5">
                    <p className="text-[11px] text-[var(--text-dim)] uppercase tracking-wider mb-1 font-medium">Tests Completed</p>
                    <p className="h text-xl font-bold text-[var(--text)]">{tester.tests_completed}</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
                  <p className="text-[13px] text-[var(--text-muted)]">Detailed payout history coming soon.</p>
                </div>
              </div>
            )}
          </div>
        )}
        {/* ═══ POST A TEST ═══ */}
        {tab === "posttest" && (
          <div>
            <h1 className="h text-xl font-bold text-[var(--text)] mb-2">Post a Test</h1>
            <p className="text-[13px] text-[var(--text-muted)] mb-6">Get real humans to test your app. Set your budget, define tasks, and get results.</p>

            <div className="bg-white rounded-2xl border border-black/[0.04] p-6 sm:p-8">
              <PostTestForm />
            </div>
          </div>
        )}

        {/* ═══ REFERRALS ═══ */}
        {tab === "referrals" && (
          <div>
            <h1 className="h text-xl font-bold text-[var(--text)] mb-2">Referrals</h1>
            <p className="text-[13px] text-[var(--text-muted)] mb-6">Invite friends to Flinchify and earn bonus rewards when they complete tests.</p>

            <div className="bg-white rounded-2xl border border-black/[0.04] p-6 sm:p-8 text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="h text-[16px] font-bold text-[var(--text)] mb-2">Your referral link</h2>
              <div className="bg-[var(--bg-2)] rounded-xl p-3 mb-4 max-w-md mx-auto">
                <code className="text-[13px] text-[var(--text)] select-all break-all">
                  {typeof window !== "undefined" ? `${window.location.origin}/become-a-tester?ref=${tester?.id}` : ""}
                </code>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/become-a-tester?ref=${tester?.id}`);
                  alert("Copied!");
                }}
                className="px-5 py-2.5 rounded-xl bg-black text-white text-[13px] font-semibold hover:bg-black/90 transition-colors">
                Copy link
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z", title: "Share your link", desc: "Send your unique referral link to friends, share on social media, or post in communities." },
                { icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z", title: "They sign up & test", desc: "When someone signs up with your link and completes their first test, you both benefit." },
                { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Earn bonuses", desc: "Get a bonus added to your earnings for every successful referral. More referrals = more money." },
              ].map(s => (
                <div key={s.title} className="bg-white rounded-2xl border border-black/[0.04] p-5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3"><path d={s.icon} /></svg>
                  <h3 className="h text-[13px] font-semibold text-[var(--text)] mb-1">{s.title}</h3>
                  <p className="text-[12px] text-[var(--text-muted)] leading-[1.6]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ HOW IT WORKS ═══ */}
        {tab === "howit" && (
          <div>
            <h1 className="h text-xl font-bold text-[var(--text)] mb-6">How it Works</h1>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-black/[0.04] p-6 sm:p-8">
                <div className="h-1 grad-warm-bg rounded-full mb-6 w-full" />
                <h2 className="h text-[15px] font-bold text-[var(--accent)] uppercase tracking-wider mb-6">For Businesses</h2>
                <div className="space-y-5">
                  {[
                    { n: "01", t: "Post your job", d: "Describe your app, paste the URL, set the tasks testers need to complete, and define a time limit." },
                    { n: "02", t: "Set your budget", d: "Choose how many testers and how much you'll pay each one. Minimum $5/tester, no ceiling." },
                    { n: "03", t: "Testers apply & test", d: "Matched testers apply to your job. They use your app, record their screen, and note every friction point." },
                    { n: "04", t: "Review & approve", d: "You review each submission. Accept good work (tester gets paid), reject lazy submissions." },
                  ].map(s => (
                    <div key={s.n} className="flex gap-3">
                      <span className="h text-[12px] font-bold text-[var(--text-dim)] mt-0.5 shrink-0">{s.n}</span>
                      <div>
                        <h4 className="h text-[13px] font-semibold text-[var(--text)] mb-0.5">{s.t}</h4>
                        <p className="text-[12px] text-[var(--text-muted)] leading-[1.6]">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.04] p-6 sm:p-8">
                <div className="h-1 bg-gradient-to-r from-red-400 to-orange-400 rounded-full mb-6 w-full" />
                <h2 className="h text-[15px] font-bold text-[#EF4444] uppercase tracking-wider mb-6">For Testers</h2>
                <div className="space-y-5">
                  {[
                    { n: "01", t: "Create your profile", d: "Sign up with your devices, interests, and experience. Takes 60 seconds." },
                    { n: "02", t: "Browse & apply", d: "Find jobs that match your profile. Filter by budget, app type, or time limit." },
                    { n: "03", t: "Complete the tasks", d: "Use the app for the specified time. Record your screen, note bugs, and log every friction point." },
                    { n: "04", t: "Get paid", d: "Business approves your work → money hits your bank via Stripe. 80% goes to you." },
                  ].map(s => (
                    <div key={s.n} className="flex gap-3">
                      <span className="h text-[12px] font-bold text-[var(--text-dim)] mt-0.5 shrink-0">{s.n}</span>
                      <div>
                        <h4 className="h text-[13px] font-semibold text-[var(--text)] mb-0.5">{s.t}</h4>
                        <p className="text-[12px] text-[var(--text-muted)] leading-[1.6]">{s.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-black/[0.04] p-6 mt-6">
              <h3 className="h text-[14px] font-semibold text-[var(--text)] mb-3">What you deliver as a tester</h3>
              <div className="grid sm:grid-cols-4 gap-4">
                {[
                  { t: "Screen recordings", d: "Full session with audio commentary" },
                  { t: "Bug reports", d: "Steps to reproduce, severity, screenshots" },
                  { t: "Friction notes", d: "What confused you, what felt off" },
                  { t: "Flinch score", d: "Overall usability rating 0-100" },
                ].map(d => (
                  <div key={d.t} className="bg-[var(--bg-2)] rounded-xl p-4">
                    <p className="h text-[12px] font-semibold text-[var(--text)] mb-1">{d.t}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{d.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ PRICING ═══ */}
        {tab === "pricing" && (
          <div>
            <h1 className="h text-xl font-bold text-[var(--text)] mb-2">Pricing</h1>
            <p className="text-[13px] text-[var(--text-muted)] mb-6">No subscriptions, no tiers. You set the price per tester and the tasks they must complete.</p>

            <div className="bg-[var(--dark)] rounded-2xl p-6 sm:p-8 text-center mb-6">
              <p className="h text-xl sm:text-2xl font-bold text-white">
                Testers <span className="text-orange-400">×</span> Your price <span className="text-orange-400">=</span> Total
              </p>
              <p className="text-[13px] text-white/40 mt-2">$5 minimum per tester. No platform fee. No surprises.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { title: "Quick check", testers: 2, price: 5, tasks: "Sign up + report friction", time: "15 min", total: 10 },
                { title: "Full audit", testers: 5, price: 12, tasks: "Complete onboarding, log every flinch", time: "30 min", total: 60, pop: true },
                { title: "Deep dive", testers: 10, price: 20, tasks: "3-day usage, daily friction logs", time: "3 days", total: 200 },
              ].map(ex => (
                <div key={ex.title} className={`bg-white rounded-2xl border p-5 ${ex.pop ? "border-[var(--accent)] ring-1 ring-orange-100" : "border-black/[0.04]"}`}>
                  {ex.pop && <span className="h text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">Most common</span>}
                  <p className="h text-[14px] font-semibold text-[var(--text)] mb-3 mt-1">{ex.title}</p>
                  <div className="space-y-2 text-[13px] mb-3">
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Testers</span><span className="font-medium text-[var(--text)]">{ex.testers}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Per tester</span><span className="font-medium text-[var(--text)]">${ex.price}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Time limit</span><span className="font-medium text-[var(--text)]">{ex.time}</span></div>
                  </div>
                  <div className="border-t border-black/[0.04] pt-3">
                    <div className="flex justify-between text-[14px]"><span className="text-[var(--text-muted)]">Total</span><span className="h font-bold text-[var(--text)]">${ex.total}</span></div>
                  </div>
                  <p className="text-[11px] text-[var(--text-dim)] mt-3">{ex.tasks}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-black/[0.04] p-6">
              <h3 className="h text-[14px] font-semibold text-[var(--text)] mb-4">Tester earnings breakdown</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-[var(--bg-2)] rounded-xl p-4 text-center">
                  <p className="h text-2xl font-bold text-[var(--text)]">80%</p>
                  <p className="text-[12px] text-[var(--text-muted)] mt-1">Goes to you</p>
                </div>
                <div className="bg-[var(--bg-2)] rounded-xl p-4 text-center">
                  <p className="h text-2xl font-bold text-[var(--text-dim)]">20%</p>
                  <p className="text-[12px] text-[var(--text-muted)] mt-1">Platform fee</p>
                </div>
                <div className="bg-[var(--bg-2)] rounded-xl p-4 text-center">
                  <p className="h text-2xl font-bold text-[var(--accent)]">Same day</p>
                  <p className="text-[12px] text-[var(--text-muted)] mt-1">Payout speed</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button onClick={() => setTab("posttest")} className="px-6 py-3 rounded-xl bg-black text-white text-[14px] font-semibold hover:bg-black/90 transition-colors">
                Post a test job
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

