"use client";

import { useState } from "react";
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

export default function BecomeATester() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    age_range: "",
    location: "",
    devices: [] as string[],
    interests: [] as string[],
    tech_comfort: 3,
    bio: "",
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
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
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
            <div className="text-center reveal-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h1 className="text-2xl font-bold mb-3">You&apos;re in.</h1>
              <p className="text-[15px] text-[var(--text-muted)] mb-6">
                We&apos;ll match you with apps that fit your profile and reach out when there&apos;s a test ready.
                Most testers get their first test within 48 hours.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Become a tester</h1>
                <p className="text-[15px] text-[var(--text-muted)]">
                  Get paid $5-15 per test. No experience needed. Takes 60 seconds.
                </p>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-[var(--card)]">
                    <div className={`h-full rounded-full transition-all duration-500 ${step >= s ? "bg-[var(--accent)] w-full" : "w-0"}`} />
                  </div>
                ))}
              </div>

              {/* Step 1: Basics */}
              {step === 1 && (
                <div className="space-y-4 reveal-up">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Your name</label>
                    <input
                      className="input"
                      placeholder="First name is fine"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Email</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
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
                      <input
                        className="input"
                        placeholder="City or country"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                      />
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
                <div className="space-y-6 reveal-up">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">What devices do you use?</label>
                    <div className="flex flex-wrap gap-2">
                      {DEVICES.map((d) => (
                        <button
                          key={d}
                          onClick={() => toggleArr("devices", d)}
                          className={`px-3 py-1.5 rounded-lg text-[13px] transition-all border ${
                            form.devices.includes(d)
                              ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent-light)]"
                              : "bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-2">What are you into? (pick all that apply)</label>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((i) => (
                        <button
                          key={i}
                          onClick={() => toggleArr("interests", i)}
                          className={`px-3 py-1.5 rounded-lg text-[13px] transition-all border ${
                            form.interests.includes(i)
                              ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent-light)]"
                              : "bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
                          }`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">Back</button>
                    <button onClick={() => setStep(3)} className="btn btn-primary flex-1">Continue</button>
                  </div>
                </div>
              )}

              {/* Step 3: Final */}
              {step === 3 && (
                <div className="space-y-4 reveal-up">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">
                      How comfortable are you with tech? (1 = barely use apps, 5 = power user)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setForm({ ...form, tech_comfort: n })}
                          className={`w-12 h-12 rounded-xl text-[15px] font-semibold transition-all border ${
                            form.tech_comfort === n
                              ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                              : "bg-[var(--card)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">
                      Anything else about you? (optional)
                    </label>
                    <textarea
                      className="input min-h-[80px] resize-none"
                      placeholder="E.g. I'm a uni student who uses 10+ apps daily, or I'm a tradie who barely uses my phone..."
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] rounded-xl px-4 py-3">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="btn btn-secondary flex-1">Back</button>
                    <button
                      onClick={submit}
                      disabled={submitting}
                      className="btn btn-primary flex-1 disabled:opacity-60"
                    >
                      {submitting ? "Submitting..." : "Sign me up"}
                    </button>
                  </div>

                  <p className="text-[11px] text-[var(--text-dim)] text-center">
                    We&apos;ll never spam you. Tests are optional — only accept ones you want.
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

