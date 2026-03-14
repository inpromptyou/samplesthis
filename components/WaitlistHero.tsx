"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import TypingRotate from "@/components/TypingRotate";

function WaitlistForm({ id, compact }: { id?: string; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"tester" | "developer" | "both">("tester");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/testers/interest").then(r => r.json()).then(d => {
      if (d.total) setTotal(d.total);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid email"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/testers/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role, source: "waitlist" }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setTotal(data.total);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div id={id} className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6 text-center">
        <p className="text-[15px] font-semibold text-[var(--text)] mb-1">You are on the list.</p>
        <p className="text-[13px] text-[var(--text-muted)]">We will email you when we launch.{total > 1 && ` You are #${total} in line.`}</p>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className="space-y-3">
      {!compact && (
        <div className="flex gap-2 justify-center mb-1 flex-wrap">
          {([
            { value: "tester" as const, label: "I want to test" },
            { value: "developer" as const, label: "I built something" },
            { value: "both" as const, label: "Both" },
          ]).map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRole(opt.value)}
              className={`px-4 py-2 rounded-xl text-[13px] font-medium border transition-all ${
                role === opt.value
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-[var(--accent)]/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      <input
        type="text"
        placeholder="Your name (optional)"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] transition-colors"
      />
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-[14px] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--accent)] transition-colors"
      />
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-accent w-full !py-3 text-[14px]">
        {loading ? "Joining..." : "Join the waitlist"}
      </button>
      {total > 0 && <p className="text-[11px] text-[var(--text-dim)] text-center">{total} {total === 1 ? "person" : "people"} already on the list</p>}
    </form>
  );
}

export default function WaitlistPage() {
  const scrollToWaitlist = () => {
    document.getElementById("waitlist-hero")?.scrollIntoView({ behavior: "smooth" });
    document.querySelector<HTMLInputElement>("#waitlist-hero input[type=email]")?.focus();
  };

  return (
    <>
      <Nav />
      <main>
        {/* ═══ HERO ═══ */}
        <section className="warm-gradient-hero pt-28 sm:pt-32 pb-16 sm:pb-20 px-5 sm:px-6">
          <div className="max-w-[800px] mx-auto text-center">
            {/* Launching soon badge */}
            <div className="mb-6 hero-anim ha-1">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[12px] font-medium text-[var(--accent)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                Launching soon — join the waitlist
              </span>
            </div>

            {/* Marquee */}
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

            <h1 className="h text-[1.75rem] sm:text-[clamp(2.4rem,5.5vw,4rem)] font-bold leading-[1.15] tracking-[-0.035em] mb-5 sm:mb-6 hero-anim ha-2">
              <span className="block sm:inline">The human signal layer</span>{" "}
              <span className="whitespace-nowrap">for{" "}<span className="grad-warm inline"><TypingRotate /></span></span>
            </h1>

            <p className="text-[15px] sm:text-[17px] text-[var(--text-muted)] max-w-[520px] mx-auto mb-8 sm:mb-10 leading-[1.6] hero-anim ha-3 px-2">
              AI builds the product. Humans find the friction. Real testers matched to your audience
              deliver screen recordings, bug reports, and every flinch moment — in hours, not weeks.
            </p>

            {/* Waitlist form in hero */}
            <div className="max-w-[440px] mx-auto hero-anim ha-4">
              <WaitlistForm id="waitlist-hero" />
            </div>
          </div>
        </section>

        {/* ═══ SOCIAL PROOF ═══ */}
        <section className="py-12 sm:py-16 px-5 sm:px-6">
          <div className="max-w-[900px] mx-auto">
            <p className="text-center text-[11px] font-medium text-[var(--text-dim)] uppercase tracking-[0.2em] mb-6">What early users are saying</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { quote: "Finally — a way to get real humans to test my vibe-coded apps before I ship them to actual users.", name: "Alex K.", role: "Indie maker", app: "SaaS dashboard" },
                { quote: "I've been looking for a side hustle I can do from my phone. Testing apps for $10-20 a pop? Sign me up.", name: "Sam R.", role: "Beta tester", app: "Early adopter" },
                { quote: "The feedback was brutally honest, exactly what I needed. Found 3 critical UX issues before launch.", name: "Jordan M.", role: "Startup CTO", app: "E-commerce flow" },
              ].map((t, i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <p className="text-[13px] sm:text-[14px] text-[var(--text-muted)] leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-[12px] font-bold">{t.name[0]}</div>
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--text)]">{t.name}</div>
                      <div className="text-[11px] text-[var(--text-dim)]">{t.role} — {t.app}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                <button onClick={scrollToWaitlist} className="card block p-6 sm:p-8 group text-left w-full">
                  <div className="w-10 h-10 rounded-xl grad-warm-subtle flex items-center justify-center mb-4 sm:mb-5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                    </svg>
                  </div>
                  <h3 className="h text-[16px] sm:text-lg font-semibold mb-2 text-[var(--text)]">I built something</h3>
                  <p className="text-[13px] sm:text-[14px] text-[var(--text-muted)] leading-[1.7] mb-4 sm:mb-5">
                    Post a test job with your budget. Describe your ideal user. Get screen recordings, bug reports, and every flinch moment.
                  </p>
                  <span className="text-[13px] font-medium text-[var(--accent)] group-hover:underline">Join as a developer →</span>
                </button>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <button onClick={scrollToWaitlist} className="card block p-6 sm:p-8 group text-left w-full">
                  <div className="w-10 h-10 rounded-xl grad-warm-subtle flex items-center justify-center mb-4 sm:mb-5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                    </svg>
                  </div>
                  <h3 className="h text-[16px] sm:text-lg font-semibold mb-2 text-[var(--text)]">I want to earn</h3>
                  <p className="text-[13px] sm:text-[14px] text-[var(--text-muted)] leading-[1.7] mb-4 sm:mb-5">
                    Browse jobs matched to your profile. Use apps for 15 minutes, give honest feedback, get paid same day.
                  </p>
                  <span className="text-[13px] font-medium text-[var(--accent)] group-hover:underline">Join as a tester →</span>
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
                Whether you are shipping a product or earning as a tester, you are three steps away.
              </p>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <ScrollReveal delay={100} animation="left">
                <div className="card card-hover-lift p-6 sm:p-8 h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 grad-warm-bg" />
                  <p className="h text-[11px] sm:text-[12px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-6 sm:mb-8">For businesses</p>
                  <div className="space-y-5 sm:space-y-6">
                    {[
                      { icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101", t: "Paste your URL", d: "Drop your app link, landing page, or prototype. Tell us what flows to test." },
                      { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", t: "Describe your ideal tester", d: "We match from our pool of vetted testers based on your audience." },
                      { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", t: "Set your budget", d: "Pay $5-$20+ per tester. No subscriptions, no hidden fees." },
                      { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", t: "Get your flinch report", d: "Screen recordings, bug reports, friction notes, and a flinch score." },
                    ].map((step, i) => (
                      <div key={step.t} className="flex gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl grad-warm-subtle flex items-center justify-center shrink-0 mt-0.5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={step.icon} /></svg>
                        </div>
                        <div>
                          <h4 className="h text-[13px] sm:text-[14px] font-semibold mb-1 text-[var(--text)]">
                            <span className="text-[var(--text-dim)] mr-1.5">{String(i + 1).padStart(2, "0")}</span>{step.t}
                          </h4>
                          <p className="text-[12px] sm:text-[13px] text-[var(--text-muted)] leading-[1.65]">{step.d}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={200} animation="right">
                <div className="card card-hover-lift p-6 sm:p-8 h-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EF4444] to-[#F97316]" />
                  <p className="h text-[11px] sm:text-[12px] font-bold text-[#EF4444] uppercase tracking-[0.15em] mb-6 sm:mb-8">For testers</p>
                  <div className="space-y-5 sm:space-y-6">
                    {[
                      { icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", t: "Create your profile", d: "Age, interests, devices. Takes 60 seconds — no interviews needed." },
                      { icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", t: "Browse matched jobs", d: "We surface test jobs that match your profile." },
                      { icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", t: "Test for 15 minutes", d: "Use the app naturally. Record your screen, note what confuses you." },
                      { icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", t: "Get paid same day", d: "$5-$20+ per test via Stripe. Direct deposit to your bank." },
                    ].map((step, i) => (
                      <div key={step.t} className="flex gap-3 sm:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={step.icon} /></svg>
                        </div>
                        <div>
                          <h4 className="h text-[13px] sm:text-[14px] font-semibold mb-1 text-[var(--text)]">
                            <span className="text-[var(--text-dim)] mr-1.5">{String(i + 1).padStart(2, "0")}</span>{step.t}
                          </h4>
                          <p className="text-[12px] sm:text-[13px] text-[var(--text-muted)] leading-[1.65]">{step.d}</p>
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
                Every test delivers a complete flinch report. No fluff — just actionable feedback.
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                { icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: "Screen recordings", desc: "Full session recordings. See exactly where users hesitate or give up.", tag: "Video" },
                { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", title: "Bug reports", desc: "Steps to reproduce, severity rating, browser info, screenshots.", tag: "Structured" },
                { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "Friction notes", desc: "Confusing copy, unclear navigation, moments of doubt.", tag: "Qualitative" },
                { icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", title: "Flinch score", desc: "0-100 score based on friction frequency and severity.", tag: "Metric" },
              ].map((d, i) => (
                <ScrollReveal key={d.title} delay={i * 80}>
                  <div className="card card-hover-lift p-5 sm:p-6 h-full group">
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

        {/* ═══ BOTTOM WAITLIST ═══ */}
        <section className="py-16 sm:py-20 px-5 sm:px-6">
          <div className="max-w-[520px] mx-auto text-center">
            <ScrollReveal>
              <h2 className="h text-[1.3rem] sm:text-[1.8rem] font-bold tracking-[-0.03em] leading-tight mb-3 text-[var(--text)]">
                Be the first to know when we launch
              </h2>
              <p className="text-[14px] sm:text-[15px] text-[var(--text-muted)] mb-6">
                Whether you want to earn money testing apps or get real feedback on what you built — we will notify you the moment we go live.
              </p>
              <WaitlistForm compact />
            </ScrollReveal>
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
            <button onClick={scrollToWaitlist} className="btn btn-primary btn-lg">Join the waitlist</button>
          </ScrollReveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
