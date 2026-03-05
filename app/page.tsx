"use client";

import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LiveCounter from "@/components/LiveCounter";
import ScrollReveal from "@/components/ScrollReveal";

const TOOLS = ["Cursor", "Bolt", "Replit", "Lovable", "v0", "Windsurf", "Claude", "ChatGPT", "Vercel", "Supabase"];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* ═══════════════════════════════════════════════
            HERO — Full-bleed cinematic, Shopify-style
        ═══════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background layers */}
          <div className="hero-bg">
            <div className="bokeh" />
            <div className="bokeh" />
            <div className="bokeh" />
            <div className="bokeh" />
            <div className="bokeh" />
            <div className="grid-overlay" />
            <div className="noise" />
            {/* Floating particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${8 + Math.random() * 12}s`,
                  animationDelay: `${Math.random() * 10}s`,
                  width: `${1 + Math.random() * 2}px`,
                  height: `${1 + Math.random() * 2}px`,
                }}
              />
            ))}
          </div>

          {/* Gradient fade at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-10" />

          {/* Content */}
          <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
            <div className="blur-in d-1 mb-6">
              <LiveCounter size="lg" />
            </div>

            <h1 className="text-[3rem] sm:text-[4.5rem] md:text-[6rem] lg:text-[7rem] font-bold leading-[0.95] tracking-[-0.03em] mb-8 blur-in d-2">
              <span className="block">Become a</span>
              <span className="block gradient-text">tester.</span>
            </h1>

            <p className="text-[16px] sm:text-[19px] text-white/50 max-w-xl mx-auto mb-10 leading-relaxed reveal-up d-3">
              The marketplace connecting real humans with apps that need testing.
              Get paid to test — or get your app tested by your actual target audience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center reveal-up d-4">
              <Link href="/become-a-tester" className="btn btn-primary btn-lg !rounded-full glow-white">
                Become a tester
              </Link>
              <Link href="/submit" className="btn btn-outline btn-lg !rounded-full">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /></svg>
                Hire testers
              </Link>
            </div>

            <p className="text-[12px] text-white/25 mt-6 reveal-up d-5">
              No subscription. Pay per test. Results in 4 hours.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            MARQUEE — Built for vibe coders
        ═══════════════════════════════════════════════ */}
        <section className="py-12 border-y border-white/[0.04] overflow-hidden bg-black">
          <div className="flex items-center animate-marquee whitespace-nowrap">
            {[...TOOLS, ...TOOLS].map((t, i) => (
              <span key={i} className="mx-8 text-[14px] font-medium text-white/20 uppercase tracking-widest">{t}</span>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            TWO SIDES — Marketplace cards
        ═══════════════════════════════════════════════ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <p className="text-[11px] font-semibold text-[var(--accent)] tracking-[0.3em] uppercase mb-4">Two sides, one marketplace</p>
                <h2 className="text-3xl md:text-[3.5rem] font-bold tracking-tight leading-tight">
                  Everyone wins.
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal delay={100}>
                <Link href="/submit" className="card p-8 md:p-10 group block h-full">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6 group-hover:border-[var(--accent)]/30 transition-colors">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 transition-opacity">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3">I built something.</h3>
                  <p className="text-[15px] text-white/50 leading-relaxed mb-6">
                    Submit your app, describe your target user, and get matched with real humans
                    who fit your audience. Screen recordings, bug reports, UX friction notes.
                    Delivered in hours.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[14px] font-medium text-white/40 group-hover:text-white transition-colors">
                    Hire testers
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </span>
                </Link>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <Link href="/become-a-tester" className="card p-8 md:p-10 group block h-full">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-6 group-hover:border-emerald-500/30 transition-colors">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 transition-opacity">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3">I want to earn.</h3>
                  <p className="text-[15px] text-white/50 leading-relaxed mb-6">
                    Get paid $5-15 to test apps matched to your interests. No experience needed.
                    A gym-goer tests fitness apps. A trader tests crypto tools.
                    Be yourself and get paid for it.
                  </p>
                  <span className="inline-flex items-center gap-2 text-[14px] font-medium text-white/40 group-hover:text-emerald-400 transition-colors">
                    Become a tester
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </span>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            HOW IT WORKS — Dual flow
        ═══════════════════════════════════════════════ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-20">
                <p className="text-[11px] font-semibold text-[var(--accent)] tracking-[0.3em] uppercase mb-4">How it works</p>
                <h2 className="text-3xl md:text-[3.5rem] font-bold tracking-tight">
                  Dead simple.
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-16 md:gap-20">
              {/* Business */}
              <div>
                <ScrollReveal>
                  <h3 className="text-[13px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8">For businesses</h3>
                </ScrollReveal>
                {[
                  { num: "01", title: "Paste your URL", desc: "Drop your app link, tell us what to test. 30 seconds." },
                  { num: "02", title: "Describe your user", desc: '"Women 25-40 who shop online" — we match from our pool.' },
                  { num: "03", title: "Get results", desc: "Screen recordings, bug reports, UX notes. In your inbox in hours." },
                ].map((s, i) => (
                  <ScrollReveal key={s.num} delay={i * 120}>
                    <div className="flex gap-5 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-mono font-bold text-white/40">{s.num}</span>
                      </div>
                      <div>
                        <h4 className="text-[16px] font-semibold mb-1">{s.title}</h4>
                        <p className="text-[14px] text-white/40 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {/* Tester */}
              <div>
                <ScrollReveal>
                  <h3 className="text-[13px] font-bold text-white/30 uppercase tracking-[0.2em] mb-8">For testers</h3>
                </ScrollReveal>
                {[
                  { num: "01", title: "Tell us about you", desc: "Age, interests, devices. No tests. No interviews. 60 seconds." },
                  { num: "02", title: "Get matched", desc: "We send you apps relevant to who you are — not random QA work." },
                  { num: "03", title: "Test and earn", desc: "Use the app for 15 mins, give honest feedback. $5-15 per test, same-day pay." },
                ].map((s, i) => (
                  <ScrollReveal key={s.num} delay={i * 120}>
                    <div className="flex gap-5 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-mono font-bold text-emerald-400/60">{s.num}</span>
                      </div>
                      <div>
                        <h4 className="text-[16px] font-semibold mb-1">{s.title}</h4>
                        <p className="text-[14px] text-white/40 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            DELIVERABLES
        ═══════════════════════════════════════════════ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal>
              <div className="text-center mb-16">
                <p className="text-[11px] font-semibold text-[var(--accent)] tracking-[0.3em] uppercase mb-4">What you get</p>
                <h2 className="text-3xl md:text-[3.5rem] font-bold tracking-tight">
                  Everything you need to ship.
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z", frame: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Screen recordings", desc: "Full session videos. See where users stumble, hesitate, and get lost." },
                { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", title: "Bug reports", desc: "What broke, steps to reproduce, severity, device info." },
                { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "UX friction notes", desc: "Plain English on what felt awkward, confusing, or missing." },
                { icon: "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12", title: "Priority ranking", desc: "Issues ranked by severity. Fix what matters first." },
              ].map((d, i) => (
                <ScrollReveal key={d.title} delay={i * 100}>
                  <div className="card p-6 h-full">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                        {d.frame && <path d={d.frame} />}
                        <path d={d.icon} />
                      </svg>
                    </div>
                    <h3 className="text-[15px] font-semibold mb-1.5">{d.title}</h3>
                    <p className="text-[13px] text-white/40 leading-relaxed">{d.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            AUDIENCE MATCHING
        ═══════════════════════════════════════════════ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <p className="text-[11px] font-semibold text-[var(--accent)] tracking-[0.3em] uppercase mb-4">Audience matching</p>
              <h2 className="text-3xl md:text-[3.5rem] font-bold tracking-tight mb-4">
                Not random testers.<br />
                <span className="text-white/30">Your</span> customers.
              </h2>
              <p className="text-[15px] text-white/40 max-w-lg mx-auto mb-10">
                Tell us who your app is for. We match testers who actually fit that profile.
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
                  <span key={a} className="bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-2 text-[13px] text-white/40 hover:text-white/70 hover:border-white/[0.12] transition-all duration-300 cursor-default">
                    {a}
                  </span>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            PRICING
        ═══════════════════════════════════════════════ */}
        <section className="py-24 md:py-32 px-6 section-glow">
          <div className="max-w-4xl mx-auto text-center">
            <ScrollReveal>
              <p className="text-[11px] font-semibold text-[var(--accent)] tracking-[0.3em] uppercase mb-4">Pricing</p>
              <h2 className="text-3xl md:text-[3.5rem] font-bold tracking-tight mb-4">
                Pay per test.
              </h2>
              <p className="text-[15px] text-white/40 mb-12 max-w-md mx-auto">
                No subscriptions. No annual contracts. Buy when you need it.
              </p>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[
                { name: "Quick Check", testers: 3, price: 29, time: "4 hours" },
                { name: "Full Test", testers: 5, price: 49, time: "4 hours", popular: true },
                { name: "Deep Dive", testers: 10, price: 89, time: "6 hours" },
              ].map((p, i) => (
                <ScrollReveal key={p.name} delay={i * 100}>
                  <div className={`card p-6 text-center ${p.popular ? "!border-white/[0.15] glow" : ""}`}>
                    {p.popular && <span className="inline-block bg-white text-black text-[10px] font-bold px-3 py-0.5 rounded-full mb-4 uppercase tracking-wider">Popular</span>}
                    <h3 className="text-[17px] font-semibold mb-1">{p.name}</h3>
                    <p className="text-[12px] text-white/30 mb-4">{p.testers} testers / {p.time}</p>
                    <p className="text-4xl font-bold mb-5">${p.price}</p>
                    <Link href="/submit" className={`btn w-full text-[13px] !rounded-full ${p.popular ? "btn-primary" : "btn-ghost"}`}>
                      Get started
                    </Link>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            FINAL CTA
        ═══════════════════════════════════════════════ */}
        <section className="relative py-32 px-6 overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#6C5CE7]/[0.03] to-transparent" />

          <div className="relative max-w-3xl mx-auto text-center">
            <ScrollReveal>
              <h2 className="text-3xl md:text-[4rem] font-bold tracking-tight leading-tight mb-4">
                Ship with<br />confidence.
              </h2>
              <p className="text-[16px] text-white/40 mb-10 max-w-md mx-auto">
                Stop guessing. Let real humans tell you what&apos;s broken before your users do.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/become-a-tester" className="btn btn-primary btn-lg !rounded-full glow-white">
                  Become a tester
                </Link>
                <Link href="/submit" className="btn btn-outline btn-lg !rounded-full">
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
