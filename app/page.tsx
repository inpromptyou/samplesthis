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

  // Listen for auth modal events from Nav
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as "tester" | "business";
      setAuthMode(detail || "tester");
    };
    window.addEventListener("open-auth", handler);
    return () => window.removeEventListener("open-auth", handler);
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
            {/* Marquee — built for makers */}
            <div className="mb-8 sm:mb-10 hero-anim ha-1 overflow-hidden">
              <p className="h text-[9px] sm:text-[10px] font-medium text-[var(--text-dim)] uppercase tracking-[0.25em] mb-3 sm:mb-4">Built for makers who ship with</p>
              <div className="flex items-center justify-center marquee-hero whitespace-nowrap">
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
                    <div key={`hero-${brand.name}-${setIdx}-${i}`} className="mx-4 sm:mx-6 flex items-center gap-2 shrink-0">
                      <img src={`/brands/${brand.file}.svg`} alt={brand.name} className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="h text-[11px] sm:text-[12px] font-semibold text-[var(--text-2)] tracking-[0.02em]">{brand.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <h1 className="h text-[2rem] sm:text-[clamp(2.6rem,6.5vw,4.5rem)] font-bold leading-[1.1] tracking-[-0.035em] mb-5 sm:mb-6 hero-anim ha-2">
              Find the flinch before<br className="sm:hidden" />{" "}
              <span className="whitespace-nowrap">your <span className="grad-warm inline"><TypingRotate /></span> do</span>
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
        <section className="warm-section py-16 sm:py-24 px-5 sm:px-6">
          <div className="max-w-[1100px] mx-auto">
            <ScrollReveal>
              <h2 className="h text-[1.5rem] sm:text-2xl md:text-[2.5rem] font-bold tracking-[-0.03em] text-center mb-4 text-[var(--text)]">
                How it works
              </h2>
              <p className="text-[14px] sm:text-[15px] text-[var(--text-muted)] text-center max-w-lg mx-auto mb-12 sm:mb-16">
                Whether you're shipping a product or earning as a tester, you're three steps away.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* For Businesses */}
              <ScrollReveal delay={100} animation="left">
                <div className="card card-hover-lift p-6 sm:p-8 h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 grad-warm-bg" />
                  <p className="h text-[11px] sm:text-[12px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-6 sm:mb-8">For businesses</p>
                  <div className="space-y-5 sm:space-y-6">
                    {[
                      { icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101", t: "Paste your URL", d: "Drop your app link, landing page, or prototype. Tell us what flows to test and what matters most." },
                      { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", t: "Describe your ideal tester", d: "\"Women 25-40 who shop online\" or \"Developers who use React\" — we match from our pool of vetted testers." },
                      { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", t: "Set your budget", d: "Pay $5-$20+ per tester. No subscriptions, no hidden fees. Higher budgets attract testers faster." },
                      { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", t: "Get your flinch report", d: "Screen recordings, timestamped bug reports, friction notes, and a flinch score — delivered to your inbox within hours." },
                    ].map((s, i) => (
                      <div key={s.t} className="flex gap-3 sm:gap-4 step-item" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl grad-warm-subtle flex items-center justify-center shrink-0 mt-0.5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                        </div>
                        <div>
                          <h4 className="h text-[13px] sm:text-[14px] font-semibold mb-1 text-[var(--text)]">
                            <span className="text-[var(--text-dim)] mr-1.5">{String(i + 1).padStart(2, "0")}</span>
                            {s.t}
                          </h4>
                          <p className="text-[12px] sm:text-[13px] text-[var(--text-muted)] leading-[1.65]">{s.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* For Testers */}
              <ScrollReveal delay={200} animation="right">
                <div className="card card-hover-lift p-6 sm:p-8 h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EF4444] to-[#F97316]" />
                  <p className="h text-[11px] sm:text-[12px] font-bold text-[#EF4444] uppercase tracking-[0.15em] mb-6 sm:mb-8">For testers</p>
                  <div className="space-y-5 sm:space-y-6">
                    {[
                      { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", t: "Create your profile", d: "Age, interests, devices, tech comfort. Takes 60 seconds — no interviews, no resume needed." },
                      { icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", t: "Browse matched jobs", d: "We surface test jobs that match your profile. Filter by budget, app type, or audience fit." },
                      { icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", t: "Test for 15 minutes", d: "Use the app naturally. Record your screen, note what confuses you, flag bugs — just be honest." },
                      { icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", t: "Get paid same day", d: "$5-$20+ per test via Stripe Connect. Direct deposit to your bank — no invoicing, no waiting." },
                    ].map((s, i) => (
                      <div key={s.t} className="flex gap-3 sm:gap-4 step-item" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                        </div>
                        <div>
                          <h4 className="h text-[13px] sm:text-[14px] font-semibold mb-1 text-[var(--text)]">
                            <span className="text-[var(--text-dim)] mr-1.5">{String(i + 1).padStart(2, "0")}</span>
                            {s.t}
                          </h4>
                          <p className="text-[12px] sm:text-[13px] text-[var(--text-muted)] leading-[1.65]">{s.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══ WHAT YOU GET ═══ */}
        <section className="py-16 sm:py-24 px-5 sm:px-6">
          <div className="max-w-[1100px] mx-auto">
            <ScrollReveal>
              <h2 className="h text-[1.5rem] sm:text-2xl md:text-[2.5rem] font-bold tracking-[-0.03em] text-center mb-4 text-[var(--text)]">
                What you get
              </h2>
              <p className="text-[14px] sm:text-[15px] text-[var(--text-muted)] text-center max-w-lg mx-auto mb-10 sm:mb-14">
                Every test delivers a complete flinch report. No fluff — just actionable feedback you can ship on.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                {
                  icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "Screen recordings",
                  desc: "Full session recordings with audio commentary. See exactly where users hesitate, get confused, or give up. Timestamped highlights included.",
                  tag: "Video",
                },
                {
                  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
                  title: "Bug reports",
                  desc: "Structured reports with steps to reproduce, expected vs actual behavior, severity rating, browser info, and screenshots of every issue found.",
                  tag: "Structured",
                },
                {
                  icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
                  title: "Friction notes",
                  desc: "Written observations on confusing copy, unclear navigation, missing affordances, and moments of doubt. The stuff analytics can't capture.",
                  tag: "Qualitative",
                },
                {
                  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                  title: "Flinch score",
                  desc: "A 0-100 score based on friction frequency, severity, and task completion rate. Track improvement across tests. Ship when you hit zero.",
                  tag: "Metric",
                },
              ].map((d, i) => (
                <ScrollReveal key={d.title} delay={i * 80}>
                  <div className="card card-hover-lift p-5 sm:p-6 h-full relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl grad-warm-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d.icon} /></svg>
                      </div>
                      <span className="h text-[10px] font-semibold text-[var(--accent)] uppercase tracking-[0.1em] bg-orange-50 px-2.5 py-1 rounded-full">{d.tag}</span>
                    </div>
                    <h3 className="h text-[14px] sm:text-[15px] font-semibold mb-2 text-[var(--text)]">{d.title}</h3>
                    <p className="text-[12px] sm:text-[13px] text-[var(--text-muted)] leading-[1.7]">{d.desc}</p>
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
