"use client";

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const APP_TYPES = ["Web app", "Mobile app", "SaaS", "Chrome extension", "Desktop app", "API/CLI", "Other"];

const SUGGESTED_BUDGETS = [
  { per: 8, label: "Economy", speed: "~24h pickup" },
  { per: 12, label: "Standard", speed: "~4h pickup" },
  { per: 20, label: "Priority", speed: "~1h pickup" },
];

interface User {
  id: number;
  email: string;
  name: string;
}

export default function SubmitPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Job flow
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    app_url: "",
    app_type: "",
    description: "",
    target_audience: "",
    testers_count: 5,
    price_per_tester: 12,
    custom_price: "",
  });

  const pricePerTester = form.custom_price ? Number(form.custom_price) : form.price_per_tester;
  const total = form.testers_count * pricePerTester;
  const isValidPrice = pricePerTester >= 5;

  // Check if logged in (unified auth — tester_token)
  useEffect(() => {
    fetch("/api/testers/me").then(r => r.json()).then(d => {
      if (d.id) {
        setUser({ id: d.id, email: d.email, name: d.name });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    setError("");
    if (!isValidPrice) { setError("Minimum $5 per tester"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price_per_tester: pricePerTester,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const totalSteps = 3;

  return (
    <>
      <Nav />
      <main className="pt-16 min-h-screen">
        <div className="max-w-xl mx-auto px-5 py-16 md:py-24">

          {loading ? (
            <div className="py-20 text-center text-[var(--text-dim)]">Loading...</div>
          ) : !user ? (
            /* ═══ NOT LOGGED IN — PROMPT TO SIGN UP ═══ */
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl grad-warm-subtle border border-orange-200 flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </div>
              <h1 className="h text-2xl md:text-3xl font-bold mb-3 text-[var(--text)]">Post a test job</h1>
              <p className="text-[15px] text-[var(--text-muted)] mb-6">
                Sign up or log in to post a test. Same account lets you test other apps too.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-auth", { detail: "tester" }));
                }} className="btn btn-primary btn-pill">Sign up</button>
                <button onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-auth", { detail: "login" }));
                }} className="btn btn-outline btn-pill">Log in</button>
              </div>
            </div>
          ) : (
            /* ═══ JOB POSTING (logged in) ═══ */
            <>
              <div className="text-center mb-10">
                <h1 className="h text-2xl md:text-3xl font-bold mb-2 text-[var(--text)]">Post a test job</h1>
                <p className="text-[15px] text-[var(--text-muted)]">
                  Set your own budget. Pay per tester. Results in hours.
                </p>
                <p className="text-[12px] text-[var(--text-dim)] mt-1">Posting as {user.email}</p>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-2 mb-8">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-black/[0.04]">
                    <div className={`h-full rounded-full transition-all duration-500 ${step >= i + 1 ? "grad-warm-bg w-full" : "w-0"}`} />
                  </div>
                ))}
              </div>

              {/* Step 1: Your app */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">App URL</label>
                    <input className="input" placeholder="https://yourapp.com" value={form.app_url} onChange={(e) => setForm({ ...form, app_url: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">App type</label>
                    <select className="select" value={form.app_type} onChange={(e) => setForm({ ...form, app_type: e.target.value })}>
                      <option value="">Select type</option>
                      {APP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">What should testers focus on? (optional)</label>
                    <textarea className="input min-h-[80px] resize-none" placeholder='E.g. "Test the checkout flow" or "Try to break the onboarding"' value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <button onClick={() => { if (form.app_url) setStep(2); }} disabled={!form.app_url} className="btn btn-primary w-full mt-2 disabled:opacity-40 disabled:cursor-not-allowed">Continue</button>
                </div>
              )}

              {/* Step 2: Audience */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-1.5">Who is your ideal tester?</label>
                    <textarea className="input min-h-[80px] resize-none" placeholder='E.g. "Women 25-40 who shop online" or "Active crypto traders"' value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} />
                    <p className="text-[11px] text-[var(--text-dim)] mt-1">Leave blank for general audience.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn btn-outline flex-1">Back</button>
                    <button onClick={() => setStep(3)} className="btn btn-primary flex-1">Continue</button>
                  </div>
                </div>
              )}

              {/* Step 3: Budget */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-3">How many testers?</label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setForm({ ...form, testers_count: Math.max(1, form.testers_count - 1) })}
                        className="w-11 h-11 rounded-xl border border-black/[0.08] bg-white flex items-center justify-center text-[var(--text-muted)] hover:border-orange-200 transition-colors text-lg font-bold">-</button>
                      <div className="flex-1 text-center">
                        <input type="number" min={1} max={100} value={form.testers_count}
                          onChange={(e) => setForm({ ...form, testers_count: Math.max(1, Math.min(100, parseInt(e.target.value) || 1)) })}
                          className="h text-4xl font-bold text-[var(--text)] text-center bg-transparent outline-none w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <p className="text-[11px] text-[var(--text-dim)] mt-0.5">tester{form.testers_count > 1 ? "s" : ""}</p>
                      </div>
                      <button onClick={() => setForm({ ...form, testers_count: Math.min(100, form.testers_count + 1) })}
                        className="w-11 h-11 rounded-xl border border-black/[0.08] bg-white flex items-center justify-center text-[var(--text-muted)] hover:border-orange-200 transition-colors text-lg font-bold">+</button>
                    </div>
                    <div className="flex justify-center gap-2 mt-3">
                      {[3, 5, 10, 20].map((n) => (
                        <button key={n} onClick={() => setForm({ ...form, testers_count: n })}
                          className={`px-3 py-1 rounded-lg text-[12px] font-medium border transition-all ${
                            form.testers_count === n ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-black/[0.06] text-[var(--text-dim)] hover:border-orange-200"
                          }`}>{n}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-medium text-[var(--text-muted)] mb-3">Budget per tester</label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {SUGGESTED_BUDGETS.map((b) => (
                        <button key={b.per} onClick={() => setForm({ ...form, price_per_tester: b.per, custom_price: "" })}
                          className={`card-light p-3 text-center ${!form.custom_price && form.price_per_tester === b.per ? "!border-orange-300 !bg-orange-50/50" : ""}`}>
                          <p className="h text-xl font-bold text-[var(--text)]">${b.per}</p>
                          <p className="text-[10px] text-[var(--text-dim)] mt-0.5">{b.label}</p>
                          <p className="text-[9px] text-[var(--text-dim)]">{b.speed}</p>
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-medium">$</span>
                      <input className="input !pl-8" type="number" min={5} placeholder="Or enter custom amount (min $5)" value={form.custom_price}
                        onChange={(e) => setForm({ ...form, custom_price: e.target.value })} />
                    </div>
                    {form.custom_price && Number(form.custom_price) < 5 && (
                      <p className="text-[11px] text-red-600 mt-1">Minimum $5 per tester</p>
                    )}
                  </div>

                  <div className="card-light p-5 bg-[var(--bg-2)]">
                    <p className="h text-[11px] font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-3">Order summary</p>
                    <div className="space-y-2 text-[13px]">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">{form.testers_count} tester{form.testers_count > 1 ? "s" : ""} x ${pricePerTester}</span>
                        <span className="text-[var(--text)] font-medium">${total}</span>
                      </div>
                      <div className="border-t border-black/[0.05] pt-2 flex justify-between items-center">
                        <span className="h text-[14px] font-bold text-[var(--text)]">Total</span>
                        <span className="h text-2xl font-bold grad-warm">${total} AUD</span>
                      </div>
                    </div>
                  </div>

                  {error && <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl px-4 py-3">{error}</div>}

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="btn btn-outline flex-1">Back</button>
                    <button onClick={submit} disabled={submitting || !isValidPrice} className="btn btn-primary flex-1 disabled:opacity-60">
                      {submitting ? "Processing..." : `Pay $${total} AUD`}
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--text-dim)] text-center">
                    Secure payment via Stripe. Full refund if we can&apos;t match testers.
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
