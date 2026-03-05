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

          <div className="relative z-10 max-w-[1000px] mx-auto px-6 text-center pt-36 pb-24">
            <div className="hero-anim ha-1 mb-6">
              <div className="badge mx-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-orange-400 opacity-50" />
                  <span className="relative rounded-full h-2 w-2 bg-orange-500" />
                </span>
                Now accepting testers
              </div>
            </div>

            <h1 className="h text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold leading-[0.92] tracking-[-0.04em] mb-7 hero-anim ha-2 text-[var(--text)]">
              Find the flinch
              <br />
              <span className="grad-warm">before your users do.</span>
            </h1>

            <p className="text-[clamp(15px,1.8vw,18px)] text-[var(--text-muted)] max-w-[540px] mx-auto mb-10 leading-[1.7] hero-anim ha-3">
              Post a test job with your budget. Real humans matched to your
              target audience find every friction point, broken flow, and
              confusing moment in your app.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center hero-anim ha-4">
              <Link href="/become-a-tester" className="btn btn-dark btn-lg btn-pill">
                Become a tester
              </Link>
              <Link href="/submit" className="btn btn-primary btn-lg btn-pill">
                Hire testers
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-2)] to-transparent z-10" />
        </section>

        {/* ═══ STATS ═══ */}
        <section className="warm-section pb-20 pt-4 px-6">
          <div className="max-w-[900px] mx-auto -mt-12 relative z-20">
            <div className="bg-white rounded-2xl border border-black/[0.07] shadow-xl shadow-orange-900/[0.04] p-1">
              <div className="grid grid-cols-2 md:grid-cols-4">
                {[
                  { value: "4hr", label: "Average delivery" },
                  { value: "98%", label: "Satisfaction rate" },
                  { value: "50+", label: "Audience segments" },
                  { value: "$8", label: "Avg cost per tester" },
                ].map((s, i) => (
                  <div key={s.label} className={`text-center py-7 px-4 ${i < 3 ? "border-r border-black/[0.05]" : ""}`}>
                    <p className="h text-2xl md:text-3xl font-bold grad-warm">{s.value}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 uppercase tracking-wider font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TOOL MARQUEE ═══ */}
        <section className="warm-section py-10 overflow-hidden">
          <p className="h text-[10px] font-semibold text-[var(--text-dim)] text-center uppercase tracking-[0.3em] mb-6">Built for makers who ship with</p>
          <div className="flex items-center marquee whitespace-nowrap">
            {[...Array(2)].flatMap(() =>
              ["Cursor", "Bolt", "Replit", "Lovable", "v0", "Windsurf", "Claude", "ChatGPT", "Vercel", "Supabase", "Next.js", "React"].map((t, i) => (
                <span key={`${t}-${i}`} className="mx-10 h text-[13px] font-semibold text-black/[0.08] uppercase tracking-[0.15em]">{t}</span>
              ))
            )}
          </div>
        </section>

        {/* ═══ TWO SIDES ═══ */}
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-[1100px] mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <div className="badge mx-auto mb-5">Two-sided marketplace</div>
                <h2 className="h text-3xl md:text-[3.2rem] font-bold tracking-[-0.03em] leading-tight text-[var(--text)]">
                  One platform.<br /><span className="text-[var(--text-muted)]">Two ways to win.</span>
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal delay={100}>
                <div className="glow-card h-full">
                  <Link href="/submit" className="glow-card-inner block p-8 md:p-10 group">
                    <div className="w-14 h-14 rounded-2xl grad-warm-subtle border border-orange-500/10 flex items-center justify-center mb-7 group-hover:border-orange-500/25 transition-all duration-300">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                      </svg>
                    </div>
                    <h3 className="h text-xl md:text-2xl font-bold mb-3 tracking-tight text-[var(--text)]">I built something.</h3>
                    <p className="text-[14px] text-[var(--text-muted)] leading-[1.7] mb-8">
                      Post a test job with your budget per tester. Describe your ideal user.
                      Matched humans accept the job and deliver screen recordings, bug reports,
                      and every flinch moment they find.
                    </p>
                    <span className="inline-flex items-center gap-2 h text-[13px] font-semibold text-[var(--text-dim)] group-hover:text-orange-600 transition-colors duration-300">
                      Post a test job
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform group-hover:translate-x-1 transition-transform duration-300"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </span>
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <div className="glow-card h-full">
                  <Link href="/become-a-tester" className="glow-card-inner block p-8 md:p-10 group">
                    <div className="w-14 h-14 rounded-2xl grad-warm-subtle border border-orange-500/10 flex items-center justify-center mb-7 group-hover:border-orange-500/25 transition-all duration-300">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                    </div>
                    <h3 className="h text-xl md:text-2xl font-bold mb-3 tracking-tight text-[var(--text)]">I want to earn.</h3>
                    <p className="text-[14px] text-[var(--text-muted)] leading-[1.7] mb-8">
                      Browse open test jobs matched to your interests. Accept the ones
                      that pay what you want. Use apps for 15 minutes, give honest
                      feedback, get paid same day.
                    </p>
                    <span className="inline-flex items-center gap-2 h text-[13px] font-semibold text-[var(--text-dim)] group-hover:text-orange-600 transition-colors duration-300">
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
                <div className="badge mx-auto mb-5">
                  <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute h-full w-full rounded-full bg-orange-400 opacity-50" /><span className="relative rounded-full h-1.5 w-1.5 bg-orange-500" /></span>
                  Live marketplace
                </div>
                <h2 className="h text-3xl md:text-[3.2rem] font-bold tracking-[-0.03em] text-[var(--text)]">
                  Jobs posted right now.
                </h2>
              </div>
            </ScrollReveal>

            <div className="space-y-3">
              {SAMPLE_JOBS.map((job, i) => (
                <ScrollReveal key={job.app} delay={i * 70}>
                  <div className="job-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="h text-[15px] font-semibold text-[var(--text)]">{job.app}</h3>
                      <p className="text-[12px] text-[var(--text-dim)] mt-0.5">{job.audience} &middot; {job.time}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <p className="h text-[20px] font-bold grad-warm">${job.budget}</p>
                        <p className="text-[9px] text-[var(--text-dim)] uppercase tracking-widest mt-0.5 font-medium">per tester</p>
                      </div>
                      <div className="w-px h-8 bg-black/[0.05]" />
                      <div className="text-center">
                        <p className="h text-[17px] font-bold text-[var(--text)]">{job.testers}</p>
                        <p className="text-[9px] text-[var(--text-dim)] uppercase tracking-widest mt-0.5 font-medium">needed</p>
                      </div>
                      <div className="w-px h-8 bg-black/[0.05]" />
                      <div className="text-center">
                        <p className="h text-[17px] font-bold text-[var(--text-muted)]">{job.applied}</p>
                        <p className="text-[9px] text-[var(--text-dim)] uppercase tracking-widest mt-0.5 font-medium">applied</p>
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
        <section className="py-24 md:py-32 px-6 warm-section">
          <div className="max-w-[1000px] mx-auto">
            <ScrollReveal>
              <div className="text-center mb-20">
                <div className="badge mx-auto mb-5">How it works</div>
                <h2 className="h text-3xl md:text-[3.2rem] font-bold tracking-[-0.03em] text-[var(--text)]">
                  Dead simple. Both sides.
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-16 md:gap-24">
              <div>
                <ScrollReveal><p className="h text-[11px] font-bold text-orange-600 uppercase tracking-[0.25em] mb-8">For businesses</p></ScrollReveal>
                {[
                  { n: "01", t: "Paste your URL", d: "Drop your app link and tell us what to test. Takes 30 seconds." },
                  { n: "02", t: "Describe your user", d: "\"Women 25-40 who shop online\" — we match from our tester pool." },
                  { n: "03", t: "Set your budget", d: "Pay what you want per tester. Higher budgets get picked up faster." },
                  { n: "04", t: "Get your flinch report", d: "Screen recordings, bug reports, and every friction point — in your inbox." },
                ].map((s, i) => (
                  <ScrollReveal key={s.n} delay={i * 100}>
                    <div className="flex gap-5 mb-7">
                      <div className="w-10 h-10 rounded-xl grad-warm-subtle border border-orange-500/10 flex items-center justify-center shrink-0">
                        <span className="h text-[11px] font-bold text-orange-600">{s.n}</span>
                      </div>
                      <div className="pt-0.5">
                        <h4 className="h text-[15px] font-semibold mb-1 text-[var(--text)]">{s.t}</h4>
                        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{s.d}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <div>
                <ScrollReveal><p className="h text-[11px] font-bold text-red-600 uppercase tracking-[0.25em] mb-8">For testers</p></ScrollReveal>
                {[
                  { n: "01", t: "Tell us about you", d: "Age, interests, devices. No tests, no interviews. 60 seconds." },
                  { n: "02", t: "Browse jobs", d: "We show you test jobs matched to your profile. Pick the ones you like." },
                  { n: "03", t: "Use the app", d: "15 minutes of natural usage. Record your screen, note what feels off." },
                  { n: "04", t: "Get paid same day", d: "$5-20 per test. Paid via PayPal or bank transfer." },
                ].map((s, i) => (
                  <ScrollReveal key={s.n} delay={i * 100}>
                    <div className="flex gap-5 mb-7">
                      <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-500/10 flex items-center justify-center shrink-0">
                        <span className="h text-[11px] font-bold text-red-600">{s.n}</span>
                      </div>
                      <div className="pt-0.5">
                        <h4 className="h text-[15px] font-semibold mb-1 text-[var(--text)]">{s.t}</h4>
                        <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{s.d}</p>
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
                <div className="badge mx-auto mb-5">Your flinch report</div>
                <h2 className="h text-3xl md:text-[3.2rem] font-bold tracking-[-0.03em] text-[var(--text)]">
                  Everything to ship with confidence.
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Screen recordings", desc: "Full session videos. See exactly where users flinch." },
                { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", title: "Bug reports", desc: "What broke, steps to reproduce, severity, device info." },
                { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "Friction notes", desc: "What felt awkward, confusing, or missing." },
                { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Flinch score", desc: "Aggregate friction rating. Ship when you hit zero." },
              ].map((d, i) => (
                <ScrollReveal key={d.title} delay={i * 80}>
                  <div className="card-light p-6 h-full">
                    <div className="w-11 h-11 rounded-xl grad-warm-subtle border border-orange-500/10 flex items-center justify-center mb-5">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d={d.icon} /></svg>
                    </div>
                    <h3 className="h text-[14px] font-semibold mb-2 text-[var(--text)]">{d.title}</h3>
                    <p className="text-[12px] text-[var(--text-muted)] leading-[1.7]">{d.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ BUDGET GUIDE — DARK ═══ */}
        <section className="dark-section py-24 md:py-32 px-6">
          <div className="max-w-[900px] mx-auto text-center">
            <ScrollReveal>
              <div className="badge mx-auto mb-5">Budget guide</div>
              <h2 className="h text-3xl md:text-[3.2rem] font-bold tracking-[-0.03em] mb-3 text-white">
                You set the price.
              </h2>
              <p className="text-[15px] text-white/50 mb-14 max-w-md mx-auto leading-relaxed">
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
                  <div className={`rounded-2xl border p-7 text-center ${t.pop ? "border-orange-500/25 bg-white/[0.06]" : "border-white/[0.08] bg-white/[0.03]"}`}>
                    {t.pop && <span className="h inline-block grad-warm-bg text-white text-[10px] font-bold px-4 py-1 rounded-full mb-4 uppercase tracking-wider">Recommended</span>}
                    <p className="h text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">{t.label}</p>
                    <p className="h text-3xl md:text-4xl font-bold grad-warm mb-1">{t.range}</p>
                    <p className="h text-[12px] font-semibold text-orange-400 mb-3">{t.speed}</p>
                    <p className="text-[13px] text-white/45 leading-relaxed">{t.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="relative py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-[var(--bg-3)] to-[var(--bg)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-orange-500/[0.06] to-transparent rounded-full blur-[80px]" />
          <div className="relative max-w-[700px] mx-auto text-center">
            <ScrollReveal>
              <h2 className="h text-3xl md:text-[4rem] font-extrabold tracking-[-0.04em] leading-[0.95] mb-5 text-[var(--text)]">
                Find the flinch.<br />
                <span className="grad-warm">Ship with confidence.</span>
              </h2>
              <p className="text-[16px] text-[var(--text-muted)] mb-10 max-w-md mx-auto leading-relaxed">
                Real humans. Your audience. Every friction point found before launch.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/become-a-tester" className="btn btn-dark btn-lg btn-pill">Become a tester</Link>
                <Link href="/submit" className="btn btn-primary btn-lg btn-pill">Hire testers</Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
