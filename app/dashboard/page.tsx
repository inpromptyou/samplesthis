"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

const NAV_ITEMS = [
  { key: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "explore", label: "Explore", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", href: "/explore" },
  { key: "jobs", label: "Browse Jobs", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { key: "payouts", label: "Payouts", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { key: "profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function Dashboard() {
  const router = useRouter();
  const [tester, setTester] = useState<Tester | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectStatus, setConnectStatus] = useState<{ onboarded: boolean; hasAccount: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/testers/me")
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) { router.push("/become-a-tester"); return; }
        setTester(d.tester);
        setLoading(false);
      })
      .catch(() => router.push("/become-a-tester"));

    // Check Stripe Connect status
    fetch("/api/connect/status").then(r => r.json()).then(d => setConnectStatus(d)).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (tab === "jobs") {
      setJobsLoading(true);
      fetch("/api/orders").then(r => r.json()).then(d => { setJobs(d.jobs || []); setJobsLoading(false); });
    }
  }, [tab]);

  const setupPayouts = async () => {
    setConnectLoading(true);
    try {
      const r = await fetch("/api/connect/onboard", { method: "POST" });
      const d = await r.json();
      if (d.url) window.location.href = d.url;
      else alert(d.error || "Failed to start setup");
    } catch { alert("Something went wrong"); }
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
              <button onClick={() => setTab("jobs")} className="bg-white rounded-2xl border border-black/[0.04] p-6 text-left hover:border-black/[0.08] transition-colors">
                <h3 className="h text-[14px] font-semibold text-[var(--text)] mb-1">Browse open jobs</h3>
                <p className="text-[13px] text-[var(--text-muted)]">Find test jobs matched to your profile and start earning.</p>
              </button>
              <button onClick={() => setTab("profile")} className="bg-white rounded-2xl border border-black/[0.04] p-6 text-left hover:border-black/[0.08] transition-colors">
                <h3 className="h text-[14px] font-semibold text-[var(--text)] mb-1">Update your profile</h3>
                <p className="text-[13px] text-[var(--text-muted)]">Keep your info current to get matched to better jobs.</p>
              </button>
            </div>
          </div>
        )}

        {tab === "jobs" && (
          <div>
            <h1 className="h text-xl font-bold text-[var(--text)] mb-6">Open test jobs</h1>
            {jobsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-black/[0.04] p-6 animate-pulse"><div className="h-4 bg-black/[0.03] rounded w-1/3" /></div>)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-black/[0.04] p-10 text-center">
                <p className="text-[var(--text-muted)]">No active jobs right now.</p>
                <p className="text-[13px] text-[var(--text-dim)] mt-1">Check back soon — new jobs are posted daily.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => {
                  const perTester = (job.price_per_tester_cents || 0) / 100;
                  const spotsLeft = job.testers_count - job.accepted_count;
                  const domain = (() => { try { return new URL(job.app_url).hostname.replace("www.", ""); } catch { return job.app_url; } })();
                  return (
                    <div key={job.id} className="bg-white rounded-2xl border border-black/[0.04] p-6 hover:border-black/[0.08] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="h text-[14px] font-semibold text-[var(--text)]">{domain}</h3>
                          {job.app_type && <span className="text-[11px] text-[var(--text-dim)]">{job.app_type}</span>}
                          {job.description && <p className="text-[13px] text-[var(--text-muted)] mt-1 line-clamp-2">{job.description}</p>}
                          <div className="flex gap-3 mt-2 text-[11px] text-[var(--text-dim)]">
                            <span>{job.applications_count} applied</span>
                            <span>{spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="h text-lg font-bold text-[var(--text)]">${perTester}</p>
                          <p className="text-[10px] text-[var(--text-dim)]">per test</p>
                        </div>
                      </div>
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
      </main>
    </div>
  );
}
