"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"];
const DEVICES = ["iPhone", "Android", "Windows PC", "Mac", "iPad/Tablet", "Linux"];
const INTERESTS = [
  "Social media", "Gaming", "Fitness", "Shopping", "Crypto/Web3",
  "Finance", "Travel", "Food/Cooking", "Music", "Photography",
  "Business/SaaS", "Education", "Health", "Parenting", "DIY/Maker",
  "Cars/Auto", "Fashion", "Sports", "Tech/Gadgets", "Art/Design",
];

export default function BecomeATesterWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[var(--text-dim)]">Loading...</div>}><BecomeATester /></Suspense>;
}

function BecomeATester() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", age_range: "", location: "",
    devices: [] as string[], interests: [] as string[],
    tech_comfort: 3, bio: "",
    linkedin: "", portfolio: "", twitter: "", github: "",
    other_links: [] as string[],
  });

  const toggleArr = (key: "devices" | "interests", val: string) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((v) => v !== val) : [...f[key], val],
    }));
  };

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ref }),
      });
      const data = await res.json();
      if (!res.ok && !data.existing) throw new Error(data.error);
      if (data.existing) {
        router.push("/dashboard");
        return;
      }
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="pt-16 min-h-screen">
        <div className="max-w-xl mx-auto px-5 py-16 md:py-24">

          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h1 className="h text-2xl font-bold mb-3 text-[var(--text)]">You&apos;re in.</h1>
              <p className="text-[15px] text-[var(--text-muted)] mb-6">
                We&apos;ll match you with apps that fit your profile and reach out when there&apos;s a test ready.
                Most testers get their first test within 48 hours.
              </p>
              <Link href="/dashboard" className="btn btn-accent">Go to your dashboard</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="h text-2xl md:text-3xl font-bold mb-2 text-[var(--text)]">Become a tester</h1>
                <p className="text-[15px] text-[var(--text-muted)]">
                  Get paid $5-15 per test. No experience needed. Takes 60 seconds.
                </p>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-black/[0.04]">
                    <div className={`h-full rounded-full transition-all duration-500 ${step >= s ? "grad-warm-bg w-full" : "w-0"}`} />
                  </div>
                ))}
              </div>

              {/* Step 1: Basics */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Your name</label>
                    <input className="input" placeholder="First name is fine" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Email</label>
                    <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Age range</label>
                      <select className="select" value={form.age_range} onChange={(e) => setForm({ ...form, age_range: e.target.value })}>
                        <option value="">Select</option>
                        {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Location</label>
                      <input className="input" placeholder="City or country" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                    </div>
                  </div>
                  <button
                    onClick={() => { if (form.name && form.email) setStep(2); }}
                    disabled={!form.name || !form.email}
                    className="btn btn-primary w-full mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 2: Profile */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">What devices do you use?</label>
                    <div className="flex flex-wrap gap-2">
                      {DEVICES.map((d) => (
                        <button key={d} onClick={() => toggleArr("devices", d)}
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all border ${
                            form.devices.includes(d)
                              ? "bg-orange-50 border-orange-300 text-orange-700"
                              : "bg-white border-black/[0.08] text-[var(--text-muted)] hover:border-orange-200"
                          }`}
                        >{d}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">What are you into? (pick all that apply)</label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((i) => (
                        <button key={i} onClick={() => toggleArr("interests", i)}
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all border ${
                            form.interests.includes(i)
                              ? "bg-orange-50 border-orange-300 text-orange-700"
                              : "bg-white border-black/[0.08] text-[var(--text-muted)] hover:border-orange-200"
                          }`}
                        >{i}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn btn-outline flex-1">Back</button>
                    <button onClick={() => setStep(3)} className="btn btn-primary flex-1">Continue</button>
                  </div>
                </div>
              )}

              {/* Step 3: Final */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">
                      How comfortable are you with tech? (1 = barely use apps, 5 = power user)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setForm({ ...form, tech_comfort: n })}
                          className={`w-12 h-12 rounded-xl text-[15px] font-semibold transition-all border ${
                            form.tech_comfort === n
                              ? "grad-warm-bg border-orange-400 text-white"
                              : "bg-white border-black/[0.08] text-[var(--text-muted)] hover:border-orange-200"
                          }`}
                        >{n}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Anything else about you? (optional)</label>
                    <textarea className="input min-h-[80px] resize-none" placeholder="E.g. I'm a uni student who uses 10+ apps daily..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="btn btn-outline flex-1">Back</button>
                    <button onClick={() => setStep(4)} className="btn btn-primary flex-1">Continue</button>
                  </div>
                </div>
              )}

              {/* Step 4: Links & Profiles (optional) */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 text-[12px] text-orange-700 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                    Tip: Testers with profiles get matched to higher-paying tests 2x faster
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text)] mb-3">Links</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">LinkedIn</label>
                        <input className="input" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Portfolio / Website</label>
                        <input className="input" placeholder="https://yoursite.com" value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text)] mb-3">Socials</p>
                    <div className="space-y-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] text-[13px]">@</span>
                        <input className="input pl-8" placeholder="twitter / X handle" value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
                      </div>
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        <input className="input pl-10" placeholder="github username" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  {/* Other links */}
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--text)] mb-3">Other links</p>
                    {form.other_links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input className="input flex-1" placeholder="https://example.com" value={link}
                          onChange={(e) => { const arr = [...form.other_links]; arr[i] = e.target.value; setForm({ ...form, other_links: arr }); }} />
                        <button onClick={() => setForm({ ...form, other_links: form.other_links.filter((_, j) => j !== i) })}
                          className="w-9 h-9 rounded-lg border border-black/[0.08] flex items-center justify-center text-[var(--text-dim)] hover:text-red-500 hover:border-red-200 transition-colors shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </div>
                    ))}
                    <button onClick={() => setForm({ ...form, other_links: [...form.other_links, ""] })}
                      className="text-[12px] text-[var(--accent)] font-medium hover:underline flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      Add a link
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3">{error}</div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(3)} className="btn btn-outline flex-1">Back</button>
                    <button onClick={submit} disabled={submitting} className="btn btn-primary flex-1 disabled:opacity-60">
                      {submitting ? "Submitting..." : "Sign me up"}
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--text-dim)] text-center">
                    All links are optional. We&apos;ll never spam you.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
