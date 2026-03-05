"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LiveCounter from "@/components/LiveCounter";
import ScrollReveal from "@/components/ScrollReveal";

const TOOLS = ["Cursor", "Bolt", "Replit", "Lovable", "v0", "Windsurf", "Claude", "ChatGPT", "Vercel", "Supabase"];

const SAMPLE_JOBS = [
  { app: "Fitness tracking app", audience: "Gym-goers, 25-40", testers: 5, budget: 12, time: "2h ago", bids: 8 },
  { app: "SaaS onboarding flow", audience: "Small business owners", testers: 3, budget: 15, time: "45m ago", bids: 5 },
  { app: "Crypto dashboard", audience: "Active traders", testers: 8, budget: 8, time: "1h ago", bids: 12 },
  { app: "Recipe sharing app", audience: "Home cooks, 30-55", testers: 5, budget: 10, time: "3h ago", bids: 9 },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* ═══ HERO ═══ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="hero-bg">
            <div className="bokeh" /><div className="bokeh" /><div className="bokeh" /><div className="bokeh" /><div className="bokeh" />
            <div className="grid-overlay" /><div className="noise" />
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${8 + Math.random() * 12}s`,
                animationDelay: `${Math.random() * 10}s`,
              }} />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--bg)] to-transparent z-10" />

          <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
            <div className="blur-in d-1 mb-8">
              <LiveCounter size="lg" />
            </div>

            <h1 className="font-display text-[3rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7rem] font-bold leading-[0.92] tracking-[-0.03em] mb-8 blur-in d-2">
              <span className="block text-white">Become a</span>
              <span className="block gradient-text">tester.</span>
            </h1>

            <p className="text-[16px] sm:text-[18px] text-white/40 max-w-xl mx-auto mb-10 leading-relaxed reveal-up d-3">
              Businesses post test jobs with their budget.
              Real humans matched to their audience accept the ones they want.
              Higher pay, faster results.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center reveal-up d-4">
              <Link href="/become-a-tester" className="btn btn-primary btn-lg !rounded-full glow-accent font-display">
                Become a tester
              </Link>
              <Link href="/submit" className="btn btn-outline btn-lg !rounded-full font-display">
                Hire testers
              </Link>
            </div>

            <p className="text-[12px] text-white/20 mt-6 reveal-up d-5 font-display">
              Set your own budget. Testers choose which jobs to accept.
            </p>
          </div>
        </section>

        {/* ═══ TOOL MARQUEE ═══ */}
        <section className="py-10 border-y border-white/[0.03] overflow-hidden">
          <div className="flex items-center animate-marquee whitespace-nowrap">
            {[...TOOLS, ...TOOLS].map((t, i) => (
              <span key={i} className="mx-8 text-[13px] font-display font-medium text-white/15 uppercase tracking-[0.2em]">{t}</span>
            ))}
          </div>
        </section>

        {/* ═══ HOW THE MARKETPLACE WORKS ═══ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <p className="text-[11px] font-display font-semibold text-[var(--accent)] tracking-[0.3em] uppercase mb-4">How it works</p>
                <h2 className="font-display text-3xl md:text-[3.5rem] font-bold tracking-tight leading-tight">
                  A marketplace,<br />not a service.
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  title: "Post your test job",
                  desc: "Submit your app URL, describe your ideal tester, and set how much you'll pay per person. You control the budget.",
                  for: "business",
                },
                {
                  step: "02",
                  title: "Testers accept",
                  desc: "Matched testers browse open jobs and accept the ones that interest them. Higher budgets attract testers faster.",
                  for: "both",
                },
                {
                  step: "03",
                  title: "Get real feedback",
                  desc: "Screen recordings, bug reports, and UX notes from real humans who match your audience. Delivered in hours.",
                  for: "business",
                },
              ].map((s, i) => (
                <ScrollReveal key={s.step} delay={i * 120}>
                  <div className="card p-7 h-full">
                    <span className="font-display text-[12px] font-bold text-[var(--accent)]/60 tracking-wider">{s.step}</span>
                    <h3 className="font-display text-[17px] font-bold mt-3 mb-2">{s.title}</h3>
                    <p className="text-[14px] text-white/40 leading-relaxed">{s.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ LIVE JOBS PREVIEW ═══ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-14">
                <p className="text-[11px] font-display font-semibold text-[var(--accent)] tracking-[0.3em] uppercase mb-4">Live marketplace</p>
                <h2 className="font-display text-3xl md:text-[3.5rem] font-bold tracking-tight">
                  Test jobs, right now.
                </h2>
                <p className="text-[15px] text-white/35 mt-3 max-w-md mx-auto">
                  Real businesses posting real jobs. Testers pick the ones they want.
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-3">
              {SAMPLE_JOBS.map((job, i) => (
                <ScrollReveal key={job.app} delay={i * 80}>
                  <div className="card px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-display text-[15px] font-semibold">{job.app}</h3>
                      <p className="text-[12px] text-white/30 mt-0.5">{job.audience} &middot; {job.time}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-display text-[18px] font-bold text-[var(--accent)]">${job.budget}</p>
                        <p className="text-[10px] text-white/25 uppercase tracking-wider">per tester</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-[16px] font-bold">{job.testers}</p>
                        <p className="text-[10px] text-white/25 uppercase tracking-wider">needed</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-[16px] font-bold text-white/60">{job.bids}</p>
                        <p className="text-[10px] text-white/25 uppercase tracking-wider">applied</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={400}>
              <div className="flex gap-3 justify-center mt-8">
                <Link href="/submit" className="btn btn-primary font-display !rounded-full">Post a job like these</Link>
                <Link href="/become-a-tester" className="btn btn-ghost font-display !rounded-full">Browse open jobs</Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ TWO SIDES ═══ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            <ScrollReveal delay={100}>
              <Link href="/submit" className="card p-8 md:p-10 group block h-full">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6 group-hover:border-[var(--accent)]/30 transition-colors">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold mb-3">I built something.</h3>
                <p className="text-[14px] text-white/40 leading-relaxed mb-6">
                  Post a test job with your budget per tester. Describe your ideal user.
                  Matched humans accept the job and deliver screen recordings, bug reports, and honest feedback.
                </p>
                <span className="inline-flex items-center gap-2 font-display text-[14px] font-medium text-white/30 group-hover:text-[var(--accent)] transition-colors">
                  Post a test job
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Link href="/become-a-tester" className="card p-8 md:p-10 group block h-full">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6 group-hover:border-[var(--accent)]/30 transition-colors">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 group-hover:opacity-100 transition-opacity">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold mb-3">I want to earn.</h3>
                <p className="text-[14px] text-white/40 leading-relaxed mb-6">
                  Browse open test jobs. Accept the ones that match your interests and pay what you want.
                  Use apps for 15 minutes, give honest feedback, get paid same day.
                </p>
                <span className="inline-flex items-center gap-2 font-display text-[14px] font-medium text-white/30 group-hover:text-[var(--accent)] transition-colors">
                  Sign up as a tester
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              </Link>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ DELIVERABLES ═══ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <p className="text-[11px] font-display font-semibold text-[var(--accent)] tracking-[0.3em] uppercase mb-4">What you get</p>
                <h2 className="font-display text-3xl md:text-[3.5rem] font-bold tracking-tight">
                  Everything to ship.
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z", frame: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Screen recordings", desc: "Full session videos showing where users stumble." },
                { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", title: "Bug reports", desc: "What broke, steps to reproduce, severity rating." },
                { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "UX friction notes", desc: "What felt awkward, confusing, or missing." },
                { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Priority ranking", desc: "Issues ranked by severity. Fix what matters." },
              ].map((d, i) => (
                <ScrollReveal key={d.title} delay={i * 100}>
                  <div className="card p-6 h-full">
                    <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/[0.06] border border-[var(--accent)]/[0.1] flex items-center justify-center mb-4">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                        {d.frame && <path d={d.frame} />}
                        <path d={d.icon} />
                      </svg>
                    </div>
                    <h3 className="font-display text-[15px] font-semibold mb-1.5">{d.title}</h3>
                    <p className="text-[13px] text-white/35 leading-relaxed">{d.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ AUDIENCE MATCHING ═══ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <p className="text-[11px] font-display font-semibold text-[var(--accent)] tracking-[0.3em] uppercase mb-4">Audience matching</p>
              <h2 className="font-display text-3xl md:text-[3.5rem] font-bold tracking-tight mb-4">
                Not random testers.<br />
                <span className="text-white/25">Your</span> customers.
              </h2>
              <p className="text-[15px] text-white/35 max-w-lg mx-auto mb-10">
                Describe who your app is for. We match testers who fit that profile.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
                {[
                  "Gen Z mobile users", "SaaS power users", "Non-tech everyday people",
                  "Crypto natives", "Gamers", "Parents & families", "Small business owners",
                  "Students", "Seniors 60+", "Fitness enthusiasts", "Freelancers",
                  "eCommerce shoppers", "Designers", "Remote workers",
                ].map((a) => (
                  <span key={a} className="bg-white/[0.03] border border-white/[0.05] rounded-full px-4 py-2 text-[13px] text-white/35 hover:text-white/60 hover:border-[var(--accent)]/20 transition-all duration-300 cursor-default">
                    {a}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══ PRICING GUIDE ═══ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <p className="text-[11px] font-display font-semibold text-[var(--accent)] tracking-[0.3em] uppercase mb-4">Budget guide</p>
              <h2 className="font-display text-3xl md:text-[3.5rem] font-bold tracking-tight mb-4">
                You set the price.
              </h2>
              <p className="text-[15px] text-white/35 mb-12 max-w-lg mx-auto">
                No fixed plans. Post what you&apos;re willing to pay per tester.
                Here&apos;s what we see working:
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[
                { range: "$5-8", speed: "Within 24h", desc: "Budget-friendly. Good for early-stage feedback on MVPs.", label: "Economy" },
                { range: "$10-15", speed: "Within 4h", desc: "Sweet spot. Attracts experienced testers fast.", label: "Recommended", pop: true },
                { range: "$20+", speed: "Within 1h", desc: "Premium. Gets senior testers and near-instant pickup.", label: "Priority" },
              ].map((t, i) => (
                <ScrollReveal key={t.label} delay={i * 100}>
                  <div className={`card p-6 text-center ${t.pop ? "!border-[var(--accent)]/20 glow" : ""}`}>
                    {t.pop && <span className="font-display inline-block bg-[var(--accent)] text-black text-[10px] font-bold px-3 py-0.5 rounded-full mb-3 uppercase tracking-wider">Recommended</span>}
                    <p className="font-display text-[11px] font-bold text-white/25 uppercase tracking-wider mb-2">{t.label}</p>
                    <p className="font-display text-3xl font-bold mb-1">{t.range}</p>
                    <p className="text-[12px] text-[var(--accent)] font-medium mb-3">{t.speed}</p>
                    <p className="text-[13px] text-white/35 leading-relaxed">{t.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="relative py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent)]/[0.02] to-transparent" />
          <div className="relative max-w-3xl mx-auto text-center">
            <ScrollReveal>
              <h2 className="font-display text-3xl md:text-[4rem] font-bold tracking-tight leading-tight mb-4">
                Ship with<br />confidence.
              </h2>
              <p className="text-[16px] text-white/35 mb-10 max-w-md mx-auto">
                Let real humans find the bugs before your users do.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/become-a-tester" className="btn btn-primary btn-lg !rounded-full glow-accent font-display">
                  Become a tester
                </Link>
                <Link href="/submit" className="btn btn-outline btn-lg !rounded-full font-display">
                  Hire testers
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
