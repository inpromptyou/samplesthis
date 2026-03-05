"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const SAMPLE_JOBS = [
  { app: "Fitness tracking app", audience: "Gym-goers, 25-40", testers: 5, budget: 12, time: "2h ago", applied: 8 },
  { app: "SaaS onboarding flow", audience: "Small business owners", testers: 3, budget: 15, time: "45m ago", applied: 5 },
  { app: "Crypto portfolio tracker", audience: "Active traders", testers: 8, budget: 8, time: "1h ago", applied: 12 },
  { app: "Recipe sharing mobile app", audience: "Home cooks, 30-55", testers: 5, budget: 10, time: "3h ago", applied: 9 },
];

const STATS = [
  { value: "4hr", label: "Average delivery" },
  { value: "98%", label: "Satisfaction rate" },
  { value: "50+", label: "Audience segments" },
  { value: "$8", label: "Avg cost per tester" },
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>

        {/* ═══ HERO ═══ */}
        <section className="hero-wrap">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="grid-bg" />
          <div className="particle-field">
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i} style={{
                left: `${5 + Math.random() * 90}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${6 + Math.random() * 14}s`,
                animationDelay: `${Math.random() * 8}s`,
              }} />
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--bg)] to-transparent z-10" />

          <div className="relative z-20 max-w-[1000px] mx-auto px-6 text-center pt-32 pb-20">
            <h1 className="h text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold leading-[0.92] tracking-[-0.04em] mb-7 hero-anim ha-1">
              <span className="grad-text-white">Find the flinch</span>
              <br />
              <span className="grad-text">before your users do.</span>
            </h1>

            <p className="text-[clamp(15px,1.8vw,18px)] text-[var(--text-muted)] max-w-[540px] mx-auto mb-10 leading-[1.7] hero-anim ha-2">
              Post a test job with your budget. Real humans matched to your
              target audience find every friction point, broken flow, and
              confusing moment in your app.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center hero-anim ha-3">
              <Link href="/become-a-tester" className="btn btn-white btn-lg btn-pill">
                Become a tester
              </Link>
              <Link href="/submit" className="btn btn-primary btn-lg btn-pill">
                Hire testers
              </Link>
            </div>

            <p className="h text-[11px] font-medium text-white/15 mt-6 tracking-wide hero-anim ha-4">
              SET YOUR OWN BUDGET &middot; PAY PER TESTER &middot; RESULTS IN HOURS
            </p>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <section className="relative -mt-8 z-20 px-6">
          <div className="max-w-[900px] mx-auto">
            <div className="glass rounded-2xl p-1">
              <div className="grid grid-cols-2 md:grid-cols-4">
                {STATS.map((s, i) => (
                  <div key={s.label} className={`text-center py-6 px-4 ${i < STATS.length - 1 ? "border-r border-white/[0.04]" : ""}`}>
                    <p className="h text-2xl md:text-3xl font-bold grad-text">{s.value}</p>
                    <p className="text-[11px] text-white/25 mt-1 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ BUILT FOR ═══ */}
        <section className="py-16 overflow-hidden">
          <p className="h text-[10px] font-semibold text-white/15 text-center uppercase tracking-[0.3em] mb-6">Built for makers who ship with</p>
          <div className="flex items-center marquee whitespace-nowrap">
            {[...Array(2)].flatMap(() =>
              ["Cursor", "Bolt", "Replit", "Lovable", "v0", "Windsurf", "Claude", "ChatGPT", "Vercel", "Supabase", "Next.js", "React"].map((t, i) => (
                <span key={`${t}-${i}`} className="mx-10 h text-[13px] font-semibold text-white/[0.07] uppercase tracking-[0.15em]">{t}</span>
              ))
            )}
          </div>
        </section>

        <div className="section-line max-w-[600px] mx-auto" />

        {/* ═══ TWO SIDES ═══ */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-[1100px] mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <div className="badge mx-auto mb-4">Two-sided marketplace</div>
                <h2 className="h text-3xl md:text-[3.2rem] font-bold tracking-[-0.03em] leading-tight">
                  One platform.<br /><span className="text-white/25">Two ways to win.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal delay={100}>
                <div className="glow-card h-full">
                  <Link href="/submit" className="glow-card-inner block p-8 md:p-10 group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/10 flex items-center justify-center mb-7 group-hover:border-emerald-500/20 transition-all duration-300">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#g1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <defs><linearGradient id="g1" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#34D399" /><stop offset="1" stopColor="#06B6D4" /></linearGradient></defs>
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      </svg>
                    </div>
                    <h3 className="h text-xl md:text-2xl font-bold mb-3 tracking-tight">I built something.</h3>
                    <p className="text-[14px] text-white/35 leading-[1.7] mb-8">
                      Post a test job with your budget per tester. Describe your ideal user.
                      Matched humans accept the job and deliver screen recordings, bug reports,
                      and every flinch moment they find.
                    </p>
                    <span className="inline-flex items-center gap-2 h text-[13px] font-semibold text-white/25 group-hover:text-[var(--accent)] transition-colors duration-300">
                      Post a test job
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-1 transition-transform duration-300"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="glow-card h-full">
                  <Link href="/become-a-tester" className="glow-card-inner block p-8 md:p-10 group">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/10 flex items-center justify-center mb-7 group-hover:border-emerald-500/20 transition-all duration-300">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#g1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                    <h3 className="h text-xl md:text-2xl font-bold mb-3 tracking-tight">I want to earn.</h3>
                    <p className="text-[14px] text-white/35 leading-[1.7] mb-8">
                      Browse open test jobs matched to your interests. Accept the ones
                      that pay what you want. Use apps for 15 minutes, give honest
                      feedback, get paid same day.
                    </p>
                    <span className="inline-flex items-center gap-2 h text-[13px] font-semibold text-white/25 group-hover:text-[var(--accent)] transition-colors duration-300">
                      Sign up as a tester
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-1 transition-transform duration-300"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <div className="section-line max-w-[600px] mx-auto" />

        {/* ═══ LIVE JOBS ═══ */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-[900px] mx-auto">
            <ScrollReveal>
              <div className="text-center mb-14">
                <div className="badge mx-auto mb-4">
                  <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-40" /><span className="relative rounded-full h-1.5 w-1.5 bg-emerald-400" /></span>
                  Live marketplace
                </div>
                <h2 className="h text-3xl md:text-[3.2rem] font-bold tracking-[-0.03em] leading-tight">
                  Jobs posted right now.
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-3">
              {SAMPLE_JOBS.map((job, i) => (
                <ScrollReveal key={job.app} delay={i * 70}>
                  <div className="job-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="h text-[15px] font-semibold truncate">{job.app}</h3>
                      <p className="text-[12px] text-white/25 mt-0.5">{job.audience} &middot; {job.time}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <p className="h text-[20px] font-bold grad-text">${job.budget}</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">per tester</p>
                      </div>
                      <div className="w-px h-8 bg-white/[0.04]" />
                      <div className="text-center">
                        <p className="h text-[17px] font-bold">{job.testers}</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">needed</p>
                      </div>
                      <div className="w-px h-8 bg-white/[0.04]" />
                      <div className="text-center">
                        <p className="h text-[17px] font-bold text-white/50">{job.applied}</p>
                        <p className="text-[9px] text-white/20 uppercase tracking-widest mt-0.5">applied</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={350}>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
                <Link href="/submit" className="btn btn-primary btn-pill">Post a job like these</Link>
                <Link href="/become-a-tester" className="btn btn-outline btn-pill">Browse open jobs</Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <div className="section-line max-w-[600px] mx-auto" />

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-[1000px] mx-auto">
            <ScrollReveal>
              <div className="text-center mb-20">
                <div className="badge mx-auto mb-4">How it works</div>
                <h2 className="h text-3xl md:text-[3.2rem] font-bold tracking-[-0.03em]">
                  Dead simple. Both sides.
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-16 md:gap-24">
              <div>
                <ScrollReveal><p className="h text-[11px] font-bold text-[var(--accent)]/50 uppercase tracking-[0.25em] mb-8">For businesses</p></ScrollReveal>
                {[
                  { n: "01", t: "Paste your URL", d: "Drop your app link and tell us what to test. Takes 30 seconds." },
                  { n: "02", t: "Describe your user", d: "\"Women 25-40 who shop online\" — we match from our tester pool." },
                  { n: "03", t: "Set your budget", d: "Pay what you want per tester. Higher budgets get picked up faster." },
                  { n: "04", t: "Get your flinch report", d: "Screen recordings, bug reports, and every friction point — in your inbox." },
                ].map((s, i) => (
                  <ScrollReveal key={s.n} delay={i * 100}>
                    <div className="flex gap-5 mb-7">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                        <span className="h text-[11px] font-bold text-[var(--accent)]/40">{s.n}</span>
                      </div>
                      <div className="pt-0.5">
                        <h4 className="h text-[15px] font-semibold mb-1">{s.t}</h4>
                        <p className="text-[13px] text-white/30 leading-relaxed">{s.d}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <div>
                <ScrollReveal><p className="h text-[11px] font-bold text-cyan-400/50 uppercase tracking-[0.25em] mb-8">For testers</p></ScrollReveal>
                {[
                  { n: "01", t: "Tell us about you", d: "Age, interests, devices. No tests, no interviews. 60 seconds." },
                  { n: "02", t: "Browse jobs", d: "We show you test jobs matched to your profile. Pick the ones you like." },
                  { n: "03", t: "Use the app", d: "15 minutes of natural usage. Record your screen, note what feels off." },
                  { n: "04", t: "Get paid same day", d: "$5-20 per test. Paid via PayPal or bank transfer." },
                ].map((s, i) => (
                  <ScrollReveal key={s.n} delay={i * 100}>
                    <div className="flex gap-5 mb-7">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0">
                        <span className="h text-[11px] font-bold text-cyan-400/40">{s.n}</span>
                      </div>
                      <div className="pt-0.5">
                        <h4 className="h text-[15px] font-semibold mb-1">{s.t}</h4>
                        <p className="text-[13px] text-white/30 leading-relaxed">{s.d}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="section-line max-w-[600px] mx-auto" />

        {/* ═══ DELIVERABLES ═══ */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-[1100px] mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <div className="badge mx-auto mb-4">Your flinch report</div>
                <h2 className="h text-3xl md:text-[3.2rem] font-bold tracking-[-0.03em]">
                  Everything to ship with confidence.
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Screen recordings", desc: "Full session videos. See exactly where users flinch." },
                { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", title: "Bug reports", desc: "What broke, steps to reproduce, severity, device." },
                { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "Friction notes", desc: "Plain English on what felt awkward or confusing." },
                { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Flinch score", desc: "Aggregate friction rating. Ship when you hit zero." },
              ].map((d, i) => (
                <ScrollReveal key={d.title} delay={i * 80}>
                  <div className="glass p-6 h-full">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/8 to-cyan-500/5 border border-emerald-500/10 flex items-center justify-center mb-5">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#g1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d.icon} /></svg>
                    </div>
                    <h3 className="h text-[14px] font-semibold mb-2">{d.title}</h3>
                    <p className="text-[12px] text-white/30 leading-[1.7]">{d.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <div className="section-line max-w-[600px] mx-auto" />

        {/* ═══ BUDGET GUIDE ═══ */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-[900px] mx-auto text-center">
            <ScrollReveal>
              <div className="badge mx-auto mb-4">Budget guide</div>
              <h2 className="h text-3xl md:text-[3.2rem] font-bold tracking-[-0.03em] mb-3">
                You set the price.
              </h2>
              <p className="text-[15px] text-white/30 mb-14 max-w-md mx-auto leading-relaxed">
                No fixed plans. Post what you&apos;re willing to pay. Here&apos;s what works:
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                { range: "$5–8", speed: "Within 24h", label: "Economy", desc: "Great for MVPs and early-stage feedback." },
                { range: "$10–15", speed: "Within 4h", label: "Recommended", pop: true, desc: "Sweet spot. Attracts experienced testers fast." },
                { range: "$20+", speed: "Within 1h", label: "Priority", desc: "Premium testers, near-instant pickup." },
              ].map((t, i) => (
                <ScrollReveal key={t.label} delay={i * 100}>
                  <div className={`glass p-7 text-center ${t.pop ? "!border-emerald-500/15 shadow-lg shadow-emerald-500/5" : ""}`}>
                    {t.pop && <span className="h inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[10px] font-bold px-4 py-1 rounded-full mb-4 uppercase tracking-wider">Recommended</span>}
                    <p className="h text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">{t.label}</p>
                    <p className="h text-3xl md:text-4xl font-bold grad-text mb-1">{t.range}</p>
                    <p className="h text-[12px] font-semibold text-[var(--accent)]/60 mb-3">{t.speed}</p>
                    <p className="text-[13px] text-white/30 leading-relaxed">{t.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="relative py-32 px-6 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-[700px] mx-auto text-center">
            <ScrollReveal>
              <h2 className="h text-3xl md:text-[4rem] font-extrabold tracking-[-0.04em] leading-[0.95] mb-5">
                Find the flinch.<br />
                <span className="grad-text">Ship with confidence.</span>
              </h2>
              <p className="text-[16px] text-white/30 mb-10 max-w-md mx-auto leading-relaxed">
                Real humans. Your audience. Every friction point found before launch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/become-a-tester" className="btn btn-white btn-lg btn-pill">
                  Become a tester
                </Link>
                <Link href="/submit" className="btn btn-primary btn-lg btn-pill">
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
