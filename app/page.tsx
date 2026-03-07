"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import AuthModal from "@/components/AuthModal";
import TypingRotate from "@/components/TypingRotate";

const SAMPLE_JOBS = [
  { app: "Fitness tracking app", audience: "Gym-goers, 25-40", testers: 5, budget: 12, time: "2h ago", applied: 8 },
  { app: "SaaS onboarding flow", audience: "Small business owners", testers: 3, budget: 15, time: "45m ago", applied: 5 },
  { app: "Crypto portfolio tracker", audience: "Active traders", testers: 8, budget: 8, time: "1h ago", applied: 12 },
  { app: "Recipe sharing mobile app", audience: "Home cooks, 30-55", testers: 5, budget: 10, time: "3h ago", applied: 9 },
  { app: "E-commerce checkout redesign", audience: "Online shoppers, 20-45", testers: 4, budget: 18, time: "30m ago", applied: 6 },
  { app: "AI writing assistant", audience: "Content creators", testers: 6, budget: 14, time: "1.5h ago", applied: 11 },
];

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}

function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authParam = searchParams.get("auth") as "tester" | "business" | null;
  const [authMode, setAuthMode] = useState<"tester" | "business" | null>(authParam);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in (either tester or business)
    Promise.all([
      fetch("/api/testers/me").then(r => r.json()).catch(() => ({})),
      fetch("/api/business/me").then(r => r.json()).catch(() => ({})),
    ]).then(([tester, biz]) => {
      if (tester?.id || biz?.authenticated) setLoggedIn(true);
    });
  }, []);

  const handleAuthSuccess = (data: { type: "tester" | "business" }) => {
    setAuthMode(null);
    if (data.type === "tester") router.push("/dashboard");
    else router.push("/submit");
  };

  return (
    <>
      <Nav />
      <AuthModal
        mode={authMode || "tester"}
        open={authMode !== null}
        onClose={() => setAuthMode(null)}
        onSuccess={handleAuthSuccess}
      />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="warm-gradient-hero pt-28 sm:pt-32 pb-16 sm:pb-20 px-5 sm:px-6">
          <div className="max-w-[800px] mx-auto text-center">
            {/* Stats — stack on mobile */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-8 sm:mb-10 hero-anim ha-1">
              {[
                { label: "Avg delivery", value: "4hr" },
                { label: "Satisfaction", value: "98%" },
                { label: "Avg per tester", value: "$8" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="text-[12px] sm:text-[13px] text-[var(--text-dim)]">{s.label}</span>
                  <span className="h text-[12px] sm:text-[13px] font-bold text-[var(--text)]">{s.value}</span>
                </div>
              ))}
            </div>

            <h1 className="h text-[2.2rem] sm:text-[clamp(2.8rem,7vw,5rem)] font-bold leading-[1.05] tracking-[-0.035em] mb-5 sm:mb-6 hero-anim ha-2">
              Find the flinch before your{" "}
              <span className="grad-warm inline"><TypingRotate /></span>{" "}
              do
            </h1>

            <p className="text-[15px] sm:text-[17px] text-[var(--text-muted)] max-w-[480px] mx-auto mb-8 sm:mb-10 leading-[1.6] hero-anim ha-3 px-2">
              Real humans matched to your audience test your app and find every
              friction point. Set your own budget, pay per tester.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 hero-anim ha-4">
              {loggedIn ? (
                <>
                  <Link href="/explore" className="btn btn-primary btn-lg w-full sm:w-auto">Start testing</Link>
                  <Link href="/submit" className="btn btn-outline btn-lg w-full sm:w-auto">Post a job</Link>
                </>
              ) : (
                <>
                  <button onClick={() => setAuthMode("tester")} className="btn btn-primary btn-lg w-full sm:w-auto">Become a tester</button>
                  <button onClick={() => setAuthMode("business")} className="btn btn-outline btn-lg w-full sm:w-auto">List a job</button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* ═══ LIVE JOBS ═══ */}
        <section className="pb-16 sm:pb-24 px-5 sm:px-6">
          <div className="max-w-[1100px] mx-auto">
            <div className="flex items-center justify-between mb-5 sm:mb-6">
              <h2 className="h text-[15px] font-semibold text-[var(--text)]">Latest jobs</h2>
              <Link href="/explore" className="text-[13px] text-[var(--text-dim)] hover:text-[var(--text)] transition-colors flex items-center gap-1">
                Explore all
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </Link>
            </div>
            {/* 1 col mobile, 3 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {SAMPLE_JOBS.map((job, i) => (
                <ScrollReveal key={job.app} delay={i * 80} animation="up">
                  <div className="card card-hover-lift p-4 sm:p-5 h-full">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="h text-[14px] sm:text-[15px] font-semibold text-[var(--text)]">{job.app}</h3>
                        <p className="text-[12px] sm:text-[13px] text-[var(--text-muted)] mt-0.5">${job.budget}/tester</p>
                      </div>
                      <span className="text-[11px] sm:text-[12px] text-[var(--text-dim)] shrink-0 ml-3">{job.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5">
                          {Array.from({ length: Math.min(3, job.applied) }).map((_, i) => (
                            <div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-orange-200 to-amber-100 border-2 border-white" />
                          ))}
                        </div>
                        <span className="text-[11px] sm:text-[12px] text-[var(--text-dim)]">{job.applied} applied</span>
                      </div>
                      <button onClick={() => setAuthMode("tester")} className="text-[12px] font-medium text-[var(--accent)] hover:underline">Apply</button>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURE BLOCK ═══ */}
        <section className="px-5 sm:px-6 pb-16 sm:pb-24">
          <div className="max-w-[1100px] mx-auto">
            <ScrollReveal animation="in">
            <div className="feature-block px-6 py-12 sm:px-10 sm:py-16 md:px-16 md:py-20 text-center">
              <h2 className="h text-2xl sm:text-3xl md:text-[3.5rem] font-bold tracking-[-0.03em] leading-tight mb-4 sm:mb-5">
                Flinch Report
              </h2>
              <p className="text-[14px] sm:text-[16px] text-white/70 max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
                Screen recordings, bug reports, friction notes, and a flinch score for every tester — delivered to your inbox.
              </p>
              <Link href="/submit" className="btn bg-white text-[var(--dark)] hover:bg-white/90 btn-lg">
                Get your report
              </Link>
            </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ TWO SIDES ═══ */}
        <section className="warm-gradient-down py-16 sm:py-20 px-5 sm:px-6">
          <div className="max-w-[1100px] mx-auto">
            <ScrollReveal>
              <h2 className="h text-[1.5rem] sm:text-2xl md:text-[2.5rem] font-bold tracking-[-0.03em] text-center mb-8 sm:mb-14 text-[var(--text)]">
                One platform. Two ways to win.
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <ScrollReveal delay={100}>
                <button onClick={() => setAuthMode("business")} className="card block p-6 sm:p-8 group text-left w-full">
                  <div className="w-10 h-10 rounded-xl grad-warm-subtle flex items-center justify-center mb-4 sm:mb-5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                  </div>
                  <h3 className="h text-[16px] sm:text-lg font-semibold mb-2 text-[var(--text)]">I built something</h3>
                  <p className="text-[13px] sm:text-[14px] text-[var(--text-muted)] leading-[1.7] mb-4 sm:mb-5">
                    Post a test job with your budget. Describe your ideal user. Get screen recordings, bug reports, and every flinch moment.
                  </p>
                  <span className="text-[13px] font-medium text-[var(--accent)] group-hover:underline">Post a test job →</span>
                </button>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <button onClick={() => setAuthMode("tester")} className="card block p-6 sm:p-8 group text-left w-full">
                  <div className="w-10 h-10 rounded-xl grad-warm-subtle flex items-center justify-center mb-4 sm:mb-5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <h3 className="h text-[16px] sm:text-lg font-semibold mb-2 text-[var(--text)]">I want to earn</h3>
                  <p className="text-[13px] sm:text-[14px] text-[var(--text-muted)] leading-[1.7] mb-4 sm:mb-5">
                    Browse jobs matched to your profile. Use apps for 15 minutes, give honest feedback, get paid same day.
                  </p>
                  <span className="text-[13px] font-medium text-[var(--accent)] group-hover:underline">Sign up as a tester →</span>
                </button>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="warm-section py-16 sm:py-20 px-5 sm:px-6">
          <div className="max-w-[800px] mx-auto">
            <ScrollReveal>
              <h2 className="h text-[1.5rem] sm:text-2xl md:text-[2.5rem] font-bold tracking-[-0.03em] text-center mb-10 sm:mb-16 text-[var(--text)]">
                How it works
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14">
              <div>
                <p className="h text-[12px] font-semibold text-[var(--accent)] uppercase tracking-[0.15em] mb-5 sm:mb-6">For businesses</p>
                {[
                  { t: "Paste your URL", d: "Drop your app link and tell us what to test." },
                  { t: "Describe your user", d: "\"Women 25-40 who shop online\" — we match from our pool." },
                  { t: "Set your budget", d: "Pay what you want per tester. No fixed plans." },
                  { t: "Get your flinch report", d: "Screen recordings, bug reports, friction notes — in your inbox." },
                ].map((s, i) => (
                  <ScrollReveal key={s.t} delay={i * 80}>
                    <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                      <span className="h text-[12px] font-bold text-[var(--text-dim)] mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h4 className="h text-[13px] sm:text-[14px] font-semibold mb-0.5 text-[var(--text)]">{s.t}</h4>
                        <p className="text-[12px] sm:text-[13px] text-[var(--text-muted)] leading-relaxed">{s.d}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <div>
                <p className="h text-[12px] font-semibold text-[#EF4444] uppercase tracking-[0.15em] mb-5 sm:mb-6">For testers</p>
                {[
                  { t: "Tell us about you", d: "Age, interests, devices. 60 seconds, no interviews." },
                  { t: "Browse jobs", d: "We match you to test jobs that fit your profile." },
                  { t: "Use the app for 15 min", d: "Record your screen, note what feels off." },
                  { t: "Get paid same day", d: "$5-20+ per test via PayPal or bank transfer." },
                ].map((s, i) => (
                  <ScrollReveal key={s.t} delay={i * 80}>
                    <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
                      <span className="h text-[12px] font-bold text-[var(--text-dim)] mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h4 className="h text-[13px] sm:text-[14px] font-semibold mb-0.5 text-[var(--text)]">{s.t}</h4>
                        <p className="text-[12px] sm:text-[13px] text-[var(--text-muted)] leading-relaxed">{s.d}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ DELIVERABLES ═══ */}
        <section className="py-16 sm:py-20 px-5 sm:px-6">
          <div className="max-w-[1100px] mx-auto">
            <ScrollReveal>
              <h2 className="h text-[1.5rem] sm:text-2xl md:text-[2.5rem] font-bold tracking-[-0.03em] text-center mb-8 sm:mb-12 text-[var(--text)]">
                What you get
              </h2>
            </ScrollReveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Screen recordings", desc: "Full sessions. See where users flinch." },
                { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", title: "Bug reports", desc: "Steps to reproduce, severity, device." },
                { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "Friction notes", desc: "What felt awkward or confusing." },
                { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Flinch score", desc: "Ship when you hit zero." },
              ].map((d, i) => (
                <ScrollReveal key={d.title} delay={i * 60}>
                  <div className="card p-4 sm:p-5 h-full">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 sm:mb-4 opacity-60"><path d={d.icon} /></svg>
                    <h3 className="h text-[13px] sm:text-[14px] font-semibold mb-1 text-[var(--text)]">{d.title}</h3>
                    <p className="text-[11px] sm:text-[12px] text-[var(--text-muted)] leading-[1.6]">{d.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BUDGET GUIDE ═══ */}
        <section className="dark-section py-16 sm:py-20 px-5 sm:px-6">
          <div className="max-w-[800px] mx-auto text-center">
            <ScrollReveal>
              <h2 className="h text-[1.5rem] sm:text-2xl md:text-[2.5rem] font-bold tracking-[-0.03em] mb-3 text-white">
                You set the price
              </h2>
              <p className="text-[13px] sm:text-[15px] text-white/40 mb-8 sm:mb-12 max-w-md mx-auto">
                No fixed plans. Higher budgets attract testers faster.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { range: "$5–8", speed: "~24h", label: "Economy" },
                { range: "$10–15", speed: "~4h", label: "Standard", pop: true },
                { range: "$20+", speed: "~1h", label: "Priority" },
              ].map((t, i) => (
                <ScrollReveal key={t.label} delay={i * 80}>
                  <div className={`rounded-xl sm:rounded-2xl border p-4 sm:p-6 text-center ${t.pop ? "border-orange-500/20 bg-white/[0.04]" : "border-white/[0.06] bg-white/[0.02]"}`}>
                    {t.pop && <span className="h inline-block text-orange-400 text-[9px] sm:text-[10px] font-bold mb-1 sm:mb-2 uppercase tracking-wider">Best</span>}
                    <p className="h text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">{t.range}</p>
                    <p className="text-[10px] sm:text-[12px] text-white/30 mb-0.5">per tester</p>
                    <p className="text-[10px] sm:text-[12px] text-orange-400/70">{t.speed}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ MARQUEE ═══ */}
        <section className="py-8 sm:py-12 overflow-hidden border-b border-black/[0.04]">
          <p className="h text-[9px] sm:text-[10px] font-medium text-[var(--text-dim)] text-center uppercase tracking-[0.25em] mb-4 sm:mb-5">Built for makers who ship with</p>
          <div className="flex items-center marquee whitespace-nowrap">
            {[...Array(2)].flatMap((_, setIdx) =>
              [
                { name: "Cursor", file: "cursor" },
                { name: "Bolt", file: "bolt" },
                { name: "Replit", file: "replit" },
                { name: "Lovable", file: "lovable" },
                { name: "v0", file: "v0" },
                { name: "Windsurf", file: "windsurf" },
                { name: "Claude", file: "claude" },
                { name: "ChatGPT", file: "chatgpt" },
                { name: "Vercel", file: "vercel" },
                { name: "Supabase", file: "supabase" },
              ].map((brand, i) => (
                <div key={`${brand.name}-${setIdx}-${i}`} className="mx-5 sm:mx-8 flex items-center gap-2.5 shrink-0">
                  <img src={`/brands/${brand.file}.svg`} alt={brand.name} className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="h text-[12px] sm:text-[13px] font-semibold text-[var(--text-2)] tracking-[0.02em]">{brand.name}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="warm-gradient-hero py-16 sm:py-24 px-5 sm:px-6 text-center">
          <ScrollReveal>
            <h2 className="h text-[1.5rem] sm:text-2xl md:text-[3rem] font-bold tracking-[-0.03em] leading-tight mb-4 sm:mb-5 text-[var(--text)]">
              Find the flinch.<br />Ship with confidence.
            </h2>
            <p className="text-[14px] sm:text-[16px] text-[var(--text-muted)] mb-6 sm:mb-8 max-w-md mx-auto">
              Real humans. Your audience. Every friction point.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {loggedIn ? (
                <>
                  <Link href="/explore" className="btn btn-primary btn-lg w-full sm:w-auto">Start testing</Link>
                  <Link href="/submit" className="btn btn-outline btn-lg w-full sm:w-auto">Post a job</Link>
                </>
              ) : (
                <>
                  <button onClick={() => setAuthMode("tester")} className="btn btn-primary btn-lg w-full sm:w-auto">Become a tester</button>
                  <button onClick={() => setAuthMode("business")} className="btn btn-outline btn-lg w-full sm:w-auto">List a job</button>
                </>
              )}
            </div>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
