"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import TypingRotate from "@/components/TypingRotate";

/* ─── Waitlist Form ─── */
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

/* ─── Full Waitlist Page ─── */
export default function WaitlistPage() {
  return (
    <main className="min-h-screen">

      {/* ═══ HERO ═══ */}
      <section className="warm-gradient-hero pt-16 sm:pt-24 pb-16 sm:pb-20 px-5 sm:px-6">
        <div className="max-w-[800px] mx-auto text-center">

          {/* Logo */}
          <div className="flex justify-center mb-8 hero-anim ha-1">
            <Image src="/logo.png" alt="Flinchify" width={48} height={48} priority />
          </div>

          {/* Launching soon badge */}
          <div className="mb-6 hero-anim ha-1">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[12px] font-medium text-[var(--accent)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              Launching soon
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

          {/* Waitlist form */}
          <div className="max-w-[440px] mx-auto hero-anim ha-4">
            <WaitlistForm id="waitlist-hero" />
          </div>
        </div>
      </section>

      {/* ═══ WHAT IS FLINCHIFY ═══ */}
      <section className="py-16 sm:py-24 px-5 sm:px-6">
        <div className="max-w-[900px] mx-auto">
          <ScrollReveal>
            <h2 className="h text-[1.3rem] sm:text-2xl md:text-[2.2rem] font-bold tracking-[-0.03em] text-center mb-4 text-[var(--text)]">
              What is Flinchify?
            </h2>
            <p className="text-[14px] sm:text-[16px] text-[var(--text-muted)] text-center max-w-[600px] mx-auto mb-12 sm:mb-16 leading-[1.7]">
              A marketplace that connects indie developers with real human testers. You build it, we find the people who will actually use it — and they tell you what is broken, confusing, or just plain bad.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <ScrollReveal delay={100}>
              <div className="card p-6 sm:p-8 h-full">
                <div className="w-10 h-10 rounded-xl grad-warm-subtle flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                  </svg>
                </div>
                <h3 className="h text-[16px] sm:text-lg font-semibold mb-2 text-[var(--text)]">For developers</h3>
                <p className="text-[13px] sm:text-[14px] text-[var(--text-muted)] leading-[1.7]">
                  Post your app with a budget ($5-$20+ per tester). Describe your ideal user. Get back screen recordings, bug reports, friction notes, and a flinch score — delivered in hours, not weeks.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="card p-6 sm:p-8 h-full">
                <div className="w-10 h-10 rounded-xl grad-warm-subtle flex items-center justify-center mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <h3 className="h text-[16px] sm:text-lg font-semibold mb-2 text-[var(--text)]">For testers</h3>
                <p className="text-[13px] sm:text-[14px] text-[var(--text-muted)] leading-[1.7]">
                  Browse test jobs matched to your profile. Use apps for 15 minutes, give honest feedback, get paid same day via Stripe. No interviews, no resume — just sign up and start earning.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="warm-section py-16 sm:py-24 px-5 sm:px-6">
        <div className="max-w-[900px] mx-auto">
          <ScrollReveal>
            <h2 className="h text-[1.3rem] sm:text-2xl md:text-[2.2rem] font-bold tracking-[-0.03em] text-center mb-12 sm:mb-16 text-[var(--text)]">
              How it works
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101",
                title: "Post your app",
                desc: "Paste your URL, describe the user flow to test, set your budget and audience.",
              },
              {
                step: "02",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                title: "Testers matched",
                desc: "Real humans who match your target audience pick up the job and test naturally.",
              },
              {
                step: "03",
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                title: "Get your report",
                desc: "Screen recordings, bug reports, friction notes, and a flinch score — in your inbox.",
              },
            ].map((s, i) => (
              <ScrollReveal key={s.step} delay={i * 100}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl grad-warm-subtle flex items-center justify-center mx-auto mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                  </div>
                  <p className="h text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.15em] mb-2">{s.step}</p>
                  <h3 className="h text-[15px] sm:text-[16px] font-semibold mb-2 text-[var(--text)]">{s.title}</h3>
                  <p className="text-[13px] text-[var(--text-muted)] leading-[1.7]">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHAT YOU GET ═══ */}
      <section className="py-16 sm:py-24 px-5 sm:px-6">
        <div className="max-w-[1100px] mx-auto">
          <ScrollReveal>
            <h2 className="h text-[1.3rem] sm:text-2xl md:text-[2.2rem] font-bold tracking-[-0.03em] text-center mb-4 text-[var(--text)]">
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

      {/* ═══ INTEGRATIONS TEASER ═══ */}
      <section className="dark-section py-16 sm:py-20 px-5 sm:px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <ScrollReveal>
            <p className="h text-[10px] sm:text-[11px] font-medium text-orange-400 uppercase tracking-[0.2em] mb-3">Integrations</p>
            <h2 className="h text-[1.3rem] sm:text-2xl md:text-[2.2rem] font-bold tracking-[-0.03em] mb-4 text-white">
              Works with your AI workflow
            </h2>
            <p className="text-[13px] sm:text-[15px] text-white/40 max-w-lg mx-auto mb-8">
              Your AI agent builds the product, then requests human testing via CLI, API, or MCP — no context switching. Results come back structured so your agent can read them and fix the bugs.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mb-8">
              {[
                { name: "Cursor", file: "cursor" },
                { name: "Claude", file: "claude" },
                { name: "ChatGPT", file: "chatgpt" },
                { name: "Replit", file: "replit" },
                { name: "Windsurf", file: "windsurf" },
                { name: "Vercel", file: "vercel" },
              ].map(brand => (
                <div key={brand.name} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                  <img src={`/brands/${brand.file}.svg`} alt={brand.name} className="h-5 w-5 brightness-0 invert" />
                  <span className="h text-[12px] font-semibold text-white/60">{brand.name}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="inline-block">
              <code className="text-[12px] text-orange-400/80 bg-white/[0.04] border border-white/[0.06] rounded-lg px-4 py-2.5 font-mono">
                npm install -g flinchify
              </code>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ BOTTOM WAITLIST CTA ═══ */}
      <section className="warm-gradient-hero py-16 sm:py-24 px-5 sm:px-6">
        <div className="max-w-[520px] mx-auto text-center">
          <ScrollReveal>
            <h2 className="h text-[1.5rem] sm:text-2xl md:text-[3rem] font-bold tracking-[-0.03em] leading-tight mb-4 sm:mb-5 text-[var(--text)]">
              Find the flinch.<br />Ship with confidence.
            </h2>
            <p className="text-[14px] sm:text-[16px] text-[var(--text-muted)] mb-8 max-w-md mx-auto">
              Be the first to know when we launch. Whether you want to earn money testing or get real feedback on what you built.
            </p>
            <WaitlistForm compact />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8 px-5 sm:px-6 border-t border-[var(--border)]">
        <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Flinchify" width={24} height={24} />
            <span className="text-[13px] text-[var(--text-dim)]">&copy; {new Date().getFullYear()} Flinchify</span>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-[var(--text-dim)]">
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <a href="https://x.com/Flinchify" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text)] transition-colors">X</a>
            <Link href="/admin" className="hover:text-[var(--text)] transition-colors opacity-30 hover:opacity-100">Admin</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
